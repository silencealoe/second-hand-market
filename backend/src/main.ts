import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // 自动将请求体转换为 DTO 实例
    }),
  );

  // 全局日志拦截器
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 配置静态文件服务
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // 启用 CORS
  app.enableCors();

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('二手交易系统 API')
    .setDescription('二手交易系统后端接口文档，包含前台用户接口和后台管理接口')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users', '用户相关接口')
    .addTag('products', '商品相关接口')
    .addTag('comments', '评论相关接口')
    .addTag('后台管理-认证', '后台管理认证接口')
    .addTag('后台管理-数据大屏', '后台管理数据大屏接口')
    .addTag('后台管理-用户管理', '后台管理用户管理接口')
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

