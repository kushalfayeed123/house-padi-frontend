export interface MyApplication {
  id: string;
  status: 'submitted' | 'approved' | 'declined' | 'cancelled';
  screening_summary: string;
  applied_at: string;
  lease_id: string | null;
  contract_url: string | null;
  property: {
    id: string;
    title: string;
    price: string; // Note: price is a string in your JSON
    currency: string;
    addressFull: string;
    images: string[];
    features: {
      bedrooms: number;
      bathrooms: number;
      furnished: boolean;
    };
    status: 'available' | 'rented';
  };
}