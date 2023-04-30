import {SQSEvent} from "aws-lambda";
import {catalogBatchProcess} from "../handler";
import {HEADERS} from "../../constants";
import {mockClient} from 'aws-sdk-client-mock';
import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb";


//
// @ts-ignore
const snsMock = mockClient(SNSClient);

process.env = {
    PRODUCTS_TABLE: "products",
    STOCKS_TABLE: "stocks",
    SNS_TOPIC: "topic"
}

const dynamoDBMock = mockClient(DynamoDBDocumentClient);
dynamoDBMock.on(PutCommand).callsFake((input) => {
    if (!input.Item.title) {
        throw new Error("Error")
    } else {
        return {}
    }
}).on(PutCommand, {TableName: "stocks"}).resolves({
    Attributes: undefined,
    ItemCollectionMetrics: undefined,
})

snsMock
    // @ts-ignore
    .on(PublishCommand)
    .callsFake((input) => {
        if(!input.TopicArn) {
            throw new Error("Not topic");
        }
        return {
            $metadata: {}
        }
})


describe('[catalogBatchProcess]', () => {
    it('should return 200 code if no errors during processing', async () => {
        const event: SQSEvent = {
            Records: []
        }
        const result = await catalogBatchProcess(event);
        expect(result).toStrictEqual({
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({}),
        });
    })

    it('should return 500 code if passed invalid body', async () => {
        const event: SQSEvent = {
            Records: [
                // @ts-ignore
                {
                    body: "hello",
                    eventSource: "",
                    awsRegion: "",
                    receiptHandle: "",
                    messageId: "",
                    md5OfBody: "",
                    eventSourceARN: "",
                }
            ]
        }
        const result = await catalogBatchProcess(event);
        expect(result).toStrictEqual({
            statusCode: 500,
            headers: HEADERS,
        });
    })

    it('should return 200 code if data save is success', async () => {
        const event: SQSEvent = {
            Records: [
                // @ts-ignore
                {
                    body: JSON.stringify({
                        "title": "Home",
                        "description": "ggg",
                        "count": 8,
                        "price": 8
                    }),
                }
            ]
        }
        const result = await catalogBatchProcess(event);
        expect(result).toStrictEqual({
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({})
        });
    })

    it('should return 500 code if data save is unsuccess', async () => {
        const event: SQSEvent = {
            Records: [
                // @ts-ignore
                {
                    body: JSON.stringify({
                        "description": "ggg",
                        "count": 8,
                        "price": 8
                    }),
                }
            ]
        }
        const result = await catalogBatchProcess(event);
        expect(result).toStrictEqual({
            statusCode: 500,
            headers: HEADERS,
        });
    })

    it('should return 200 code if message send success', async () => {
        const event: SQSEvent = {
            Records: [
                // @ts-ignore
                {
                    body: JSON.stringify({
                        "title": "Home",
                        "description": "ggg",
                        "count": 8,
                        "price": 8
                    }),
                }
            ]
        }
        const result = await catalogBatchProcess(event);
        expect(result).toStrictEqual({
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({})
        });
    })

    it('should return 500 code if messages send unsuccess', async () => {
        const event: SQSEvent = {
            Records: [
                // @ts-ignore
                {
                    body: JSON.stringify({
                        "title": "444",
                        "description": "ggg",
                        "count": 8,
                        "price": 8
                    }),
                }
            ]
        }
        process.env.SNS_TOPIC = "";
        const result = await catalogBatchProcess(event);
        expect(result).toStrictEqual({
            statusCode: 500,
            headers: HEADERS,
        });
    })
});