'use server';
/**
 * @fileOverview This file defines a Genkit flow for calculating an irrigation schedule based on crop type, soil conditions, and weather forecasts.
 *
 * - calculateIrrigationSchedule - A function that calculates the irrigation schedule.
 * - CalculateIrrigationScheduleInput - The input type for the calculateIrrigationSchedule function.
 * - CalculateIrrigationScheduleOutput - The return type for the calculateIrrigationSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateIrrigationScheduleInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  soilType: z.string().describe('The type of soil the crop is grown in.'),
  location: z.string().describe('The location where the crop is being grown.'),
  waterAccess: z.string().describe('Water access description'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type CalculateIrrigationScheduleInput = z.infer<typeof CalculateIrrigationScheduleInputSchema>;

const ScheduleEntrySchema = z.object({
  date: z.string().describe("The date for the watering event in 'YYYY-MM-DD' format."),
  task: z.string().describe("The specific watering instruction for that day, e.g., 'Water for 30 minutes in the morning.'"),
});

const CalculateIrrigationScheduleOutputSchema = z.object({
  schedule: z.array(ScheduleEntrySchema).describe('A 30-day watering schedule starting from today. It must include at least 5-7 watering days spread out over the 30 day period.'),
  waterConservationTips: z.string().describe('Tips for water conservation.'),
});
export type CalculateIrrigationScheduleOutput = z.infer<typeof CalculateIrrigationScheduleOutputSchema>;

export async function calculateIrrigationSchedule(input: CalculateIrrigationScheduleInput): Promise<CalculateIrrigationScheduleOutput> {
  return calculateIrrigationScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateIrrigationSchedulePrompt',
  input: {schema: CalculateIrrigationScheduleInputSchema},
  output: {schema: CalculateIrrigationScheduleOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in irrigation. Based on the crop type, soil conditions, location, and weather forecasts, create a detailed 30-day irrigation schedule starting from today.

The output must be a structured calendar of events. Make sure to schedule at least 5-7 distinct watering days within the 30-day period. Also provide general water conservation techniques.

Provide the entire response in the following language: {{{language}}}.

Today's date is {{currentDate}}.

Crop Type: {{{cropType}}}
Soil Type: {{{soilType}}}
Location: {{{location}}}
Water access: {{{waterAccess}}}`,
});

const calculateIrrigationScheduleFlow = ai.defineFlow(
  {
    name: 'calculateIrrigationScheduleFlow',
    inputSchema: CalculateIrrigationScheduleInputSchema,
    outputSchema: CalculateIrrigationScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      ...input,
      // @ts-ignore
      currentDate: new Date().toLocaleDateString('en-CA')
    });
    return output!;
  }
);
