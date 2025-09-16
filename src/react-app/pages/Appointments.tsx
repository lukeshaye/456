import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseAuth } from '../auth/SupabaseAuthProvider';
import { useAppStore } from '../../shared/store';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, X } from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';
import type { AppointmentType, ClientType, BusinessHoursType } from '../../shared/types';
import { AppointmentFormSchema } from '../../shared/types';
import { useToastHelpers } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Configuração do Localizer ---
moment.locale('pt-br');

// Força a atualização da localização para garantir a tradução correta
moment.updateLocale('pt-br', {
  months: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
    "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ],
  weekdays: [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
  ],
  weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  weekdaysMin: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sá"],
  relativeTime: {
    future: "em %s",
    past: "há %s",
    s: 'alguns segundos',
    ss: '%d segundos',
    m: "um minuto",
    mm: "%d minutos",
    h: "uma hora",
    hh: "%d horas",
    d: "um dia",
    dd: "%d dias",
    M: "um mês",
    MM: "%d meses",
    y: "um ano",
    yy: "%d anos"
  }
});


const localizer = momentLocalizer(moment);

interface AppointmentFormData {
  client_id: number;
  service: string;
  price: number;
  professional: string;
  appointment_date: string;
  attended?: boolean;
}

const defaultFormValues: Partial<AppointmentFormData> = {
    client_id: undefined,
    service: '',
    price: undefined,
    professional: '',
    attended: false,
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: AppointmentType;
}

