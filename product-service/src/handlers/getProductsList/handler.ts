import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {DynamoDBClient, ScanCommand} from "@aws-sdk/client-dynamodb";
import {HEADERS} from "../constants";
import {logRequest} from "../utils";
import {Client} from 'pg'

export const getProductsList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // const client = new Client({
    //     connectionString: `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.POSTGRESQL_HOST}:${process.env.POSTGRESQL_PORT}/${process.env.DATABASE_NAME}` // e.g. postgres://user:password@host:5432/database
    // })
    // await client.connect();
    //
    // try {
    //     const products = await new Promise((resolve, reject) => {
    //         client.query("SELECT * from products", (err: Error, res: any) => {
    //             if (err) {
    //                 reject(err.stack)
    //             } else {
    //                 resolve(res.rows)
    //             }
    //         })
    //     });
    //     const stocks = await new Promise((resolve, reject) => {
    //         client.query("SELECT * from stocks", (err: Error, res: any) => {
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
    //             productsList: products,
    //             stocksList: stocks,
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

    logRequest(event);
    try {
        const db = new DynamoDBClient({})
        const productTable = process.env.PRODUCTS_TABLE
        const stocksTable = process.env.STOCKS_TABLE
        const products = await db.send(new ScanCommand({
            TableName: productTable,
        }));
        const stocks = await db.send(new ScanCommand({
            TableName: stocksTable
        }));
        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({
                productsList: products.Items,
                stocksList: stocks.Items,
            }),
        };
    } catch (e: any) {
        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({
                message: e.message,
            })
        }
    }
}