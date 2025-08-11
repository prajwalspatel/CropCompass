
'use server';
import { config } from 'dotenv';
config();

// This file is used for the Genkit development server.
// It is not part of the Next.js build.
if (process.env.GENKIT_DEV_SERVER) {
    import('@/ai/flows/suggest-optimal-crops.ts');
    import('@/ai/flows/calculate-irrigation-schedule.ts');
    import('@/ai/flows/predict-yield.ts');
    import('@/ai/flows/analyze-farm-data.ts');
    import('@/ai/flows/find-govt-schemes.ts');
    import('@/ai/flows/chat-assistant.ts');
    import('@/ai/flows/diagnose-plant.ts');
    import('@/ai/flows/get-market-price.ts');
    import('@/ai/flows/get-crop-distribution.ts');
}
