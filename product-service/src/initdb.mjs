import * as dotenv from 'dotenv';
dotenv.config();
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./products.json");
console.log(process.env.AWS_SDK_LOAD_CONFIG)
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

const {DynamoDB} = require("aws-sdk");
const db = new DynamoDB.DocumentClient({
    region: process.env.REGION,

});
async function init() {
    for (let i = 0; i < data.products.length; i++) {
        const prod = data.products[i];
        const newId = uuidv4();
        const newProduct = {
            id: newId,
            title: prod.title,
            description: prod.description,
            price: prod.price,
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
                            count: data.stocks[i].count,
                        },
                    },
                },
            ],
        }).promise();
    }
}
init();