import {Callback, Context, S3Event} from "aws-lambda";
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import csv from 'csv-parser';
import type {Readable} from 'stream'
const sqsClient = new SQSClient({ region: "us-east-1" });

export const importFileParser = async (event: S3Event, context: Context, callback: Callback): Promise<void> => {
    const accountId = JSON.stringify(context.invokedFunctionArn).split(':')[4];
    const client = new S3Client({region: process.env.REGION});
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const result = await client.send(new GetObjectCommand(params));
        if (result.Body) {
            const stream = result.Body as Readable
            const promise = new Promise((resolve, reject) => {
                stream
                    .pipe(csv())
                    .on('data', async (data) => {
                        console.log(data);
                        await sendSQSEvent(data, accountId);
                    })
                    .on("close", () => {
                        callback();
                        resolve(1);
                    })
                    .on("error", () => {
                        callback();
                        reject();
                    })
                    .on('end', async () => {
                        await moveFile(client, bucket, key);
                        callback();
                        resolve(1);
                    });
            });
            await promise;
        }

    } catch (err) {
        console.error(`Error getting object ${key} from bucket ${bucket}.`);
        throw new Error(`Error getting object ${key} from bucket ${bucket}.`);
    }
}


async function sendSQSEvent(product: any, accountId: string) {
    const params = {
        MessageGroupId: 'products',
        MessageBody: JSON.stringify(product),
        QueueUrl: `https://sqs.us-east-1.amazonaws.com/492825409148/catalogItemsQueue.fifo`,
    };
    await sqsClient.send(new SendMessageCommand(params));
}

async function moveFile(s3: S3Client, bucket: string, file: string) {
    const [_, fileName] = file.split('/');
    const sourceFolder = 'uploaded'
    const destFolder = 'parsed'
    try {
        await s3.send(new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${sourceFolder}/${fileName}`,
            Key: `${destFolder}/${fileName}`
        }));
        await s3.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: `${sourceFolder}/${fileName}`
        }));
    } catch (ex) {
        console.error(`Failed: ${ex}`)
    }
}