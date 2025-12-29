import "dotenv/config";
import { connectDB } from "./src/config/db";
import { scrapeBlogs } from "./src/scraper/scrapeBlogs";

(async () => {
  await connectDB();
  await scrapeBlogs();
  process.exit();
})();