export default function Appointments() {
  const { user } = useSupabaseAuth();
  const { showSuccess, showError } = useToastHelpers();
  
  const { 
    appointments, 
    clients, 
    professionals, 
    businessHours,
    loading, 
    fetchAppointments, 
    fetchClients, 
    fetchProfessionals,
    fetchBusinessHours,
    addAppointment,
    updateAppointment,
    deleteAppointment
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentType | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentFormSchema) as any,
    defaultValues: defaultFormValues
  });

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          await Promise.all([
            fetchAppointments(user.id),
            fetchClients(user.id),
            fetchProfessionals(user.id),
            fetchBusinessHours(user.id)
          ]);
        } catch (err: any) {
          console.error('Erro ao carregar dados:', err.message);
          showError("Falha ao carregar dados", "Tente recarregar a página.");
        }
      };
      fetchData();
    }
  }, [user, fetchAppointments, fetchClients, fetchProfessionals, fetchBusinessHours, showError]);

  const { minTime, maxTime } = useMemo(() => {
    if (!businessHours || businessHours.length === 0) {
      return {
        minTime: moment().startOf('day').add(8, 'hours').toDate(),
        maxTime: moment().startOf('day').add(20, 'hours').toDate(),
      };
    }

    let min = '23:59';
    let max = '00:00';

    businessHours.forEach((hour: BusinessHoursType) => {
      if (hour.start_time && hour.start_time < min) {
        min = hour.start_time;
      }
      if (hour.end_time && hour.end_time > max) {
        max = hour.end_time;
      }
    });

    return {
      minTime: moment().startOf('day').add(moment.duration(min)).toDate(),
      maxTime: moment().startOf('day').add(moment.duration(max)).toDate(),
    };
  }, [businessHours]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!user) return;
    
    const client = clients.find((c: ClientType) => c.id === Number(data.client_id));
    if (!client) {
        showError("Cliente não encontrado.");
        return;
    }
    
    const appointmentData = {
      ...data,
      price: Math.round(Number(data.price) * 100),
      client_id: Number(data.client_id),
      client_name: client.name,
      attended: data.attended ?? false,
    };

    try {
      if (editingAppointment) {
        await updateAppointment({ ...editingAppointment, ...appointmentData });
        showSuccess("Agendamento atualizado!");
      } else {
        await addAppointment(appointmentData, user.id);
        showSuccess("Agendamento criado com sucesso!");
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', (error as Error).message);
      showError("Não foi possível salvar", "Verifique os dados e tente novamente.");
    }
  };

  const handleDeleteClick = (appointment: AppointmentType) => {
    setAppointmentToDelete(appointment);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !appointmentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAppointment(appointmentToDelete.id!);
      showSuccess("Agendamento removido!");
      setIsConfirmModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir:', err.message);
      showError("Falha ao remover agendamento.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
      setIsConfirmModalOpen(false);
      setAppointmentToDelete(null);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    reset(defaultFormValues);
  };

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    const appointmentDateTime = moment(start).format('YYYY-MM-DDTHH:mm');
    reset({ ...defaultFormValues, appointment_date: appointmentDateTime });
    setEditingAppointment(null);
    setIsModalOpen(true);
  }, [reset]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setEditingAppointment(event.resource);
    const appointmentDate = new Date(event.resource.appointment_date);
    
    reset({
      client_id: event.resource.client_id,
      service: event.resource.service,
      price: event.resource.price / 100,
      professional: event.resource.professional,
      appointment_date: moment(appointmentDate).format('YYYY-MM-DDTHH:mm'),
      attended: event.resource.attended,
    });
    setIsModalOpen(true);
  }, [reset]);
  
  const calendarEvents: CalendarEvent[] = appointments.map((appointment: AppointmentType) => {
    const start = new Date(appointment.appointment_date);
    const end = moment(start).add(1, 'hours').toDate();
    
    return {
      id: appointment.id!,
      title: `${appointment.client_name} - ${appointment.service}`,
      start,
      end,
      resource: appointment,
    };
  });

  if (loading.appointments || loading.clients || loading.professionals || loading.businessHours) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="mt-2 text-gray-600">Gerencie todos os seus agendamentos</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                  reset({...defaultFormValues, appointment_date: moment().format('YYYY-MM-DDTHH:mm')})
                  setEditingAppointment(null);
                  setIsModalOpen(true)
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div style={{ height: '600px' }}>
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              culture='pt-br'
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Nenhum agendamento neste período.',
                showMore: (total: number) => `+ Ver mais (${total})`,
              }}
              formats={{
                timeGutterFormat: 'HH:mm',
                dayFormat: 'ddd, DD/MM',
                weekdayFormat: 'dddd',
                monthHeaderFormat: 'MMMM [de] YYYY',
                dayHeaderFormat: 'dddd, D [de] MMMM',
                dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => `${moment(start).format('DD')} - ${moment(end).format('DD [de] MMMM [de] YYYY')}`,
                agendaTimeFormat: 'HH:mm',
                agendaTimeRangeFormat: ({ start, end }: { start: Date, end: Date }) => `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`,
                eventTimeRangeFormat: ({ start, end }: { start: Date, end: Date }) => `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              }}
              min={minTime}
              max={maxTime}
            />
          </div>
        </div>

        {isModalOpen && (
           <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit(onSubmit as any)}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
                      <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Cliente *</label>
                        <select
                          {...register('client_id', { valueAsNumber: true })}
                          id="client_id"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        >
                          <option value="">Selecione um cliente</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                        {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-700">Serviço *</label>
                        <input type="text" {...register('service')} placeholder="Ex: Corte de Cabelo" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                        {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (R$) *</label>
                          <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="50,00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="professional" className="block text-sm font-medium text-gray-700">Profissional *</label>
                          <select
                            {...register('professional')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          >
                            <option value="">Selecione um profissional</option>
                            {professionals.map((professional) => (
                              <option key={professional.id} value={professional.name}>
                                {professional.name}
                              </option>
                            ))}
                          </select>
                          {errors.professional && <p className="mt-1 text-sm text-red-600">{errors.professional.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700">Data e Hora *</label>
                        <input type="datetime-local" {...register('appointment_date')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                        {errors.appointment_date && <p className="mt-1 text-sm text-red-600">{errors.appointment_date.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center">
                     <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-base font-medium text-white hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {isSubmitting ? 'Salvando...' : (editingAppointment ? 'Atualizar' : 'Criar')}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:w-auto sm:text-sm">
                      Cancelar
                    </button>
                     {editingAppointment && (
                        <button
                        type="button"
                        onClick={() => handleDeleteClick(editingAppointment)}
                        className="mt-3 sm:mt-0 mr-auto w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                        >
                        Excluir
                        </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Excluir Agendamento"
          message={`Tem certeza que deseja excluir o agendamento para "${appointmentToDelete?.client_name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
}