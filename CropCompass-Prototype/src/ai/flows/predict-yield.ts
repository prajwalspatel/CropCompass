'use server';

/**
 * @fileOverview A yield prediction AI agent.
 *
 * - predictYield - A function that handles the yield prediction process.
 * - PredictYieldInput - The input type for the predictYield function.
 * - PredictYieldOutput - The return type for the predictYield function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictYieldInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  soilType: z.string().describe('The type of soil the crop is grown in.'),
  season: z.string().describe('The season in which the crop is being grown (e.g., Kharif, Rabi, Zaid).'),
  location: z.string().describe('The location where the crop is being grown.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type PredictYieldInput = z.infer<typeof PredictYieldInputSchema>;

const PredictYieldOutputSchema = z.object({
  predictedYield: z.string().describe('The estimated yield for the crop in quintals per acre.'),
  weatherReport: z.string().describe("A 6-month weather report summary for the location."),
  factors: z.string().describe('The key factors influencing the predicted yield, including weather.'),
  recommendations: z.string().describe('Recommendations to improve the yield based on all factors.'),
});
export type PredictYieldOutput = z.infer<typeof PredictYieldOutputSchema>;

export async function predictYield(input: PredictYieldInput): Promise<PredictYieldOutput> {
  return predictYieldFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictYieldPrompt',
  input: {schema: PredictYieldInputSchema},
  output: {schema: PredictYieldOutputSchema},
  prompt: `You are an expert agricultural advisor. Based on the crop type, soil conditions, season, location, and a 6-month weather forecast for the area, estimate the potential yield in quintals per acre.

Provide the entire response in the following language: {{{language}}}.

Your response must include:
1.  A summary of the 6-month weather report for the given location.
2.  The predicted yield.
3.  A description of the key factors that would influence this yield, explicitly including the weather patterns.
4.  Actionable recommendations to improve the yield.

Crop Type: {{{cropType}}}
Soil Type: {{{soilType}}}
Season: {{{season}}}
Location: {{{location}}}`,
});

const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: PredictYieldInputSchema,
    outputSchema: PredictYieldOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
