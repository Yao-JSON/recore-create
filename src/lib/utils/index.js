const logger = require('./log')();
const file = require('./file');
const spawn = require('./spawn');
const otherUtils = require('./other-utils');
const nunjucks = require('./nunjucks');

module.exports = {
  ...file,
  logger,
  spawn,
  ...otherUtils,
  nunjucks
}
