import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // 查找用户（通过用户名或邮箱）
    const user = await this.usersRepository.findOne({
      where: [
        { username: loginDto.usernameOrEmail },
        { email: loginDto.usernameOrEmail },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成JWT令牌
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword as User,
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    // 检查用户名或邮箱是否已存在
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: registerDto.username },
        { email: registerDto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.username === registerDto.username) {
        throw new ConflictException('用户名已存在');
      }
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('邮箱已被注册');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 创建用户
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // 生成JWT令牌
    const payload = { sub: savedUser.id, username: savedUser.username };
    const access_token = await this.jwtService.signAsync(payload);

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = savedUser;

    return {
      access_token,
      user: userWithoutPassword as User,
    };
  }
}

