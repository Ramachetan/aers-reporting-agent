
import { GoogleGenAI, GenerateContentResponse, Type, Part, Content } from "@google/genai";
import type { Message, ReportData, GeminiResponse } from '../types';
import { SYSTEM_PROMPT, RESPONSE_SCHEMA, getAdverseEffectSuggestionsTool } from '../constants';

// In browser builds, process.env is replaced by Vite. Provide a safe runtime fallback via window.__ENV__.
declare global {
  interface Window {
    __ENV__?: Record<string, any>;
  }
}

const API_KEY = (typeof process !== 'undefined' && (process as any).env && (process as any).env.API_KEY)
  || (typeof window !== 'undefined' && window.__ENV__ && (window.__ENV__.API_KEY || window.__ENV__.GEMINI_API_KEY));

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Calls an external API to get medically accurate adverse effect terms.
 */
async function getMedDRASuggestions(query: string): Promise<{ results: { LLT: string }[] }> {
    if (!query) {
        return { results: [] };
    }
    try {
        // Call the production Cloud Function URL directly.
        // This requires the Cloud Function to have CORS enabled.
        const apiUrl = 'https://meddra-lite-1036646057438.europe-west1.run.app';
            
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`MedDRA API call failed with status: ${response.status}. Body: ${errorText}`);
            // Don't show a generic error, let the AI handle the empty result.
            return { results: [] }; 
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling MedDRA API:", error);
        // On fetch error (e.g., network issue, or CORS if not configured correctly), return empty.
        return { results: [] }; 
    }
}


/**
 * Analyzes the current report data and creates a summary of filled vs empty fields
 * to help the AI understand what information is already available
 */
function analyzeReportCompleteness(reportData: ReportData): string {
  const analysis: string[] = [];
  
  // Helper function to check if a value is filled
  const isFilled = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  // Patient Info Analysis
  const patientFields = Object.entries(reportData.patient_info);
  const filledPatientFields = patientFields.filter(([_, value]) => isFilled(value));
  if (filledPatientFields.length > 0) {
    analysis.push(`PATIENT INFO (${filledPatientFields.length}/${patientFields.length} fields filled): ${filledPatientFields.map(([key, value]) => 
      `${key}=${Array.isArray(value) ? `[${value.join(', ')}]` : value}`).join(', ')}`);
  } else {
    analysis.push('PATIENT INFO: No fields filled yet');
  }

  // Adverse Event Analysis
  const eventFields = Object.entries(reportData.adverse_event);
  const filledEventFields = eventFields.filter(([_, value]) => isFilled(value));
  if (filledEventFields.length > 0) {
    analysis.push(`ADVERSE EVENT (${filledEventFields.length}/${eventFields.length} fields filled): ${filledEventFields.map(([key, value]) => 
      `${key}=${Array.isArray(value) ? `[${value.join(', ')}]` : value}`).join(', ')}`);
  } else {
    analysis.push('ADVERSE EVENT: No fields filled yet');
  }

  // Suspect Product Analysis
  const productFields = Object.entries(reportData.suspect_product);
  const filledProductFields = productFields.filter(([_, value]) => isFilled(value));
  if (filledProductFields.length > 0) {
    analysis.push(`SUSPECT PRODUCT (${filledProductFields.length}/${productFields.length} fields filled): ${filledProductFields.map(([key, value]) => 
      `${key}=${Array.isArray(value) ? `[${value.join(', ')}]` : value}`).join(', ')}`);
  } else {
    analysis.push('SUSPECT PRODUCT: No fields filled yet');
  }

  // Concomitant Products
  if (reportData.concomitant_products.length > 0) {
    analysis.push(`CONCOMITANT PRODUCTS: ${reportData.concomitant_products.length} products listed`);
  } else {
    analysis.push('CONCOMITANT PRODUCTS: None listed yet');
  }

  // Reporter Info (should be auto-filled)
  const reporterFields = Object.entries(reportData.reporter_info);
  const filledReporterFields = reporterFields.filter(([_, value]) => isFilled(value));
  if (filledReporterFields.length > 0) {
    analysis.push(`REPORTER INFO (AUTO-FILLED): ${filledReporterFields.map(([key]) => key).join(', ')}`);
  }

  // Product Available
  if (reportData.product_available !== null) {
    analysis.push(`PRODUCT AVAILABLE: ${reportData.product_available ? 'Yes' : 'No'}`);
  }

  return analysis.join('\n');
}

