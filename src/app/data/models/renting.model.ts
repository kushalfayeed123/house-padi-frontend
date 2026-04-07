import { User } from "./auth.model";
import { Property } from "./property.model";

export interface Application {
  id: string;
  property_id: string;
  renter_id: string;
  status: 'submitted' | 'screening' | 'approved' | 'rejected';
  ai_match_score: number;
  screening_summary: string;
  applied_at: string;
  property: Property;
  renter: User;
}

export interface Lease {
  id: string;
  propertyId: string;
  ownerId: string;
  renterId: string;
  startDate: string;
  rent: number;
  contractUrl: string;
  isActive: boolean;
  property: Property;
  renter: User;
}

export interface InterestDto {
  propertyId: string;
  tourDate?: string;
}

export interface PaymentCompleteDto {
  leaseId: string;
  reference: string;
  userId: string;
}