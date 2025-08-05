# Desafio técnico para a Trademaster.

## Como rodar

Antes de rodar o projeto certifique-se de ter o Docker e o Docker Composer instalados em seu sistema.

```bash
$ docker compose up --build -d
```

## Testes

# e2e tests
```
$ pnpm run test:watch
```

```
# test coverage
$ pnpm run test:cov
```

## Descrição

O projeto é simples e foca no uso dos eventos.
A rota do cURL abaixo serve para criar um pedido. Esse pedido é adicionado ao banco e dispara um evento para atualizar ele e enviar uma notificação.

A parte de notificações faz o uso do [Design Pattern Strategy](https://refactoring.guru/design-patterns/strategy). Esse design pattern permite que seu código aja da mesma forma, independente da estratégia selecionada. No contexto usei para diferenciar o disparo de notificações por email ou SMS, porém esse padrão de projeto é muito útil para o contexto de pagamentos, calculo de envios e por aí vai.

```curl
curl --request POST \
  --url http://localhost:3000/orders \
  --header 'Content-Type: application/json' \
  --data '{
	"email": "teste@email.com",
	"phone": "841012893500007",
	"value": 123
}'
```

Optei por manter todo o fluxo em uma aplicação no intuito de reduzir o consumo de recursos, já que é um projeto enxuto.
Também mantive os testes bem minimalistas, porém assertivos. O teste coverage é de mais ou menos 80%. Como foi usado o [Testcontainers](https://testcontainers.com/), a garantia de que a aplicação vai se comportar da mesma maneira em produção é alta.

## Stack
NestJS
PostgreSQL
RabbitMQ
Testcontainers
Docker/Compose
pnpm