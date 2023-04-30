export type Order = {
  id?: string,
  userId: string;
  cartId: string;
  comments: string,
  status: string;
  total: number;
  payment: {
    type: string,
    address?: any,
    creditCard?: any,
  },
  delivery: {
    type: string,
    address: any,
  },
}
