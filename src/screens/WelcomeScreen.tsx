import React from 'react';
import { OnboardingScreen } from './OnboardingScreen';
import { useChitter } from '../context/ChitterContext';
export const WelcomeScreen: React.FC = () => { const { setScreen } = useChitter(); return <OnboardingScreen onComplete={() => setScreen('login')} />; };
