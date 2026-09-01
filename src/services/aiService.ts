import type { AIMessage } from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AskCodebaseResponse {
  ok: boolean;
  message?: string;
  answer?: string;
  content?: string;
  relatedFiles?: string[];
}

interface SuggestedQuestionsResponse {
  ok: boolean;
  message?: string;
  questions?: string[];
}

export async function askCodebase(
  repositoryId: string,
  question: string,
): Promise<AIMessage> {
  const response = await fetch(
    `${API_BASE_URL}/api/repositories/${repositoryId}/ai/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
      }),
    },
  );

  const data: AskCodebaseResponse = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      data.message || 'Failed to get an answer from Decode AI',
    );
  }

  return {
    id: `ai_${Date.now()}`,
    role: 'assistant',
    content:
      data.answer ||
      data.content ||
      'No answer was generated for this question.',
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    relatedFiles: data.relatedFiles || [],
  };
}

export async function getSuggestedQuestions(
  repositoryId: string,
): Promise<string[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/repositories/${repositoryId}/ai/suggestions`,
  );

  const data: SuggestedQuestionsResponse =
    await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      data.message ||
      'Failed to generate repository questions',
    );
  }

  return Array.isArray(data.questions)
    ? data.questions
    : [];
}