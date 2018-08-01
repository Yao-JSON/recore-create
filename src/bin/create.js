#!/usr/bin/env node

'use strict';

const yargs = require('yargs-parser');
const updater = require('npm-updater');
const os = require('os');

const { logger } = require('./../lib/utils/index');
const Init = require('./../lib/index');

const options = {
  'no-install': {
    describe:'',
    type: 'boolean'
  },
  template: {
    describe: '',
    type: 'string',
    alias: 'T'
  },
  'no-install': {
    describe: 'no install',
    type: 'boolean'
  }
}


const argv = yargs(process.argv, options)

const pkg = require('./../../package.json');

let updateMessage = [
  `你可以执行 tnpm install -g ${pkg.name} 来安装此版本\n`,
  `如果提示没有权限，请尝试 sudo tnpm install -g ${pkg.name}\n`
];
if (process.platform === 'win32') {
  // windows 提示使用 npminstall 来安装
  updateMessage = [
    `你可以执行以下命令来安装此版本:${os.EOL}`,
    `  tnpm install -g npminstall${os.EOL}`,
    `  npm install -g ${pkg.name} --registry=http://registry.npm.alibaba-inc.com${os.EOL}`
  ];
}


updater({
  package: pkg,
  abort: false,
  interval: '1d',
  updateMessage
}).then(() =>  {
  Init(argv)
}).catch((err) => {
  logger(err);
  logger.debug('运行错误:', err);
  logger.err(err);
});
