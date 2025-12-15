export enum SearchType {
  USERNAME = 'USERNAME',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  REALNAME = 'REALNAME',
  DOMAIN = 'DOMAIN',
  MULTIMEDIA = 'MULTIMIDIA'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeId?: string;
  };
}

export interface PersonalData {
  fullName?: string;
  cpf?: string; // Ou outros docs encontrados
  birthDate?: string;
  location?: string;
  contact: {
    emails: string[];
    phones: string[];
  };
  family: {
    spouse?: string;
    children: string[];
    parents: string[];
    others: string[];
  };
  occupation?: string;
}

export interface OsintResult {
  summary: string;
  sources: GroundingChunk[];
  foundProfiles: {
    platform: string;
    url: string;
    confidence: 'High' | 'Medium' | 'Low';
  }[];
  personalData?: PersonalData; // Novo campo estruturado
  strategy: string[];
  timestamp?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: SearchType;
  timestamp: number;
  result: OsintResult;
}

export interface OsintScanParams {
  query: string;
  type: SearchType;
  deepScan?: boolean;
  file?: {
    mimeType: string;
    data: string; // base64
  };
}