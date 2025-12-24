import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class EnhancedJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(EnhancedJwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      this.logger.warn('未找到Authorization头或令牌格式不正确');
      throw new UnauthorizedException('未提供访问令牌');
    }
    
    this.logger.log(`提取到令牌: ${token.substring(0, 20)}...`);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      request['user'] = payload;
      this.logger.log(`JWT验证成功 - 用户ID: ${payload.sub}`);
    } catch (error) {
      this.logger.error(`JWT验证失败: ${error.message}`, error.stack);
      throw new UnauthorizedException('无效的访问令牌');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}