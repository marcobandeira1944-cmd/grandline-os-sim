import { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from '../contexts/AppContext';
import BootScreen from '../components/BootScreen';
import LoginScreen from '../components/LoginScreen';
import Desktop from '../components/Desktop';
import ToastSystem from '../components/ToastSystem';

function OldEraOS() {
  const { state, dispatch } = useApp();
  const [booted, setBooted] = useState(false);

  const handleBootDone = useCallback(() => setBooted(true), []);

  if (!booted) return <BootScreen onDone={handleBootDone} />;
  if (!state.currentUser) return <><LoginScreen /><ToastSystem /></>;
  return <Desktop />;
}

const Index = () => (
  <AppProvider>
    <OldEraOS />
  </AppProvider>
);

export default Index;
