const { sendJson } = require('../sendJson');

async function execute({ message, args, api }) {
  try {
    const devices = await api.devices.getDevices({
      $skipCache: true,
    });
    const reduced = Object.values(devices).reduce((accumulator, device) => {
      accumulator[device.id] = {
        name: device.name,
        zoneName: device.zoneName,
      };
      return accumulator;
    }, {});

    await sendJson({ channel: message.channel, value: reduced });
  } catch (error) {
    await sendJson({ channel: message.channel, value: error });
  }
}

const devices = {
  name: 'devices',
  description: 'Fetch devices.',
  execute,
};

module.exports = {
  devices,
};
