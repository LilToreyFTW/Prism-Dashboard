export type DashboardMetrics = {
  cpu: number;
  memory: number;
  active_users: number;
  prism_score: number;
};

export type PrismNode = {
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
  z: number;
};

export type DashboardPayload = {
  status: string;
  timestamp: number;
  metrics: DashboardMetrics;
  prism_3d_data: {
    nodes: PrismNode[];
    edges: Array<[string, string]>;
    alerts: number;
  };
};

export type AuthMode = 'login' | 'register';

export type AuthResponse = {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
  subscription?: string;
  expires?: string;
};

export type BuilderLanguage = 'python' | 'cpp' | 'csharp' | 'java';

export type BuilderRequest = {
  language: BuilderLanguage;
  framework: string;
  template: string;
  app_name: string;
  version: string;
  theme: string;
  features: string[];
  license_header?: string;
  initialize_git: boolean;
};
