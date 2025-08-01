import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  send(createNotificationDto: SendNotificationDto) {
    return this.getStrategy(createNotificationDto.type, createNotificationDto);
  }

  getStrategy(type: NotificationType, dto: SendNotificationDto) {
    switch (type) {
      case NotificationType.EMAIL:
        return this.sendEmail(dto);
      case NotificationType.SMS:
        return this.sendSMS(dto);
      default:
        return;
    }
  }

  private sendEmail(createNotificationDto: SendNotificationDto) {
    console.log(
      `Email sent to ${createNotificationDto.email} with message: ${createNotificationDto.message}`,
    );
  }

  private sendSMS(createNotificationDto: SendNotificationDto) {
    console.log(
      `SMS sent to ${createNotificationDto.phone} with message: ${createNotificationDto.message}`,
    );
  }
}
