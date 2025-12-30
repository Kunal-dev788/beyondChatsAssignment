export interface Article {
  _id: string;
  title: string;
  content: string;
  type: "original" | "updated";
  sourceUrl?: string;
  references?: string[];
  createdAt?: string;
  updatedAt?: string;
}
