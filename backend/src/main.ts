import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 配置静态文件服务
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // 启用 CORS
  app.enableCors();

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('二手交易系统 API')
    .setDescription('二手交易系统后端接口文档')
    .setVersion('1.0')
    .addTag('users', '用户相关接口')
    .addTag('products', '商品相关接口')
    .addTag('comments', '评论相关接口')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const swaggerJsonPath = path.join(process.cwd(), 'swagger-docs.json');
  fs.writeFileSync(
    swaggerJsonPath,
    JSON.stringify(document, null, 2) // 格式化 JSON，便于阅读
  );
  console.log(`Swagger JSON 文档已导出至：${swaggerJsonPath}`);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`应用运行在 http://localhost:${port}`);
  console.log(`Swagger 文档地址: http://localhost:${port}/api`);
}

bootstrap();

