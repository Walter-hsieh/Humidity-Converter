
import { GoogleGenAI } from "@google/genai";

interface HumidityData {
  temperature: number;
  relativeHumidity: number;
  dewPoint: number;
  absoluteHumidity: number;
}

export async function getExplanation(data: HumidityData): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
        You are an expert meteorologist. Explain the following atmospheric conditions in simple, easy-to-understand terms for a layperson. 
        Describe what it would feel like to be in these conditions and explain the relationship between the values. Keep the explanation concise and well-formatted.

        Conditions:
        - Air Temperature: ${data.temperature.toFixed(1)}°C
        - Relative Humidity: ${data.relativeHumidity.toFixed(1)}%
        - Dew Point: ${data.dewPoint.toFixed(1)}°C
        - Absolute Humidity: ${data.absoluteHumidity.toFixed(1)} g/m³

        Start with a summary of the feeling (e.g., "This feels like a warm and muggy day.") and then briefly explain each metric and how they connect.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching explanation from Gemini API:", error);
        throw new Error("Could not connect to the AI service. Please check your API key and network connection.");
    }
}
