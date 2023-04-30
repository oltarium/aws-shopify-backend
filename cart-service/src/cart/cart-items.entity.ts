import {
    Entity, ManyToOne, PrimaryKey,
    Property,
} from '@mikro-orm/core';
import {CardEntity} from "./cart.entity";

@Entity({ tableName: 'card-items' })
export class CardItemEntity {
    @PrimaryKey()
    id: number;

    @ManyToOne({ entity: () => CardEntity, })
    cardId: number;

    @Property({ name: 'product_id' })
    productId : string;

    @Property({ name: 'count' })
    count : number;

    constructor(
        cardId: number,
        productId: string,
        count: number,
    ) {
        this.cardId = cardId;
        this.productId = productId;
        this.count = count;
    }
}

export enum Status {
    OPEN = 'OPEN',
    ORDERED = 'ORDERED',
}
