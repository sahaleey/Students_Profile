import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { AcademicMonth } from './entities/academic-month.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { Punishment } from '../usthad/entities/punishment.entity';
import { ArrivalSession } from './entities/arrival-session.entity';
import { Arrival } from 'src/usthad/entities/arrival.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AcademicMonth,
      User,
      Achievement,
      Punishment,
      ArrivalSession,
      Arrival,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
