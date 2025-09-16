import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente de forma segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação para garantir que as variáveis foram carregadas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL e Anon Key não foram encontradas. Verifique o seu arquivo .env");
}

/**
 * Cria e exporta a instância do cliente Supabase.
 * Esta instância única será usada em toda a aplicação para interagir
 * com o seu banco de dados, autenticação e outros serviços do Supabase.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);