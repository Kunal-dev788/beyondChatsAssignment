import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Gemini model used for rewriting articles
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash",
});

export async function rewriteArticle(
  original: string,
  ref1: string,
  ref2: string,
  links: string[]
) {
  const prompt = `
Rewrite the article clearly, in natural human language.

Rules:
- don't copy text directly from references
- keep the same meaning
- improve structure + readability
- short paragraphs
- avoid robotic tone
- markdown friendly

Add this block at the end:

## References
1. ${links[0]}
2. ${links[1]}

Original:
"""
${original}
"""

Reference 1:
"""
${ref1}
"""

Reference 2:
"""
${ref2}
"""
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    // Handle rate limit (429)
    if (err?.status === 429) {
      console.log("Rate limit hit — waiting 15s...");
      await new Promise((r) => setTimeout(r, 15000));

      // retry once
      return await rewriteArticle(original, ref1, ref2, links);
    }

    // Any other error → fallback
    console.error("Gemini rewrite failed — fallback used", err);

    return `
${original}

## References
1. ${links[0]}
2. ${links[1]}
`;
  }
}
