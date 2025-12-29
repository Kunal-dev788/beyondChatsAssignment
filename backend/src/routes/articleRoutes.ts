import { Router, Request, Response } from "express";
import { Article } from "../models/Article";

const router = Router();

// Create a new article
router.post("/", async (req: Request, res: Response) => {
  try {
    const createdArticle = await Article.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: createdArticle,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Could not create article",
      error: error.message,
    });
  }
});

// Get all articles
router.get("/", async (_req: Request, res: Response) => {
  const articles = await Article.find().sort({ createdAt: -1 });

  return res.json({
    success: true,
    count: articles.length,
    data: articles,
  });
});

// Get one article by ID
router.get("/:id", async (req: Request, res: Response) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return res.status(404).json({
      success: false,
      message: "Article not found",
    });
  }

  return res.json({
    success: true,
    data: article,
  });
});


// Update article by ID
router.put("/:id", async (req: Request, res: Response) => {
  const updatedArticle = await Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  return res.json({
    success: true,
    message: "Article updated successfully",
    data: updatedArticle,
  });
});


// Delete article by ID
router.delete("/:id", async (req: Request, res: Response) => {
  await Article.findByIdAndDelete(req.params.id);

  return res.json({
    success: true,
    message: "Article deleted successfully",
  });
});

export default router;
