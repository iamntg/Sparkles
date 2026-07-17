export enum IdeaStatus {
  DRAFT = 'draft',
  DEVELOPED = 'developed',
  ARCHIVED = 'archived'
}

export type Idea = {
  id: string;
  createdAt: number;
  updatedAt: number;
  sourceType: string;
  text: string;
  rawText?: string;
  /** Longer-form detail added via Develop; the spark's own text stays untouched. */
  description?: string;
  title: string;
  status: IdeaStatus;
  /** Times the spark has been opened. Feeds brightness — a spark you return to glows. */
  visits?: number;
  transcriptStatus?: string;
  audioLocalPath?: string;
  constellationX?: number;
  constellationY?: number;
  constellationSeed?: number;
  deletedAt?: number;
};

export type Link = {
  id: string;
  fromIdeaId: string;
  toIdeaId: string;
  type: string;
  confidence: number;
  createdAt: number;
};

export type ReviewSession = {
  id: string;
  createdAt: number;
  scope: string;
  resultJson: string;
};

/** One turn of the brainstorm chat attached to a spark, as stored. */
export type ChatTurn = {
  id: string;
  ideaId: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
};

/** One turn as sent to the AI — no storage fields. */
export type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

/** A spark handed to the AI, with whatever detail the user has added. */
export type ReviewInput = {
  text: string;
  description?: string;
};

export type PlanStep = {
  n: string;
  text: string;
};

export type IdeaReview = {
  /** A short, warm observation about the spark — not a critique. */
  reflection: string;
  /** Open questions that push the idea somewhere new. */
  angles: string[];
  /** Small concrete steps. Only present when a plan was requested. */
  plan?: PlanStep[];
};

export type VaultManifest = {
  version: number;
  createdAt: number;
  kdf: {
    salt: string;
    iterations: number;
  };
  encryption: {
    algorithm: string;
  };
};

export type Cluster = {
  id: string;
  title: string;
  ideaIds: string[];
};
