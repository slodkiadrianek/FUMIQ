import { app } from "./app.js";
import { Db } from "./config/database.config.js";
import { caching } from "./app.js";
import { RedisCacheService } from "./types/common.type.js";
app.listen("3000", async () => {
  new Db(process.env.DB_LINK || "");
  await (caching as RedisCacheService).set("key", "value") ;
  const value = await (caching as RedisCacheService).get("key");
  if (value) {
    console.log(`Caching service is working`);
  }
  console.log(`server is working`);
});