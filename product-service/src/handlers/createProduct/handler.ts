import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

const {DynamoDB} = require("aws-sdk");

type ProductBody = {
    id: number;
    title: string;
    description: string;
    price: number;
    count: number;
}

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const log = `
        Method: ${event.httpMethod}, 
        Function: createProduct, 
        Path Parameters: ${event.pathParameters}, 
        Query Parameters: ${event.queryStringParameters},
        Body: ${event.body}
    `;
    console.log(log);
    if (event.body === null) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                message: `Missed request body`
            })
        }
    }
    const body: ProductBody = JSON.parse(event.body) as any as ProductBody;
    if (!body.title || !body.description || !body.price || !body.count) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                message: `Invalid body. Missed some product property`
            })
        }
    }

    try {
        const db = new DynamoDB.DocumentClient();
        const {Count: count = 0} = await db.scan({
            // @ts-ignore
            TableName: process.env.PRODUCTS_TABLE,
            Select: "COUNT",
        }).promise();
        const newId = count + 1;
        const newProduct: Omit<ProductBody, "count"> = {
            id: newId,
            title: body.title,
            description: body.description,
            price: body.price,
        }
        await db.transactWrite({
            TransactItems: [
                {
                    Put: {
                        // @ts-ignore
                        TableName: process.env.PRODUCTS_TABLE,
                        Item: newProduct,
                    },
                },
                {
                    Put: {
                        // @ts-ignore
                        TableName: process.env.STOCKS_TABLE,
                        Item: {
                            // @ts-ignore
                            product_id: newId,
                            count: body.count,
                        },
                    },
                },
            ],
        }).promise();
        return {statusCode: 201, body: JSON.stringify({})}
    } catch (e: any) {
        return {
            statusCode: 500, body: JSON.stringify({
                message: e.message,
            })
        }
    }
}