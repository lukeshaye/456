import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

// Definir o tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Criar o contexto de autenticação com um valor padrão
// A linha abaixo foi corrigida de "Auth" para "AuthContext"
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

// Criar o provedor de autenticação
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta obter a sessão inicial, que pode estar guardada (e.g. localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ouve mudanças no estado de autenticação (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Limpa a subscrição quando o componente é desmontado
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
  };

  // Fornece o estado de autenticação para toda a aplicação
  // Adicionamos a verificação !loading aqui para evitar a tela branca
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

// Criar um hook customizado para usar o contexto de autenticação facilmente
export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth deve ser usado dentro de um SupabaseAuthProvider');
  }
  return context;
}

