import React, { createContext, useContext, useState, useCallback } from "react";
import {
  SurveyState,
  ExpertInfo,
  PairwiseMatrix,
  CRITERIA,
  createIdentityMatrix,
  updateMatrix,
} from "@/lib/ahp";

interface SurveyContextType {
  state: SurveyState;
  currentStep: number;
  totalSteps: number;
  setExpert: (expert: ExpertInfo) => void;
  updateRootMatrix: (row: number, col: number, value: number) => void;
  updateSubMatrix: (criterionId: string, row: number, col: number, value: number) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSurvey: () => void;
  completeSurvey: () => void;
}

const defaultExpert: ExpertInfo = {
  name: "",
  organization: "",
  position: "",
  expertise: "",
  experience: "",
  email: "",
};

function createInitialState(): SurveyState {
  const rootSize = CRITERIA.length; // 4개 대분류
  return {
    expert: defaultExpert,
    rootMatrix: {
      criterionId: "root",
      size: rootSize,
      matrix: createIdentityMatrix(rootSize),
      labels: CRITERIA.map((c) => c.label),
    },
    subMatrices: CRITERIA.map((criterion) => ({
      criterionId: criterion.id,
      size: criterion.subCriteria.length,
      matrix: createIdentityMatrix(criterion.subCriteria.length),
      labels: criterion.subCriteria.map((s) => s.label),
    })),
    completed: false,
  };
}

const SurveyContext = createContext<SurveyContextType | null>(null);

// 총 단계: 0=소개, 1=전문가정보, 2=대분류비교, 3~6=소분류비교(4개), 7=결과
const TOTAL_STEPS = 8;

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SurveyState>(createInitialState);
  const [currentStep, setCurrentStep] = useState(0);

  const setExpert = useCallback((expert: ExpertInfo) => {
    setState((prev) => ({ ...prev, expert }));
  }, []);

  const updateRootMatrix = useCallback((row: number, col: number, value: number) => {
    setState((prev) => ({
      ...prev,
      rootMatrix: {
        ...prev.rootMatrix,
        matrix: updateMatrix(prev.rootMatrix.matrix, row, col, value),
      },
    }));
  }, []);

  const updateSubMatrix = useCallback(
    (criterionId: string, row: number, col: number, value: number) => {
      setState((prev) => ({
        ...prev,
        subMatrices: prev.subMatrices.map((sm) =>
          sm.criterionId === criterionId
            ? { ...sm, matrix: updateMatrix(sm.matrix, row, col, value) }
            : sm
        ),
      }));
    },
    []
  );

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, TOTAL_STEPS - 1)));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetSurvey = useCallback(() => {
    setState(createInitialState());
    setCurrentStep(0);
  }, []);

  const completeSurvey = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completed: true,
      timestamp: new Date().toISOString(),
    }));
    setCurrentStep(TOTAL_STEPS - 1);
  }, []);

  return (
    <SurveyContext.Provider
      value={{
        state,
        currentStep,
        totalSteps: TOTAL_STEPS,
        setExpert,
        updateRootMatrix,
        updateSubMatrix,
        goToStep,
        nextStep,
        prevStep,
        resetSurvey,
        completeSurvey,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error("useSurvey must be used within SurveyProvider");
  return ctx;
}
