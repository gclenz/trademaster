import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { NotificationType } from '../notification/entities/notification.entity';
import { AddMessageDto } from './dto/add-message.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject('ORDER_SERVICE') private readonly client: ClientProxy,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const orderId = randomUUID();
    await this.orderRepository.insert({
      id: orderId,
      status: OrderStatus.CREATED,
      email: createOrderDto.email,
      phone: createOrderDto.phone,
      value: createOrderDto.value,
    });
    this.addMessage({
      event: 'order.created',
      message: {
        id: orderId,
        email: createOrderDto.email,
        phone: createOrderDto.phone,
      },
    });
    return { id: orderId }
  }

  async update(data: UpdateOrderDto) {
    const { id, email, phone } = data;
    await this.orderRepository.update(id, {
      status: OrderStatus.PENDING,
    });

    const notificationType =
      Math.random() > 0.5 ? NotificationType.EMAIL : NotificationType.SMS;

    this.addMessage({
      event: 'notification.send',
      message: {
        id,
        email,
        phone,
        message: `Order ${id} is now pending.`,
        type: notificationType,
        status: OrderStatus.PENDING,
      },
    });
  }

  addMessage<T>(data: AddMessageDto<T>) {
    return this.client.emit(
      { cmd: data.event, queue: 'trademaster' },
      data.message,
    );
  }
}
