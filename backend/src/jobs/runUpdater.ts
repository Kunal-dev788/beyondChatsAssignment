import { runUpdater } from "../modules/updater/updater";
import "dotenv/config";

(async () => {
  await runUpdater();
  process.exit();
})();
