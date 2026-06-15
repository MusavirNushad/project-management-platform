// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { RealtimeEventsService } from './application/services/realtime-events.service';
// import { RealtimeGateway } from './presentation/gateways/realtime.gateway';

// @Module({
//     imports: [JwtModule],
//     providers: [RealtimeGateway, RealtimeEventsService],
//     exports: [RealtimeEventsService],
// })
// export class RealtimeModule { }

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { AccessControlModule } from '../access-control/access-control.module';
import { PROJECT_REPOSITORY } from '../project/domain/ports/project.repository.port';
import { PrismaProjectRepository } from '../project/infrastructure/database/prisma-project.repository';
import { TASK_REPOSITORY } from '../task/domain/ports/task.repository.port';
import { PrismaTaskRepository } from '../task/infrastructure/database/prisma-task.repository';
import { RealtimeAccessService } from './application/services/realtime-access.service';
import { RealtimeEventsService } from './application/services/realtime-events.service';
import { RealtimeGateway } from './presentation/gateways/realtime.gateway';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    AccessControlModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  providers: [
    RealtimeGateway,
    RealtimeEventsService,
    RealtimeAccessService,
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [RealtimeEventsService],
})
export class RealtimeModule {}
