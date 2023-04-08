import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

import {DynamoDBClient, TransactWriteItemsCommand} from "@aws-sdk/client-dynamodb";
import {HEADERS} from "../constants";
import {logRequest} from "../utils";
import {Client} from 'pg'

type ProductBody = {
    id: number;
    title: string;
    description: string;
    price: number;
    count: number;
}

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logRequest(event);
    if (event.body === null) {
        return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({
                message: `Missed request body`
            })
        }
    }
    const body: ProductBody = JSON.parse(event.body) as any as ProductBody;
    if (!body.title || !body.description || !body.price || !body.count) {
        return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({
                message: `Invalid body. Missed some product property`
            })
        }
    }

    // const client = new Client({
    //     connectionString: `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.POSTGRESQL_HOST}:${process.env.POSTGRESQL_PORT}/${process.env.DATABASE_NAME}` // e.g. postgres://user:password@host:5432/database
    // })
    // await client.connect();

    // try {
    //     const productId = await new Promise((resolve, reject) => {
    //         client.query(`INSERT INTO products (title, description, price) VALUES ('${body.title}', '${body.description}', ${body.price})  RETURNING id`, (err: Error, res: any) => {
    //             console.log(res);
    //             if (err) {
    //                 reject(err.stack)
    //             } else {
    //                 resolve(res.rows[0].id)
    //             }
    //         })
    //     });
    //     await new Promise((resolve, reject) => {
    //         client.query(`INSERT INTO stocks(product_id, count) VALUES(${productId}, ${body.count})`, (err: Error, res: any) => {
    //             if (err) {
    //                 reject(err.stack)
    //             } else {
    //                 resolve(res.rows)
    //             }
    //         })
    //     });
    //     return {
    //         statusCode: 201,
    //         headers: HEADERS,
    //         body: JSON.stringify({}),
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
        const db = new DynamoDBClient({});
        const newId = uuidv4();
        const newProduct = {
            id: {S: newId},
            title: {S: body.title},
            description: {S: body.description},
            price: {N: `${body.price}`},
        }
        const newStock = {
            product_id: {S: newId},
            count: {N: `${body.count}`},
        }
        await db.send(new TransactWriteItemsCommand({
            ReturnItemCollectionMetrics: 'NONE',
            ReturnConsumedCapacity: 'TOTAL',
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
                        Item: newStock,
                    },
                },
            ],
        }));
        return {statusCode: 201, body: JSON.stringify({})}
    } catch (e: any) {
        return {
            statusCode: 500, body: JSON.stringify({
                message: e.message,
            })
        }
    }
}