require "jekyll"
require "jekyll/page_without_a_file"

module Jekyll
  class TagPage < PageWithoutAFile
    def initialize(site:, tag:, posts:)
      slug = Utils.slugify(tag, mode: "latin")

      @site = site
      @base = site.source
      @dir  = File.join("tag", slug)
      @name = "index.html"

      process(@name)

      self.data = {
        "layout" => "tag",
        "tag" => tag,
        "tag_slug" => slug,
        "title" => "Tag: #{tag}",
        "permalink" => "/tag/#{slug}/",
        "hero_title" => tag,
        "hero_subtitle" => "#{posts.size} #{posts.size == 1 ? 'post' : 'posts'}",
        "tag_posts" => posts.sort_by { |post| post.date }.reverse,
        "nav_exclude" => true,
      }
    end
  end

  class TagPageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      site.tags.each do |tag, posts|
        site.pages << TagPage.new(site: site, tag: tag, posts: posts)
      end
    end
  end
end
