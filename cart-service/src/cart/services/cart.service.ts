import { Injectable } from '@nestjs/common';
import { Cart, CartItem, Status } from '../models';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CardEntity } from '../cart.entity';
import { EntityRepository, wrap } from '@mikro-orm/core';
import { CardItemEntity } from '../cart-items.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardsRepository: EntityRepository<CardEntity>,
    @InjectRepository(CardItemEntity)
    private readonly cardItemsRepository: EntityRepository<CardItemEntity>,
  ) {}

  async getCard(userId: number): Promise<CardEntity> {
    console.log('get card', typeof userId)
    return this.cardsRepository.findOne(
      { userId: userId, status: Status.OPEN},
      { populate: ['items'] },
    );
  }

  async addCard(body: Cart): Promise<number> {
    const newCard = new CardEntity(
      body.user_id,
      new Date(body.created_at),
      Status.OPEN,
      new Date(body.updated_at),
    );
    const card = await this.cardsRepository.create(newCard);
    await this.cardsRepository.persistAndFlush(card);
    return card.id;
  }

  async addItemToCard(cardId: number, item: CartItem): Promise<any> {
    const newItem = new CardItemEntity(cardId, item.productId, 1);
    const it = await this.cardItemsRepository.create(newItem);
    return this.cardItemsRepository.persistAndFlush(it);
  }

  async updateCardItem(
    cardId: number,
    item: CartItem,
  ): Promise<any> {
    const cardItem = await this.cardItemsRepository.findOneOrFail({
      cardId: cardId,
      productId: item.productId,
    });
    wrap(cardItem).assign({
      count: item.count,
    });
    return this.cardItemsRepository.persistAndFlush(cardItem);
  }

  async removeItemFromCard(cardId: number, productId: string): Promise<any> {
    const cardItem = await this.cardItemsRepository.findOneOrFail({
      cardId,
      productId,
    });
    return this.cardItemsRepository.removeAndFlush(cardItem);
  }

  async deleteCard(cardId: number): Promise<any> {
    const item = await this.cardsRepository.findOneOrFail({ id: cardId });
    return this.cardsRepository.removeAndFlush(item);
  }
}
