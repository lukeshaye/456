import z from "zod";

// Esquemas de validação para clients
export const ClientSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do cliente é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  notes: z.string().optional(),
});

export const CreateClientSchema = ClientSchema.omit({ id: true, user_id: true });

// Esquemas de validação para appointments
export const AppointmentSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  client_id: z.number().min(1, "Cliente é obrigatório"),
  client_name: z.string().min(1, "Nome do cliente é obrigatório"),
  service: z.string().min(1, "Serviço é obrigatório"),
  price: z.number().positive("Preço deve ser positivo"),
  professional: z.string().min(1, "Profissional é obrigatório"),
  appointment_date: z.string(),
  is_confirmed: z.boolean().default(false),
});

export const CreateAppointmentSchema = AppointmentSchema.omit({ id: true, user_id: true }).extend({
  is_confirmed: z.boolean().optional().default(false),
});

// Esquemas de validação para financial entries
export const FinancialEntrySchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  type: z.enum(["receita", "despesa"]),
  entry_type: z.enum(["pontual", "fixa"]),
  entry_date: z.string(),
  is_virtual: z.boolean().default(false),
});

export const CreateFinancialEntrySchema = FinancialEntrySchema.omit({ id: true, user_id: true, is_virtual: true });

// Esquemas de validação para products
export const ProductSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  quantity: z.number().int().min(0, "Quantidade deve ser positiva").default(0),
  image_url: z.string().url().optional(),
});

export const CreateProductSchema = ProductSchema.omit({ id: true, user_id: true }).extend({
  quantity: z.number().int().min(0, "Quantidade deve ser positiva").optional().default(0),
});

// Esquemas de validação para professionals
export const ProfessionalSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do profissional é obrigatório"),
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
  lunch_start_time: z.string().optional(),
  lunch_end_time: z.string().optional(),
});

export const CreateProfessionalSchema = ProfessionalSchema.omit({ id: true, user_id: true });

// Tipos derivados dos esquemas
export type AppointmentType = z.infer<typeof AppointmentSchema>;
export type CreateAppointmentType = z.infer<typeof CreateAppointmentSchema>;
export type FinancialEntryType = z.infer<typeof FinancialEntrySchema>;
export type CreateFinancialEntryType = z.infer<typeof CreateFinancialEntrySchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type CreateProductType = z.infer<typeof CreateProductSchema>;
export type ProfessionalType = z.infer<typeof ProfessionalSchema>;
export type CreateProfessionalType = z.infer<typeof CreateProfessionalSchema>;
export type ClientType = z.infer<typeof ClientSchema>;
export type CreateClientType = z.infer<typeof CreateClientSchema>;

// Tipos para dashboard
export interface DashboardKPIs {
  dailyEarnings: number;
  dailyAppointments: number;
  avgTicket: number;
}

export interface WeeklyEarning {
  entry_date: string;
  earnings: number;
}

export interface ServicePopularity {
  service: string;
  count: number;
}

export interface ProfessionalPerformance {
  professional: string;
  count: number;
}
