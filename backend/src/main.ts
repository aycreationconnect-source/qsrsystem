import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import express, { json, urlencoded } from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // Locate frontend dist directory (for single-port production mode)
  const candidatePaths = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
  ];
  const frontendDist = candidatePaths.find((p) => fs.existsSync(p));

  if (frontendDist) {
    const indexPath = path.join(frontendDist, 'index.html');

    // 1. Direct browser HTML navigation handler (e.g. /menu, /tables, /pos, /dashboard)
    app.use((req: any, res: any, next: any) => {
      if (
        req.method === 'GET' &&
        !req.url.startsWith('/api') &&
        req.headers.accept &&
        req.headers.accept.includes('text/html') &&
        fs.existsSync(indexPath)
      ) {
        return res.sendFile(indexPath);
      }
      next();
    });

    // 2. Serve static assets (JS, CSS, images, icons)
    app.use(express.static(frontendDist));
  }

  // 3. API Route rewrite:
  // In production, frontend makes calls to /api/* (e.g. /api/order, /api/menu).
  // Strip '/api' prefix so they map directly to NestJS controllers.
  app.use((req: any, res: any, next: any) => {
    if (req.url.startsWith('/api/')) {
      req.url = req.url.substring(4);
    } else if (req.url === '/api') {
      req.url = '/';
    }
    next();
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 QSR POS Server running on http://localhost:${port}`);
  if (frontendDist) {
    console.log(`📦 Serving static frontend from: ${frontendDist}`);
  }
}
void bootstrap();
