import { default as computed, observes } from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
classNameBindings: ['visibility:visible', ':logo-container'],

  @computed('currentPath')
  visibility(currentPath) {
    return currentPath.indexOf('topic') === -1;
  },

  @observes('visibility')
  toggleBodyClass() {
    const visibility = this.get('visibility');
    $('body').toggleClass('has-logo', visibility);
  }
});