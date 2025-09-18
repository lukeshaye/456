import { create } from 'zustand';
import { supabase } from '../react-app/supabaseClient';
import type {
  ClientType,
  ProductType,
  ServiceType, // <-- Importado o novo tipo de Serviço
  AppointmentType,
  FinancialEntryType,
  ProfessionalType,
  BusinessHoursType
} from './types';

// Interface que define a forma do nosso estado global
interface AppState {
  // Clientes
  clients: ClientType[];
  fetchClients: (userId: string) => Promise<void>;
  addClient: (client: Omit<ClientType, 'id' | 'user_id'>, userId: string) => Promise<void>;
  updateClient: (client: ClientType) => Promise<void>;
  deleteClient: (clientId: number) => Promise<void>;

  // Produtos
  products: ProductType[];
  fetchProducts: (userId: string) => Promise<void>;
  addProduct: (product: Omit<ProductType, 'id' | 'user_id'>, userId: string) => Promise<void>;
  updateProduct: (product: ProductType) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;

  // --- NOVO: Serviços ---
  services: ServiceType[];
  fetchServices: (userId: string) => Promise<void>;
  addService: (service: Omit<ServiceType, 'id' | 'user_id'>, userId: string) => Promise<void>;
  updateService: (service: ServiceType) => Promise<void>;
  deleteService: (serviceId: number) => Promise<void>;

  // Profissionais
  professionals: ProfessionalType[];
  fetchProfessionals: (userId: string) => Promise<void>;
  addProfessional: (professional: Omit<ProfessionalType, 'id' | 'user_id'>, userId: string) => Promise<void>;
  updateProfessional: (professional: ProfessionalType) => Promise<void>;
  deleteProfessional: (professionalId: number) => Promise<void>;

  // Agendamentos
  appointments: AppointmentType[];
  fetchAppointments: (userId: string) => Promise<void>;
  addAppointment: (appointment: Omit<AppointmentType, 'id' | 'user_id'>, userId: string) => Promise<void>;
  updateAppointment: (appointment: AppointmentType) => Promise<void>;
  deleteAppointment: (appointmentId: number) => Promise<void>;

  // Entradas Financeiras
  financialEntries: FinancialEntryType[];
  fetchFinancialEntries: (userId: string) => Promise<void>;
  addFinancialEntry: (entry: Omit<FinancialEntryType, 'id' | 'user_id'>, userId: string) => Promise<void>;
  updateFinancialEntry: (entry: FinancialEntryType) => Promise<void>;
  deleteFinancialEntry: (entryId: number) => Promise<void>;

  // Horários de Funcionamento
  businessHours: BusinessHoursType[];
  fetchBusinessHours: (userId: string) => Promise<void>;

