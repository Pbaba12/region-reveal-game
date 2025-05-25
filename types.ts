export interface GameState {
  regions: string[]; // Changed from cities
  secretCountry: string; // Changed from secretConnection
  aiQuestion: string; // Changed from playerQuestion, AI poses question about the country
  currentGuess: string; // Player's textual guess for the country
  feedbackMessage: string; // AI generated feedback or game status messages
  statusMessage: string; // "Correct!", "Incorrect", "Close!" or ""
  guessCount: number;
  gameOver: boolean;
  isLoadingAI: boolean;
  isCorrectGuess?: boolean; // Specifically track if the last guess was correct
}