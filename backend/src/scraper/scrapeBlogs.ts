import axios from "axios";
import * as cheerio from "cheerio";
import { Article } from "../models/Article";

const BLOG_URL = "https://beyondchats.com/blogs/";

// makes a urlKey from title
function makeUrlKey(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

// get article links from listing page
export async function getArticleLinks() {
  console.log("fetching blog page...");

  try {
    const res = await axios.get(BLOG_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(res.data);

    const links: string[] = [];

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      let link = href;

      // convert relative -> absolute
      if (link.startsWith("/")) {
        link = `https://beyondchats.com${link}`;
      }

      // only accept real blog article URLs
      const isBlogArticle =
        link.startsWith("https://beyondchats.com/blogs/") &&
        !link.includes("/tag/") &&
        !link.includes("/page/") &&
        !link.endsWith("/blogs/") &&
        !link.includes("/author/") &&
        !link.includes("share") &&
        !link.includes("privacy") &&
        !link.includes("terms") &&
        !link.includes("contact") &&
        !link.includes("faq") &&
        !link.includes("success-stories") &&
        !link.includes("case-studies");

      if (!isBlogArticle) return;

      if (!links.includes(link)) {
        links.push(link);
      }
    });

    console.log("filtered article links:", links.length);
    return links.slice(-5); // oldest 5
  } catch (err) {
    console.log("error fetching blog page:", err);
    return [];
  }
}

// scrape single article
async function scrapeArticle(url: string) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $("h1").first().text().trim();
  const content = $(".post-content").text().trim();

  return { title, content, url };
}

// main function
export const scrapeBlogs = async () => {
  console.log("scraper started");
  try {
    const links = await getArticleLinks();

    for (const url of links) {
      console.log("processing:", url);
      try {
        const article = await scrapeArticle(url);

        await Article.create({
          title: article.title,
          urlKey: makeUrlKey(article.title),
          content: article.content,
          sourceUrl: article.url,
          type: "original",
          references: [],
        });

        console.log("saved:", article.title);
      } catch {
        console.log("could not save:", url);
      }
    }
  } catch (err) {
    console.log("scrape failed:", err);
  }
};
