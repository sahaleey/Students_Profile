import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Punishment, PunishmentStatus } from './entities/punishment.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsthadCronService {
  private readonly logger = new Logger(UsthadCronService.name);

  constructor(
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
    private notifService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkOverduePunishments() {
    this.logger.log('Scanning for overdue 1-week punishments...');

    // Calculate exactly what "7 days ago" is
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const overduePunishments = await this.punishmentRepo.find({
      where: {
        status: PunishmentStatus.ACTIVE,
        isEscalated: false,
        createdAt: LessThan(oneWeekAgo),
      },
      relations: ['student', 'assignedBy'],
    });

    if (overduePunishments.length === 0) {
      this.logger.log('No overdue punishments found today.');
      return;
    }

    // Loop through each overdue punishment and send the warnings
    for (const punishment of overduePunishments) {
      // 1. Warn the Student
      await this.notifService.sendNotification({
        recipientId: punishment.student.id,
        title: '⚠️ Overdue Action Required',
        message: `Your punishment "${punishment.title}" is over 1 week old. Please resolve it immediately to avoid further action.`,
        type: 'WARNING',
        link: '/student/tasks',
      });

      // 2. Warn the Usthad
      await this.notifService.sendNotification({
        recipientId: punishment.assignedBy.id,
        title: '⏳ Unresolved Punishment Escalation',
        message: `${punishment.student.fullName} has not resolved "${punishment.title}" after 1 week. Please take action.`,
        type: 'INFO',
        link: '/usthad',
      });

      // 3. Mark as escalated so we don't spam them again tomorrow
      punishment.isEscalated = true;
      await this.punishmentRepo.save(punishment);
    }

    this.logger.log(
      `Successfully escalated ${overduePunishments.length} punishments.`,
    );
  }
}
