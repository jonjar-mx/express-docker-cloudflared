import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api",
    time: new Date().toISOString()
  });
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hola desde la API 👋" });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

