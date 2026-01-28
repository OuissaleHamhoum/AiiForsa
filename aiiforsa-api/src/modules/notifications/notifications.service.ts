import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationPriority, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface CreateNotificationDto {
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all notifications for a user
   */
  async findAllForUser(
    userId: string,
    options?: {
      includeRead?: boolean;
      includeArchived?: boolean;
      limit?: number;
    },
  ) {
    const {
      includeRead = true,
      includeArchived = false,
      limit = 50,
    } = options || {};

    const where: Record<string, unknown> = { userId };

    if (!includeRead) {
      where.isRead = false;
    }
    if (!includeArchived) {
      where.isArchived = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        isArchived: false,
      },
    });
  }

  /**
   * Create a notification for a user
   */
  async create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: dto.type,
        priority: dto.priority || 'NORMAL',
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl,
        metadata: dto.metadata ?? Prisma.JsonNull,
      },
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Archive a notification
   */
  async archive(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isArchived: true },
    });
  }

  /**
   * Delete a notification
   */
  async delete(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Create system notifications (helper methods)
   */
  async notifyAchievementUnlocked(
    userId: string,
    achievementTitle: string,
    xpReward: number,
  ) {
    return this.create(userId, {
      type: 'ACHIEVEMENT',
      priority: 'HIGH',
      title: '🏆 Achievement Unlocked!',
      message: `You earned "${achievementTitle}" and gained ${xpReward} XP!`,
      actionUrl: '/profile#achievements',
    });
  }

  async notifyLevelUp(userId: string, newLevel: number, badgeName?: string) {
    const message = badgeName
      ? `Congratulations! You reached Level ${newLevel} and earned the "${badgeName}" badge!`
      : `Congratulations! You reached Level ${newLevel}!`;

    return this.create(userId, {
      type: 'SYSTEM',
      priority: 'HIGH',
      title: '🎉 Level Up!',
      message,
      actionUrl: '/profile',
    });
  }

  async notifyApplicationUpdate(
    userId: string,
    jobTitle: string,
    status: string,
  ) {
    return this.create(userId, {
      type: 'APPLICATION_UPDATE',
      priority: 'HIGH',
      title: 'Application Update',
      message: `Your application for "${jobTitle}" has been updated to: ${status}`,
      actionUrl: '/applied-jobs',
    });
  }

  async notifyNewMessage(userId: string, senderName: string) {
    return this.create(userId, {
      type: 'MESSAGE',
      priority: 'NORMAL',
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      actionUrl: '/messages',
    });
  }

  async notifyCommunityInteraction(
    userId: string,
    actorName: string,
    action: 'liked' | 'commented' | 'followed',
    targetTitle?: string,
  ) {
    const messages = {
      liked: `${actorName} liked your post${targetTitle ? `: "${targetTitle}"` : ''}`,
      commented: `${actorName} commented on your post${targetTitle ? `: "${targetTitle}"` : ''}`,
      followed: `${actorName} started following you`,
    };

    return this.create(userId, {
      type: 'SYSTEM',
      priority: 'LOW',
      title: 'Community Activity',
      message: messages[action],
      actionUrl: '/community',
    });
  }
}
