import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://vhowowbxyqztakovrqwy.supabase.co';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseKey || supabaseKey === 'your-service-role-key-here') {
      this.logger.warn(
        'Supabase API key is not configured in .env. Direct Supabase JS client will operate in standby mode; Prisma will manage PostgreSQL queries.',
      );
      return;
    }

    try {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      this.logger.log(`Supabase Client initialized successfully for ${supabaseUrl}`);
    } catch (err) {
      this.logger.error('Failed to initialize Supabase client:', err);
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }
}
