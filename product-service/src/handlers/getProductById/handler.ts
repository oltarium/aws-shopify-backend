import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
const {DynamoDB} = require("aws-sdk");

export const getProductById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const log = `
        Method: ${event.httpMethod}, 
        Function: createProduct, 
        Path Parameters: ${event.pathParameters}, 
        Query Parameters: ${event.queryStringParameters},
        Body: ${event.body}
    `;
    console.log(log);
    const productId = Number(event.pathParameters?.productId);
    if (Number.isNaN(productId)) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                message: `Product id should be a number`
            })
        }
    }
    try {
        const db = new DynamoDB.DocumentClient()
        const {Item: productItem} = await db.get({
            // @ts-ignore
            TableName: process.env.PRODUCTS_TABLE,
            Key: {
                id: productId,
            }
        }).promise();
        if (!productItem) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify({
                    message: `Product with id = ${productId} not found`
                })
            }
        }
        const {Item: stockItem} = await db.get({
            // @ts-ignore
            TableName: process.env.STOCKS_TABLE,
            Key: {
                product_id: productItem.id,
            }
        }).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                productItem,
                stockItem,
            })
        };
    } catch (e: any) {
        return {
            statusCode: 500, body: JSON.stringify({
                message: e.message,
            })
        }
    }
}