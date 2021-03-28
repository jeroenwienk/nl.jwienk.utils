const { sendJson } = require('../sendJson');

async function execute({ message, args, api }) {
  try {
    const device = await api.devices.getDevice({
      id: args[0],
      $skipCache: true,
    });

    if (args[1] === 'capabilities') {
      if (args[2] != null) {
        const capability = device.capabilitiesObj[args[2]];
        if (capability == null) {
          throw new Error(`Unknown capability ${args[2]}`);
        }

        let value = args[3];

        switch (capability.type) {
          case 'boolean':
            value = value === 'true' ? true : value === 'false' ? false : null;
            break;
          default:
            break;
        }

        const result = await api.devices.setCapabilityValue({
          deviceId: device.id,
          capabilityId: capability.id,
          value: value,
        });
        await sendJson({ channel: message.channel, value: result });
        return;
      }

      await sendJson({
        channel: message.channel,
        value: device.capabilitiesObj,
      });
      return;
    }

    if (args[1] === 'quickaction') {
      const capability = device.capabilitiesObj[device.ui.quickAction];

      if (capability != null) {
        const result = await api.devices.setCapabilityValue({
          deviceId: device.id,
          capabilityId: capability.id,
          value: !capability.value,
        });

        await sendJson({ channel: message.channel, value: result });
        return;
      }
    }

    await sendJson({ channel: message.channel, value: device });
  } catch (error) {
    await sendJson({ channel: message.channel, value: error });
  }
}

const device = {
  name: 'device',
  description: 'Fetch device by id.',
  args: true,
  usage: '<id> [,<subcommand> [,<capabilityId> [,<capabilityValue>]]]',
  execute,
};

module.exports = {
  device,
};
