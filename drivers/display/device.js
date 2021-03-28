'use strict';

const Homey = require('homey');

class DisplayDevice extends Homey.Device {
  async onInit() {
    this.log('DisplayDevice has been initialized');
    const settings = this.getSettings();

    this.getCapabilities().forEach(async (capabilityId) => {
      const capabilityOptions = this.getCapabilityOptions(capabilityId);

      if (capabilityOptions.title !== settings[capabilityId]) {
        await this.setCapabilityOptions(capabilityId, {
          title: settings[capabilityId],
        });
      }

      this.registerCapabilityListener(capabilityId, async (value, opts) => {
        const capabilityOptions = this.getCapabilityOptions(capabilityId);
        this.driver.triggerDisplayTextSet.trigger(
          this,
          {
            title: capabilityOptions.title,
            value: value,
          },
          {
            capabilityId,
            value,
          }
        );
      });
    });
  }

  async onAdded() {
    this.log('DisplayDevice has been added');
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('DisplayDevice settings where changed');

    Object.entries(newSettings).forEach(async ([key, value]) => {
      if (key.startsWith('text') && value !== oldSettings[key]) {
        await this.setCapabilityOptions(key, {
          title: value,
        });
      }
    });
  }

  async onRenamed(name) {
    this.log('DisplayDevice was renamed');
  }

  async onDeleted() {
    this.log('DisplayDevice has been deleted');
  }
}

module.exports = DisplayDevice;
