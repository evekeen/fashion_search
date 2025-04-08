import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';

// Load environment variables explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

export const openaiClient = new OpenAI({
  apiKey
});