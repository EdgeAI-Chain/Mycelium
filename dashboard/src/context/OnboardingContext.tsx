
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// --- Types ---
export type OnboardingStep = 'hardware' | 'inventory' | 'baseline' | 'complete';

interface OnboardingState {
    currentStep: OnboardingStep;
    hardware: {
        connected: boolean;
        deviceId: string | null;
        sensors: string[];
    };
    inventory: {
        gardenType: string;
        zones: string[];
    };
}

type OnboardingAction =
    | { type: 'SET_STEP'; payload: OnboardingStep }
    | { type: 'UPDATE_HARDWARE'; payload: Partial<OnboardingState['hardware']> }
    | { type: 'UPDATE_INVENTORY'; payload: Partial<OnboardingState['inventory']> }
    | { type: 'RESET' };

// --- Initial State ---
const initialState: OnboardingState = {
    currentStep: 'hardware',
    hardware: {
        connected: false,
        deviceId: null,
        sensors: []
    },
    inventory: {
        gardenType: '',
        zones: []
    }
};

// --- Reducer ---
const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, currentStep: action.payload };
        case 'UPDATE_HARDWARE':
            return { ...state, hardware: { ...state.hardware, ...action.payload } };
        case 'UPDATE_INVENTORY':
            return { ...state, inventory: { ...state.inventory, ...action.payload } };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
};

// --- Context ---
const OnboardingContext = createContext<{
    state: OnboardingState;
    dispatch: React.Dispatch<OnboardingAction>;
} | undefined>(undefined);

// --- Provider ---
const STORAGE_KEY = 'mycelium_onboarding_state';

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load from local storage if available
    const initializer = (initial: OnboardingState) => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : initial;
    };

    const [state, dispatch] = useReducer(onboardingReducer, initialState, initializer);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    return (
        <OnboardingContext.Provider value={{ state, dispatch }}>
            {children}
        </OnboardingContext.Provider>
    );
};

// --- Hook ---
export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
