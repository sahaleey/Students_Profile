import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubwingController } from './subwing.controller';
import { SubwingService } from './subwing.service';
import { Program } from './entities/program.entity';
import { ProgramResult } from './entities/program-result.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { AcademicMonth } from '../admin/entities/academic-month.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      ProgramResult,
      Achievement,
      AcademicMonth,
    ]),
    NotificationsModule,
  ],
  controllers: [SubwingController],
  providers: [SubwingService],
})
export class SubwingModule {}
