import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { User } from '../users/entities/user.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { Punishment } from '../usthad/entities/punishment.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Achievement, Punishment]),
    NotificationsModule,
  ],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
