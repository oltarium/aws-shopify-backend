import { Module } from '@nestjs/common';

import { UsersService } from './services';
import {MikroOrmModule} from "@mikro-orm/nestjs";
import {UserEntity} from "./user.entity";
import {UsersController} from "./users.controller";
import {CartService} from "../cart";
import {CardEntity} from "../cart/cart.entity";
import {CardItemEntity} from "../cart/cart-items.entity";

@Module({
  providers: [ UsersService, CartService ],
  exports: [ UsersService ],
  controllers: [ UsersController ],
  imports: [MikroOrmModule.forFeature({entities: [UserEntity, CardEntity, CardItemEntity]})]
})
export class UsersModule {}
