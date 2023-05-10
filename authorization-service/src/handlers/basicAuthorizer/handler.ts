import {
    APIGatewayTokenAuthorizerEvent,
    Context,
    Callback
} from "aws-lambda";

export const basicAuthorizer = async (event: APIGatewayTokenAuthorizerEvent, context: Context, callback: Callback): Promise<any> => {
    const token = event.authorizationToken;
    const encodedCredentials = token.split(" ")[1];
    const buffer = Buffer.from(encodedCredentials, "base64");
    const plainCredentials = buffer.toString("utf-8").split(":");
    const username = plainCredentials[0];
    const password = plainCredentials[1];
    console.log(`username: ${username}, password: ${password}`);
    const storePassword = process.env[username];
    const effect = !storePassword || storePassword !== password ? 'Deny' : 'Allow';
    return generatePolicy(encodedCredentials, event.methodArn, effect);
}
const generatePolicy = (principalId: string, resource: string, effect = "Allow") => {
    return {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                }
            ]
        }
    };
}