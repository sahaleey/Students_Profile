import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity'; // 🚀 Import User
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
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
    const savedNotification = await this.notifRepo.save(notification);
    try {
      const user = await this.userRepo.findOne({
        where: { id: data.recipientId },
      });

      if (user && user.fcmToken) {
        await admin.messaging().send({
          token: user.fcmToken,
          notification: {
            title: data.title,
            body: data.message,
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              vibrateTimingsMillis: [300, 150, 300, 150, 500],
              defaultVibrateTimings: false,
            },
          },

          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
          webpush: {
            notification: {
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            },
            fcmOptions: {
              // Firebase will automatically open this link when the mobile notification is tapped!
              link:
                data.link || 'https://nahj-studentsprofile.vercel.app/parent',
            },
          },
          // Keep the data block for frontend foreground handling
          data: {
            link: data.link || 'https://nahj-studentsprofile.vercel.app/parent',
          },
        });

        console.log(
          `✅ Push notification sent to mobile for User: ${user.fullName}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to send push notification to ${data.recipientId}:`,
        error,
      );
    }

    return savedNotification;
  }

  // Fetches a user's notifications (newest first)
  async getUserNotifications(userId: string) {
    return this.notifRepo.find({
      where: { recipient: { id: String(userId) } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // Mark a specific notification as read
  async markAsRead(notifId: string, userId: string) {
    await this.notifRepo.update(
      { id: notifId, recipient: { id: String(userId) } },
      { isRead: true },
    );
    return { success: true };
  }

  // Mark ALL as read
  async markAllAsRead(userId: string) {
    await this.notifRepo.update(
      { recipient: { id: String(userId) }, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}
