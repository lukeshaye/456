import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSupabaseAuth } from '../auth/SupabaseAuthProvider'; // 1. Mudar para o nosso hook do Supabase
import { supabase } from '../supabaseClient'; // 2. Importar o cliente Supabase para o logout
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Package,
  Users,
  Briefcase,
  Settings,
  Menu,
  X,
  LogOut,
  Scissors
} from 'lucide-react';

// --- Definição de Tipos ---
interface LayoutProps {
  children: React.ReactNode;
}

// --- Dados de Navegação (sem alteração) ---
const navigation = [
  { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agendamentos', href: '/appointments', icon: Calendar },
  { name: 'Financeiro', href: '/financial', icon: DollarSign },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Profissionais', href: '/professionals', icon: Briefcase },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

/**
 * Componente principal do layout que envolve todas as páginas protegidas.
 * Inclui a barra lateral de navegação e a lógica de logout.
 */
export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 3. Obter o usuário do nosso contexto Supabase
  const { user } = useSupabaseAuth(); 
  
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Função para terminar a sessão do usuário.
   * Chama o método `signOut` do Supabase e redireciona para a página inicial.
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
    }
    // Redireciona para a página inicial independentemente de ter ocorrido um erro ou não.
    navigate('/');
  };
  
  // 4. Extrair dados do usuário do objeto do Supabase
  const userName = user?.user_metadata?.full_name || user?.email;
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Móvel */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl p-2">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">SalonFlow</h1>
                </div>
              </div>
              <nav className="mt-5 space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`mr-4 h-6 w-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || '')}&background=6366f1&color=fff`}
                    alt="Avatar do utilizador"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">
                    {userName}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl p-2">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">SalonFlow</h1>
              </div>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-6 w-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div>
                   <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || '')}&background=6366f1&color=fff`}
                    alt="Avatar do utilizador"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {userName}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
