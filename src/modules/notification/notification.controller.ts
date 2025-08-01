import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @MessagePattern({ cmd: 'notification.send', queue: 'trademaster' })
  send(@Payload() createNotificationDto: SendNotificationDto) {
    this.notificationService.send(createNotificationDto);
  }
}
