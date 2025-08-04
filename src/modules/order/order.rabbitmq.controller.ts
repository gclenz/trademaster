import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller()
export class OrderRabbitMQController {
  private readonly MAX_RETRIES = Number(process.env.MAX_RETRIES) || 5;
  constructor(private readonly orderService: OrderService) { }

  @MessagePattern({ cmd: 'order.created', queue: 'trademaster' })
  async created(
    @Payload() updateOrderDto: UpdateOrderDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const retryCount = originalMsg.properties.headers['x-death']
      ? originalMsg.properties.headers['x-death'][0].count
      : 0;

    try {
      await this.orderService.update(updateOrderDto);
      channel.ack(originalMsg);
    } catch (error) {
      console.error(
        `Falha ao processar a mensagem [order.created] (tentativa ${retryCount + 1}):`,
        error,
        updateOrderDto
      );

      if (retryCount >= this.MAX_RETRIES) {
        channel.nack(originalMsg, false, false);
      } else {
        channel.nack(originalMsg, false, false);
      }
    }
  }
}
