import DiscourseURL from 'discourse/lib/url';

const patreonGroups = [
  "spectacular_saplings",
  "stunning_seedlings",
  "super_sprouts",
  "terrific_trees"
];

export default Ember.Component.extend({
  classNames: 'homepage-category',

  click() {
    const currentUser = this.get('currentUser');
    const category = this.get('category');

    if (category.has_access) {
      let slug = category.slug;

      if ((category.slug === 'private' || category.slug === 'pro') && currentUser.groups.length) {
        let userPatreonGroup = currentUser.groups.find(g => patreonGroups.indexOf(g.name) > -1);
        if (userPatreonGroup) {
          slug = userPatreonGroup.name.dasherize();
        }
      }

      DiscourseURL.routeTo('/c/' + slug);
    } else {
      if (currentUser) {
        DiscourseURL.routeTo(Discourse.SiteSettings.hsp_patreon_link);
      } else {
        this.sendAction('showLogin');
      }
    }
  }
});