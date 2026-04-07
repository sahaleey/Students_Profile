import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 CRITICAL: Allows Next.js (Port 3000) to talk to NestJS (Port 3001)
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Change this to 3001 so it doesn't fight with Next.js!
  await app.listen(3001);
  console.log('🚀 Backend running on http://localhost:3001');
}
bootstrap();
