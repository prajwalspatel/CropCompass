'use server';
/**
 * @fileOverview An AI assistant for farming queries.
 *
 * - chatAssistant - A function that handles the chat assistant queries.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatAssistantInputSchema = z.object({
  message: z.string().describe("The user's message to the assistant."),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response."),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: {schema: ChatAssistantInputSchema},
  output: {schema: ChatAssistantOutputSchema},
  prompt: `You are a helpful AI assistant for farmers called CropCompass. Your goal is to answer questions and provide information related to farming, agriculture, crop management, and government schemes. Be friendly, knowledgeable, and provide concise, actionable advice.

Provide the entire response in the following language: {{{language}}}.

User's query: {{{message}}}`,
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
