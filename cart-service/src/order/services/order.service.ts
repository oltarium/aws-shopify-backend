import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { OrderEntity } from '../order.entity';
import {EntityRepository, MikroORM, wrap} from '@mikro-orm/core';
import { Status } from '../../cart';
import {CardEntity} from "../../cart/cart.entity";
import { EntityManager } from '@mikro-orm/postgresql';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: EntityRepository<OrderEntity>,
    @InjectRepository(CardEntity)
    private readonly cardsRepository: EntityRepository<CardEntity>,
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  getAll(userId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({ userId: userId });
  }

  findById(orderId: number): Promise<OrderEntity> {
    return this.orderRepository.findOneOrFail({ id: orderId });
  }

  async create(order: any) {
    const em = this.orm.em as EntityManager;
    return await em.transactional(async (zz) => {
      const newOrder = new OrderEntity(
          order.userId,
          order.cardId,
          Status.ORDERED,
          order.payment,
          order.delivery,
          order.total,
          order.comments,
      );
      const item = zz.create(OrderEntity, newOrder);
      await zz.persistAndFlush(item);
      const card = await zz.findOne(CardEntity, {id: order.cardId});
      wrap(card).assign({
        status: Status.ORDERED
      });
      await zz.persistAndFlush(card);
      const newCard = new CardEntity(
          order.userId,
          new Date(),
          Status.OPEN,
          new Date(),
      );
      const car = await zz.create(CardEntity, newCard);
      await zz.persistAndFlush(car);
      return Promise.resolve();
    });
  }

  async update(orderId, data): Promise<any> {
    const order: OrderEntity = await this.findById(orderId);
    wrap(order).assign({
      status: data.status,
      payment: data.payment,
      comments: data.comments,
      delivery: data.delivery,
      total: data.total,
    });
    await this.orderRepository.persistAndFlush(order);
  }

  async deleteOrder(orderId: number): Promise<any> {
    const item = await this.orderRepository.findOneOrFail({ id: orderId });
    await this.orderRepository.removeAndFlush(item);
  }
}
