import {getProductById} from '../handler';
import {APIGatewayProxyEvent} from "aws-lambda";
import {data} from "../../mock";

describe('[getProductById]', () => {
    it('should return 400 code if productId is not number', async () => {
        const productId = "hello";
        const event: APIGatewayProxyEvent = {
            pathParameters: {
                productId: productId
            }
        } as any
        const result = await getProductById(event);
        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify({
            message: 'Product id should be a number'
        }));
    });


    it('should return product and status 200 if product id exists', async () => {
        const productId = "1";
        const event: APIGatewayProxyEvent = {
            pathParameters: {
                productId: productId
            }
        } as any
        const result = await getProductById(event);
        const expectedProduct = data.find(d => d.id === Number(productId));
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify(expectedProduct));
    });

    it('should return 404 status and message if product id does not exists', async () => {
        const productId = "5";
        const event: APIGatewayProxyEvent = {
            pathParameters: {
                productId: productId
            }
        } as any
        const result = await getProductById(event);
        expect(result.statusCode).toEqual(404);
        expect(result.body).toEqual(JSON.stringify({
            message: `Product with id = ${productId} not found`
        }));
    });
});