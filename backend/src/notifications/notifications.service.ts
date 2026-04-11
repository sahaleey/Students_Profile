import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  // Triggered internally by other backend services!
  async sendNotification(data: {
    recipientId: string;
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    const notification = this.notifRepo.create({
      recipient: { id: data.recipientId },
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      link: data.link,
    });
    return this.notifRepo.save(notification);
  }

  // Fetches a user's notifications (newest first)
  async getUserNotifications(userId: string) {
    return this.notifRepo.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 so it doesn't slow down
    });
  }

  // Mark a specific notification as read
  async markAsRead(notifId: string, userId: string) {
    await this.notifRepo.update(
      { id: notifId, recipient: { id: userId } },
      { isRead: true },
    );
    return { success: true };
  }

  // Mark ALL as read
  async markAllAsRead(userId: string) {
    await this.notifRepo.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}
