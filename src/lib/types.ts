export interface Database {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          created_at?: string;
        };
      };
      deliveries: {
        Row: {
          id: string;
          driver_id: string;
          customer_name: string;
          customer_phone: string | null;
          address: string;
          latitude: number;
          longitude: number;
          cans: number;
          delivery_date: string;
          status: string;
          completed_at: string | null;
          route_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          customer_name: string;
          customer_phone?: string | null;
          address: string;
          latitude: number;
          longitude: number;
          cans?: number;
          delivery_date?: string;
          status?: string;
          completed_at?: string | null;
          route_order?: number | null;
          created_at?: string;
          preferred_time_start?: string | null;
          preferred_time_end?: string | null;
          estimated_duration_minutes?: number;
        };
        Update: {
          id?: string;
          driver_id?: string;
          customer_name?: string;
          customer_phone?: string | null;
          address?: string;
          latitude?: number;
          longitude?: number;
          cans?: number;
          delivery_date?: string;
          status?: string;
          completed_at?: string | null;
          route_order?: number | null;
          created_at?: string;
          preferred_time_start?: string | null;
          preferred_time_end?: string | null;
          estimated_duration_minutes?: number;
        };
      };
      gps_tracking: {
        Row: {
          id: string;
          driver_id: string;
          latitude: number;
          longitude: number;
          timestamp: string;
          total_distance: number;
        };
        Insert: {
          id?: string;
          driver_id: string;
          latitude: number;
          longitude: number;
          timestamp?: string;
          total_distance?: number;
        };
        Update: {
          id?: string;
          driver_id?: string;
          latitude?: number;
          longitude?: number;
          timestamp?: string;
          total_distance?: number;
        };
      };
    };
  };
}

export type Driver = Database['public']['Tables']['drivers']['Row'];
export type Delivery = Database['public']['Tables']['deliveries']['Row'];
export type GPSTracking = Database['public']['Tables']['gps_tracking']['Row'];
