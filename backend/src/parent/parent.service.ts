import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { Punishment } from '../usthad/entities/punishment.entity';
import { PunishmentStatus } from '../usthad/entities/punishment.entity';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
  ) {}

  async getDashboardData(parentId: string) {
    const parent = await this.usersRepo.findOne({
      where: { id: parentId },
      relations: ['children'],
    });

    if (!parent || !parent.children.length) {
      return { children: [] };
    }

    const childIds = parent.children.map((c) => c.id);

    // 🔥 Fetch all data in bulk (NO N+1 problem)
    const achievements = await this.achievementRepo.find({
      where: { student: { id: In(childIds) } },
      order: { createdAt: 'DESC' },
    });

    const punishments = await this.punishmentRepo.find({
      where: { student: { id: In(childIds) } },
    });

    // 🔥 Build response
    const childrenData = parent.children.map((child) => {
      const childAchievements = achievements.filter(
        (a) => a.student.id === child.id,
      );

      const childPunishments = punishments.filter(
        (p) => p.student.id === child.id,
      );

      return {
        profile: {
          id: child.id,
          fullName: child.fullName,
        },
        totalPoints: childAchievements.reduce((sum, a) => sum + a.points, 0),
        recentAchievements: childAchievements.slice(0, 3),
        activePunishments: childPunishments.filter(
          (p) => p.status === PunishmentStatus.ACTIVE,
        ),
      };
    });

    return { children: childrenData };
  }
}
