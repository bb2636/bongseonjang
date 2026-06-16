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
import { ensureAdminUser } from "./seeds/ensureAdminUser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const objectStorageService = new ObjectStorageService();

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
  process.env.SOCIAL_REDIRECT_BASE_URL || "",
  process.env.VITE_SOCIAL_REDIRECT_BASE_URL || "",
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

app.use("/objects", async (req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  const objectPath = `/objects${req.path}`;

  try {
    await objectStorageService.downloadObjectByPath(objectPath, res);
  } catch (error) {
    res.status(404).json({ error: "Object not found" });
  }
});

app.use("/api", routes);

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const staticPath = path.join(__dirname, "static");
app.use("/static", express.static(staticPath));

const distPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(distPath));

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'WhatsApp',
  'TelegramBot',
  'kakaotalk-scrap',
  'KakaoTalk',
  'Googlebot',
  'bingbot',
  'yandex',
  'naverbot',
];

function isCrawler(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return CRAWLER_USER_AGENTS.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

app.get('/product/:id', async (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  
  if (!isCrawler(userAgent)) {
    return res.sendFile(path.join(distPath, "index.html"));
  }
  
  try {
    const productId = req.params.id;
    const { ProductService } = await import('./features/product/application/ProductService.js');
    const { TypeORMProductRepository } = await import('./features/product/repository/TypeORMProductRepository.js');
    const productRepository = new TypeORMProductRepository();
    const productService = new ProductService(productRepository);
    const product = await productService.getProductById(productId);
    
    if (!product) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    
    const baseUrl = process.env.REPLIT_DEPLOYMENT_URL || 
                    (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://bongseonjang.com');
    const productUrl = `${baseUrl}/product/${productId}`;
    const imageUrl = product.mainImage?.startsWith('http') 
      ? product.mainImage 
      : `${baseUrl}${product.mainImage || '/logo.png'}`;
    const price = product.discountPrice || product.originalPrice || 0;
    const formattedPrice = new Intl.NumberFormat('ko-KR').format(price);
    
    const ogHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.name} - 봉선장</title>
  
  <!-- Open Graph -->
  <meta property="og:type" content="product">
  <meta property="og:title" content="${product.name}">
  <meta property="og:description" content="${product.brandName ? `${product.brandName} | ` : ''}${formattedPrice}원 - 봉선장에서 확인하세요!">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${productUrl}">
  <meta property="og:site_name" content="봉선장">
  <meta property="og:locale" content="ko_KR">
  <meta property="product:price:amount" content="${price}">
  <meta property="product:price:currency" content="KRW">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${product.name}">
  <meta name="twitter:description" content="${product.brandName ? `${product.brandName} | ` : ''}${formattedPrice}원">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirect for actual users -->
  <meta http-equiv="refresh" content="0;url=${productUrl}">
</head>
<body>
  <script>window.location.href = "${productUrl}";</script>
  <p>상품 페이지로 이동 중...</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(ogHtml);
  } catch (error) {
    console.error('[OG Meta] Error generating OG tags:', error);
    return res.sendFile(path.join(distPath, "index.html"));
  }
});

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

async function prewarmImageCache(): Promise<void> {
  try {
    const { AppDataSource } = await import('./config/database.js');
    const { Banner } = await import('./entity/Banner.js');
    const { ProductImage } = await import('./entity/ProductImage.js');

    const banners = await AppDataSource.getRepository(Banner).find({
      where: { isActive: true },
      select: ['imageUrl'],
    });

    const productImages = await AppDataSource.getRepository(ProductImage).find({
      select: ['imageUrl'],
      take: 200,
    });

    const allPaths = [
      ...banners.map(b => b.imageUrl),
      ...productImages.map(p => p.imageUrl),
    ].filter(p => p && p.startsWith("/objects/"));

    if (allPaths.length > 0) {
      await objectStorageService.prewarmCache(allPaths);
    }
  } catch (error) {
    console.warn('[Cache Prewarm] Failed:', error);
  }
}

async function startServer(): Promise<void> {
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server is running on port ${config.port}`);
  });

  try {
    await initializeDatabase();
    await runProductionSeed();
    await ensureAdminUser();
    console.log("Database ready");
    prewarmImageCache();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

startServer();
