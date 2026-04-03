import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeepScriptMode from '../components/deepScript/DeepScriptMode.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function DeepScriptView() {
  const navigate = useNavigate();
  const { languageId } = useLanguage();

  const handleBackToHome = React.useCallback(() => {
    navigate('/home');
  }, [navigate]);

  return (
    <DeepScriptMode
      onBack={handleBackToHome}
      isGuidedPackRun={false}
      languageId={languageId}
    />
  );
}
