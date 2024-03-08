import "@twilio-labs/serverless-runtime-types";
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
  ServerlessEventObject,
} from "@twilio-labs/serverless-runtime-types/types";

import { OpenAI } from "openai";
import * as dotenv from "dotenv";

dotenv.config();

// You have to change that based on which parameters you expect to be passed tp
// your Twilio Function via the POST body or request parameters.
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

export const handler = async function (
  context: Context,
  event: RequestParameters,
  callback: ServerlessCallback
) {
  // Set up the Twilio VoiceResponse object to generate the TwiML
  const twiml = new Twilio.twiml.VoiceResponse();

  // Initiate the Twilio Response object to handle updating the cookie with the chat history
  const response = new Twilio.Response();

  // Parse the cookie value if it exists
  const cookieValue = event.request.cookies.convo;
  const cookieData = cookieValue
    ? JSON.parse(decodeURIComponent(cookieValue))
    : null;

  // Get the user's voice input from the event
  let voiceInput = event.SpeechResult;
  let sessionId = cookieData?.sessionId;
  // Get the AI's response based on the conversation history

  try {
    const inference = await fetch(
      `${process.env.API_URL}/inference?` +
        new URLSearchParams({
          query: voiceInput,
          sessionId: sessionId ? sessionId : "",
        })
    );
    const aiResponse = await inference.json();
    if (!aiResponse) {
      return;
    }

    // Generate some <Say> TwiML using the cleaned up AI response
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      aiResponse?.result
    );

    // Redirect to the Function where the <Gather> is capturing the caller's speech
    twiml.redirect(
      {
        method: "POST",
      },
      `/transcribe`
    );

    // Since we're using the response object to handle cookies we can't just pass the TwiML straight back to the callback, we need to set the appropriate header and return the TwiML in the body of the response
    response.appendHeader("Content-Type", "application/xml");
    response.setBody(twiml.toString());

    const newCookieValue = encodeURIComponent(
      JSON.stringify({
        sessionId: aiResponse?.sessionId,
      })
    );
    response.setCookie("convo", newCookieValue, ["Path=/"]);

    // Return the response to the handler
    callback(null, response);
  } catch (error) {
    console.error("Error: OpenAI API returned a 500 status code."); // Log an error message indicating that the OpenAI API returned a 500 status code
    twiml.say(
      {
        // Create a TwiML say element to provide an error message to the user
        voice: "Polly.Joanna-Neural",
      },
      "Oops, looks like I got an error from the OpenAI API on that request. Let's try that again."
    );
    twiml.redirect(
      {
        // Create a TwiML redirect element to redirect the user to the /transcribe endpoint
        method: "POST",
      },
      `/transcribe`
    );
    response.appendHeader("Content-Type", "application/xml"); // Set the Content-Type header of the response to "application/xml"
    response.setBody(twiml.toString()); // Set the body of the response to the XML string representation of the TwiML response
    callback(null, response); // Return the response to the callback function
  }
};
