import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const posts = await getCollection("blog");
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: sortedPosts.map((post) => {
      const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
      return {
        ...post.data,
        link: `/post/${path}/`,
        pubDate: new Date(post.data.date).toUTCString(),
      };
    }),
  });
}
