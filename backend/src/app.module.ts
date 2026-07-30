import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSource } from './infrastructure/database/data-source';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './infrastructure/repository/user.repository';
import { AuthenticateMiddleware } from './infrastructure/middleware/authenticate.middleware';
import { ConfigModule } from '@nestjs/config';
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
      useFactory: () => ({
        ...dataSource.options,
        retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS) || 10,
        retryDelay: Number(process.env.DB_RETRY_DELAY) || 5000,
      }),
      dataSourceFactory: async (options) =>
        createTransactionalDataSourceService(
          process.env.DB_POSTGRES_HOST || 'database',
          options as DataSourceOptions,
        ),
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_REGISTER_SECRET || 'cdcwrg3mNJyUKpvAvd3L9psS8wXMzcm4nNbA4ka1vneueuNSsFirdqft3goL7',
      // signOptions: { expiresIn: '60m' },
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
