import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AI_MODEL_NAME } from '../constants';

let ai: GoogleGenAI | null = null;
let apiKeyAvailable = false;

if (process.env.API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    apiKeyAvailable = true;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    apiKeyAvailable = false;
  }
} else {
  console.warn("API_KEY environment variable not found. AI features will be disabled.");
}

export const isApiKeyAvailable = (): boolean => apiKeyAvailable;

interface RegionChallengeDetails {
  regions: string[];
  country: string;
  playerQuestion: string; // Question AI asks player
}

interface GuessEvaluation {
  isCorrect: boolean;
  feedback: string;
  isClose?: boolean;
}

const generateJson = async (prompt: string): Promise<any | null> => {
  if (!ai || !apiKeyAvailable) {
    console.warn("Gemini AI service is not available for JSON generation.");
    return null;
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
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


const generateText = async (prompt: string): Promise<string | null> => {
    if (!ai || !apiKeyAvailable) {
      console.warn("Gemini AI service is not available for text generation.");
      return null;
    }
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
          model: AI_MODEL_NAME,
          contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error calling Gemini API for text:", error);
      return null;
    }
  };


export const getRegionChallengeDetails = async (): Promise<RegionChallengeDetails> => {
  const defaultChallenge: RegionChallengeDetails = {
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

export const evaluateCountryGuess = async (regions: string[], secretCountry: string, playerGuess: string): Promise<GuessEvaluation> => {
  const defaultEvaluation: GuessEvaluation = {
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
  "isCorrect": boolean, // true if the player's guess correctly identifies the secret country. Be reasonably lenient with minor variations in naming (e.g., "USA" for "United States of America", "UK" for "United Kingdom").
  "feedback": string,   // A short, helpful message to the player (max 20 words). If correct, congratulate. If incorrect, be encouraging.
  "isClose": boolean    // true if the guess is incorrect but perhaps a neighboring country, or a country often confused with the secret one. False otherwise.
}
If the guess is correct, the feedback must be congratulatory.
If "isClose" is true, the feedback should acknowledge this (e.g., "Getting geographically close, but not there yet!").
If wrong and not close, provide gentle feedback like "That's an interesting guess, but not the country I'm thinking of." or "Not the nation these regions call home. Try again!"
Do not reveal the secret country in the feedback unless "isCorrect" is true.
Example for wrong: {"isCorrect": false, "feedback": "Not the one! Think about their continent.", "isClose": false}
Example for close (e.g. guessing Canada for USA regions): {"isCorrect": false, "feedback": "Very close neighbor, but not it!", "isClose": true}
Example for correct: {"isCorrect": true, "feedback": "Absolutely right! Well done!", "isClose": false}`;

  const aiEvaluation = await generateJson(prompt);
  if (aiEvaluation && typeof aiEvaluation.isCorrect === 'boolean' && typeof aiEvaluation.feedback === 'string') {
    return {
        isCorrect: aiEvaluation.isCorrect,
        feedback: aiEvaluation.feedback,
        isClose: typeof aiEvaluation.isClose === 'boolean' ? aiEvaluation.isClose : false,
    };
  }
  console.warn("AI country guess evaluation fallback triggered due to parsing issue or unexpected structure.", aiEvaluation);
  // More robust fallback if AI fails
  const isCorrect = playerGuess.trim().toLowerCase() === secretCountry.trim().toLowerCase();
  return {
      isCorrect,
      feedback: isCorrect ? "Correct!" : `Not quite. The answer isn't "${playerGuess}".`,
      isClose: false
  };
};

export const getWinMessage = async (guessCount: number, secretCountry: string): Promise<string> => {
  const defaultMessage = `You got it in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}! The country was: ${secretCountry}.`;
  if (!apiKeyAvailable) return defaultMessage;

  const prompt = `You are a cheerful game host. The player just correctly guessed the country in ${guessCount} ${guessCount === 1 ? 'attempt' : 'attempts'}.
The country was: "${secretCountry}".
Provide a short, enthusiastic, and congratulatory message (max 25 words).
Do NOT repeat the secret country in your message if it's too long; focus on the congratulation.
Example: "Brilliant! You pinpointed it in ${guessCount} ${guessCount === 1 ? 'go' : 'goes'}!"
Example: "Yes! That's the nation! Fantastic geographical skills!"`;
  const aiMessage = await generateText(prompt);
  return aiMessage || defaultMessage;
};