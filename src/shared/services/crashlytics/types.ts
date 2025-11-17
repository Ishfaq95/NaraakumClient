export interface ErrorInfo {
    componentStack: string;
    [key: string]: any;
}

export interface CrashlyticsConfig {
    userId?: string;
    customKeys?: Record<string, string>;
}

export interface GoogleMapReturnData {
    fromSave?: boolean;
    mapAddress?: {
      latitude: number;
      longitude: number;
      address: string;
      city: string;
    };
    description?: string;
    openSheet?: boolean;
  }
  