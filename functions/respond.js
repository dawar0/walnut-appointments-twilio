"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("@twilio-labs/serverless-runtime-types");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    const response = new Twilio.Response();
    const cookieValue = event.request.cookies.convo;
    const cookieData = cookieValue
        ? JSON.parse(decodeURIComponent(cookieValue))
        : null;
    let voiceInput = event.SpeechResult;
    let sessionId = cookieData?.sessionId;
    console.log({
        query: voiceInput,
        sessionId: sessionId ? sessionId : "",
    });
    console.log(cookieValue);
    try {
        const inference = await fetch(`${process.env.API_URL}/inference?` +
            new URLSearchParams({
                query: voiceInput,
                sessionId: sessionId ? sessionId : "",
            }));
        const aiResponse = await inference.json();
        if (!aiResponse) {
            return;
        }
        twiml.say({
            voice: "Polly.Joanna-Neural",
        }, aiResponse?.result);
        twiml.redirect({
            method: "POST",
        }, `/transcribe`);
        response.appendHeader("Content-Type", "application/xml");
        response.setBody(twiml.toString());
        const newCookieValue = encodeURIComponent(JSON.stringify({
            sessionId: aiResponse?.sessionId,
        }));
        response.setCookie("convo", newCookieValue, ["Path=/"]);
        callback(null, response);
    }
    catch (error) {
        console.error("Error: OpenAI API returned a 500 status code.");
        twiml.say({
            voice: "Polly.Joanna-Neural",
        }, "Oops, looks like I got an error from the OpenAI API on that request. Let's try that again.");
        twiml.redirect({
            method: "POST",
        }, `/transcribe`);
        response.appendHeader("Content-Type", "application/xml");
        response.setBody(twiml.toString());
        callback(null, response);
    }
};
exports.handler = handler;
