import { z } from "zod";

// =================================================================
// --- Schemas de Clientes ---
// =================================================================
export const ClientSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do cliente é obrigatório"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  notes: z.string().optional().nullable(),
});
export const CreateClientSchema = ClientSchema.omit({ id: true, user_id: true });

// =================================================================
// --- Schemas de Profissionais ---
// =================================================================
export const ProfessionalSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do profissional é obrigatório"),
});
export const CreateProfessionalSchema = ProfessionalSchema.omit({ id: true, user_id: true });


// =================================================================
// --- Schemas de Serviços (NOVO) ---
// =================================================================
export const ServiceSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  description: z.string().optional().nullable(),
  price: z.number().positive("O preço deve ser um número positivo"),
  duration: z.number().int().positive("A duração deve ser um número inteiro positivo (em minutos)"),
});
export const CreateServiceSchema = ServiceSchema.omit({ id: true, user_id: true });


// =================================================================
// --- Schemas de Produtos ---
// =================================================================
export const ProductSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional().nullable(),
  price: z.number().positive("O preço deve ser positivo"),
  quantity: z.number().int().min(0, "A quantidade deve ser positiva").default(0),
  image_url: z.string().url("URL da imagem inválida").optional().nullable().or(z.literal('')),
});
export const CreateProductSchema = ProductSchema.omit({ id: true, user_id: true }).extend({
  quantity: z.number().int().min(0, "A quantidade deve ser positiva").optional().default(0),
});

// =================================================================
// --- Schemas de Agendamentos (Atualizado com service_id) ---
// =================================================================
const BaseAppointmentSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  client_id: z.number({ required_error: "Cliente é obrigatório." }).min(1, "Cliente é obrigatório."),
  professional_id: z.number({ required_error: "Profissional é obrigatório." }).min(1, "Profissional é obrigatório."),
  service_id: z.number({ required_error: "Serviço é obrigatório." }).min(1, "Serviço é obrigatório."),
  client_name: z.string(), // Será preenchido a partir do client_id
  service: z.string(),     // Será preenchido a partir do service_id
  price: z.number().positive("Preço deve ser positivo"),
  appointment_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data de início inválida" }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data de fim inválida" }),
  attended: z.boolean().default(false),
});

const dateRefinement = {
  message: "A data de fim deve ser posterior à data de início",
  path: ["end_date"],
};

export const AppointmentSchema = BaseAppointmentSchema.refine(
  (data) => new Date(data.end_date) > new Date(data.appointment_date),
  dateRefinement
);

export const AppointmentFormSchema = BaseAppointmentSchema.omit({
  id: true,
  user_id: true,
  client_name: true,
  service: true,
}).refine(
  (data) => new Date(data.end_date) > new Date(data.appointment_date),
  dateRefinement
);


// =================================================================
// --- Schemas de Entradas Financeiras ---
// =================================================================
export const FinancialEntrySchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().positive("O valor deve ser positivo"),
  type: z.enum(["receita", "despesa"]),
  entry_type: z.enum(["pontual", "fixa"]),
  entry_date: z.string(),
  appointment_id: z.number().optional().nullable(),
  is_virtual: z.boolean().default(false),
});
export const CreateFinancialEntrySchema = FinancialEntrySchema.omit({ id: true, user_id: true, is_virtual: true, appointment_id: true });


// =================================================================
// --- Schemas de Configurações ---
// =================================================================
export const BusinessHoursSchema = z.object({
  day_of_week: z.number(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});

// =================================================================
// --- Tipos Derivados ---
// =================================================================
export type ClientType = z.infer<typeof ClientSchema>;
export type ProfessionalType = z.infer<typeof ProfessionalSchema>;
export type ServiceType = z.infer<typeof ServiceSchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type AppointmentType = z.infer<typeof AppointmentSchema>;
export type FinancialEntryType = z.infer<typeof FinancialEntrySchema>;
export type BusinessHoursType = z.infer<typeof BusinessHoursSchema>;