export async function getAiResponse(
  conversationHistory: Message[],
  currentReportData: ReportData,
  files?: { mimeType: string; data: string }[]
): Promise<GeminiResponse> {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const reportAnalysis = analyzeReportCompleteness(currentReportData);
    
    const systemInstruction = `${SYSTEM_PROMPT}

**CURRENT DATE**
${currentDate}

**CURRENT REPORT DATA ANALYSIS**
${reportAnalysis}

**FULL CURRENT REPORT DATA**
${JSON.stringify(currentReportData, null, 2)}
`;

    const historyToFormat = conversationHistory[0]?.id === 'initial-greeting'
      ? conversationHistory.slice(1)
      : conversationHistory;

    // Build conversation history for the model
    const contents: Content[] = historyToFormat.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    // If there are files, attach them to the last user message
    if (files && files.length > 0 && contents.length > 0) {
      const lastContent = contents[contents.length - 1];
      if (lastContent.role === 'user') {
          const fileParts = files.map(file => ({
              inlineData: {
                  mimeType: file.mimeType,
                  data: file.data,
              },
          }));
          lastContent.parts.push(...fileParts);
      }
    }
    
    // Step 1: Make an initial call with tools enabled to see if the model uses one.
    // We DO NOT enforce a response schema here, to give the model freedom.
    const initialResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [getAdverseEffectSuggestionsTool],
      },
    });
    
    // Check for a function call using the correct `functionCalls` property.
    const functionCall = initialResponse.functionCalls?.[0];

    if (functionCall?.name === 'get_adverse_effect_suggestions') {
      const symptomDescription = functionCall.args.symptom_description as string || '';
      const suggestions = await getMedDRASuggestions(symptomDescription);
      const suggestionTerms = suggestions.results.map(r => r.LLT).slice(0, 5);

      if (suggestionTerms.length > 0) {
        // SUCCESS: Return our special response with suggestions for the UI.
        return {
          ai_response_message: "Thanks for sharing. To ensure I'm capturing this accurately, which of these terms best describes your symptom?",
          updated_report_data: currentReportData,
          suggestions: suggestionTerms,
        };
      } else {
        // The tool was called but returned no results. We must inform the model
        // and ask it to generate a normal response by forcing JSON.
        const newHistory: Content[] = [
          ...contents,
          { role: 'model', parts: [{ functionCall }] },
          {
            role: 'tool',
            parts: [{
              functionResponse: {
                name: functionCall.name,
                response: { result: `No specific medical terms were found for "${symptomDescription}".` }
              }
            }]
          }
        ];
        
        const finalResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: newHistory,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: RESPONSE_SCHEMA,
            },
        });
        const responseText = finalResponse.text?.trim();
        if (!responseText) throw new Error("AI returned an empty response after a failed tool call.");
        return JSON.parse(responseText) as GeminiResponse;
      }
    } else {
      // The model chose not to call a function.
      // We must call it again, this time forcing the JSON schema to get a valid report update.
      const jsonResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      });

      const responseText = jsonResponse.text?.trim();
      if (!responseText) {
        throw new Error("AI returned an empty response when forced to generate JSON.");
      }
      
      const parsedResponse = JSON.parse(responseText);
      
      if (!parsedResponse.ai_response_message || !parsedResponse.updated_report_data) {
        throw new Error('Invalid response structure from AI.');
      }

      return parsedResponse as GeminiResponse;
    }

  } catch (error) {
    console.error("Error fetching AI response:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get response from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
}
