import axios from "axios";
import { searchWeb, extractTopLinks } from "./google";
import { scrapeArticleContent } from "./scraper";
import { rewriteArticle } from "./llm";

const API = "http://localhost:5000/api/articles";

export async function runUpdater() {
  // get all articles
  const res = await axios.get(API);
  console.log("API response:", res.data);
  const articles = Array.isArray(res.data?.data) ? res.data.data : [];

  const originalArticles = articles.filter((a: any) => a.type === "original");

  for (const article of originalArticles) {
    console.log("Processing:", article.title);

    // Checking if an updated version already exists
    const existing = await axios.get(API);

    const alreadyUpdated = existing.data?.data?.some(
      (a: any) =>
        a.title === article.title + " (Updated)" && a.type === "updated"
    );

    if (alreadyUpdated) {
      console.log("Skipping — already updated\n");
      continue;
    }

    // Search Google
    const html = await searchWeb(article.title);
    const links = extractTopLinks(html);

    console.log("Google links:", links);

    if (links.length < 2) {
      console.log("Skipping — not enough links");
      continue;
    }

    // Scrape both refs
    const first = await scrapeArticleContent(links[0]);
    const second = await scrapeArticleContent(links[1]);

    // Rewrite with Gemini
    const updatedContent = await rewriteArticle(
      article.content,
      first,
      second,
      links
    );

    // Save
    await axios.post(API, {
      title: article.title + " (Updated)",
      content: updatedContent,
      sourceUrl: article.sourceUrl,
      type: "updated",
      references: links,
    });

    console.log("Updated saved:", article.title);
  }
}
