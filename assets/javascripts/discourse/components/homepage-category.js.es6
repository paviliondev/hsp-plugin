import DiscourseURL from 'discourse/lib/url';

export default Ember.Component.extend({
  classNames: 'homepage-category',

  click() {
    const currentUser = this.get('currentUser');
    const category = this.get('category');

    if (currentUser) {
      if (category.has_access) {
        DiscourseURL.routeTo('/c/' + category.slug);
      } else {
        DiscourseURL.routeTo(Discourse.SiteSettings.hsp_patreon_link);
      }
    } else {
      this.sendAction('showLogin');
    }
  }
});