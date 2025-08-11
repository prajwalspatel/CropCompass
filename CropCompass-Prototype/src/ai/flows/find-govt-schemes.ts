'use server';

/**
 * @fileOverview A government scheme finder AI agent.
 *
 * - findGovtSchemes - A function that finds relevant government schemes.
 * - FindGovtSchemesInput - The input type for the findGovtSchemes function.
 * - FindGovtSchemesOutput - The return type for the findGovtSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindGovtSchemesInputSchema = z.object({
  location: z.string().describe('The location of the user (e.g., District, State).'),
  farmerCategory: z.string().describe('The category of the farmer (e.g., Small, Marginal, Large).'),
  annualIncome: z.string().describe("The farmer's approximate annual income in INR (e.g., 'less than 1 lakh', '2-5 lakhs')."),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type FindGovtSchemesInput = z.infer<typeof FindGovtSchemesInputSchema>;

const SchemeSchema = z.object({
    name: z.string().describe("The name of the government scheme."),
    eligibility: z.string().describe("The eligibility criteria for the scheme."),
    benefits: z.string().describe("The benefits provided by the scheme."),
    documents: z.string().describe("The list of documents required to apply for the scheme."),
    application: z.string().describe("The application process for the scheme."),
    applicationLink: z.string().describe("A direct official URL to the scheme's information or application portal. Should be a valid URL."),
});

const FindGovtSchemesOutputSchema = z.object({
  centralSchemes: z.array(SchemeSchema).describe('A list of relevant central government schemes.'),
  stateSchemes: z.array(SchemeSchema).describe('A list of relevant state-level government schemes for the specified location.'),
});
export type FindGovtSchemesOutput = z.infer<typeof FindGovtSchemesOutputSchema>;

export async function findGovtSchemes(input: FindGovtSchemesInput): Promise<FindGovtSchemesOutput> {
  return findGovtSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findGovtSchemesPrompt',
  input: {schema: FindGovtSchemesInputSchema},
  output: {schema: FindGovtSchemesOutputSchema},
  prompt: `You are an expert advisor on Indian government schemes for farmers. Based on the user's location, farmer category, and annual income, identify relevant government schemes. You MUST categorize them into 'centralSchemes' and 'stateSchemes'.

For each scheme, provide:
1.  Name of the scheme.
2.  Eligibility criteria.
3.  Benefits provided.
4.  Documents required.
5.  Application process.
6.  A direct, official URL to the scheme's information or application portal.

Provide the entire response in the following language: {{{language}}}.

Location: {{{location}}}
Farmer Category: {{{farmerCategory}}}
Annual Income: {{{annualIncome}}}

Focus on the most impactful schemes like PM-Kisan, Soil Health Card, and PMFBY for central schemes, and include relevant state-specific schemes based on the provided location.`,
});

const findGovtSchemesFlow = ai.defineFlow(
  {
    name: 'findGovtSchemesFlow',
    inputSchema: FindGovtSchemesInputSchema,
    outputSchema: FindGovtSchemesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
