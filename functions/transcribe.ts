import "@twilio-labs/serverless-runtime-types";
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

// You have to change that based on which parameters you expect to be passed tp
// your Twilio Function via the POST body or request parameters.
type RequestParameters = {
  request: {
    cookies: {
      convo?: string;
    };
  };
};

export const handler: ServerlessFunctionSignature = function (
  context: Context,
  event: RequestParameters,
  callback: ServerlessCallback
) {
  const twiml = new Twilio.twiml.VoiceResponse();

  // If no previous conversation is present, or if the conversation is empty, start the conversation
  if (!event.request.cookies.convo) {
    // Greet the user with a message using AWS Polly Neural voice
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Welcome to Dr Smith's office. I'm Polly. You can ask me to schedule an appointment."
    );
  }

  // Listen to the user's speech and pass the input to the /respond Function
  twiml.gather({
    speechTimeout: "auto", // Automatically determine the end of user speech
    speechModel: "experimental_conversations", // Use the conversation-based speech recognition model
    input: ["speech"], // Specify speech as the input type
    action: "/respond", // Send the collected input to /respond
  });

  // Create a Twilio Response object
  const response = new Twilio.Response();

  // Set the response content type to XML (TwiML)
  response.appendHeader("Content-Type", "application/xml");

  // Set the response body to the generated TwiML
  response.setBody(twiml.toString());

  // If no conversation cookie is present, set an empty conversation cookie
  if (!event.request.cookies.convo) {
    response.setCookie("convo", "", ["Path=/"]);
  }

  // Return the response to Twilio
  callback(null, response);
};
