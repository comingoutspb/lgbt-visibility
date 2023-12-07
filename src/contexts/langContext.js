// dataContex.js

import React, { createContext, useContext, useState } from 'react';

// Create a context for the language
export const LanguageContext = createContext();
// Create a provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  if (language === undefined) {
    throw new Error('useLanguage must be used within a DataProvider');
  }
  return { language, setLanguage };
};
