export const ResearchStatus = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const;

export type ResearchStatus = typeof ResearchStatus[keyof typeof ResearchStatus];

export const Language = {
  ENGLISH: 'english',
  LATIN: 'latin'
} as const;

export type Language = typeof Language[keyof typeof Language];

export const Methodology = {
  PALEOGRAPHIC: 'paleographic',
  TEXTUAL: 'textual'
} as const;

export type Methodology = typeof Methodology[keyof typeof Methodology];

export interface SourceMetadata {
  language: Language;
  methodology: Methodology;
}

export interface Source {
  id: string;
  title: string;
  author?: string;
  manuscriptLocation: string;
  dateCreated: string;
  researchStatus: ResearchStatus;
  notes: string[];
  metadata: SourceMetadata;
  updatedAt?: string;
}

export interface CreateSourceInput extends Omit<Source, 'id' | 'dateCreated' | 'updatedAt'> {}

export interface UpdateSourceInput extends Partial<Omit<Source, 'id' | 'dateCreated' | 'updatedAt'>> {}
