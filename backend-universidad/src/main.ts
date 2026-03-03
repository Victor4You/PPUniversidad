// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import * as express from 'express';
import cookieParser from 'cookie-parser';

let app: INestApplication;

function setupApp(instance: INestApplication): void {
  const expressInstance = instance
    .getHttpAdapter()
    .getInstance() as express.Application;

  expressInstance.use(express.json({ limit: '50mb' }));
  expressInstance.use(express.urlencoded({ limit: '50mb', extended: true }));

  instance.use(cookieParser());
  instance.setGlobalPrefix('v1');

  instance.enableCors({
    origin: (origin, callback) => {
      // 1. Permitir peticiones sin origen (Electron local, Postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      // 2. Orígenes permitidos (Asegúrate de incluir app://.)
      const allowedOrigins = [
        'http://localhost:3000',
        'https://universidad.ppollo.org',
        'http://194.113.64.53:3001',
        'http://194.113.64.53:3012',
        'app://.', // <--- IMPORTANTE: El origen exacto que envía tu Electron
      ];

      // 3. Validación lógica
      const isElectron =
        origin.startsWith('app://') || origin.startsWith('file://');
      const isVercel = origin.endsWith('.vercel.app');

      if (allowedOrigins.includes(origin) || isElectron || isVercel) {
        // IMPORTANTE: Devolvemos el origen exacto para evitar el error de Wildcard (*)
        callback(null, true);
      } else {
        console.warn(`[CORS] Origen bloqueado: ${origin}`);
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Esto obliga a que 'origin' no sea '*'
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'x-user-username',
      'ngrok-skip-browser-warning',
    ],
    exposedHeaders: ['Set-Cookie', 'Content-Disposition', 'Content-Length'],
  });
}

/**
 * Ejecución local y VPS (Docker/VPS)
 */
async function bootstrap(): Promise<void> {
  const localApp = await NestFactory.create(AppModule);
  setupApp(localApp);

  // Escuchar en todas las interfaces para que sea accesible desde el exterior del VPS
  const port = process.env.PORT || 3001;
  await localApp.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor Universidad PuroPollo listo en puerto ${port}`);
}

/**
 * EXPORTACIÓN PARA VERCEL
 */
export default async function handler(
  req: unknown,
  res: unknown,
): Promise<void> {
  if (!app) {
    app = await NestFactory.create(AppModule);
    setupApp(app);
    await app.init();
  }

  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance() as (
    req: unknown,
    res: unknown,
  ) => void;

  return instance(req, res);
}

// Lógica de arranque
if (process.env.VERCEL) {
  // Manejado por el export default
} else {
  bootstrap().catch((err) => {
    console.error('❌ Error fatal al iniciar el servidor:', err);
    process.exit(1);
  });
}
