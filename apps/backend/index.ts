import "reflect-metadata";
import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { config, initializeDatabase } from "./config";
import routes from "./routes";
import { ObjectStorageService } from "./objectStorage";
import { runProductionSeed } from "./seeds/productionSeed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(compression());

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://localhost",
  "capacitor://localhost",
  "http://localhost",
  process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "",
  process.env.REPLIT_DEPLOYMENT_URL || "",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.some(
          (allowed) => origin.startsWith(allowed) || allowed.includes(origin),
        )
      ) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(null, true);
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`→ ${req.method} ${req.path}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
});

app.use("/uploads", (req, res) => {
  res.redirect(301, `/objects${req.path}`);
});

// app.use('/objects', async (req, res, next) => {
//   if (req.method !== 'GET') {
//     return next();
//   }

//   const objectStorageService = new ObjectStorageService();
//   const objectPath = `/objects${req.path}`;

//   console.log('[DEBUG /objects] Request path:', req.path);
//   console.log('[DEBUG /objects] Full object path:', objectPath);

//   try {
//     await objectStorageService.downloadObjectByPath(objectPath, res);
//   } catch (error) {
//     console.error('[DEBUG /objects] Error serving object:', error);
//     res.status(404).json({ error: 'Object not found' });
//   }
// });

app.use("/api", routes);

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const distPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/api") &&
    !req.path.startsWith("/objects")
  ) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    next();
  }
});

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();

    await runProductionSeed();

    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
