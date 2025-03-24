import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());


  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Social Media Management API')
    .setDescription('A social media management API similar to Ayrshare')
    .setVersion('1.0')
    // .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config); 
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
