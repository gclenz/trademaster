import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  private readonly MAX_RETRIES = Number(process.env.MAX_RETRIES) || 5;
  constructor(private readonly notificationService: NotificationService) { }

  @MessagePattern({ cmd: 'notification.send', queue: 'trademaster' })
  send(@Payload() createNotificationDto: SendNotificationDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const retryCount = originalMsg.properties.headers['x-death']
      ? originalMsg.properties.headers['x-death'][0].count
      : 0;

    try {
      this.notificationService.send(createNotificationDto);
      channel.ack(originalMsg);
    } catch (error) {
      console.error(
        `Falha ao processar a mensagem [notification.send] (tentativa ${retryCount + 1}):`,
        error,
        createNotificationDto
      );

      if (retryCount >= this.MAX_RETRIES) {
        channel.nack(originalMsg, false, false);
      } else {
        channel.nack(originalMsg, false, true);
      }
    }
  }
}
