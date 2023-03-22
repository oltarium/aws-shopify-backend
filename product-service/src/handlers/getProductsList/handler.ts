import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
const {DynamoDB} = require("aws-sdk");

export const getProductsList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const log = `
        Method: ${event.httpMethod}, 
        Function: createProduct, 
        Path Parameters: ${event.pathParameters}, 
        Query Parameters: ${event.queryStringParameters},
        Body: ${event.body}
    `;
    console.log(log);
    try {
        const db = new DynamoDB.DocumentClient()

        const products = await db.scan({
            // @ts-ignore
            TableName: process.env.PRODUCTS_TABLE,
        }).promise();
        const stocks = await db.scan({
            // @ts-ignore
            TableName: process.env.STOCKS_TABLE,
        }).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                productsList: products.Items,
                stocksList: stocks.Items,
            }),
        };
    } catch (e: any) {
        return {
            statusCode: 500, body: JSON.stringify({
                message: e.message,
            })
        }
    }
}