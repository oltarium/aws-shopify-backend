import {Controller, Get, Delete, Body, Post, Param, Query, Put} from '@nestjs/common';
import { CartService } from './services';
import {Cart, CartItem} from "./models";

@Controller('carts')
export class CartController {
  constructor(
    private cartService: CartService,
  ) { }

  @Post()
  createCard(@Body() body: Cart) {
    return this.cartService.addCard(body);
  }

  @Put(':id/items')
  addItem(@Param('id') cardId: number, @Body() body: CartItem) {
    return this.cartService.addItemToCard(cardId, body);
  }

  @Post(':id/items')
  updateItem(@Param('id') cardId: number, @Body() body: CartItem) {
    return this.cartService.updateCardItem(cardId, body);
  }

  @Delete(':id/items/:productId')
  deleteItem(@Param('id') cardId: number, @Param('productId') productId: string) {
    return this.cartService.removeItemFromCard(cardId, productId);
  }

  @Get()
  getCard(@Query('userId') userId: number) {
    return this.cartService.getCard(userId);
  }
}
