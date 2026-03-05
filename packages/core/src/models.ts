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
  title: string;
  status: IdeaStatus;
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
