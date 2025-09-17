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
// --- Schemas de Profissionais (Simplificado) ---
// =================================================================
export const ProfessionalSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do profissional é obrigatório"),
});
export const CreateProfessionalSchema = ProfessionalSchema.omit({ id: true, user_id: true });

// =================================================================
// --- Schemas de Agendamentos (Atualizado com professional_id) ---
// =================================================================

// 1. Schema base para um agendamento.
//    - 'professional' foi removido em favor de 'professional_id'.
//    - 'client_name' é mantido para compatibilidade, mas o formulário usará 'client_id'.
const BaseAppointmentSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  client_id: z.number({ required_error: "Cliente é obrigatório." }).min(1, "Cliente é obrigatório."),
  professional_id: z.number({ required_error: "Profissional é obrigatório." }).min(1, "Profissional é obrigatório."),
  client_name: z.string().min(1, "Nome do cliente é obrigatório"), // Mantido para dados existentes
  service: z.string().min(1, "Serviço é obrigatório"),
  price: z.number().positive("Preço deve ser positivo"),
  appointment_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data de início inválida" }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data de fim inválida" }),
  attended: z.boolean().default(false),
});

// 2. Validação para garantir que a data de fim seja após a de início.
const dateRefinement = {
  message: "A data de fim deve ser posterior à data de início",
  path: ["end_date"],
};

// 3. Schema completo que representa um agendamento na base de dados (com validação de datas).
export const AppointmentSchema = BaseAppointmentSchema.refine(
  (data) => new Date(data.end_date) > new Date(data.appointment_date),
  dateRefinement
);

// 4. Schema para o formulário de criação/edição de agendamentos.
//    - Omitimos os campos que não são preenchidos diretamente pelo usuário.
//    - Aplicamos a validação de datas.
export const AppointmentFormSchema = BaseAppointmentSchema.omit({ 
  id: true, 
  user_id: true, 
  client_name: true // client_name é derivado de client_id
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
  amount: z.number().positive("Valor deve ser positivo"),
  type: z.enum(["receita", "despesa"]),
  entry_type: z.enum(["pontual", "fixa"]),
  entry_date: z.string(),
  appointment_id: z.number().optional().nullable(),
  is_virtual: z.boolean().default(false),
});
export const CreateFinancialEntrySchema = FinancialEntrySchema.omit({ id: true, user_id: true, is_virtual: true, appointment_id: true });

// =================================================================
// --- Schemas de Produtos ---
// =================================================================
export const ProductSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Preço deve ser positivo"),
  quantity: z.number().int().min(0, "Quantidade deve ser positiva").default(0),
  image_url: z.string().url("URL da imagem inválida").optional().nullable().or(z.literal('')),
});
export const CreateProductSchema = ProductSchema.omit({ id: true, user_id: true }).extend({
  quantity: z.number().int().min(0, "Quantidade deve ser positiva").optional().default(0),
});

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
export type AppointmentType = z.infer<typeof AppointmentSchema>;
export type FinancialEntryType = z.infer<typeof FinancialEntrySchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type BusinessHoursType = z.infer<typeof BusinessHoursSchema>;