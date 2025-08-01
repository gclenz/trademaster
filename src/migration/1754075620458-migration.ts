import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Migration1754075620458 implements MigrationInterface {
    name = 'Migration1754075620458';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'orders',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['created', 'pending'],
                        isNullable: false,
                    },
                    { name: 'email', type: 'varchar', isNullable: true },
                    { name: 'phone', type: 'varchar', isNullable: true },
                    {
                        name: 'value',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('orders');
    }
}
