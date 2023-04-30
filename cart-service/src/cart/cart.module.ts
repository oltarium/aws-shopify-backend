import {Module} from '@nestjs/common';

import {OrderModule} from '../order/order.module';

import {CartController} from './cart.controller';
import {CartService} from './services';
import {MikroOrmModule} from "@mikro-orm/nestjs";
import {CardItemEntity} from "./cart-items.entity";
import {CardEntity} from "./cart.entity";
import {OrderEntity} from "../order/order.entity";


@Module({
    imports: [OrderModule, MikroOrmModule.forFeature({entities: [CardItemEntity, CardEntity, OrderEntity, CardItemEntity]})],
    providers: [CartService],
    controllers: [CartController],
    exports: [CartService]
})
export class CartModule {
}
