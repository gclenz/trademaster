import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(@Inject('ORDER_SERVICE') private readonly client: ClientProxy) { }

  create(createOrderDto: CreateOrderDto) {
    console.log(createOrderDto, Date.now());
    return 'This action adds a new order';
  }

  send() {
    return `This action returns all order`;
  }

  addMessage(message: object) {
    return this.client.emit(
      { cmd: 'order.create', queue: 'trademaster' },
      message,
    );
  }
}
