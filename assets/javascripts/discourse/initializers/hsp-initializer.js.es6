import { default as computed } from 'ember-addons/ember-computed-decorators';
import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'hsp-initializer',
  initialize() {
    withPluginApi('0.8.12', api => {
      api.modifyClass('controller:landing', {
        @computed('model')
        firstCategories(categories) {
          return categories.slice(0, 3);
        },

        @computed('model')
        secondCategories(categories) {
          return categories.slice(3, 6);
        }
      });
    });
  }
};