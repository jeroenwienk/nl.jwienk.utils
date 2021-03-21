'use strict';

const Homey = require('homey');

const TimerDriver = require('./driver');

class TimerDevice extends Homey.Device {
  async onInit() {
    this.log('TimerDevice has been initialized');
    const settings = this.getSettings();

    this.timerTimeout = null;
    this.timerInterval = null;

    this.durationUpdateInterval = settings.duration_update_interval;

    this.state = this.getCapabilityValue('timer_state');
    this.duration = this.getCapabilityValue('timer_duration');
    this.durationEnd = null;

    // todo could try to recover after restart
    if (this.state === 'running' || this.state === 'paused') {
      this.state = 'idle';
      this.duration = 0;

      this.setCapabilityValue('timer_state', this.state);
      this.setCapabilityValue('timer_duration', this.duration);
    }

    this.triggerTimerEnd = this.homey.flow.getDeviceTriggerCard(
      TimerDriver.flow.trigger_timer_end
    );
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('TimerDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('TimerDevice settings where changed');
    this.durationUpdateInterval = newSettings.duration_update_interval;
  }

  async onRenamed(name) {
    this.log('TimerDevice was renamed');
  }

  async onDeleted() {
    this.log('TimerDevice has been deleted');
    this.clear();
  }

  clearTimeout() {
    this.homey.clearTimeout(this.timerTimeout);
  }

  clearInterval() {
    this.homey.clearInterval(this.timerInterval);
  }

  clear() {
    this.clearTimeout();
    this.clearInterval();
  }

  async startTimer({ duration }) {
    this.clear();
    this.validate({ duration });

    this.durationEnd = Date.now() + duration;

    this.duration = duration;
    this.state = 'running';

    await this.setCapabilityValue('timer_state', this.state);
    await this.setCapabilityValue('timer_duration', this.duration);

    this.startOrResume();
  }

  async stopTimer() {
    if (this.state === 'running' || this.state === 'paused') {
      this.clear();

      this.state = 'idle';
      this.duration = 0;
      this.durationEnd = null;

      await this.setCapabilityValue('timer_state', this.state);
      await this.setCapabilityValue('timer_duration', this.duration);
    }
  }

  async pauseTimer() {
    if (this.state === 'running') {
      this.clear();
      this.state = 'paused';

      const currentTime = Date.now();
      this.duration = this.durationEnd - currentTime;
      this.durationEnd = Date.now() + this.duration;

      await this.setCapabilityValue('timer_state', this.state);
      await this.setCapabilityValue('timer_duration', this.duration);
    }
  }

  async resumeTimer() {
    if (this.state === 'paused') {
      this.state = 'running';
      await this.setCapabilityValue('timer_state', this.state);

      this.validate({ duration: this.duration });

      this.startOrResume();
    }
  }

  startOrResume() {
    this.timerTimeout = this.homey.setTimeout(
      this.timeoutHandler.bind(this),
      this.duration
    );

    this.timerInterval = this.homey.setInterval(
      this.intervalHandler.bind(this),
      this.durationUpdateInterval
    );
  }

  async timeoutHandler() {
    this.clearInterval();

    this.durationEnd = null;

    this.duration = 0;
    this.state = 'idle';

    await this.setCapabilityValue('timer_state', this.state);
    await this.setCapabilityValue('timer_duration', this.duration);
    await this.triggerTimerEnd.trigger(this, {}, {});
  }

  async intervalHandler() {
    this.duration -= this.durationUpdateInterval;
    if (this.duration < 0) this.duration = 0;

    await this.setCapabilityValue('timer_duration', this.duration);
  }

  validate({ duration }) {
    if (typeof duration !== 'number') {
      throw new Error(
        this.homey.__('timer.duration.type', { value: typeof duration })
      );
    }

    if (duration < 0) {
      throw new Error(
        this.homey.__('timer.duration.positive', { value: duration })
      );
    }
  }
}

module.exports = TimerDevice;
