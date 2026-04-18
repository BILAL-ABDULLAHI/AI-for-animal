
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisInput, AnalysisResult } from "../types";

export const analyzeAnimalHealth = async (input: AnalysisInput): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analyze the following animal health data and provide a detailed diagnostic report.
    Animal Category: ${input.category}
    Specific Type: ${input.specificType}
    Age: ${input.age}
    Symptoms: ${input.symptoms}
    Behavioral Changes: ${input.behaviorChanges}
    Feeding Patterns: ${input.feedingPatterns}
    Environment: ${input.environment}

    Please provide a professional assessment including:
    1. Possible conditions/diagnoses (max 3).
    2. Recommended immediate actions or treatments (if safe for non-professionals).
    3. Preventive measures for the future.
    4. Whether this is an emergency situation.
    5. A confidence score (0-100).
    6. Referral advice (when to see a vet).
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (input.imageUrl) {
    const base64Data = input.imageUrl.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          possibleDiagnosis: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of potential medical conditions."
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Recommended immediate steps or first aid."
          },
          preventiveMeasures: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "How to prevent this in the future."
          },
          isEmergency: {
            type: Type.BOOLEAN,
            description: "True if the animal requires immediate life-saving veterinary attention."
          },
          confidenceScore: {
            type: Type.NUMBER,
            description: "Confidence in the assessment from 0 to 100."
          },
          referralAdvice: {
            type: Type.STRING,
            description: "Guidance on when and why to contact a professional veterinarian."
          }
        },
        required: ["possibleDiagnosis", "recommendations", "preventiveMeasures", "isEmergency", "confidenceScore", "referralAdvice"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result as AnalysisResult;
};
