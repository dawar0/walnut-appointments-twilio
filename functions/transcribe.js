"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("@twilio-labs/serverless-runtime-types");
const handler = function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    if (!event.request.cookies.convo) {
        twiml.say({
            voice: "Polly.Joanna-Neural",
        }, "Welcome to Dr Smith's office. I'm Polly. You can ask me to schedule an appointment.");
    }
    twiml.gather({
        speechTimeout: "auto",
        speechModel: "experimental_conversations",
        input: ["speech"],
        action: "/respond",
    });
    const response = new Twilio.Response();
    response.appendHeader("Content-Type", "application/xml");
    response.setBody(twiml.toString());
    if (!event.request.cookies.convo) {
        response.setCookie("convo", "", ["Path=/"]);
    }
    callback(null, response);
};
exports.handler = handler;
