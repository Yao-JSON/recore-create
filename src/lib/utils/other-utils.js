const { statSync, readdirSync } = require('fs');
const logger = require('./log')();

const isDir = (_paths) => {
  try {
    const stat = statSync(_paths);
    if (stat.isDirectory()) return true;
  } catch (err) {
    logger.debug('detect "', _paths, '" is not a folder', 'ERR: ', err);
    return false;
  }
  return false;
};

const isFile = (_paths) => {
  try {
    const stat = statSync(_paths);
    if (stat.isFile()) {
      return true;
    }
  } catch (err) {
    logger.debug('detect "', _paths, '" is not a file。', 'ERR: ', err);
    return false;
  }
  return false;
};

const isEmptyDir = (_paths) => {
  if (!isDir(_paths)) {
    return true;
  }
  return !readdirSync(_paths).length;
};

const isDebug = (argv) => {
  process.env.XDEV_DEBUG = !!argv.debug;
}


module.exports = {
  isDir,
  isFile,
  isEmptyDir,
  isDebug
}
