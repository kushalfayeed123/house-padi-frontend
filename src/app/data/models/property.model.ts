// src/app/core/models/property.model.ts
export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  images: string[];
  aiSummary: string;
  isFeatured: boolean;
  features: {
    bedrooms: number;
    bathrooms: number;
    is_luxury: boolean;
  };
}

export interface AISearchResponse {
  padi_summary: string;
  count: number;
  data: Property[];
}