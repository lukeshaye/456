import { useSupabaseAuth } from "../auth/SupabaseAuthProvider";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

// --- Definição de Tipos ---
interface ProtectedRouteProps {
  children: React.ReactNode; // A página/componente que esta rota está a proteger.
}

/**
 * Um componente de ordem superior (HOC) que protege rotas.
 * Ele verifica o estado de autenticação do usuário usando o hook `useSupabaseAuth`.
 * - Se o estado de autenticação ainda está a ser carregado, exibe um spinner.
 * - Se o usuário não está autenticado, redireciona-o para a página inicial.
 * - Se o usuário está autenticado, renderiza o componente filho (a página protegida).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Obtém o usuário e o estado de carregamento do nosso contexto de autenticação.
  const { user, loading } = useSupabaseAuth();

  // Enquanto o SupabaseAuthProvider está a verificar a sessão,
  // exibimos um spinner para o usuário.
  if (loading) {
    return <LoadingSpinner />;
  }

  // Após o carregamento, se não houver um objeto `user`,
  // significa que o usuário não está logado.
  // Usamos o componente `Maps` do React Router para redirecioná-lo.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Se o carregamento terminou e temos um usuário,
  // renderizamos o conteúdo protegido.
  return <>{children}</>;
}
