import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../auth/SupabaseAuthProvider';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, DollarSign, TrendingUp, MessageCircle } from 'lucide-react';
import type { AppointmentType } from '../../shared/types';
import moment from 'moment';
import { useAppStore } from '../../shared/store';
import { useToastHelpers } from '../contexts/ToastContext';

// --- Definição de Tipos para os dados do Dashboard ---
interface DashboardKPIs {
  dailyEarnings: number;
  dailyAppointments: number;
  avgTicket: number;
}
interface WeeklyEarning {
  entry_date: string;
  earnings: number;
}

/**
 * Página principal que mostra uma visão geral do negócio.
 */
export default function Dashboard() {
  const { user } = useSupabaseAuth();
  const { clients } = useAppStore();
  const { showSuccess, showError } = useToastHelpers();

  // --- Estados do Componente ---
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentType[]>([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState<WeeklyEarning[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Efeito para Carregar os Dados ---
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  /**
   * Orquestra todas as buscas de dados para o dashboard.
   */
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [kpisData, appointmentsData, weeklyData] = await Promise.all([
        fetchKPIs(),
        fetchTodayAppointments(),
        fetchWeeklyEarnings(),
      ]);

      setKpis(kpisData);
      setTodayAppointments(appointmentsData || []);
      setWeeklyEarnings(weeklyData || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', (error as Error).message);
      showError('Erro ao carregar dados', 'Não foi possível buscar os dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // --- Funções de Busca de Dados Específicas ---

  const fetchKPIs = async (): Promise<DashboardKPIs> => {
    if (!user) return { dailyEarnings: 0, dailyAppointments: 0, avgTicket: 0 };
    const today = moment().format('YYYY-MM-DD');
    
    // Calcula os ganhos com base nos agendamentos que foram marcados como 'attended'
    const { data: attendedAppointments, error } = await supabase
      .from('appointments')
      .select('price')
      .eq('user_id', user.id)
      .eq('attended', true)
      .gte('appointment_date', `${today}T00:00:00`)
      .lt('appointment_date', `${today}T23:59:59`);
      
    if (error) throw error;
    
    // Total de agendamentos do dia (independentemente de terem comparecido)
    const { count: totalAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('appointment_date', `${today}T00:00:00`)
        .lt('appointment_date', `${today}T23:59:59`);


    const dailyAppointments = totalAppointmentsCount || 0;
    const dailyEarnings = attendedAppointments?.reduce((sum, app) => sum + app.price, 0) || 0;
    const avgTicket = dailyAppointments > 0 ? dailyEarnings / dailyAppointments : 0;

    return { dailyEarnings, dailyAppointments, avgTicket };
  };

  const fetchTodayAppointments = async (): Promise<AppointmentType[] | null> => {
    if (!user) return null;
    const today = moment().format('YYYY-MM-DD');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .gte('appointment_date', `${today}T00:00:00`)
      .lt('appointment_date', `${today}T23:59:59`)
      .order('appointment_date', { ascending: true });
    if (error) throw error;
    return data;
  };

  const fetchWeeklyEarnings = async (): Promise<WeeklyEarning[] | null> => {
    if (!user) return null;
    const sevenDaysAgo = moment().subtract(6, 'days').format('YYYY-MM-DD');
    const { data, error } = await supabase
      .from('financial_entries')
      .select('entry_date, amount')
      .eq('user_id', user.id)
      .eq('type', 'receita')
      .gte('entry_date', sevenDaysAgo);

    if (error) throw error;

    const earningsByDay: { [key: string]: number } = {};
    if (data) {
      for (const entry of data) {
        earningsByDay[entry.entry_date] = (earningsByDay[entry.entry_date] || 0) + entry.amount;
      }
    }
    return Object.entries(earningsByDay).map(([date, earnings]) => ({ entry_date: date, earnings }));
  };

  // --- Lógica de Negócio ---

  /**
   * Lida com a mudança de status de presença de um agendamento.
   * Cria ou remove a entrada financeira correspondente.
   */
  const handleAttendanceChange = async (appointment: AppointmentType, hasAttended: boolean) => {
    if (!user) return;
    
    // 1. Atualiza o status de presença no agendamento
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ attended: hasAttended })
      .eq('id', appointment.id!);
      
    if (updateError) {
      showError('Erro ao atualizar presença', updateError.message);
      return;
    }

    if (hasAttended) {
      // 2a. Se o cliente compareceu, cria a entrada financeira
      const { error: insertError } = await supabase
        .from('financial_entries')
        .insert({
          user_id: user.id,
          description: `Serviço: ${appointment.service} - Cliente: ${appointment.client_name}`,
          amount: appointment.price,
          type: 'receita',
          entry_type: 'pontual',
          entry_date: moment(appointment.appointment_date).format('YYYY-MM-DD'),
          is_virtual: true, // Indica que foi gerado por um agendamento
        });

      if (insertError) {
        showError('Erro ao criar receita', insertError.message);
        // Desfaz a alteração de presença em caso de erro
        await supabase.from('appointments').update({ attended: false }).eq('id', appointment.id!);
        return;
      }
      showSuccess('Receita registrada!');

    } else {
      // 2b. Se o cliente não compareceu (desmarcou), remove a entrada financeira
      // A condição `is_virtual` garante que só vamos apagar a entrada gerada por este fluxo
      const { error: deleteError } = await supabase
        .from('financial_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('description', `Serviço: ${appointment.service} - Cliente: ${appointment.client_name}`)
        .eq('is_virtual', true);

      if (deleteError) {
        showError('Erro ao remover receita', deleteError.message);
         // Desfaz a alteração de presença em caso de erro
        await supabase.from('appointments').update({ attended: true }).eq('id', appointment.id!);
        return;
      }
      showSuccess('Receita removida.');
    }
    
    // 3. Recarrega todos os dados do dashboard para refletir as mudanças
    await fetchDashboardData();
  };


  // --- Funções Auxiliares ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const sendWhatsAppReminder = (appointment: AppointmentType) => {
    const client = clients.find(c => c.id === appointment.client_id);
    const clientName = client ? client.name : 'Cliente';
    const message = `Olá ${clientName}! Lembrete do seu agendamento para ${appointment.service} hoje às ${formatTime(appointment.appointment_date)} com ${appointment.professional}. Até já! 😊`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // --- Renderização ---
  if (loading) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
          <p className="mt-2 text-gray-600">Acompanhe o desempenho do seu negócio</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 rounded-md p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Ganhos do Dia</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {kpis ? formatCurrency(kpis.dailyEarnings) : 'R$ 0,00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Agendamentos Hoje</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {kpis ? kpis.dailyAppointments : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-purple-100 rounded-md p-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Ticket Médio</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {kpis ? formatCurrency(kpis.avgTicket) : 'R$ 0,00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Agendamentos de Hoje</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {todayAppointments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhum agendamento para hoje
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      {/* Checkbox para marcar presença */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`attended-${appointment.id}`}
                          className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          checked={appointment.attended}
                          onChange={(e) => handleAttendanceChange(appointment, e.target.checked)}
                        />
                        <label htmlFor={`attended-${appointment.id}`} className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(appointment.appointment_date)} - {clients.find(c => c.id === appointment.client_id)?.name || 'Cliente'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {appointment.service} • {appointment.professional} • {formatCurrency(appointment.price)}
                          </p>
                        </label>
                      </div>
                      
                      <button
                        onClick={() => sendWhatsAppReminder(appointment)}
                        className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Lembrete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Ganhos da Semana</h3>
            </div>
            <div className="p-6">
              {weeklyEarnings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Sem dados para exibir
                </div>
              ) : (
                <div className="space-y-3">
                  {weeklyEarnings.map((day, index) => {
                    const maxEarnings = Math.max(...weeklyEarnings.map(d => d.earnings));
                    const percentage = maxEarnings > 0 ? (day.earnings / maxEarnings) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-16 text-xs text-gray-600">
                          {new Date(day.entry_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </div>
                        <div className="flex-1 mx-3">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-xs font-medium text-right">
                          {formatCurrency(day.earnings)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
