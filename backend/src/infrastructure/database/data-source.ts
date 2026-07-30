//Data-Source imports
import { DataSource, DataSourceOptions } from "typeorm";
import { ConfigService } from "@nestjs/config";

//Entities
import { UserEntity } from "src/domain/user/user.entity";

const configService = new ConfigService();

const options: DataSourceOptions = {
    type: (configService.get<string>('DB_POSTGRES_TYPE') as any) || 'postgres',
    host: configService.get<string>('DB_POSTGRES_HOST') || 'database',
    port: configService.get<number>('DB_POSTGRES_PORT') ? Number(configService.get('DB_POSTGRES_PORT')) : 5432,
    username: configService.get<string>('DB_POSTGRES_USERNAME'),
    password: configService.get<string>('DB_POSTGRES_PASSWORD'),
    database: configService.get<string>('DB_POSTGRES_DATABASE'),
    entities: [
        UserEntity,
    ],
    synchronize: false,
    migrations: ['dist/infrastructure/database/migrations/*{.ts,.js}'],
};

const dataSource = new DataSource(options);

export { dataSource, options };