import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MerchantsService } from '../merchants/merchants.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private merchantsService: MerchantsService,
    private jwtService: JwtService,
  ) {}

  async validateMerchant(email: string, pass: string): Promise<any> {
    const merchant = await this.merchantsService.findByEmail(email);
    if (merchant && await bcrypt.compare(pass, merchant.passwordHash)) {
      const { passwordHash, ...result } = merchant.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const merchant = await this.validateMerchant(loginDto.email, loginDto.password);
    if (!merchant) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: merchant.email, sub: merchant._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      merchant: { id: merchant._id.toString(), name: merchant.name, email: merchant.email }
    };
  }
}
