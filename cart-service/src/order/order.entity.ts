import {
    Entity,
    Enum,
    PrimaryKey,
    Property,
    Unique,
} from '@mikro-orm/core';
import {Status} from "../cart";

@Entity({tableName: 'orders'})
export class OrderEntity {
    @PrimaryKey()
    @Unique()
    id: number;

    @Property({name: 'user_id'})
    userId: number;

    @Property({name: 'cart_id'})
    cartId: number;

    @Property({name: 'payment', type: "json"})
    payment: any;

    @Property({name: 'delivery', type: "json"})
    delivery: any;

    @Property({name: 'comments'})
    comments: string;

    @Property({name: 'total'})
    total : number;

    @Enum(() => Status)
    status : Status;

    constructor(
        userId: number,
        cartId: number,
        status: Status,
        payment: any,
        delivery: any,
        total: number,
        comments: string
    ) {
        this.userId = userId;
        this.cartId = cartId;
        this.status = status;
        this.total = total;
        this.comments = comments;
        this.delivery = delivery;
        this.payment = payment;
    }
}
