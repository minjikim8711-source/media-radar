export type Category = 'Social' | 'Content' | 'Emerging' | 'Partnership';
export type Status = 'Explore' | 'Pilot' | 'Scale' | 'Monitor' | 'Deprioritize';
export type Priority = 'High' | 'Medium' | 'Low';
export type Trend = 'Rising' | 'Stable' | 'Declining';

export interface MediaOpportunity {
  id: string;
  name: string;
  nameKo?: string;
  category: Category;
  status: Status;
  priority: Priority;
  trend: Trend;
  reach: number;        // 1–10
  brandFit: number;     // 1–10
  costEfficiency: number; // 1–10
  competitiveEdge: number; // 1–10
  description: string;
  targetAudience: string;
  estimatedBudget: string;
  timeToLaunch: string;
  tags: string[];
}
