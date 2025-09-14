import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseAuth } from '../auth/SupabaseAuthProvider';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToastHelpers } from '../contexts/ToastContext';
import { DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2, X, FileText, AlertCircle } from 'lucide-react';
import type { FinancialEntryType } from '../../shared/types';
import { CreateFinancialEntrySchema } from '../../shared/types';
import { formatCurrency, formatDate } from '../utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FinancialFormData {
    description: string;
    amount: number; 
    type: 'receita' | 'despesa';
    entry_type: 'pontual' | 'fixa';
    entry_date: string;
}

const defaultFormValues: FinancialFormData = {
    description: '',
    amount: 0,
    type: 'receita',
    entry_type: 'pontual',
    entry_date: new Date().toISOString().split('T')[0],
};

export default function Financial() {
  const { user } = useSupabaseAuth(); 
  const { showSuccess, showError } = useToastHelpers();
  
  const [entries, setEntries] = useState<FinancialEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntryType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntryType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [kpis, setKpis] = useState({
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netProfit: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FinancialFormData>({
    resolver: zodResolver(CreateFinancialEntrySchema),
    defaultValues: defaultFormValues,
  });
  
  useEffect(() => {
    if (user) {
      fetchEntriesAndKPIs();
    }
  }, [user]);

  const fetchEntriesAndKPIs = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [entriesData, kpisData] = await Promise.all([
        fetchEntries(),
        fetchKPIs()
      ]);
      
      if (entriesData) setEntries(entriesData);
      if (kpisData) {
         setKpis({
            ...kpisData,
            netProfit: kpisData.monthlyRevenue - kpisData.monthlyExpenses,
        });
      }

    } catch (err: any) {
      setError("Falha ao carregar dados financeiros. Tente novamente mais tarde.");
      console.error("Erro ao carregar dados financeiros:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('financial_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data || [];
  };
  
  const fetchKPIs = async () => {
     if (!user) return { monthlyRevenue: 0, monthlyExpenses: 0 };
    
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data: monthlyEntries, error } = await supabase
      .from('financial_entries')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('entry_date', startOfMonth.toISOString().split('T')[0])
      .lte('entry_date', endOfMonth.toISOString().split('T')[0]);

    if (error) throw error;

    const kpisResult = (monthlyEntries || []).reduce((acc: { monthlyRevenue: number; monthlyExpenses: number }, entry: { amount: number; type: string }) => {
        if (entry.type === 'receita') {
          acc.monthlyRevenue += entry.amount;
        } else if (entry.type === 'despesa') {
          acc.monthlyExpenses += entry.amount;
        }
        return acc;
      }, { monthlyRevenue: 0, monthlyExpenses: 0 });

    return kpisResult;
  };

  const onSubmit = async (formData: FinancialFormData) => {
    if (!user) return;
    setError(null);
    
    const entryData = {
      ...formData,
      amount: Math.round(formData.amount * 100),
    };

    try {
      if (editingEntry) {
        await supabase.from('financial_entries').update(entryData).eq('id', editingEntry.id);
        showSuccess('Entrada atualizada!');
      } else {
        await supabase.from('financial_entries').insert([{ ...entryData, user_id: user.id }]);
        showSuccess('Entrada adicionada!');
      }
      
      await fetchEntriesAndKPIs();
      handleCloseModal();
    } catch (err: any) {
      setError("Erro ao salvar a entrada financeira. Verifique os dados e tente novamente.");
      showError('Erro ao salvar.');
      console.error('Erro ao salvar entrada financeira:', err.message);
    }
  };
  
  const handleDeleteClick = (entry: FinancialEntryType) => {
    setEntryToDelete(entry);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !entryToDelete) return;
    
    setIsDeleting(true);
    try {
      await supabase.from('financial_entries').delete().eq('id', entryToDelete.id!);
      showSuccess('Entrada removida!');
      setIsConfirmModalOpen(false);
      setEntryToDelete(null);
      await fetchEntriesAndKPIs();
    } catch (error) {
      console.error('Erro ao excluir entrada:', (error as Error).message);
      showError('Erro ao remover entrada.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
      setIsConfirmModalOpen(false);
      setEntryToDelete(null);
  }

  const handleEditEntry = (entry: FinancialEntryType) => {
    setEditingEntry(entry);
    reset({
      ...entry,
      amount: entry.amount / 100,
      entry_date: entry.entry_date.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    reset(defaultFormValues);
    setError(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório Financeiro - SalonFlow", 14, 16);
    autoTable(doc, {
        startY: 20,
        head: [['Data', 'Descrição', 'Tipo', 'Valor']],
        body: entries.map((e: FinancialEntryType) => [
            formatDate(e.entry_date),
            e.description,
            e.type === 'receita' ? 'Receita' : 'Despesa',
            formatCurrency(e.amount)
        ]),
    });
    doc.save('relatorio_financeiro.pdf');
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Tipo', 'Valor (R$)'],
      ...entries.map((e: FinancialEntryType) => [
        formatDate(e.entry_date),
        e.description,
        e.type === 'receita' ? 'Receita' : 'Despesa',
        (e.amount / 100).toFixed(2).replace('.', ',')
      ])
    ].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';')).join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio_financeiro.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="mt-2 text-gray-600">Controle completo das suas finanças</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
             <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrada
            </button>
          </div>
        </div>
        
        {error && !isModalOpen && (
            <div className="bg-red-50 p-4 rounded-md my-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 rounded-md p-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Receitas do Mês</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(kpis.monthlyRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 rounded-md p-3">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Despesas do Mês</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(kpis.monthlyExpenses)}</dd>
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
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Lucro Líquido</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(kpis.netProfit)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Lançamentos Recentes</h3>
            </div>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma entrada financeira</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece registrando uma receita ou despesa.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.entry_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {entry.type === 'receita' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${entry.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.type === 'receita' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditEntry(entry)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteClick(entry)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{editingEntry ? 'Editar Entrada' : 'Nova Entrada'}</h3>
                      <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                    </div>
                    {error && (
                        <div className="bg-red-50 p-3 rounded-md mb-4 flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição *</label>
                        <input type="text" {...register('description')} placeholder="Ex: Venda de produto X" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
                        <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="150,00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo *</label>
                        <select {...register('type')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                          <option value="receita">Receita</option>
                          <option value="despesa">Despesa</option>
                        </select>
                        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="entry_type" className="block text-sm font-medium text-gray-700">Frequência *</label>
                        <select {...register('entry_type')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                          <option value="pontual">Pontual</option>
                          <option value="fixa">Fixa</option>
                        </select>
                        {errors.entry_type && <p className="mt-1 text-sm text-red-600">{errors.entry_type.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700">Data *</label>
                        <input type="date" {...register('entry_date')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
                        {errors.entry_date && <p className="mt-1 text-sm text-red-600">{errors.entry_date.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-base font-medium text-white hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {isSubmitting ? 'Salvando...' : (editingEntry ? 'Atualizar' : 'Criar')}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                      Cancelar
                    </button>
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
          title="Excluir Entrada Financeira"
          message={`Tem certeza que deseja excluir a entrada "${entryToDelete?.description}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
}