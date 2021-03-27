const { sendJson } = require('../sendJson');

async function execute({ message, args, api }) {
  const taggedUser = message.mentions.users.first();
  await sendJson({ channel: message.channel, value: taggedUser });
}

const whois = {
  name: 'whois',
  description: 'Whois a mentioned user.',
  mentions: true,
  usage: '@<user>',
  execute,
};

module.exports = {
  whois,
};
