const { sendJson } = require('../sendJson');

async function execute({ message, args, api }) {
  try {
    const device = await api.devices.getDevice({
      id: args[0],
      $skipCache: true,
    });
    await sendJson({ channel: message.channel, value: device });
  } catch (error) {
    await sendJson({ channel: message.channel, value: error });
  }
}

const device = {
  name: 'device',
  description: 'Fetch device by id.',
  args: true,
  usage: '<id>',
  execute,
};

module.exports = {
  device,
};
