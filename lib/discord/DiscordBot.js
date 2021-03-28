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

  async init() {
    this.client.on('ready', async () => {
      this.log(`Logged in as ${this.client.user.tag}!`);
    });
    this.client.on('message', this.handleMessage.bind(this));

    try {
      await this.client.login(this.homey.settings.get('discord_bot_token'));
    } catch (error) {
      this.client.destroy();
      this.error(error);
    }

    this.homey.settings.on('set', async (key) => {
      if (key === 'discord_bot_token') {
        try {
          await this.client.login(this.homey.settings.get('discord_bot_token'));
        } catch (error) {
          this.client.destroy();
          this.error(error);
        }
      }
    });

    this.registerActionDiscordMessageSend();
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

        await command.execute({ message, args, api: this.homeyAPI });
      } catch (error) {
        this.error(error);
        message.reply('There was an error trying to execute that command!');
      }
    }
  }

  getArgs(message) {
    const matches = message.content
      .slice(message.client.commandPrefix.length)
      .trim()
      .matchAll(/'(.*?)'|"(.*?)"|\S+/g);

    const args = [];

    for (const match of matches) {
      if (match[1] != null || match[2] != null) {
        args.push(match[1] != null ? match[1] : match[2]);
      } else {
        args.push(match[0]);
      }
    }

    return args;
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

  registerActionDiscordMessageSend() {
    this.actionDiscordMessageSend = this.homey.flow.getActionCard(
      'action_discord_message_send'
    );

    this.actionDiscordMessageSend.registerRunListener(async (args, state) => {
      const channel = await this.client.channels.fetch(args.channel.id);
      await channel.send(args.content);

      return true;
    });

    this.actionDiscordMessageSend.registerArgumentAutocompleteListener(
      'channel',
      async (query, args) => {
        const guildId = this.homey.settings.get('discord_bot_guild_id');
        // todo throw on no guild id

        const guild = await this.client.guilds.fetch(guildId);

        const channels = guild.channels.cache;
        const textChannels = channels.filter((channel) => {
          return (
            channel.type === 'text' &&
            channel.name.toLowerCase().includes(query.toLowerCase())
          );
        });

        return textChannels.map((channel) => {
          return {
            id: channel.id,
            name: channel.name,
            description: channel.guild.name,
          };
        });
      }
    );
  }
}

module.exports = {
  DiscordBot,
};
