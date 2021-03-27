const { sendJson } = require('../sendJson');

async function execute({ message, args, api }) {
  try {
    const commands = message.client.commands;
    const data = [];

    const name = args[0] ? args[0].toLowerCase() : null;
    const command = commands.get(name);

    if (command != null) {
      data.push(`**Name:** ${command.name}`);

      command.description != null &&
        data.push(`**Description:** ${command.description}`);
      command.usage != null &&
        data.push(
          `**Usage:** ${message.client.commandPrefix}${command.name} ${command.usage}`
        );
    } else {
      data.push("Here's a list of all my commands:");
      data.push(commands.map((command) => command.name));
      data.push(
        `\nYou can send \`${message.client.commandPrefix}commands <command>\` to get info on a specific command!`
      );
    }

    message.channel.send(data, { split: true });
  } catch (error) {
    await sendJson({ channel: message.channel, value: error });
  }
}

const commands = {
  name: 'commands',
  description: 'List all of my commands or info about a specific command.',
  usage: '<command>',
  execute,
};

module.exports = {
  commands,
};
