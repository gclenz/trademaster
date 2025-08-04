import { INestApplication } from '@nestjs/common';
import {
  Transport
} from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as amqp from 'amqplib';
import * as request from 'supertest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Order, OrderStatus } from '../src/modules/order/entities/order.entity';

describe('E2E: Orders', () => {
  let app: INestApplication;
  let rabbitmq: StartedTestContainer;
  let postgres: StartedTestContainer;
  let dataSource: DataSource;

  beforeAll(async () => {
    jest.setTimeout(30000);

    rabbitmq = await new GenericContainer('rabbitmq')
      .withExposedPorts(5672)
      .start();
    const rabbitUrl = `amqp://localhost:${rabbitmq.getMappedPort(5672)}`;

    postgres = await new GenericContainer('postgres:17')
      .withEnvironment({
        POSTGRES_DB: 'testdb',
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass'
      })
      .withExposedPorts(5432)
      .start();
    const pgPort = postgres.getMappedPort(5432);
    const pgHost = postgres.getHost();

    process.env.AMQP_URL = rabbitUrl;
    process.env.DB_HOST = pgHost;
    process.env.DB_PORT = pgPort.toString();
    process.env.DB_USER = 'testuser';
    process.env.DB_PASS = 'testpass';
    process.env.DB_NAME = 'testdb';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forRootAsync({
        useFactory: () => ({
          type: 'postgres',
          url: `postgres://testuser:testpass@${pgHost}:${pgPort}/testdb`,
          entities: [Order],
          migrationsRun: true,
          migrations: ['./**/migration/**/*.ts'],
        }),
      }),
        TypeOrmModule.forFeature([Order]),],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue('trademaster', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'retry_exchange',
      }
    });

    await channel.close();
    await connection.close();

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'trademaster',
        noAck: false,
        queueOptions: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'retry_exchange',
          }
        },
      },
    });
    await app.startAllMicroservices();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
    await rabbitmq.stop();
    await postgres.stop();
  });

  it('should create an order via HTTP', async () => {
    const orderData = {
      value: 100,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(orderData)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(response.body.id).toBeDefined();
  });

  it('should process order status update via RabbitMQ', async () => {
    const orderData = {
      value: 100,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(orderData)
      .expect(201);

    const orderId = response.body.id;

    const maxRetries = 5;
    const retryInterval = 1000;

    for (let i = 0; i < maxRetries; i++) {
      const order = await dataSource.getRepository(Order)
        .findOne({
          where: { id: orderId }
        });

      if (order?.status === OrderStatus.PENDING) {
        expect(order.value).toBe('100.00');
        return;
      }

      await new Promise(res => setTimeout(res, retryInterval));
    }

    throw new Error('Order status was not updated in time');
  });
});
