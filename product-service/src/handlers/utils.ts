import {APIGatewayProxyEvent} from "aws-lambda";

export function logRequest(event: APIGatewayProxyEvent) {
    const log = `
        Method: ${event.httpMethod}, 
        Function: createProduct, 
        Path Parameters: ${JSON.stringify(event.pathParameters)}, 
        Query Parameters: ${JSON.stringify(event.queryStringParameters)},
        Body: ${JSON.stringify(event.body)}
    `;
    console.log(log);
}