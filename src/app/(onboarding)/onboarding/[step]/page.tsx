import { notFound } from "next/navigation";
import { StepProgress } from "@/components/onboarding/step-progress";
import { StepGoal }       from "@/components/onboarding/step-goal";
import { StepMetrics }    from "@/components/onboarding/step-metrics";
import { StepGender }     from "@/components/onboarding/step-gender";
import { StepFitness }    from "@/components/onboarding/step-fitness";
import { StepAssessment } from "@/components/onboarding/step-assessment";
import { StepRankReveal } from "@/components/onboarding/step-rank-reveal";
import { StepPlan }       from "@/components/onboarding/step-plan";

const STEPS: Record<number, { title: string; component: React.ComponentType }> = {
  1: { title: "Primary Objective",   component: StepGoal },
  2: { title: "Body Metrics",        component: StepMetrics },
  3: { title: "Gender Identity",     component: StepGender },
  4: { title: "Fitness Level",       component: StepFitness },
  5: { title: "Baseline Assessment", component: StepAssessment },
  6: { title: "Rank Reveal",         component: StepRankReveal },
  7: { title: "Mission Plan",        component: StepPlan },
};

interface PageProps {
  params: Promise<{ step: string }>;
}

export async function generateStaticParams() {
  return Object.keys(STEPS).map((s) => ({ step: s }));
}

export async function generateMetadata({ params }: PageProps) {
  const { step } = await params;
  const stepNum = parseInt(step, 10);
  const config = STEPS[stepNum];
  return {
    title: config ? `${config.title} — Onboarding` : "Onboarding",
  };
}

export default async function OnboardingStepPage({ params }: PageProps) {
  const { step } = await params;
  const stepNum = parseInt(step, 10);

  if (isNaN(stepNum) || !STEPS[stepNum]) notFound();

  const { component: StepComponent } = STEPS[stepNum];

  return (
    <div className="flex flex-col flex-1">
      <StepProgress currentStep={stepNum} />

      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        style={{ padding: "var(--spacing-6) var(--spacing-4)" }}
      >
        <div className="max-w-lg mx-auto">
          <StepComponent />
        </div>
      </main>
    </div>
  );
}
