import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../constants/datasets';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Ask about project ideas, hackathon winners, or both. search for 'NFT ideas', 'Web3 ideas' etc",
  timestamp: new Date().toISOString(),
};

export function useChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data;
      console.log('---ai--data---',responseData.data);
      let assistantMessage  = {};
      if (data?.category === 'ideas') {
        assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          ideas: data?.ideas || [],
          summary: data?.summary || '',
          timestamp: new Date().toISOString(),
        };
      }
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        'Unable to reach the RAG backend. Start the API server to enable live queries.'
      );

      const fallbackMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: inferDemoResponse(trimmed),
        isDemo: true,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}

function inferDemoResponse(query) {
  const lower = query.toLowerCase();
  const mentionsIdeas =
    lower.includes('idea') ||
    lower.includes('project') ||
    lower.includes('build') ||
    lower.includes('startup');
  const mentionsHackathon =
    lower.includes('hackathon') ||
    lower.includes('winner') ||
    lower.includes('colosseum') ||
    lower.includes('cypherpunk');

  if (mentionsIdeas && mentionsHackathon) {
    return (
      '**[Demo mode]** Query routed to both collections: `ideas_rag` + `hackathon_winners_rag`. ' +
      'The pipeline would retrieve from both Qdrant collections in parallel, merge ranked chunks, ' +
      'and pass combined context to the LLM for synthesis.'
    );
  }

  if (mentionsHackathon) {
    return (
      '**[Demo mode]** Query routed to `hackathon_winners_rag`. ' +
      'The intent classifier detected a hackathon-related query and would search only the winners collection.'
    );
  }

  if (mentionsIdeas) {
    return (
      '**[Demo mode]** Query routed to `ideas_rag`. ' +
      'The intent classifier detected an ideas-related query and would search only the ideas collection.'
    );
  }

  return (
    '**[Demo mode]** Backend offline — showing routing preview. ' +
    'Connect the LangChain API to get live retrieval-augmented answers from both vector collections.'
  );
}
