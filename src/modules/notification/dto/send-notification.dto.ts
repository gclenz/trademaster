import { NotificationType } from '../entities/notification.entity';

export class SendNotificationDto {
  email?: string;
  phone?: string;
  message: string;
  type: NotificationType;
}
