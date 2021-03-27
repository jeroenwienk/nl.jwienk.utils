const Homey = require('homey');
const Discord = require('discord.js');

const commands = require('./commands');
const commandPrefix = '!';

class DiscordBot {
  constructor({ homey, homeyAPI }) {
    this.homey = homey;
    this.homeyAPI = homeyAPI;
    this.log = this.homey.app.log;
    this.error = this.homey.app.error;

    this.client = new Discord.Client();
    this.client.commands = new Discord.Collection();
    this.client.commandPrefix = commandPrefix;

    Object.values(commands).forEach((command) => {
      this.client.commands.set(command.name, command);
    });
  }

  init() {
    this.client.on('ready', () => {
      this.log(`Logged in as ${this.client.user.tag}!`);
    });
    this.client.on('message', this.handleMessage.bind(this));
    this.client.login(Homey.env.DISCORD_TOKEN);
  }

  async handleMessage(message) {
    if (
      message.guild == null ||
      message.author.bot === true ||
      message.content.startsWith(this.client.commandPrefix) === false
    ) {
      return;
    }

    const args = this.getArgs(message);
    const commandName = args.shift().toLowerCase();

    if (this.client.commands.has(commandName)) {
      try {
        const command = this.client.commands.get(commandName);

        if (
          this.didValidateArgsAndReplied({ command, message, args }) ||
          this.didValidateMentionsAndReplied({ command, message, args })
        ) {
          return;
        }

        command.execute({ message, args, api: this.homeyAPI });
      } catch (error) {
        this.error(error);
        message.reply('There was an error trying to execute that command!');
      }
    }
  }

  getArgs(message) {
    return message.content
      .slice(message.client.commandPrefix.length)
      .trim()
      .split(/ +/);
  }

  didValidateArgsAndReplied({ command, message, args }) {
    if (command.args === true && args.length === 0) {
      let reply = `You didn't provide any arguments, ${message.author}!`;

      if (command.usage) {
        reply += `\nThe proper usage would be: \`${this.client.commandPrefix}${command.name} ${command.usage}\``;
      }

      message.channel.send(reply);
      return true;
    }
    return false;
  }

  didValidateMentionsAndReplied({ command, message, args }) {
    if (command.mentions === true && message.mentions.users.size === 0) {
      let reply = `You didn't provide any mentions, ${message.author}!`;

      if (command.usage) {
        reply += `\nThe proper usage would be: \`${this.client.commandPrefix}${command.name} ${command.usage}\``;
      }

      message.channel.send(reply);
      return true;
    }

    return false;
  }
}

module.exports = {
  DiscordBot,
};
