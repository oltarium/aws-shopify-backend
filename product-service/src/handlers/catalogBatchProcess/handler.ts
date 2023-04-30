import {SQSEvent} from "aws-lambda";
import {DynamoDBClient,} from "@aws-sdk/client-dynamodb";
import {PublishCommand, SNSClient,} from "@aws-sdk/client-sns";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {HEADERS} from "../constants";
import {DynamoDBDocumentClient, PutCommand} from '@aws-sdk/lib-dynamodb';

const snsClient = new SNSClient({apiVersion: '2010-03-31', region: "us-east-1"});
const db = DynamoDBDocumentClient.from(new DynamoDBClient({region: "us-east-1"}))

export const catalogBatchProcess = async (event: SQSEvent) => {
    for (let i = 0; i < event.Records.length; i++) {
        try {
            const {body} = event.Records[i];
            const product = JSON.parse(body);
            await createProduct(product);
            await sendNotification(product);
        } catch (e) {
            return {
                statusCode: 500,
                headers: HEADERS,
            };
        }
    }
    return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({})
    };
}

async function createProduct(body: any) {
    const newId = uuidv4();
    const newProduct = {
        id: newId,
        title: body.title,
        description: body.description,
        price: body.price,
    }
    const newStock = {
        product_id: newId,
        count: body.count,
    }

    await db.send(new PutCommand({
        TableName: process.env.PRODUCTS_TABLE,
        Item: newProduct,
    }));
    await db.send(new PutCommand({
        TableName: process.env.STOCKS_TABLE,
        Item: newStock,
    }));
}

type PublishParams = {
    MessageAttributes: any,
    Message: string;
    TopicArn?: string;
}

async function sendNotification(product: any) {
    const params: PublishParams = {
        MessageAttributes: {
            productPrice: {
                DataType: "String",
                StringValue: `${product.price}`,
                BinaryValue: 1,
            },
            productCount: {
                DataType: "String",
                StringValue: `${product.count}`,
                BinaryValue: 1,
            }
        },
        Message: `New product created: Title: ${product.title}, Price: ${product.price}, Count: ${product.count}`,
        TopicArn: process.env.SNS_TOPIC
    };
    try {
        await snsClient.send(new PublishCommand(params));
    } catch (e) {
        console.log(e);
    }

}