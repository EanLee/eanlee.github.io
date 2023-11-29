import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const posts = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => {
      console.log(post.id);
      const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
      return {
        ...post.data,
        link: `/post/${path}/`,
        pubDate: new Date(post.data.date).toUTCString(),
      };
    }),
  });
}
