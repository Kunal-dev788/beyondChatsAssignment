import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODELS = [
  "models/gemini-2.5-flash",
  "models/gemini-2.5-pro",
  "models/gemini-1.5-flash",
];

export async function rewriteArticle(
  original: string,
  ref1: string,
  ref2: string,
  links: string[]
) {
  const prompt = `
Rewrite the blog below into a polished, human-like article.

Goals
- Maintain meaning (NO hallucinations)
- Improve readability + structure
- SEO friendly headings (H2/H3)
- Short paragraphs
- Natural tone
- No emojis, ads, or fluff
- Do NOT repeat content
- Format using Markdown

At the bottom, include:

## References
${links.map((l) => `- ${l}`).join("\n")}

---

Original Article:
${original}

Reference Extracts:
${ref1.slice(0, 500)}

${ref2?.slice(0, 500) || ""}
`;

  for (const m of MODELS) {
    try {
      console.log("Trying model:", m);
      const model = genAI.getGenerativeModel({ model: m });

      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (err: any) {
      console.log("Model failed:", m);
      console.log("Gemini error:", err?.response ?? err?.message ?? err);
    }
  }

  throw new Error("All models failed");
}
