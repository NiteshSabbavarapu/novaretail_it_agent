import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('novaretail_api_url') || '/api');

  // Architecture parameters (fixed to match backend vector_utils.py & agents.py)
  const rrfK = 60;
  const topK = 5;
  const modelName = 'openai/gpt-oss-120b (Groq)';
  const rerankerModel = 'cross-encoder/ms-marco-MiniLM-L-6-v2';
  const embeddingModel = 'sentence-transformers/all-MiniLM-L6-v2';
  const pineconeIndex = 'novaretail-index';

  useEffect(() => {
    localStorage.setItem('novaretail_api_url', apiUrl);
  }, [apiUrl]);

  const value = {
    apiUrl,
    setApiUrl,
    rrfK,
    topK,
    modelName,
    rerankerModel,
    embeddingModel,
    pineconeIndex,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
