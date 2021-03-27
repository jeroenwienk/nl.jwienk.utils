'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('athom-api');

const { DiscordBot } = require('./lib/discord/DiscordBot');

if (process.env.DEBUG === '1') {
  require('inspector').open(9230, '0.0.0.0', false);
}

class UtilsApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('UtilsApp has been initialized');

    this.homeyAPI = await HomeyAPI.forCurrentHomey(this.homey);

    this.discordBot = new DiscordBot({
      homey: this.homey,
      homeyAPI: this.homeyAPI,
    });

    this.discordBot.init();
  }
}

module.exports = UtilsApp;
