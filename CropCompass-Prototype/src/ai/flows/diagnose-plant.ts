
'use server';
/**
 * @fileOverview A plant problem diagnosis AI agent.
 *
 * - diagnosePlant - A function that handles the plant diagnosis process.
 * - DiagnosePlantInput - The input type for the diagnosePlant function.
 * - DiagnosePlantOutput - The return type for the diagnosePlant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the plant problem.'),
  location: z.string().describe('The user\'s current location (e.g., city, district) for finding nearby stores.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type DiagnosePlantInput = z.infer<typeof DiagnosePlantInputSchema>;

const TreatmentSchema = z.object({
    method: z.string().describe('The name of the treatment method or product.'),
    priceRange: z.string().describe('The estimated price range for this treatment (e.g., "₹500 - ₹800"). "N/A" if not applicable.'),
});

const DiagnosePlantOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the image contains a plant.'),
    commonName: z.string().describe('The common name of the identified plant.'),
    latinName: z.string().describe('The Latin name of the identified plant.'),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant is healthy.'),
    diseaseOrPest: z.string().describe("The name of the disease or pest affecting the plant. 'None' if healthy."),
    confidence: z.string().describe("Confidence level of the diagnosis (e.g., High, Medium, Low)."),
    description: z.string().describe('A detailed description of the disease or pest and its symptoms.'),
  }),
  treatment: z.object({
    organic: z.array(TreatmentSchema).describe('A list of organic treatment suggestions with price ranges.'),
    chemical: z.array(TreatmentSchema).describe('A list of chemical treatment suggestions with price ranges.'),
  }),
  prevention: z.array(z.string()).describe('A list of tips to prevent this issue in the future.'),
  googleMapsSearchLink: z.string().describe("A Google Maps URL that searches for 'agricultural supply stores' in the user's provided location. Will be an empty string if no disease is detected."),
  ecommerceLinks: z.array(z.object({
    siteName: z.string().describe("The name of the e-commerce website. Only use 'Amazon', 'Flipkart', 'Zepto', or 'Blinkit'."),
    searchUrl: z.string().describe("A URL to search for a relevant treatment product on that e-commerce site."),
  })).describe("A list of search links for treatment products on popular Indian e-commerce sites. Provide links for generic terms like 'pesticide' or 'fungicide' if a specific product is not available online. Only use Amazon, Flipkart, Zepto, and Blinkit."),
});
export type DiagnosePlantOutput = z.infer<typeof DiagnosePlantOutputSchema>;

export async function diagnosePlant(input: DiagnosePlantInput): Promise<DiagnosePlantOutput> {
  return diagnosePlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantPrompt',
  input: {schema: DiagnosePlantInputSchema},
  output: {schema: DiagnosePlantOutputSchema},
  prompt: `You are an expert plant pathologist and botanist specializing in Indian agriculture. Your task is to analyze an image of a plant, a user-provided description, and their location to identify the plant, diagnose any diseases or pests, and recommend treatments.

Provide the entire response in the following language: {{{language}}}.

Analyze the provided image and description.
1.  **Identification**: First, confirm if the image contains a plant. If it does, identify its common and Latin names.
2.  **Diagnosis**: Determine if the plant is healthy. If not, identify the disease or pest. State your confidence in this diagnosis. Provide a detailed description of the symptoms and the identified issue.
3.  **Treatment**: Suggest specific organic and chemical treatment methods. For each method/pesticide, provide an estimated price range in Indian Rupees (₹).
4.  **Prevention**: Provide actionable tips to prevent the problem from recurring.
5.  **Find Stores**: If a disease or pest is identified, create a Google Maps search link for "agricultural supply stores" in the user's location. The URL should be in the format: \`https://www.google.com/maps/search/?api=1&query=agricultural+supply+stores+in+<LOCATION>\`. Replace <LOCATION> with the user's location.
6.  **E-commerce Links**: If a treatment is recommended, generate product search URLs for the suggested chemical or organic products (e.g., 'Neem Oil', 'Fungicide'). You MUST only use the following e-commerce sites: Amazon.in, Flipkart, Zepto, Blinkit.

User's Location: {{{location}}}
User's Description: {{{description}}}
Plant Photo: {{media url=photoDataUri}}`,
});

const diagnosePlantFlow = ai.defineFlow(
  {
    name: 'diagnosePlantFlow',
    inputSchema: DiagnosePlantInputSchema,
    outputSchema: DiagnosePlantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
