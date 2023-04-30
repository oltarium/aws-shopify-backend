export type Product = {
    id: string,
    title: string,
    description: string,
    price: number,
};


export type CartItem = {
    cardId: number;
    productId: string;
    count: number,
}

export type Cart = {
    id?: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    status?: Status;

}
export enum Status {
    OPEN = 'OPEN',
    ORDERED = 'ORDERED',
}
