'use strict';

const Homey = require('homey');
const { v4: uuid } = require('uuid');

class DisplayDriver extends Homey.Driver {
  static flow = {
    trigger_display_text_set: 'trigger_display_text_set',
    action_display_text_set: 'action_display_text_set',
  };

  async onInit() {
    this.log('DisplayDriver has been initialized');

    this.registerTriggerDisplayTextChanged();
    this.registerActionDisplayTextSet();
  }

  async onPairListDevices() {
    return [
      {
        name: 'My Display',
        data: {
          id: uuid(),
        },
      },
    ];
  }

  registerTriggerDisplayTextChanged() {
    this.triggerDisplayTextSet = this.homey.flow.getDeviceTriggerCard(
      DisplayDriver.flow.trigger_display_text_set
    );

    this.triggerDisplayTextSet.registerRunListener(async (args, state) => {
      return args.capability.id === state.capabilityId;
    });

    this.triggerDisplayTextSet.registerArgumentAutocompleteListener(
      'capability',
      async (query, args) => {
        return args.device
          .getCapabilities()
          .map((capabilityId) => {
            const capabilityOptions = args.device.getCapabilityOptions(
              capabilityId
            );

            return {
              id: capabilityId,
              name: capabilityOptions.title,
            };
          })
          .filter((option) => {
            return option.name.toLowerCase().includes(query.toLowerCase());
          });
      }
    );
  }

  registerActionDisplayTextSet() {
    this.actionDisplayTextSet = this.homey.flow.getActionCard(
      DisplayDriver.flow.action_display_text_set
    );

    this.actionDisplayTextSet.registerRunListener(async (args, state) => {
      // dont try to optimize because the same value might be set
      // and a trigger is expected anyway
      // const currentValue = args.device.getCapabilityValue(args.capability.id);

      // if (currentValue !== args.content) {
      await args.device.triggerCapabilityListener(
        args.capability.id,
        args.content
      );
      // }

      return true;
    });

    this.actionDisplayTextSet.registerArgumentAutocompleteListener(
      'capability',
      async (query, args) => {
        return args.device
          .getCapabilities()
          .map((capabilityId) => {
            const capabilityOptions = args.device.getCapabilityOptions(
              capabilityId
            );

            return {
              id: capabilityId,
              name: capabilityOptions.title,
            };
          })
          .filter((option) => {
            return option.name.toLowerCase().includes(query.toLowerCase());
          });
      }
    );
  }
}

module.exports = DisplayDriver;
