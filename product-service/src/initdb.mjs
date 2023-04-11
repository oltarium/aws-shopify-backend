import * as dotenv from 'dotenv';
import {createRequire} from "module";
import {v4 as uuidv4} from 'uuid';
import {DynamoDBClient, TransactWriteItemsCommand} from "@aws-sdk/client-dynamodb";

const require = createRequire(import.meta.url);
const data = require("./products.json");

// @ts-ignore
dotenv.config();

const db = new DynamoDBClient({
    region: process.env.REGION,
});

async function init() {
    for (let i = 0; i < data.products.length; i++) {
        const prod = data.products[i];
        const newId = uuidv4();
        const newProduct = {
            id: {S: newId},
            title: {S: prod.title},
            description: {S: prod.description},
            price: {N: `${prod.price}`},
        }
        const newStock = {
            product_id: {S: newId},
            count: {N: `${data.stocks[i].count}`},
        }
        try {
            await db.send(new TransactWriteItemsCommand({
                ReturnItemCollectionMetrics: 'NONE',
                ReturnConsumedCapacity: 'TOTAL',
                ClientRequestToken: `Tokey=${i}`,
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
        } catch (e) {
            console.error(e);
        }
    }
}

await init();