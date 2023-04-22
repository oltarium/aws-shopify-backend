import {importProductsFile} from "../handler";
import {APIGatewayProxyEvent} from "aws-lambda";
import sinon from 'sinon';
import * as clientInternals from '../my-s3-client-internals';

describe('importProductsFile', () => {
    it('should throw error if REGION or BUCKET is not present', async () => {
        // @ts-ignore
        const event: APIGatewayProxyEvent = {
            queryStringParameters: {}
        }
        await expect(importProductsFile(event)).rejects.toThrowError();
    });

    it('should return 400 code if no file name in query params', async () => {
        process.env = {
            BUCKET: '1',
            REGION: '1'
        }
        // @ts-ignore
        const event: APIGatewayProxyEvent = {
            queryStringParameters: {}
        }
        const res = await importProductsFile(event);
        expect(res).toStrictEqual({
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                message: 'Missing name parameter',
            }),
        })
    });

    it('should return 200 code if bucket url was generated successfully', async () => {
        process.env = {
            BUCKET: '1',
            REGION: '1'
        }
        const fileName = 'file.csv'
        // @ts-ignore
        const event: APIGatewayProxyEvent = {
            queryStringParameters: {
                name: fileName
            }
        }
        const signedUrl = "https://someurl/file";

        const stub = sinon.stub(clientInternals, 'getSignedUrl')
            .callsFake(async (client, command, options) => {
                return signedUrl;
            });
        const result = await importProductsFile(event);
        expect(stub.calledOnce).toBeTruthy();
        expect(result).toStrictEqual({
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(signedUrl),
        });
    });
});