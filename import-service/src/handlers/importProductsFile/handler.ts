import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from './my-s3-client-internals';

export const importProductsFile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const {REGION: region, BUCKET: bucket} = process.env;
    if (!region || !bucket) {
        throw new Error('REGION and BUCKET environment variables are required!');
    }

    const file = event.queryStringParameters
        ? event.queryStringParameters['name']
        : undefined;

    if (!file) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                message: 'Missing name parameter',
            }),
        };
    }
    const client = new S3Client({region: region});
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: "uploaded/" + file,
    });
    const url = await getSignedUrl(client, command, {expiresIn: 3600});

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(url),
    };

}