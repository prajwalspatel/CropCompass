# cropcompass
# CropCompass: Your AI-Powered Smart Farming Assistant

![CropCompass Banner](https://images.unsplash.com/photo-1560493676-04071c5f467b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZXxlbnwwfHx8fDE3NTQ0NzAyNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080)

**CropCompass** is an intelligent, AI-powered web application designed to serve as a comprehensive digital assistant for Indian farmers. It leverages the power of Google's Gemini models through the Genkit framework to provide a suite of "agentic" tools that offer actionable insights and decision support for the entire farming lifecycle.

The primary goal of CropCompass is to make modern, data-driven agricultural science accessible to every farmer, helping them increase profitability, improve sustainability, and navigate the complexities of modern farming.

## ✨ Key Features

CropCompass is built around a suite of specialized AI agents, each designed to be an expert in a specific agricultural domain.

| Feature | Agentic Tool | Description |
| :--- | :--- | :--- |
| **Pest & Disease Detection** | `diagnosePlant` | Upload a photo of a plant to identify diseases or pests. The agent provides a detailed diagnosis, confidence score, treatment suggestions (organic and chemical) with price estimates, and generates Google Maps and e-commerce links to find and purchase treatments. |
| **Crop Suggestions** | `suggestOptimalCrops`| Get personalized crop recommendations based on your farm's location, soil type, and available resources. The agent provides reasoning and suggests suitable fertilizers. |
| **Smart Irrigation Plan** | `calculateIrrigationSchedule` | Generate a tailored 30-day irrigation calendar to optimize water usage. It highlights watering days and provides water conservation tips. |
| **Yield Prediction** | `predictYield` | Estimate potential crop yield based on your crop type, soil, season, and location, complete with a weather forecast summary and actionable recommendations. |
| **Govt. Scheme Finder** | `findGovtSchemes` | Discover relevant Central and State government schemes based on your farmer profile (location, income, category) and get direct links to apply. |
| **Farm Data Analytics** | `analyzeFarmData` | Upload your farm data (CSV, XLS, PDF) to receive a concise summary, key insights on profitability, and actionable recommendations for improvement. |
| **Market Price Checker** | `getMarketPrice` | Get AI-powered estimates for your produce based on market location, including trend analysis and links to live market data. |
| **Crop Distribution Visualizer** | `getCropDistribution` | View interactive charts (Bar, Pie) showing the production share of major crops in India or a specific state. |
| **Inventory Management** | (Client-Side) | A simple tool to track your stock of fertilizers, pesticides, and other farm supplies with a persistent log of changes. |
| **AI Chat Assistant** | `chatAssistant` | A multilingual AI assistant that can answer general farming-related questions in a conversational manner. |

## 🚀 Technology Stack

This application is built with a modern, full-stack TypeScript architecture.

### **Frontend**

*   **Framework**: [Next.js](https://nextjs.org/) 14 (with App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **UI Library**: [React](https://react.dev/)
*   **Component Library**: [ShadCN UI](https://ui.shadcn.com/) - for beautiful, accessible, and composable components.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - for utility-first styling.
*   **Charting**: [Recharts](https://recharts.org/) - for creating interactive and responsive charts.
*   **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](httpss://zod.dev/) for validation.
*   **Internationalization (i18n)**: A custom solution using React Context to support English, Hindi, and Kannada.

### **Backend & AI**

*   **Runtime**: [Next.js](https://nextjs.org/) (Server Components & Server Actions)
*   **AI Orchestration**: [Genkit](https://firebase.google.com/docs/genkit) - for building, deploying, and monitoring reliable AI-powered flows.
*   **AI Model**: [Google Gemini](https://deepmind.google/technologies/gemini/) (via the `@genkit-ai/googleai` plugin).
*   **Deployment**: Designed for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## 🛠️ Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### **Prerequisites**

*   [Node.js](https://nodejs.org/en/) (version 18 or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/cropcompass.git
cd cropcompass
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Set Up Environment Variables**

You will need a Google AI (Gemini) API key to run the AI features.

1.  Create a file named `.env.local` in the root of the project.
2.  Add your API key to this file:

    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

### **4. Running the Development Servers**

This project requires running two concurrent development servers: one for the Next.js frontend and one for the Genkit AI flows.

*   **Terminal 1: Run the Next.js App**

    ```bash
    npm run dev
    ```
    This will start the Next.js development server, usually on `http://localhost:3000`.

*   **Terminal 2: Run the Genkit AI Server**

    ```bash
    npm run genkit:watch
    ```
    This starts the Genkit development server in watch mode, which allows you to test and debug your AI flows. It will be available at `http://localhost:4000`. The Next.js app is configured to proxy AI requests to this server during development.

### **5. Open the Application**

Once both servers are running, open your browser and navigate to `http://localhost:3000`. You should now see the CropCompass application running locally.

