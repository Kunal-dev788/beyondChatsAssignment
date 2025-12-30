import axios from "axios";
import { searchWeb, extractTopLinks } from "./google";
import { scrapeArticleContent } from "./scraper";
import { rewriteArticle } from "./llm";

const API = "http://localhost:5000/api/articles";

type Article = {
  _id: string;
  title: string;
  content: string;
  sourceUrl: string;
  type: "original" | "updated";
};

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function retry<T>(fn: () => Promise<T>, attempts = 3, delay = 1200) {
  let last: any;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (i < attempts - 1) await sleep(delay);
    }
  }

  throw last;
}

export async function runUpdater() {
  console.log("Updater started…");

  const res = await axios.get(API);
  const all: Article[] = Array.isArray(res.data?.data)
    ? res.data.data
    : [];

  const originals = all.filter(a => a.type === "original");
  const updatedTitles = new Set(
    all.filter(a => a.type === "updated").map(a => a.title)
  );

  for (const article of originals) {
    try {
      console.log("\nProcessing:", article.title);

      const updatedTitle = `${article.title} (Updated)`;

      if (updatedTitles.has(updatedTitle)) {
        console.log("→ Skipped (already updated)");
        continue;
      }

      // GOOGLE
      const searchResult = await retry(
        () => searchWeb(article.title),
        3
      );

      let links = extractTopLinks(searchResult);

      console.log("Filtered links:", links);

      if (links.length === 0) {
        console.log("→ Skipped (no valid links found)");
        continue;
      }

      // SCRAPE
      const scraped: string[] = [];

      for (const link of links) {
        if (scraped.length === 2) break;

        try {
          const content = await retry(
            () => scrapeArticleContent(link),
            2,
            1200
          );

          if (content && content.length > 250) scraped.push(content);
        } catch {
          console.log("Scrape failed:", link);
        }
      }

      if (scraped.length === 0) {
        console.log("→ Skipped (no usable scraped content)");
        continue;
      }

      const ref1 = scraped[0];
      const ref2 = scraped[1] || "";

      // LLM
      let rewritten = await retry(
        () => rewriteArticle(article.content || "", ref1, ref2, links),
        2,
        1500
      ).catch(() => "");

      if (!rewritten || rewritten.trim().length < 150) {
        console.log("→ Skipped (rewrite invalid)");
        continue;
      }

      // SAVE
      await axios.post(API, {
        title: updatedTitle,
        content: rewritten.trim(),
        sourceUrl: article.sourceUrl,
        type: "updated",
        references: links.slice(0, 3),
      });

      console.log("Updated saved:", updatedTitle);

      await sleep(2500);
    } catch (err) {
      console.log("Failed for:", article.title);
      console.log(err);
    }
  }

  console.log("\nUpdater finished.");
}
