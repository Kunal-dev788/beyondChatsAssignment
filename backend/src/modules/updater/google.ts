import axios from "axios";
import "dotenv/config";

type GoogleItem = {
  link?: string;
};

type GoogleSearchResult = {
  items?: GoogleItem[];
};

export async function searchWeb(query: string): Promise<GoogleSearchResult> {
  const apiKey = process.env.GOOGLE_API_KEY!;
  const cx = process.env.GOOGLE_CX!;

  try {
    const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: {
        key: apiKey,
        cx,
        q: query,      
        num: 8
      },
    });

    return res.data;
  } catch (err: any) {
    console.log("GOOGLE ERROR:", err?.response?.data || err);
    throw err;
  }
}

export function extractTopLinks(result: GoogleSearchResult): string[] {
  if (!Array.isArray(result.items)) return [];

  return result.items
    .map(item => item.link ?? "")
    .filter(link => link.startsWith("http"))
    // prefer article-looking pages
    .filter(link =>
      /(blog|article|post|insights|news|guide|learn|resources|case)/i.test(link)
    )
    // remove junk
    .filter(
      link =>
        !/(reddit|forum|community|support|docs|github|raw|pdf|login|policy|terms|account|download)/i.test(
          link
        )
    )
    .slice(0, 5);
}
