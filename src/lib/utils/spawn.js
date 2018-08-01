
const crossSpawn = require('cross-spawn');
const logger = require('./log')();

module.exports = function spawn(cmd, params, options = {}) {
  options.cwd = options.cwd || process.env.__ctxPath || process.cwd();
  const newOptions = Object.assign({ stdio: 'inherit' }, options);
  let result;
  try {
    result = crossSpawn.sync(cmd, params, newOptions);
  } catch (err) {
    logger.debug(cmd, params.join(' '), '. failed ');
    logger.err(err);
    process.exit(0);
  }
  if (result.status === 0) {
    logger.debug(cmd, params.join(' '), '. success ');
  } else {
    logger.debug(cmd, params.join(' '), '. failed ');
    logger.warn(cmd, params.join(' '), ' Add --debug debugging application');
    logger.err(result.error && result.error.stack);
    process.exit(0);
  }
  return result;
};
