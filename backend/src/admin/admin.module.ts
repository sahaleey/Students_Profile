import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { AcademicMonth } from './entities/academic-month.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { Punishment } from '../usthad/entities/punishment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AcademicMonth,
      User,
      Achievement,
      Punishment,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
