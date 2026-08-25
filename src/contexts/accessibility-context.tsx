import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large';
type ContrastMode = 'normal' | 'high';

interface AccessibilityContextType {
  fontSize: FontSize;
  contrastMode: ContrastMode;
  simpleLanguage: boolean;
  setFontSize: (size: FontSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setSimpleLanguage: (enabled: boolean) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('ll-font-size') as FontSize) || 'medium';
  });
  const [contrastMode, setContrastMode] = useState<ContrastMode>(() => {
    return (localStorage.getItem('ll-contrast') as ContrastMode) || 'normal';
  });
  const [simpleLanguage, setSimpleLanguage] = useState<boolean>(() => {
    return localStorage.getItem('ll-simple-lang') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ll-font-size', fontSize);
    const root = document.documentElement;
    if (fontSize === 'small') root.style.fontSize = '14px';
    else if (fontSize === 'medium') root.style.fontSize = '16px';
    else root.style.fontSize = '18px';
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('ll-contrast', contrastMode);
    const root = document.documentElement;
    if (contrastMode === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [contrastMode]);

  useEffect(() => {
    localStorage.setItem('ll-simple-lang', String(simpleLanguage));
  }, [simpleLanguage]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{ fontSize, contrastMode, simpleLanguage, setFontSize, setContrastMode, setSimpleLanguage, speak, stopSpeaking }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
