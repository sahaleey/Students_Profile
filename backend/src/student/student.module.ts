import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { User } from '../users/entities/user.entity';
import { Punishment } from '../usthad/entities/punishment.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { Submission } from '../usthad/entities/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Punishment, Achievement, Submission]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