  // Estados de loading
  loading: {
    clients: boolean;
    products: boolean;
    services: boolean; // <-- Adicionado
    professionals: boolean;
    appointments: boolean;
    financialEntries: boolean;
    businessHours: boolean;
  };
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // --- CLIENTES ---
  clients: [],
  fetchClients: async (userId) => {
    set(state => ({ loading: { ...state.loading, clients: true } }));
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId).order('name', { ascending: true });
    if (error) console.error("Erro ao buscar clientes:", error);
    set({ clients: data || [], loading: { ...get().loading, clients: false } });
  },
  addClient: async (client, userId) => {
    const { data, error } = await supabase.from('clients').insert([{ ...client, user_id: userId }]).select();
    if (error) throw error;
    if (data) set((state) => ({ clients: [...state.clients, data[0]].sort((a, b) => a.name.localeCompare(b.name)) }));
  },
  updateClient: async (client) => {
    const { data, error } = await supabase.from('clients').update(client).eq('id', client.id).select();
    if (error) throw error;
    if (data) set((state) => ({ clients: state.clients.map((c) => (c.id === client.id ? data[0] : c)) }));
  },
  deleteClient: async (clientId) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) throw error;
    set((state) => ({ clients: state.clients.filter((c) => c.id !== clientId) }));
  },

  // --- PRODUTOS ---
  products: [],
  fetchProducts: async (userId) => {
    set(state => ({ loading: { ...state.loading, products: true } }));
    const { data, error } = await supabase.from('products').select('*').eq('user_id', userId).order('name', { ascending: true });
    if (error) console.error("Erro ao buscar produtos:", error);
    set({ products: data || [], loading: { ...get().loading, products: false } });
  },
  addProduct: async (product, userId) => {
    const { data, error } = await supabase.from('products').insert([{ ...product, user_id: userId }]).select();
    if (error) throw error;
    if (data) set((state) => ({ products: [...state.products, data[0]].sort((a, b) => a.name.localeCompare(b.name)) }));
  },
  updateProduct: async (product) => {
    const { data, error } = await supabase.from('products').update(product).eq('id', product.id).select();
    if (error) throw error;
    if (data) set((state) => ({ products: state.products.map((p) => (p.id === product.id ? data[0] : p)) }));
  },
  deleteProduct: async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
    set((state) => ({ products: state.products.filter((p) => p.id !== productId) }));
  },

  // --- SERVIÇOS (NOVO) ---
  services: [],
  fetchServices: async (userId) => {
    set(state => ({ loading: { ...state.loading, services: true } }));
    const { data, error } = await supabase.from('services').select('*').eq('user_id', userId).order('name', { ascending: true });
    if (error) console.error("Erro ao buscar serviços:", error);
    set({ services: data || [], loading: { ...get().loading, services: false } });
  },
  addService: async (service, userId) => {
    const { data, error } = await supabase.from('services').insert([{ ...service, user_id: userId }]).select();
    if (error) throw error;
    if (data) set((state) => ({ services: [...state.services, data[0]].sort((a, b) => a.name.localeCompare(b.name)) }));
  },
  updateService: async (service) => {
    const { data, error } = await supabase.from('services').update(service).eq('id', service.id).select();
    if (error) throw error;
    if (data) set((state) => ({ services: state.services.map((s) => (s.id === service.id ? data[0] : s)) }));
  },
  deleteService: async (serviceId) => {
    const { error } = await supabase.from('services').delete().eq('id', serviceId);
    if (error) throw error;
    set((state) => ({ services: state.services.filter((s) => s.id !== serviceId) }));
  },

  // --- PROFISSIONAIS ---
  professionals: [],
  fetchProfessionals: async (userId) => {
    set(state => ({ loading: { ...state.loading, professionals: true } }));
    const { data, error } = await supabase.from('professionals').select('*').eq('user_id', userId).order('name', { ascending: true });
    if (error) console.error("Erro ao buscar profissionais:", error);
    set({ professionals: data || [], loading: { ...get().loading, professionals: false } });
  },
  addProfessional: async (professional, userId) => {
    const { data, error } = await supabase.from('professionals').insert([{ ...professional, user_id: userId }]).select();
    if (error) throw error;
    if (data) set((state) => ({ professionals: [...state.professionals, data[0]].sort((a, b) => a.name.localeCompare(b.name)) }));
  },
  updateProfessional: async (professional) => {
    const { data, error } = await supabase.from('professionals').update(professional).eq('id', professional.id).select();
    if (error) throw error;
    if (data) set((state) => ({ professionals: state.professionals.map((p) => (p.id === professional.id ? data[0] : p)) }));
  },
  deleteProfessional: async (professionalId) => {
    const { error } = await supabase.from('professionals').delete().eq('id', professionalId);
    if (error) throw error;
    set((state) => ({ professionals: state.professionals.filter((p) => p.id !== professionalId) }));
  },

  // --- AGENDAMENTOS ---
  appointments: [],
  fetchAppointments: async (userId) => {
    set(state => ({ loading: { ...state.loading, appointments: true } }));
    const { data, error } = await supabase.from('appointments').select('*').eq('user_id', userId).order('appointment_date', { ascending: true });
    if (error) console.error("Erro ao buscar agendamentos:", error);
    set({ appointments: data || [], loading: { ...get().loading, appointments: false } });
  },
  addAppointment: async (appointment, userId) => {
    const { data, error } = await supabase.from('appointments').insert([{ ...appointment, user_id: userId }]).select();
    if (error) throw error;
    if (data) set((state) => ({ appointments: [...state.appointments, data[0]] }));
  },
  updateAppointment: async (appointment) => {
    const { data, error } = await supabase.from('appointments').update(appointment).eq('id', appointment.id).select();
    if (error) throw error;
    if (data) set((state) => ({ appointments: state.appointments.map((a) => (a.id === appointment.id ? data[0] : a)) }));
  },
  deleteAppointment: async (appointmentId) => {
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
    if (error) throw error;
    set((state) => ({ appointments: state.appointments.filter((a) => a.id !== appointmentId) }));
  },

  // --- ENTRADAS FINANCEIRAS ---
  financialEntries: [],
  fetchFinancialEntries: async (userId) => {
    set(state => ({ loading: { ...state.loading, financialEntries: true } }));
    const { data, error } = await supabase.from('financial_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false });
    if (error) console.error("Erro ao buscar entradas financeiras:", error);
    set({ financialEntries: data || [], loading: { ...get().loading, financialEntries: false } });
  },
  addFinancialEntry: async (entry, userId) => {
    const { data, error } = await supabase.from('financial_entries').insert([{ ...entry, user_id: userId }]).select();
    if (error) throw error;
    if (data) set((state) => ({ financialEntries: [...state.financialEntries, data[0]] }));
  },
  updateFinancialEntry: async (entry) => {
    const { data, error } = await supabase.from('financial_entries').update(entry).eq('id', entry.id).select();
    if (error) throw error;
    if (data) set((state) => ({ financialEntries: state.financialEntries.map((e) => (e.id === entry.id ? data[0] : e)) }));
  },
  deleteFinancialEntry: async (entryId) => {
    const { error } = await supabase.from('financial_entries').delete().eq('id', entryId);
    if (error) throw error;
    set((state) => ({ financialEntries: state.financialEntries.filter((e) => e.id !== entryId) }));
  },

  // --- HORÁRIOS DE FUNCIONAMENTO ---
  businessHours: [],
  fetchBusinessHours: async (userId) => {
    set(state => ({ loading: { ...state.loading, businessHours: true } }));
    const { data, error } = await supabase.from('business_settings').select('day_of_week, start_time, end_time').eq('user_id', userId).not('start_time', 'is', null).not('end_time', 'is', null);
    if (error) console.error("Erro ao buscar horários de funcionamento:", error);
    set({ businessHours: data || [], loading: { ...get().loading, businessHours: false } });
  },

  // --- ESTADOS DE LOADING ---
  loading: {
    clients: true,
    products: true,
    services: true, // <-- Adicionado
    professionals: true,
    appointments: true,
    financialEntries: true,
    businessHours: true,
  },
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  })),
}));
