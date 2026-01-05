
import { useOnboarding, OnboardingStep } from '../../context/OnboardingContext';
import { ArrowRight, CheckCircle, Settings, Sprout, Database } from 'lucide-react';

const STEPS: { id: OnboardingStep; label: string; icon: any }[] = [
    { id: 'hardware', label: 'Hardware Setup', icon: Settings },
    { id: 'inventory', label: 'Garden Inventory', icon: Sprout },
    { id: 'baseline', label: 'Baseline', icon: Database },
    { id: 'complete', label: 'Finish', icon: CheckCircle },
];

interface Props {
    children: React.ReactNode;
}

export const OnboardingLayout: React.FC<Props> = ({ children }) => {
    const { state } = useOnboarding();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col p-6">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Mycelium Setup
                </h1>
                <div className="text-sm text-gray-400">
                    Step {STEPS.findIndex(s => s.id === state.currentStep) + 1} of {STEPS.length}
                </div>
            </header>

            {/* Progress Bar (Stepper) */}
            <div className="flex justify-between items-center mb-12 relative px-4">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -z-10" />

                {STEPS.map((step, index) => {
                    const currentIndex = STEPS.findIndex(s => s.id === state.currentStep);
                    const isCompleted = index < currentIndex;
                    const isCurrent = step.id === state.currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0f172a] px-2">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                ${isCompleted || isCurrent
                                    ? 'border-green-500 bg-green-500/20 text-green-400'
                                    : 'border-gray-600 bg-gray-800 text-gray-500'}
                            `}>
                                <step.icon size={18} />
                            </div>
                            <span className={`text-xs font-medium ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
                <div className="glass-panel p-8 min-h-[400px] flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
};
