# name: hsp-plugin
# about: HSP's Discourse plugin
# version: 0.0.1
# authors: Angus McLeod
# url: https://github.com/angusmcleod/hsp-plugin

if respond_to?(:register_svg_icon)
  register_svg_icon "facebook"
  register_svg_icon "twitter"
  register_svg_icon "wordpress"
end

after_initialize do
  class DiscourseLanding::PageController < ::ApplicationController
    def index
      category_ids = [*SiteSetting.hsp_homepage_categories.split('|')]
      categories = Category.where(id: category_ids).to_a
        .sort_by { |a| category_ids.index(a.id.to_s) }
      render json: ActiveModel::ArraySerializer.new(
        categories,
        each_serializer: HomepageCategorySerializer,
        scope: Guardian.new(current_user),
        root: false
      )
    end
  end

  class ::HomepageCategorySerializer < ApplicationSerializer
    attributes :id,
               :name,
               :slug,
               :description,
               :description_text,
               :has_access

    has_one :uploaded_logo, embed: :object, serializer: CategoryUploadSerializer

    def has_access
      scope.can_see_category?(object)
    end
  end
end