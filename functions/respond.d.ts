import "@twilio-labs/serverless-runtime-types";
import { Context, ServerlessCallback } from "@twilio-labs/serverless-runtime-types/types";
type RequestParameters = {
    request: {
        cookies: {
            convo?: string;
        };
        headers: {
            "Content-Type": string;
        };
    };
    SpeechResult: string;
};
export declare const handler: (context: Context, event: RequestParameters, callback: ServerlessCallback) => Promise<void>;
export {};
