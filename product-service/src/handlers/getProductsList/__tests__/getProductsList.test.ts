import {APIGatewayProxyEvent} from "aws-lambda";
import {getProductsList} from "../handler";
import {data} from "../mock";

describe('[getProductsList]', () => {
    it('should return array of products', async () => {
        const event: APIGatewayProxyEvent = {} as any;
        const result = await getProductsList(event);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify(data));
    });
});