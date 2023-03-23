import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {S3} from "aws-sdk";

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

    const params = {
        Bucket: bucket,
        Key: "uploaded/" + file,
        Expires: 30,
    };

    try {
        const s3 = new S3({signatureVersion: 'v4', region});
        const url = s3.getSignedUrl('putObject', params);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(url),
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(error),
        };
    }
}