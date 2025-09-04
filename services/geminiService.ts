import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEMPLATE, DOCTORS } from '../constants';
import { ChatMessage, ChatRole } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function* streamChat(history: ChatMessage[], languageName: string) {
  const geminiHistory = history.map(msg => ({
      role: msg.role === ChatRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
  }));

  const result = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: geminiHistory,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_TEMPLATE(languageName),
    },
  });
  
  for await (const chunk of result) {
    yield chunk.text;
  }
}

export async function parseDoctorName(transcript: string): Promise<string | null> {
    const doctorList = DOCTORS.map(d => `- ${d.name} (${d.specialty})`).join('\n');
    const prompt = `From the following list of doctors:\n${doctorList}\n\nIdentify which doctor's specialty is mentioned in the text below. Respond with only the specialty name (e.g., "Cardiologist"). If no clear match is found, respond with "INVALID".\n\nText: "${transcript}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert entity extraction system. Your only output should be a single specialty string or the exact word 'INVALID'. Do not add any other explanatory text.",
                temperature: 0,
            }
        });
        const parsedSpecialty = response.text.trim();
        const isValidSpecialty = DOCTORS.some(d => d.specialty === parsedSpecialty);
        return isValidSpecialty ? parsedSpecialty : null;
    } catch (error) {
        console.error("Error parsing doctor name with Gemini:", error);
        return null;
    }
}

export async function parseDate(dateText: string): Promise<string | null> {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Parse the following text into a YYYY-MM-DD format. The date must not be in the past. Today's date is ${today}. If the text does not represent a clear future or present date, output 'INVALID'.\n\nText: "${dateText}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert date parsing system. Your only output should be a single date string in YYYY-MM-DD format or the exact word 'INVALID'. Do not add any other explanatory text.",
                temperature: 0, // For deterministic output
            }
        });

        const parsed = response.text.trim();
        
        // Validate YYYY-MM-DD format and ensure it's a plausible date
        if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
            const parsedDate = new Date(parsed);
            // Check if date is valid and not in the past (accounting for timezone)
            if (!isNaN(parsedDate.getTime())) {
                const utcParsedDate = new Date(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate());
                const utcToday = new Date(new Date(today).getUTCFullYear(), new Date(today).getUTCMonth(), new Date(today).getUTCDate());
                 if (utcParsedDate >= utcToday) {
                    return parsed;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error parsing date with Gemini:", error);
        return null;
    }
}