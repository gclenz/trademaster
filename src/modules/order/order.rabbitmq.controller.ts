import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller()
export class OrderRabbitMQController {
  constructor(private readonly orderService: OrderService) { }

  @MessagePattern({ cmd: 'order.create', queue: 'trademaster' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'order.shipped', queue: 'trademaster' })
  send(@Payload() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }
}
