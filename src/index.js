import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("👑 WISE PRINCE BOT PLATFORM IS RUNNING!");
});

app.get("/api/status", (req, res) => {
  res.json({
    name: "WISE PRINCE",
    status: "online",
    version: "1.0.0"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`WISE PRINCE running on port ${PORT}`);
});
