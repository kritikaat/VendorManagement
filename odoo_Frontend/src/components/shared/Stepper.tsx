import { cn } from '@/lib/utils';

interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium',
                  isActive && 'border-emerald-500 bg-emerald-500/20 text-emerald-400',
                  isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                  !isActive && !isCompleted && 'border-border text-muted-foreground',
                )}
              >
                {stepNumber}
              </div>
              <span
                className={cn(
                  'hidden text-sm sm:inline',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  'mx-4 h-px flex-1',
                  isCompleted ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
