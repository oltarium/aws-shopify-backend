import {MiddlewareConsumer, Module, NestModule, OnModuleInit} from '@nestjs/common';
import {AppController} from './app.controller';
import {CartModule} from './cart/cart.module';
import {OrderModule} from './order/order.module';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MikroORM} from "@mikro-orm/core";
import {MikroOrmMiddleware, MikroOrmModule} from "@mikro-orm/nestjs";
import {UsersModule} from "./users/users.module";

@Module({
    imports: [
        UsersModule,
        CartModule,
        OrderModule,
        MikroOrmModule.forRoot(),
        ConfigModule.forRoot({
            ignoreEnvFile: process.env.NODE_ENV !== 'development',
        }),
    ],
    controllers: [
        AppController,
    ],
    providers: [],
})
export class AppModule implements NestModule, OnModuleInit {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(MikroOrmMiddleware).forRoutes('*');
    }

    constructor(
        private readonly orm: MikroORM,
        private readonly configService: ConfigService,
    ) {
    }

    async onModuleInit(): Promise<void> {
        await this.orm.getMigrator().up();
    }
}
