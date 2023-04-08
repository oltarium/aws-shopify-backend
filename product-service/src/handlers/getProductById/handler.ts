import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {HEADERS} from "../constants";
import {logRequest} from "../utils";
import {Client} from 'pg'

export const getProductById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logRequest(event);
    const productId = event.pathParameters?.productId;

    // const client = new Client({
    //     connectionString: `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.POSTGRESQL_HOST}:${process.env.POSTGRESQL_PORT}/${process.env.DATABASE_NAME}` // e.g. postgres://user:password@host:5432/database
    // })
    // await client.connect();
    //
    // try {
    //     const products: any[] = await new Promise((resolve, reject) => {
    //         client.query(`SELECT * from products WHERE id = ${productId}`, (err: Error, res: any) => {
    //             if (err) {
    //                 reject(err.stack)
    //             } else {
    //                 resolve(res.rows)
    //             }
    //         })
    //     });
    //     if (products.length === 0) {
    //         return {
    //             statusCode: 404,
    //             headers: HEADERS,
    //             body: JSON.stringify({
    //                 message: `Product with id = ${productId} not found`
    //             })
    //         }
    //     }
    //     const stocks: any[] = await new Promise((resolve, reject) => {
    //         client.query(`SELECT * from stocks WHERE product_id = ${productId}`, (err: Error, res: any) => {
    //             if (err) {
    //                 reject(err.stack)
    //             } else {
    //                 resolve(res.rows)
    //             }
    //         })
    //     });
    //     return {
    //         statusCode: 200,
    //         headers: HEADERS,
    //         body: JSON.stringify({
    //             productItem: products[0],
    //             stockItem: stocks[0],
    //         }),
    //     };
    // } catch (e: any) {
    //     console.error(e);
    //     return {
    //         statusCode: 500, body: JSON.stringify({
    //             message: e.message,
    //         })
    //     }
    // } finally {
    //     await client.end();
    // }

    try {
        const db = new DynamoDBClient({})
        const {Item: productItem} = await db.send(new GetItemCommand({
            // @ts-ignore
            TableName: process.env.PRODUCTS_TABLE,
            Key: marshall({
                id: productId,
            }),
        }));
        if (!productItem) {
            return {
                statusCode: 404,
                headers: HEADERS,
                body: JSON.stringify({
                    message: `Product with id = ${productId} not found`
                })
            }
        }
        const {Item: stockItem} = await db.send(new GetItemCommand({
            // @ts-ignore
            TableName: process.env.STOCKS_TABLE,
            Key: marshall({
                product_id: productId,
            }),
        }));
        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({
                productItem,
                stockItem,
            })
        };
    } catch (e: any) {
        return {
            statusCode: 500, headers: HEADERS, body: JSON.stringify({
                message: e.message,
            })
        }
    }
}