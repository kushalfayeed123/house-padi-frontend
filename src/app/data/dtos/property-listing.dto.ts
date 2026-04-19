export interface PropertyListingPayload {
  title: string;
  price: number;
  location: string;
  addressFull: string;
  description: string;
  leaseDurationMonths: number;
  agreementContent?: string;
  lat?: number;
  lng?: number;
  features: {
    bedrooms: number;
    bathrooms: number;
    parking: boolean;
    furnished: boolean;
    [key: string]: any; // Allows for additional dynamic features
  };
}