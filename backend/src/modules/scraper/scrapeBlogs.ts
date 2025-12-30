import axios from "axios";
import * as cheerio from "cheerio";
import { Article } from "../../models/Article";
import sanitizeHtml from "sanitize-html";

const BLOG_URL = "https://beyondchats.com/blogs/";

function makeUrlKey(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

export async function getArticleLinks() {
  try {
    const res = await axios.get(BLOG_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const $ = cheerio.load(res.data);
    const links: string[] = [];

    $("a").each((_, el) => {
      let href = $(el).attr("href");
      if (!href) return;

      if (href.startsWith("/"))
        href = `https://beyondchats.com${href}`;

      const ok =
        href.startsWith("https://beyondchats.com/blogs/") &&
        !href.includes("/tag/") &&
        !href.includes("/page/") &&
        !href.endsWith("/blogs/");

      if (ok && !links.includes(href)) links.push(href);
    });

    // last 5 only
    return links.slice(-5);
  } catch {
    return [];
  }
}

async function scrapeArticle(url: string) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $("h1").first().text().trim();
  const raw = $(".post-content").html() || "";

  const clean = sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
      "h1",
      "h2",
      "h3",
      "h4",
      "span",
      "blockquote",
      "pre",
      "code",
    ]),
    allowedAttributes: {
      "*": ["class"],
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
  });

  let finalHtml = clean
    .replace(/For more such amazing content[\s\S]*?<\/p>/gi, "")
    .replace(/<p>\s*\d+\s*<\/p>/gi, "")
    .replace(/<span>\s*\d+\s*<\/span>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  return { title, content: finalHtml, url };
}

export const scrapeBlogs = async () => {
  const links = await getArticleLinks();

  for (const url of links) {
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

      console.log("Saved:", article.title);
    } catch {
      console.log("Skipped:", url);
    }
  }
};
