import { Schema, model, Document } from "mongoose";

export interface ArticleInterface extends Document {
  title: string;
  urlKey?: string;
  content: string;
  sourceUrl?: string;
  type: "original" | "updated";
  references: string[];
}

const ArticleSchema = new Schema<ArticleInterface>(
  {
    title: { type: String, required: true },
    urlKey: String,
    content: { type: String, required: true },
    sourceUrl: String,
    type: {
      type: String,
      enum: ["original", "updated"],
      default: "original",
    },
    references: [{ type: String }],
  },
  { timestamps: true }
);

export const Article = model<ArticleInterface>("Article", ArticleSchema);
