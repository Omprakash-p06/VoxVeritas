import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Document, ChatMessage, SafetyReport } from '@/types';

interface AppState {
  // Documents
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (docId: string) => void;
  
  // Chat
  chatHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // Sources
  currentSources: ChatMessage['sources'];
  setCurrentSources: (sources: ChatMessage['sources']) => void;
  
  // Safety
  safetyReport: SafetyReport | null;
  setSafetyReport: (report: SafetyReport | null) => void;
  
  // Loading states
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  isQuerying: boolean;
  setIsQuerying: (value: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocumentsState] = useState<Document[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentSources, setCurrentSources] = useState<ChatMessage['sources']>(undefined);
  const [safetyReport, setSafetyReport] = useState<SafetyReport | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  const setDocuments = useCallback((docs: Document[]) => {
    setDocumentsState(docs);
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocumentsState(prev => [...prev, doc]);
  }, []);

  const removeDocument = useCallback((docId: string) => {
    setDocumentsState(prev => prev.filter(d => d.doc_id !== docId));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  }, []);

  const clearChat = useCallback(() => {
    setChatHistory([]);
    setCurrentSources(undefined);
  }, []);

  const value: AppState = {
    documents,
    setDocuments,
    addDocument,
    removeDocument,
    chatHistory,
    addMessage,
    clearChat,
    currentSources,
    setCurrentSources,
    safetyReport,
    setSafetyReport,
    isUploading,
    setIsUploading,
    isQuerying,
    setIsQuerying,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
