
export type AnimalCategory = 'Cattle' | 'Poultry' | 'Small Ruminants' | 'Companion Animals';

export interface AnalysisInput {
  category: AnimalCategory;
  specificType: string;
  age: string;
  symptoms: string;
  behaviorChanges: string;
  feedingPatterns: string;
  environment: string;
  imageUrl?: string;
}

export interface AnalysisResult {
  possibleDiagnosis: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  isEmergency: boolean;
  confidenceScore: number;
  referralAdvice: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  input: AnalysisInput;
  result: AnalysisResult;
}
