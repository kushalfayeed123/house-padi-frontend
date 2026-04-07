// src/app/core/models/property.model.ts

export interface Property {
  id: string;
  ownerId: string; // Added from Swagger
  title: string;
  description: string;
  price: number;   // Changed to number for | number pipe
  location: string;
  addressFull: string; // Added for the UI
  images: string[];
  aiSummary: string;
  isFeatured: boolean;
  leaseDurationMonths: number; // Added for lease logic
  agreementContent: string;    // The missing field causing the error
  features: {
    bedrooms: number;
    bathrooms: number;
    is_luxury: boolean;
    parking?: boolean;
  };
  status: 'draft' | 'available' | 'pending' | 'rented' | 'archived';
  createdAt: string;
}

export interface AISearchResponse {
  padi_summary: string;
  count: number;
  data: Property[];
}