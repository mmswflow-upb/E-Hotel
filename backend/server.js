// server.js
const seed = require("./dataLoader");

(async () => {
  try {
    console.log("🔄 Seeding data…");
    await seed();
    console.log("✅ Data seeded—starting server");
  } catch (err) {
    console.error("❌ DataLoader failed:", err);
    process.exit(1);
  }

  // now start Express
  const express = require("express");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const api = require("./routes");
  require("./firebase");

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use("/api", api);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
})();
