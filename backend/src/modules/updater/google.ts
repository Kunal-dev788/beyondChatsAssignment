import axios from "axios";
import "dotenv/config";

const GOOGLE_API = "https://www.googleapis.com/customsearch/v1";

export async function searchWeb(query: string) {
  const apiKey = process.env.GOOGLE_API_KEY!;
  const cx = process.env.GOOGLE_CX!;

  try {
    const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key: apiKey, cx, q: query },
    });

    return res.data;
  } catch (err: any) {
    console.log("GOOGLE ERROR RESPONSE:", err?.response?.data);
    throw err;
  }
}

export function extractTopLinks(result: any) {
  if (!Array.isArray(result.items)) return [];

  return result.items
    .map((item: any) => item.link)
    .filter((link: string) => link?.startsWith("http"))
    .slice(0, 2);
}
