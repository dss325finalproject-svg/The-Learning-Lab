import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getStudyHelp(
  topic: string, 
  context: string, 
  learningStyle?: string, 
  fileData?: { mimeType: string, data: string },
  prefs?: StudyPreferences
) {
  const model = "gemini-3-flash-preview";
  
  const prefPrompt = prefs ? `
    Difficulty: ${prefs.difficulty || 'medium'}.
    Explanation level: ${prefs.explanationDepth || 'simple'}.
    - Easy: focus on definitions.
    - Medium: focus on understanding.
    - Hard: focus on analysis.
    - Simple explanation: short notes.
    - Detailed: more info.
    - Step-by-step: break it down.
  ` : '';

  const stylePrompt = learningStyle ? `The user is a ${learningStyle} learner. Write for them simply.
    Don't use complex words. Write short sentences.
    - For visual: use simple descriptions and ASCII diagrams.
    - For auditory: give simple tips or patterns.
    - For readWrite: use lists and clear steps.` : '';

  let contents: any[] = [
    { text: `You are a study helper. ${stylePrompt} ${prefPrompt}
    Topic: ${topic}.
    Context: ${context}.
    
    Here is the rule for your writing:
    - Use a neutral tone. Do not be too formal or too friendly.
    - Use common words and short sentences.
    - No complicated terms or big words.
    - No long dashes or asterisks (*).
    - No phrases like "dive into", "unleash", or "game-changing".
    - Be straight to the point.
    - If you talk about the study companion, call it "buddy" or "friend".
    
    Provide a short summary, key points, and a few practice questions. 
    Strict rule: Do not use any markdown formatting. No asterisks, bolding, italics, or headers. Use plain text only.
    No markdown.` }
  ];

  if (fileData) {
    contents.unshift({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function getMotivationalMessage() {
  const model = "gemini-3-flash-preview";
  const prompt = `Write a short note for someone studying.
    Use under 15 words. 
    Use a neutral tone.
    No asterisks or special symbols.
    No complex words.
    Don't use "unlock" or "potential".
    Be straight to the point.
    Call the helper "buddy" or "friend".`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "You're doing well. Keep it up.";
  }
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint: string;
  category: string; // The specific sub-topic or skill tested
}

export interface StudyPreferences {
  difficulty?: 'easy' | 'medium' | 'hard';
  quizLevel?: 'recall' | 'application' | 'thinking';
  explanationDepth?: 'simple' | 'detailed' | 'breakdown';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

export async function generateFlashcards(
  topic: string, 
  context: string, 
  learningStyle?: string,
  fileData?: { mimeType: string, data: string },
  performanceHistory?: string,
  prefs?: StudyPreferences
): Promise<Flashcard[]> {
  const model = "gemini-3-flash-preview";
  const stylePrompt = learningStyle ? `Write for a ${learningStyle} learner.` : '';
  const historyPrompt = performanceHistory ? `Here is how they did before: ${performanceHistory}. Focus on what they found hard.` : '';
  
  const prefPrompt = prefs ? `
    Difficulty: ${prefs.difficulty || 'medium'}.
    Explanation level: ${prefs.explanationDepth || 'simple'}.
  ` : '';

  let parts: any[] = [
    { text: `Generate 8 simple flashcards about "${topic}". ${stylePrompt} ${historyPrompt} ${prefPrompt}
    Use this context: "${context}".
    
    Writing rules:
    - Use common words and short sentences.
    - No complicated terms.
    - No asterisks (*) or long dashes.
    - No buzzwords like "unleash".
    - Use a neutral tone.
    - Be straight to the point.
    - If you mention the study buddy, call it "friend" or "buddy".
    
    Return ONLY a JSON array of objects:
    [
      {
        "id": "unique-slug",
        "front": "simple question or term",
        "back": "simple answer or definition",
        "tags": ["topic"]
      }
    ]
    No markdown.` }
  ];

  if (fileData) {
    parts.unshift({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts }
    });
    
    const text = response.text || "[]";
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Flashcard Generation Error:", error);
    throw error;
  }
}

export async function generateQuiz(
  topic: string, 
  context: string, 
  learningStyle?: string,
  fileData?: { mimeType: string, data: string },
  performanceHistory?: string,
  prefs?: StudyPreferences
): Promise<QuizQuestion[]> {
  const model = "gemini-3-flash-preview";
  const stylePrompt = learningStyle ? `Write for a ${learningStyle} learner.` : '';
  const historyPrompt = performanceHistory ? `They had trouble with this: ${performanceHistory}. Add questions on these parts.` : '';
  
  const prefPrompt = prefs ? `
    Difficulty: ${prefs.difficulty || 'medium'}.
    Question type: ${prefs.quizLevel || 'recall'}.
    - Recall: simple facts.
    - Application: use the info in a case.
    - Thinking: deep analysis.
    Explanation level: ${prefs.explanationDepth || 'simple'}.
  ` : '';

  let parts: any[] = [
    { text: `Generate a 5-question quiz about "${topic}". ${stylePrompt} ${historyPrompt} ${prefPrompt}
    Use Multiple Choice or True/False.
    Context: "${context}".
    
    Writing rules:
    - Use simple words and short sentences.
    - No complicated vocabulary.
    - No asterisks (*) or long dashes.
    - No hype. 
    - Use a neutral tone. Not too formal, not too friendly.
    - Be straight to the point.
    - If you mention the companion, call it "buddy" or "friend".
    
    Return ONLY a JSON array:
    [
      {
        "question": "question text",
        "options": ["0", "1", "2", "3"],
        "correctAnswer": 0,
        "explanation": "why this is right",
        "hint": "a clue",
        "category": "topic or concept"
      }
    ]
    No markdown.` }
  ];

  if (fileData) {
    parts.unshift({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts }
    });
    
    const text = response.text || "[]";
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
}

export interface SessionSummary {
  summary: string;
  productivityInsight: string;
  quiz: QuizQuestion[];
  motivationalMessage: string;
}

export async function generateSessionSummary(
  duration: number,
  mode: string,
  topic: string,
  materials: string,
  learningStyle?: string
): Promise<SessionSummary> {
  const model = "gemini-3-flash-preview";
  const stylePrompt = learningStyle ? `Write for a ${learningStyle} learner.` : '';
  const prompt = `Write a study summary. ${stylePrompt}
    Details:
    - Time: ${duration} mins
    - Mode: ${mode}
    - Topic: ${topic}
    - Stuff used: ${materials}

    Writing rules:
    - Use common words. 
    - No asterisks (*) or long dashes.
    - No complicated terms.
    - Use a neutral tone.
    - Be straight to the point.
    - Call the helper "buddy" or "friend".
    - Quiz questions should also follow these rules.

    Return ONLY a JSON object:
    {
      "summary": "what they studied, simply",
      "productivityInsight": "how they did, simply",
      "quiz": [
        {
          "question": "text",
          "options": ["a", "b", "c", "d"],
          "correctAnswer": 0,
          "explanation": "why it is right",
          "hint": "a clue",
          "category": "sub-topic name"
        }
      ],
      "motivationalMessage": "short note"
    }
    No markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });
    
    const text = response.text || "{}";
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Summary Generation Error:", error);
    throw error;
  }
}
