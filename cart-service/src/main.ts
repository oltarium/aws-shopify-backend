import {NestFactory} from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import {Callback, Context, Handler} from 'aws-lambda';
import {AppModule} from './app.module';
import {Logger} from "@nestjs/common";

let server: Handler;

async function bootstrap(): Promise<Handler> {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    //await app.listen(process.env.PORT || 3000);
    return serverlessExpress({
        app: expressApp,

        log: {
            info: (message, additional) => {
                console.log(message, additional)
            },
            debug: (message, additional) => {
                console.log(message, additional)
            },
            error: (message, additional) => {
                console.log(message, additional)
            }
        }
    });
}

export const handler: Handler = async (
    event: any,
    context: Context,
    callback: Callback,
) => {
    server = server ?? (await bootstrap());
    return server(event, context, callback);
};
//bootstrap();
