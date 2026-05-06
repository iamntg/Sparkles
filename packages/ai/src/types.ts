export interface ClusterItem {
  title: string;
  items: string[]; // List of idea strings
}

export interface ClusterResult {
  clusters: ClusterItem[];
}

export interface AIProvider {
  clusterIdeas(ideas: string[]): Promise<ClusterResult>;
  summarizeIdeas(ideas: string[]): Promise<string>;
}
