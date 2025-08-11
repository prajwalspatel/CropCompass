'use server';
/**
 * @fileOverview A farm data analysis AI agent.
 *
 * - analyzeFarmData - A function that handles the farm data analysis process.
 * - AnalyzeFarmDataInput - The input type for the analyzeFarmData function.
 * - AnalyzeFarmDataOutput - The return type for the analyzeFarmData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFarmDataInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A data file (CSV, XLS, PDF), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the uploaded file.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type AnalyzeFarmDataInput = z.infer<typeof AnalyzeFarmDataInputSchema>;

const AnalyzeFarmDataOutputSchema = z.object({
  summary: z.string().describe('A brief, one-paragraph summary of the key findings from the data.'),
  keyInsights: z.array(z.string()).describe('A list of 3-5 bullet-point insights on yields, costs, and profitability.'),
  recommendations: z.array(z.string()).describe('A list of 3-5 actionable recommendations to improve farm performance.'),
});
export type AnalyzeFarmDataOutput = z.infer<typeof AnalyzeFarmDataOutputSchema>;

export async function analyzeFarmData(input: AnalyzeFarmDataInput): Promise<AnalyzeFarmDataOutput> {
  return analyzeFarmDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFarmDataPrompt',
  input: {schema: AnalyzeFarmDataInputSchema},
  output: {schema: AnalyzeFarmDataOutputSchema},
  prompt: `You are an expert agricultural data analyst. Analyze the following farm data from the file '{{{fileName}}}'. Your goal is to provide a clear, concise, and easily understandable analysis. Avoid overly long text.

Your analysis must include:
1.  A brief **Summary** of the overall findings.
2.  A list of 3-5 crucial **Key Insights** (e.g., "Highest-cost operation is X," "Crop A is 20% more profitable than Crop B").
3.  A list of 3-5 actionable **Recommendations** (e.g., "Consider reducing fertilizer usage for Crop C," "Explore market options for Crop A").

Provide the entire response in the following language: {{{language}}}.

Use the following data as the source for your analysis.

File: {{media url=fileDataUri}}`,
});

const analyzeFarmDataFlow = ai.defineFlow(
  {
    name: 'analyzeFarmDataFlow',
    inputSchema: AnalyzeFarmDataInputSchema,
    outputSchema: AnalyzeFarmDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
