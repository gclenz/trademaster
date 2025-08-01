import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller()
export class OrderRabbitMQController {
  constructor(private readonly orderService: OrderService) { }

  @MessagePattern({ cmd: 'order.created', queue: 'trademaster' })
  created(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(updateOrderDto);
  }
}
