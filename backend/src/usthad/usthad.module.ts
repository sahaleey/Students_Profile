import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsthadService } from './usthad.service';
import { UsthadController } from './usthad.controller';
import { Punishment } from './entities/punishment.entity';
import { Achievement } from './entities/achievement.entity';
import { Submission } from './entities/submission.entity';
import { User } from '../users/entities/user.entity';

@Module({
  // Register all the tables here!
  imports: [
    TypeOrmModule.forFeature([Punishment, Achievement, Submission, User]),
  ],
  controllers: [UsthadController],
  providers: [UsthadService],
})
export class UsthadModule {}
