import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSource } from './infrastructure/database/data-source';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './infrastructure/repository/user.repository';
import { AuthenticateMiddleware } from './infrastructure/middleware/authenticate.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BcryptService } from './infrastructure/service/bcrypt.service';
import { SocketModule } from './infrastructure/socket/socket.module';
import { JwtHelperService } from './infrastructure/service/jwt.service';
import { AuthModule } from './feature/auth/auth.module';
import { createTransactionalDataSourceService } from './infrastructure/service/typeorm-transactional.service';
import { DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dataSource.options,
        retryAttempts: Number(configService.get('DB_RETRY_ATTEMPTS')) || 10,
        retryDelay: Number(configService.get('DB_RETRY_DELAY')) || 5000,
      }),
      dataSourceFactory: async (options) =>
        createTransactionalDataSourceService(
          ((options as any)?.host as string) || 'database',
          options as DataSourceOptions,
        ),
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REGISTER_SECRET') || 'cdcwrg3mNJyUKpvAvd3L9psS8wXMzcm4nNbA4ka1vneueuNSsFirdqft3goL7',
      }),
      global: true,
    }),

    //Modules
    AuthModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, BcryptService, UserRepository, JwtHelperService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.ALL },
        { path: 'auth/register', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
