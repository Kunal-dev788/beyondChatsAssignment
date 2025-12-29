import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeArticleContent(url: string) {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const $ = cheerio.load(res.data);

    let text = "";

    $("p").each((_, p) => {
      text += $(p).text() + "\n";
    });

    return text.trim();
  } catch {
    return "";
  }
}
