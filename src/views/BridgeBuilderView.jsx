import React from 'react';
import { useNavigate } from 'react-router-dom';
import BridgeBuilderGame from '../components/bridgeBuilder/BridgeBuilderGame.jsx';

export default function BridgeBuilderView() {
  const navigate = useNavigate();

  return (
    <BridgeBuilderGame onBack={() => navigate('/home')} />
  );
}
