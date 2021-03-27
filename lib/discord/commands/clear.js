const { sendJson } = require('../sendJson');

async function execute({ message, args, api }) {
  try {
    const countStr = args[0];

    if (countStr) {
      const count = parseInt(countStr, 10);
      await message.channel.bulkDelete(Math.min(count + 1, 100), true);

      return;
    }

    await message.channel.bulkDelete(100, true);
  } catch (error) {
    await sendJson({ channel: message.channel, value: error });
  }
}

const clear = {
  name: 'clear',
  description: 'Clear messages.',
  execute,
};

module.exports = {
  clear,
};
