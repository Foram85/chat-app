import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<User> {
    // Check if user already exists
    const exists = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (exists) {
      throw new ConflictException('Email already in use');
    }
    // Hash the password
    const hashed = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      ...registerDto,
      password: hashed,
    });
    return this.userRepository.save(user);
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
