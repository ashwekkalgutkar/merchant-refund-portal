import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private refundsService: RefundsService) {}

  @Post()
  create(@Request() req, @Body() body: { transactionId: string; reason: string }) {
    return this.refundsService.create(req.user.userId, body.transactionId, body.reason);
  }
}
