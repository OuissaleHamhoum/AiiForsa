import { Global, Module } from '@nestjs/common';
import { ClamAVService } from './clamav.service';

@Global()
@Module({
  providers: [ClamAVService],
  exports: [ClamAVService],
})
export class CommonServicesModule {}
