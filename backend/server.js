// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const api = require("./routes");
const { seed } = require("./dataLoader");
require("./firebase");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount all routes under /api
app.use("/api", api);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

// Check if --seed argument is provided
const shouldSeed = process.argv.includes("--seed");

// Start the server
app.listen(PORT, async () => {
  console.log(`🚀 Listening on port ${PORT}`);

  if (shouldSeed) {
    console.log("🌱 Seeding database...");
    try {
      await seed();
      console.log("✅ Database seeded successfully");
    } catch (error) {
      console.error("❌ Error seeding database:", error);
    }
  }
});
