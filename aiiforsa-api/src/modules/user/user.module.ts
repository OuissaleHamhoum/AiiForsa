import { Module } from '@nestjs/common';
import { ResumeModule } from '../resume/resume.module';
import { XpModule } from '../xp/xp.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ResumeModule, XpModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
