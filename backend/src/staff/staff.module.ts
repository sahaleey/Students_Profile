import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { User } from '../users/entities/user.entity';
import { Punishment } from '../usthad/entities/punishment.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { AcademicMonth } from '../admin/entities/academic-month.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { StaffService } from './staff.service';
import { StaffProgram } from './entities/staff-program.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Punishment,
      Achievement,
      AcademicMonth,
      StaffProgram,
    ]), // 🚀 Must include all 4!
    NotificationsModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
