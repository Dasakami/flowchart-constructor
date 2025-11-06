export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Flowchart {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  data: FlowchartData;
  created_at: string;
  updated_at: string;
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  connections: Connection[];
}

export interface FlowchartNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'input' | 'decision';
  x: number;
  y: number;
  label: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
}
