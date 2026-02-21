import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

/**
 * Bootstrap de la aplicación backend.
 * Configura seguridad, validación, documentación y versionado.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Seguridad: Helmet - Protege cabeceras HTTP comunes
  app.use(helmet());

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  // Versionado de API
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Filtro global de excepciones genéricas
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Filtro específico para errores de Prisma
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // Interceptor para estandarizar respuestas { data, statusCode, timestamp }
  app.useGlobalInterceptors(new TransformInterceptor());

  // Validación de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger UI en /docs
  const config = new DocumentBuilder()
    .setTitle('CursApp API')
    .setDescription('Documentación de la API de CursApp - Seguimiento Académico UNAHUR')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 API activa en: http://localhost:${port}/api/v1`);
  logger.log(`📄 Documentación Swagger: http://localhost:${port}/docs`);
}

bootstrap();
