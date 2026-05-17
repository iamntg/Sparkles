export interface ClusterItem {
  title: string;
  items: string[]; // List of idea strings
}

export interface ClusterResult {
  clusters: ClusterItem[];
}

export interface DailyDigestResult {
  summary: string;
  clusters: ClusterItem[];
}

export interface AIProvider {
  clusterIdeas(ideas: any[]): Promise<ClusterResult>;
  summarizeIdeas(ideas: string[]): Promise<string>;
  generateDailyDigest(ideas: any[]): Promise<DailyDigestResult>;
}
