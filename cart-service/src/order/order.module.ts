import { Module } from '@nestjs/common';
import { OrderService } from './services';
import {MikroOrmModule} from "@mikro-orm/nestjs";
import {OrderEntity} from "./order.entity";
import {OrderController} from "./order.controller";
import {CardEntity} from "../cart/cart.entity";

@Module({
  imports: [ OrderModule, MikroOrmModule.forFeature({ entities: [OrderEntity, CardEntity]}) ],
  providers: [ OrderService ],
  exports: [ OrderService ],
  controllers: [OrderController]
})
export class OrderModule {}
