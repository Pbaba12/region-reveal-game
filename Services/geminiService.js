import { GoogleGenAI } from "@google/genai"; // GenerateContentResponse removed as it's a type
import { AI_MODEL_NAME } from '../constants.js';

let ai = null; // Removed GoogleGenAI type
let apiKeyAvailable = false;

// process.env.API_KEY will not be available in GitHub Pages client-side code.
// This logic will correctly result in apiKeyAvailable = false.
// For a real app needing the API key, a backend proxy is required.
if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    apiKeyAvailable = true;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    apiKeyAvailable = false;
  }
} else {
  console.warn("API_KEY environment variable not found or 'process' is not defined. AI features will be disabled.");
  apiKeyAvailable = false; // Ensure it's false if process or process.env is not defined
}


export const isApiKeyAvailable = () => apiKeyAvailable; // Removed boolean type

// RegionChallengeDetails interface removed (was for type checking)
// GuessEvaluation interface removed (was for type checking)

const generateJson = async (prompt) => { // Removed type annotations
  if (!ai || !apiKeyAvailable) {
    console.warn("Gemini AI service is not available for JSON generation.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({ // Removed GenerateContentResponse type
        model: AI_MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON response:", e, "Raw text:", response.text);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API for JSON:", error);
    return null;
  }
};


const generateText = async (prompt) => { // Removed type annotations
    if (!ai || !apiKeyAvailable) {
      console.warn("Gemini AI service is not available for text generation.");
      return null;
    }
    try {
      const response = await ai.models.generateContent({ // Removed GenerateContentResponse type
          model: AI_MODEL_NAME,
          contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error calling Gemini API for text:", error);
      return null;
    }
  };


export const getRegionChallengeDetails = async () => { // Removed Promise<RegionChallengeDetails>
  const defaultChallenge = { // Structure remains, type is inferred
    regions: ["Oyo", "Lagos", "Borno"],
    country: "Nigeria",
    playerQuestion: "These regions are all part of which nation?"
  };
  if (!apiKeyAvailable) return defaultChallenge;

  const prompt = `You are a creative game designer for a geography guessing game.
Generate a set of three distinct, real-world states or regions from a single country.
Also, provide the name of that country. Ensure the states/regions are recognizable but might offer a moderate challenge.
Provide a short, engaging question (max 20 words) to ask the player to guess this country.
Return the response as a JSON object with keys: "regions" (an array of 3 region/state name strings), "country" (a string: the name of the country), and "playerQuestion" (a string for the player).
Example 1: {"regions": ["California", "Texas", "New York"], "country": "United States of America", "playerQuestion": "To which country do these prominent states belong?"}
Example 2: {"regions": ["Kyoto Prefecture", "Hokkaido", "Okinawa Prefecture"], "country": "Japan", "playerQuestion": "These diverse prefectures belong to which island nation?"}
Example 3: {"regions": ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg"], "country": "Germany", "playerQuestion": "Which European country are these 'Bundesländer' part of?"}`;

  const aiChallenge = await generateJson(prompt);
  if (aiChallenge && Array.isArray(aiChallenge.regions) && aiChallenge.regions.length === 3 && typeof aiChallenge.country === 'string' && typeof aiChallenge.playerQuestion === 'string') {
    return aiChallenge;
  }
  console.warn("AI region challenge fallback triggered due to parsing issue or unexpected structure.", aiChallenge);
  return defaultChallenge;
};

export const evaluateCountryGuess = async (regions, secretCountry, playerGuess) => { // Removed Promise<GuessEvaluation> and param types
  const defaultEvaluation = { // Structure remains
    isCorrect: playerGuess.toLowerCase() === secretCountry.toLowerCase(),
    feedback: playerGuess.toLowerCase() === secretCountry.toLowerCase() ? "That's the one!" : "Not quite, try another guess!",
    isClose: false
  };
  if (!apiKeyAvailable) return defaultEvaluation;

  const prompt = `You are an AI judge for a geography guessing game.
The three regions/states presented to the player are: ${regions.join(', ')}.
The secret country they belong to is: "${secretCountry}".
The player guessed: "${playerGuess}".

Evaluate if the player's guessed country is correct.
Respond ONLY with a JSON object in the format:
{
  "isCorrect": boolean,
  "feedback": string,
  "isClose": boolean 
}
If the guess is correct, the feedback must be congratulatory.
If "isClose" is true, the feedback should acknowledge this.
If wrong and not close, provide gentle feedback.
Do not reveal the secret country in the feedback unless "isCorrect" is true.`;

  const aiEvaluation = await generateJson(prompt);
  if (aiEvaluation && typeof aiEvaluation.isCorrect === 'boolean' && typeof aiEvaluation.feedback === 'string') {
    return {
        isCorrect: aiEvaluation.isCorrect,
        feedback: aiEvaluation.feedback,
        isClose: typeof aiEvaluation.isClose === 'boolean' ? aiEvaluation.isClose : false,
    };
  }
  console.warn("AI country guess evaluation fallback triggered due to parsing issue or unexpected structure.", aiEvaluation);
  const isCorrect = playerGuess.trim().toLowerCase() === secretCountry.trim().toLowerCase();
  return {
      isCorrect,
      feedback: isCorrect ? "Correct!" : `Not quite. The answer isn't "${playerGuess}".`,
      isClose: false
  };
};

export const getWinMessage = async (guessCount, secretCountry) => { // Removed Promise<string> and param types
  const defaultMessage = `You got it in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}! The country was: ${secretCountry}.`;
  if (!apiKeyAvailable) return defaultMessage;

  const prompt = `You are a cheerful game host. The player just correctly guessed the country in ${guessCount} ${guessCount === 1 ? 'attempt' : 'attempts'}.
The country was: "${secretCountry}".
Provide a short, enthusiastic, and congratulatory message (max 25 words).
Do NOT repeat the secret country in your message if it's too long; focus on the congratulation.`;
  const aiMessage = await generateText(prompt);
  return aiMessage || defaultMessage;
};