import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsthadController } from './usthad.controller';
import { UsthadService } from './usthad.service';
import { Punishment } from './entities/punishment.entity';
import { Achievement } from './entities/achievement.entity';
import { Submission } from './entities/submission.entity';
import { User } from '../users/entities/user.entity';
import { AcademicMonth } from '../admin/entities/academic-month.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Arrival } from './entities/arrival.entity';
import { ArrivalSession } from 'src/admin/entities/arrival-session.entity';

@Module({
  // 🚀 THIS IS THE CRUCIAL PART
  imports: [
    TypeOrmModule.forFeature([
      Punishment,
      Achievement,
      Submission,
      User,
      Arrival,
      AcademicMonth,
      ArrivalSession,
    ]),
    NotificationsModule,
  ],
  controllers: [UsthadController],
  providers: [UsthadService],
})
export class UsthadModule {}
