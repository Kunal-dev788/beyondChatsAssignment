import { API_URL } from "../config";
import type { Article } from "../types";

export async function getArticles(): Promise<Article[]> {
  const res = await fetch(`${API_URL}/articles`);
  const data = await res.json();
  // because backend returns { success, count, data }
  return data.data as Article[];
}
