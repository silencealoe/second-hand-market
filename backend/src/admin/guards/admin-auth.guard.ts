import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * 后台管理认证守卫
 * 用于保护需要管理员权限的接口，验证JWT令牌的有效性
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * 检查请求是否允许通过
   * @param context 执行上下文
   * @returns 是否允许访问
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开接口
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
      throw new UnauthorizedException('未提供访问令牌');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // 将用户信息附加到请求对象
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('无效的访问令牌');
    }

    return true;
  }

  /**
   * 从请求头中提取JWT令牌
   * @param request 请求对象
   * @returns 提取的令牌或undefined
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}