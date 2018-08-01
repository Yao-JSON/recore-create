const { join, resolve } = require('path');
const inquirer = require('inquirer');
const download = require('download');
const compressing = require('compressing');
const glob = require('glob');
const chalk = require('chalk');
const ora = require('ora');


const {
  logger,
  spawn,
  isFile,
  removeFs,
  copyFs,
  rmdirFs,
  writeFileFs,
  readFileFs,
  isEmptyDir,
  isDebug,
  nunjucks } = require('./utils');
const templateConfig = require('./config/template.json');


class InitFunc {
  constructor(argv) {
    const ctxPath = resolve(argv._[2] || '.');
    isDebug(argv);
    this.argv = argv;
    this.ctxPath = ctxPath;
    this.result = {};
    this.templateTgzUrl = null;
    this.templateName = null;
    this.templateTgzPath = join(__dirname, '../lib/tgz');
    this.targetTemplatePath = join(ctxPath, '.nowa-xdev')
    this.spinner = ora('download template ...');
  }

  getTemplateOptions() {
    return [
      {
        type: 'list',
        name: 'templateName',
        message: '模板选择',
        choices: [
          {
            name: 'hello recore',
            value: '@ali/recore-template-default'
          },
          {
            name: 'pages',
            value: '@ali/recore-template-pages'
          }
        ]
      }
    ]
  }

  async start() {
    const { argv, ctxPath } = this;
    const inCurrent = [{
      name: 'ok',
      type: 'confirm',
      message: '确认需要继续执行初始化,请输入(y)'
    }];

    if (!isEmptyDir(ctxPath) && !argv.force) {
      logger.warn('当前目录下已存在文件,继续执行初始化会覆盖已存在的同名文件');
      const { ok } = await inquirer.prompt(inCurrent);
      if (!ok) {
        process.exit(0);
      }
    }

    // 获取模板地址
    const templateAns = argv.template ?
    this.checkTemplateIsExist() :
    (await inquirer.prompt(this.getTemplateOptions()));
    // 获取模板下载 tgz
    if(this.getTempalteTgzUrl(templateAns)) {
      // 下载模板
      await this.downloadTemplateTgz();
    }
    // 解压模板
    await this.unCompressingTgz();
    // 创建项目
    await this.createdProject();
  }
  /**
   * 检测用输入模板值类型
   * 检测用户模板是否存在
   * 支持：
   * 1. @ali/xxxx-template
   * 2. http://xxxxx.zip
   * @returns { template: <string|object> }
   */
  checkTemplateIsExist () {
    const { argv } = this;
    if(/^http/.test(argv.template)) {
      return {
        templateName : argv.template,
        tgzUrl: argv.template,
        type: 'URL'
      }
    }
    let result = null;
    try {
      result = spawn('tnpm', ['view', argv.template, 'dist.tarball'])
    } catch(e) {
      logger.error('connot find module ', argv.template)
      process.exit(1);
    }
    return {
      templateName: argv.template,
      tgzUrl: result,
      type: 'URL'
    }
  }
  /**
   * 获取模板 tgz 模板下载地址
   * 对比是否有缓存 zip 文件
   */
  getTempalteTgzUrl(templateAns) {
    const { targetTemplatePath } = this;
    let templateTgzUrl = null;
    if(templateAns.type === 'URL' && templateAns.tgzUrl) {
      templateTgzUrl = templateAns.tgzUrl;
    } else {
      templateTgzUrl = spawn('tnpm', ['view', templateAns.templateName, 'dist.tarball'], { stdio: 'pipe' });
      templateTgzUrl = templateTgzUrl.stdout.toString()
    }
    const templateName = encodeURIComponent(templateAns.templateName);
    this.templateName = templateName;
    this.templateTgzUrl = templateTgzUrl
    this.targetTemplateTgzPath = join(targetTemplatePath, `${templateName}.tgz`)
    
    if(templateTgzUrl !== templateConfig[templateName]) {
      return true;
    }
    
    this.templateCacheTgzPath = join(__dirname, `./tgz/${templateName}.tgz`)

    if(!isFile(this.templateCacheTgzPath)) {
      return true;
    }

    return false;
  }
  /**
   * 模板下载
   * 缓存模板信息
   * @memberof InitFunc
   */
  async  downloadTemplateTgz() {
    const {
      templateTgzPath, templateTgzUrl, templateCacheTgzPath, templateName,spinner
    } = this;
    spinner.start();
    if (isFile(templateCacheTgzPath)) {
      await removeFs(templateCacheTgzPath);
    }
    try {
      await download(templateTgzUrl, templateTgzPath, {
        filename: `${templateName}.tgz`,
        timeout: 60 * 1000
      });
    } catch (err) {
      logger.err('模板下载失败，url ', templateTgzUrl, err);
      process.exit(0);
    }
    templateConfig[templateName] = templateTgzUrl;
    await writeFileFs(join(__dirname, './config/template.json'), JSON.stringify(templateConfig, null, ' '));
    logger.debug('templateTgzPath: ', this.templateTgzPath);
    spinner.stop()
  }
  /**
   * 解压 tgz & 获取模板中 inquirer.options
   * @memberof InitFunc
   */
  async unCompressingTgz() {
    const {
      templateTgzPath, targetTemplatePath, targetTemplateTgzPath
    } = this;

    await copyFs(templateTgzPath, targetTemplatePath);

    try {
      logger.debug('targetTemplateTgzPath: ', targetTemplateTgzPath);
      await compressing.tgz.uncompress(targetTemplateTgzPath, targetTemplatePath);
    } catch (err) {
      logger.err('解压失败', err);
      process.exit(1);
    }

    const nowaOptionsFilePath = join(targetTemplatePath, 'package/nowa-questions.js');
    if(isFile(nowaOptionsFilePath)) {
      try{
        const questions = require(nowaOptionsFilePath);
        const result = await inquirer.prompt(questions(this));
        this.result = result;
      } catch(err){
        logger.err(err)
      }
    }

  }
  /**
   * 创建项目
   * @memberof InitFunc
   */
  async createdProject() {
    const {
      targetTemplatePath, argv, ctxPath, result
    } = this;
    await copyFs(`${targetTemplatePath}/package/proj`, ctxPath);

    const fileArr = glob.sync('**/*.tpl', {
      cwd: ctxPath,
      nodir: true,
      ignore: ['node_modules', targetTemplatePath]
    }).map(async (filename) => {
      if (!/\.tpl$/.test(filename)) {
        return;
      }
      let targetFile = join(ctxPath, filename);
      let content = await readFileFs(targetFile, { encoding: 'utf8' });
      await removeFs(targetFile);
      targetFile = targetFile.replace(/\.tpl$/, '');
      targetFile = targetFile.replace('~', '');
      content = nunjucks.renderString(content, result);
      await writeFileFs(targetFile, content);
    });

    await Promise.all(fileArr);

    logger.success(`🎉  Successfully created project ${chalk.yellow(result.projectName)}.`);
    await rmdirFs(targetTemplatePath);
    if (argv.install !== false) {
      logger.debug('tnpm install --registry=http://registry.npm.alibaba-inc.com');
      logger.debug('ctxPath: ', ctxPath);
      spawn('npm', ['i', '--registry=http://registry.npm.alibaba-inc.com'], { cwd: ctxPath });
    }
  }

}

module.exports = async (argv) => {
  const InitResult = new InitFunc(argv);
  await InitResult.start()
}
