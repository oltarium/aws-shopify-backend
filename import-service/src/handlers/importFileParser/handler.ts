import {Callback, Context, S3Event} from "aws-lambda";
import {S3} from "aws-sdk";
import csv from 'csv-parser';

export const importFileParser = async (event: S3Event, context: Context, callback: Callback): Promise<void> => {
    const s3 = new S3({signatureVersion: 'v4', region: "us-east-1"});
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const stream = await s3.getObject(params).createReadStream();
        const promise = new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', async (data) => {
                    console.log(data);
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
                    await moveFile(s3, bucket, key);
                    callback();
                    resolve(1);
                });
        });
        await promise;
    } catch (err) {
        console.log(err)
        console.error(`Error getting object ${key} from bucket ${bucket}.`);
        throw new Error(`Error getting object ${key} from bucket ${bucket}.`);
    }
}

async function moveFile(s3: S3, bucket: string, file: string) {
    const [_, fileName] = file.split('/');
    const sourceFolder = 'uploaded'
    const destFolder = 'parsed'
    const s3Params = {
        Bucket: bucket,
        CopySource: `${bucket}/${sourceFolder}/${fileName}`,
        Key: `${destFolder}/${fileName}`
    };
    try {
        await s3.copyObject(s3Params).promise();
        await s3.deleteObject({Bucket: bucket, Key: `${sourceFolder}/${fileName}`}).promise();
    } catch (ex) {
        console.error(`Failed: ${ex}`)
    }
}