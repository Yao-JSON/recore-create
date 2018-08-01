
const logger = require('./log')();

const {
  copy,
  copySync,
  emptyDir,
  move,
  ensureFile,
  outputFile,
  remove,
  rmdir,
  ensureDir,
  readFile,
  writeFile,
  ensureDirSync,
  ensureFileSync,
  removeSync
} = require('fs-extra');


const copyFs = async (_olddir, _newdir) => {
  let result;
  try {
    ensureDirSync(_newdir);
    result = await copy(_olddir, _newdir);
    logger.debug(' copy folder success. ', _olddir, ' => ', _newdir);
  } catch (err) {
    logger.debug(' copy folder failed. ', _olddir, ' => ', _newdir);
    logger.err(err);
  }
  return result;
};

const copySyncFs = (_olddir, _newdir, options = {}) => {
  let result;
  try {
    result = copySync(_olddir, _newdir, options);
    logger.debug(' copySync folder success. ', _olddir, ' => ', _newdir);
  } catch (err) {
    logger.debug(' copySync folder failed. ', _olddir, ' => ', _newdir);
    logger.err(err);
  }
  return result;
};

const rmdirFs = async (_path) => {
  let result;
  try {
    await emptyDir(_path);
    result = await rmdir(_path);
    logger.debug(' rmdir folder success. path:', _path);
  } catch (err) {
    logger.debug(' rmdir folder failed. path:', _path);
    logger.err(err);
  }
  return result;
};

const mkdirFs = async (_path) => {
  let result;
  try {
    result = await ensureDir(_path);
    logger.debug(' mkdir folder success. path:', _path);
  } catch (err) {
    logger.debug(' mkdir folder failed. path:', _path);
    logger.err('mkdir folder: ', _path, err);
  }
  return result;
};

const emptyDirFs = async (_path) => {
  let result;
  try {
    result = await emptyDir(_path);
    logger.debug(' emptyDir folder success. path:', _path);
  } catch (err) {
    logger.debug(' emptyDir folder failed. path:', _path);
    logger.err(err);
  }
  return result;
};

const moveFs = async (_olddir, _newdir, overwrite = true) => {
  let result;
  try {
    result = await move(_olddir, _newdir, { overwrite });
    logger.debug(' move folder success. ', _olddir, ' => ', _newdir);
  } catch (err) {
    logger.move(' move folder failed. ', _olddir, ' => ', _newdir);
    logger.err(err);
  }
  return result;
};

const outputFileFs = async (_file, context) => {
  let result;
  try {
    result = await outputFile(_file, context);
    logger.debug(' outputFile file success. path:', _file);
  } catch (err) {
    logger.debug(' outputFile file failed. path:', _file);
    logger.err(err);
  }
  return result;
};

const removeFs = async (_file) => {
  let result;
  try {
    result = await remove(_file);
    logger.debug(' remove file success. path:', _file);
  } catch (err) {
    logger.debug(' remove file failed. path:', _file);
    logger.err(err);
  }
  return result;
};

const removeSyncFs = (_dir) => {
  let result;
  try {
    result = removeSync(_dir);
    logger.debug(' removeSync file success. path:', _dir);
  } catch (err) {
    logger.debug(' removeSync file failed. path:', _dir);
    logger.err(err);
  }
  return result;
};

const readFileFs = async (_file) => {
  let result;
  try {
    result = await readFile(_file, { encoding: 'utf-8' });
    logger.debug(' readFile file success. path:', _file);
  } catch (err) {
    logger.debug(' readFile file failed. path:', _file);
    logger.err(err);
  }
  return result;
};

const writeFileFs = async (_file, context) => {
  let result;
  try {
    result = await writeFile(_file, context, { encoding: 'utf-8' });
    logger.debug(' readFile file success. path:', _file);
  } catch (err) {
    logger.debug(' readFile file failed. path:', _file);
    logger.err(err);
  }
  return result;
};

const ensureFileFs = async (_file) => {
  let result;
  if (!_file) {
    logger.warn('ensure file path: ', _file);
    return null;
  }
  try {
    result = await ensureFile(_file);
    logger.debug(' ensureFile file success. path:', _file);
  } catch (err) {
    logger.debug(' ensureFile file failed. path:', _file);
    logger.err(err);
  }
  return result;
};

const ensureDirSyncFs = (_dir) => {
  let result;
  try {
    result = ensureDirSync(_dir);
    logger.debug(' ensureDirSync dir success. path:', _dir);
  } catch (err) {
    logger.debug(' ensureDirSync dir failed. path:', _dir);
    logger.err(err);
  }
  return result;
};

const ensureFileSyncFs = (_file) => {
  let result;
  try {
    result = ensureFileSync(_file);
    logger.debug(' ensureFileSync file success. path:', _file);
  } catch (err) {
    logger.debug(' ensureFileSync file failed. path:', _file);
    logger.err(err);
  }
  return result;
};

module.exports = {
  copyFs,
  copySyncFs,
  rmdirFs,
  mkdirFs,
  emptyDirFs,
  moveFs,
  outputFileFs,
  removeFs,
  removeSyncFs,
  readFileFs,
  writeFileFs,
  ensureFileFs,
  ensureDirSyncFs,
  ensureFileSyncFs
};
