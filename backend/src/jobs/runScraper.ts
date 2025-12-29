import "dotenv/config";
import { connectDB } from "../config/db"
import { scrapeBlogs } from "../modules/scraper/scrapeBlogs";

(async () => {
  await connectDB();
  await scrapeBlogs();
  process.exit();
})();
