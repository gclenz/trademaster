import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderHttpController } from './order.http.controller';
import { OrderRabbitMQController } from './order.rabbitmq.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'ORDER_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('AMQP_URL') as string],
            queue: 'trademaster',
            queueOptions: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': 'retry_exchange',
              },
            },
            socketOptions: {
              heartbeatIntervalInSeconds: 5,
              reconnectTimeInSeconds: 5,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderRabbitMQController, OrderHttpController],
  providers: [OrderService],
})
export class OrderModule { }
