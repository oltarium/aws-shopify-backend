import {
  Collection,
  Entity,
  Enum, OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import {CardItemEntity} from "./cart-items.entity";
import {Status} from "./models";

@Entity({ tableName: 'cards' })
export class CardEntity {
  @PrimaryKey()
  @Unique()
  id: number;

  @Property({ name: 'user_id' })
  userId: number;

  @Property({ name: 'created_at' })
  createdAt: Date;

  @Property({ name: 'updated_at' })
  updatedAt: Date;

  @Enum(() => Status)
  status: Status;

  @OneToMany(() => CardItemEntity, book => book.cardId)
  items = new Collection<CardItemEntity>(this);

  constructor(
    userId: number,
    createdAt: Date,
    status: Status,
    updatedAt: Date,
  ) {
    this.userId = userId;
    this.createdAt = createdAt;
    this.status = status;
    this.updatedAt = updatedAt;
  }
}

