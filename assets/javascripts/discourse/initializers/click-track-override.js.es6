import { default as ClickTrack, isValidLink } from "discourse/lib/click-track";
import { ajax } from "discourse/lib/ajax";
import DiscourseURL from "discourse/lib/url";
import { wantsNewWindow } from "discourse/lib/intercept-click";
import { selectedText } from "discourse/lib/utilities";

export default {
  name: 'click-track-override',
  initialize() {
    ClickTrack.trackClick = function(e) {
      // right clicks are not tracked
      if (e.which === 3) {
        return true;
      }

      // Cancel click if triggered as part of selection.
      const selection = window.getSelection();
      if (selection.type === "Range" || selection.rangeCount > 0) {
        if (selectedText() !== "") {
          return true;
        }
      }

      const $link = $(e.currentTarget);
      const tracking = isValidLink($link);

      // Return early for mentions and group mentions
      if ($link.is(".mention, .mention-group")) {
        return true;
      }

      if ($link.hasClass("attachment")) {
        // Warn the user if they cannot download the file.
        if (
          Discourse.SiteSettings.prevent_anons_from_downloading_files &&
          !Discourse.User.current()
        ) {
          bootbox.alert(I18n.t("post.errors.attachment_download_requires_login"));
          return false;
        }

        return true;
      }

      let href = ($link.attr("href") || $link.data("href") || "").trim();
      if (!href || href.indexOf("mailto:") === 0) {
        return true;
      }

      const $article = $link.closest(
        "article:not(.onebox-body), .excerpt, #revisions"
      );
      const postId = $article.data("post-id");
      const topicId = $("#topic").data("topic-id") || $article.data("topic-id");
      const userId = $link.data("user-id") || $article.data("user-id");
      const ownLink = userId && userId === Discourse.User.currentProp("id");

      // Update badge clicks unless it's our own.
      if (tracking && !ownLink) {
        const $badge = $("span.badge", $link);
        if ($badge.length === 1) {
          const html = $badge.html();
          const key = `${new Date().toLocaleDateString()}-${postId}-${href}`;
          if (/^\d+$/.test(html) && !sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, true);
            $badge.html(parseInt(html, 10) + 1);
          }
        }
      }

      const trackPromise = tracking
        ? ajax("/clicks/track", {
            data: {
              url: href,
              post_id: postId,
              topic_id: topicId
            }
          })
        : Ember.RSVP.resolve();

      const isInternal = DiscourseURL.isInternal(href);
      const openExternalInNewTab = true; /*Discourse.User.currentProp(
        "external_links_in_new_tab"
      );*/

      if (!wantsNewWindow(e)) {
        if (!isInternal && openExternalInNewTab) {
          const newWindow = window.open(href, "_blank");
          newWindow.opener = null;
          newWindow.focus();

          // Hack to prevent changing current window.location.
          // e.preventDefault() does not work.
          if (!$link.data("href")) {
            $link.addClass("no-href");
            $link.data("href", $link.attr("href"));
            $link.attr("href", null);
            $link.data("auto-route", true);

            Ember.run.later(() => {
              $link.removeClass("no-href");
              $link.attr("href", $link.data("href"));
              $link.data("href", null);
              $link.data("auto-route", null);
            }, 50);
          }
        } else {
          trackPromise.finally(() => {
            if (isInternal) {
              DiscourseURL.routeTo(href);
            } else {
              DiscourseURL.redirectTo(href);
            }
          });
        }

        return false;
      }

      return true;
    };
  }
};
