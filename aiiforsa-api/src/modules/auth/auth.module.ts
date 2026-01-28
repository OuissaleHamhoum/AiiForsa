import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { RedisModule } from '../redis/redis.module';
import { MailerModule } from '../mailer/mailer.module';
@Module({
  imports: [UserModule, RedisModule, MailerModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
