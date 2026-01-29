
'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';
import React from 'react';

const stepsConfig = [
  { id: 'modalities', name: 'Modalidades' },
  { id: 'identification', name: 'Identificação' },
  { id: 'subscription', name: 'Inscrição' },
  { id: 'payment', name: 'Pagamento' },
];

interface RegistrationStepsProps {
  currentStep: 'modalities' | 'identification' | 'subscription' | 'payment';
}

export function RegistrationSteps({ currentStep }: RegistrationStepsProps) {
  const currentStepIndex = stepsConfig.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full bg-muted/50 p-4 rounded-lg">
      <nav className="flex items-center justify-center space-x-2 sm:space-x-4">
        {stepsConfig.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className='flex flex-col items-center gap-2'>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all',
                index === currentStepIndex ? 'bg-primary text-primary-foreground scale-110 shadow-lg' :
                index < currentStepIndex ? 'bg-primary/80 text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                 {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'font-semibold uppercase text-xs tracking-wide text-center',
                  index === currentStepIndex
                    ? 'text-primary'
                    : index < currentStepIndex
                    ? 'text-foreground/80'
                    : 'text-muted-foreground/70'
                )}
              >
                {step.name}
              </span>
            </div>
            {index < stepsConfig.length - 1 && (
              <ChevronRight
                className={cn(
                  'h-5 w-5 mx-1 sm:mx-4 text-muted-foreground/30 self-start mt-1.5',
                   index < currentStepIndex && 'text-primary/50'
                )}
              />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

