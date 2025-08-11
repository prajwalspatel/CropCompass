
'use server';
/**
 * @fileOverview An AI agent for providing crop distribution data for India or a specific state.
 *
 * - getCropDistribution - A function that fetches crop distribution data.
 * - GetCropDistributionInput - The input type for the getCropDistribution function.
 * - GetCropDistributionOutput - The return type for the getCropDistribution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCropDistributionInputSchema = z.object({
  graphType: z.string().describe('The type of graph requested (e.g., "Bar Chart", "Pie Chart").'),
  location: z.string().describe('The location (state) for which to get the crop distribution. Defaults to "India" if not provided.').optional(),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type GetCropDistributionInput = z.infer<typeof GetCropDistributionInputSchema>;

const CropDataPointSchema = z.object({
    name: z.string().describe("The name of the crop."),
    value: z.number().describe("The percentage of total production for this crop."),
});

const GetCropDistributionOutputSchema = z.object({
  title: z.string().describe("A title for the graph, e.g., 'Top 10 Major Crops in India by Production Share'."),
  data: z.array(CropDataPointSchema).describe('An array of the top 10 crops and their percentage of total production. The sum of values should be close to 100 representing the share of these top crops.'),
  insights: z.string().describe("A brief analysis or insight about the crop distribution based on the data provided."),
});
export type GetCropDistributionOutput = z.infer<typeof GetCropDistributionOutputSchema>;

export async function getCropDistribution(input: GetCropDistributionInput): Promise<GetCropDistributionOutput> {
  return getCropDistributionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCropDistributionPrompt',
  input: {schema: GetCropDistributionInputSchema},
  output: {schema: GetCropDistributionOutputSchema},
  prompt: `You are an expert agricultural data analyst. Your task is to provide data on the distribution of the top 10 major crops grown in {{#if location}}{{{location}}}{{else}}India{{/if}} by production volume share.

Provide the entire response, including the title, data names, and insights, in the following language: {{{language}}}.

The output should be a JSON object containing:
1.  A 'title' for the graph.
2.  A 'data' array, where each object has a 'name' (the crop) and a 'value' (the production percentage). The top 10 crops should be listed.
3.  A brief 'insights' string summarizing the data.

Please provide the most recent and accurate data available.
Graph Type Requested: {{{graphType}}}.
`,
});

const getCropDistributionFlow = ai.defineFlow(
  {
    name: 'getCropDistributionFlow',
    inputSchema: GetCropDistributionInputSchema,
    outputSchema: GetCropDistributionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
