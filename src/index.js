import "dotenv/config";
import express from "express";
import usersRouter from "./routes/users.routes.js";

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API activa" });
});

app.use("/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.code === "P2025") {
    return res.status(404).json({ message: "Recurso no encontrado" });
  }

  return res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
