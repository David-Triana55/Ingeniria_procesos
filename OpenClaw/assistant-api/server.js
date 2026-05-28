require("dotenv").config();

const express = require("express");
const azureDevopsService = require("./services/azureDevops");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Assistant API running"
  });
});

app.get("/bugs", async (req, res) => {
  try {
    const bugs = await azureDevopsService.getMyActiveBugs();

    res.json({
      count: bugs.length,
      bugs
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Error getting bugs"
    });
  }
});

app.get("/bugs/:id", async (req, res) => {
  try {
    const bug = await azureDevopsService.getBugById(
      req.params.id
    );

    res.json(bug);
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Error getting bug detail"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});