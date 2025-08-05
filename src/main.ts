import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  console.log(process.env.AMQP_URL);


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.AMQP_URL as string],
      queue: 'trademaster',
      noAck: false,
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
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
