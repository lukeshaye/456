/**
 * Formata um valor numérico (em cêntimos) para uma string de moeda no padrão BRL.
 * @param value O valor em cêntimos (ex: 12345 para R$ 123,45)
 * @returns A string formatada (ex: "R$ 123,45")
 */
export const formatCurrency = (value: number) => {
  const amountInReais = value / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amountInReais);
};

/**
 * Formata uma string de data (YYYY-MM-DD) para o formato local (pt-BR).
 * @param dateString A data no formato "YYYY-MM-DD"
 * @returns A data formatada (ex: "dd/mm/aaaa")
 */
export const formatDate = (dateString: string) => {
  // Adiciona T00:00:00 para garantir que a data seja interpretada como local,
  // evitando problemas de fuso horário que podem alterar o dia.
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('pt-BR');
};
