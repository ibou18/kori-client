import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { index: 1, label: "Informations" },
    { index: 2, label: "Documents" },
    { index: 3, label: "Selfie & Vérification" },
  ];

  if (currentStep === 4) return null; // Ne pas afficher l'indicateur à l'étape de confirmation

  return (
    <div className="flex mb-6">
      {steps.map((s, i) => (
        <div key={s.index} className="flex items-center">
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
              currentStep === s.index
                ? "bg-primary text-white"
                : currentStep > s.index
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {currentStep > s.index ? <Check className="h-4 w-4" /> : s.index}
          </div>
          <div
            className={`text-xs ${
              currentStep === s.index
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }`}
          >
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 mx-2 ${
                currentStep > i + 1 ? "bg-green-600" : "bg-gray-200"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
