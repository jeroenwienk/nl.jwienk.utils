'use strict';

const Homey = require('homey');
const { v4: uuid } = require('uuid');

class TimerDriver extends Homey.Driver {
  static flow = {
    trigger_timer_end: 'trigger_timer_end',
    condition_timer_running: 'condition_timer_running',
    condition_timer_paused: 'condition_timer_paused',
    action_timer_start: 'action_timer_start',
    action_timer_pause: 'action_timer_pause',
    action_timer_resume: 'action_timer_resume',
  };

  async onInit() {
    this.log('TimerDriver has been initialized');

    this.registerTriggerTimerEnd();
    this.registerConditionTimerRunning();
    this.registerConditionTimerPaused();
    this.registerActionTimerStart();
    this.registerActionTimerPause();
    this.registerActionTimerResume();
  }

  async onPairListDevices() {
    return [
      {
        name: 'My Timer',
        data: {
          id: uuid(),
        },
      },
    ];
  }

  registerTriggerTimerEnd() {
    this.triggerTimerEnd = this.homey.flow.getDeviceTriggerCard(
      TimerDriver.flow.trigger_timer_end
    );

    this.triggerTimerEnd.registerRunListener(async (args, state) => {
      return true;
    });
  }

  registerConditionTimerRunning() {
    this.conditionTimerRunning = this.homey.flow.getConditionCard(
      TimerDriver.flow.condition_timer_running
    );

    this.conditionTimerRunning.registerRunListener(async (args, state) => {
      const value = await args.device.getCapabilityValue('timer_state');
      return value === 'running';
    });
  }

  registerConditionTimerPaused() {
    this.conditionTimerPaused = this.homey.flow.getConditionCard(
      TimerDriver.flow.condition_timer_paused
    );

    this.conditionTimerPaused.registerRunListener(async (args, state) => {
      const value = await args.device.getCapabilityValue('timer_state');
      return value === 'paused';
    });
  }

  registerActionTimerStart() {
    this.actionTimerStart = this.homey.flow.getActionCard(
      TimerDriver.flow.action_timer_start
    );

    this.actionTimerStart.registerRunListener(async (args, state) => {
      await args.device.startTimer({
        duration: args.timer_duration,
      });
      return true;
    });
  }

  registerActionTimerPause() {
    this.actionTimerPause = this.homey.flow.getActionCard(
      TimerDriver.flow.action_timer_pause
    );

    this.actionTimerPause.registerRunListener(async (args, state) => {
      await args.device.pauseTimer();
      return true;
    });
  }

  registerActionTimerResume() {
    this.actionTimerResume = this.homey.flow.getActionCard(
      TimerDriver.flow.action_timer_resume
    );

    this.actionTimerResume.registerRunListener(async (args, state) => {
      await args.device.resumeTimer();
      return true;
    });
  }
}

module.exports = TimerDriver;
