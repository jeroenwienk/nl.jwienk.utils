const { commands } = require('./commands');
const { clear } = require('./clear');
const { whois } = require('./whois');

const { devices } = require('./devices');
const { device } = require('./device');

module.exports = {
  commands,
  clear,
  whois,
  device,
  devices,
};
