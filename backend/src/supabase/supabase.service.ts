import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase configuration missing');
      throw new Error('Supabase URL and Key must be provided in environment variables');
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase client', error);
      throw new Error('Failed to initialize Supabase client');
    }
  }

  /**
   * Get the Supabase client instance
   * @returns SupabaseClient - The configured Supabase client
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

