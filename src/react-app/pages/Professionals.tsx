import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseAuth } from '../auth/SupabaseAuthProvider';
import { useAppStore } from '../../shared/store';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToastHelpers } from '../contexts/ToastContext';
import { Plus, Edit, Trash2, X, Briefcase } from 'lucide-react';
import type { ProfessionalType } from '../../shared/types';
import { CreateProfessionalSchema } from '../../shared/types';

interface ProfessionalFormData {
  name: string;
  work_start_time?: string;
  work_end_time?: string;
  lunch_start_time?: string;
  lunch_end_time?: string;
}

const defaultFormValues: ProfessionalFormData = {
    name: '',
    work_start_time: '',
    work_end_time: '',
    lunch_start_time: '',
    lunch_end_time: '',
};

export default function Professionals() {
  const { user } = useSupabaseAuth();
  const { 
    professionals, 
    loading, 
    fetchProfessionals, 
    addProfessional, 
    updateProfessional, 
    deleteProfessional 
  } = useAppStore();
  const { showSuccess, showError } = useToastHelpers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<ProfessionalType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalFormData>({
    resolver: zodResolver(CreateProfessionalSchema),
    defaultValues: defaultFormValues
  });

  useEffect(() => {
    if (user) {
      fetchProfessionals(user.id);
    }
  }, [user, fetchProfessionals]);

  const onSubmit = async (formData: ProfessionalFormData) => {
    if (!user) return;
    try {
      if (editingProfessional) {
        await updateProfessional({ ...editingProfessional, ...formData });
        showSuccess('Profissional atualizado!', 'As alterações foram salvas com sucesso.');
      } else {
        await addProfessional(formData, user.id);
        showSuccess('Profissional adicionado!', 'O novo profissional foi adicionado à sua equipe.');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar profissional:', (error as Error).message);
      showError('Erro ao salvar profissional', 'Tente novamente ou contacte o suporte se o problema persistir.');
    }
  };

  const handleDeleteClick = (professional: ProfessionalType) => {
    setProfessionalToDelete(professional);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !professionalToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteProfessional(professionalToDelete.id!);
      showSuccess('Profissional removido!', 'O profissional foi removido da sua equipe.');
      setIsDeleteModalOpen(false);
      setProfessionalToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir profissional:', (error as Error).message);
      showError('Erro ao remover profissional', 'Tente novamente ou contacte o suporte se o problema persistir.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setProfessionalToDelete(null);
  };

  const handleEditProfessional = (professional: ProfessionalType) => {
    setEditingProfessional(professional);
    reset({ 
      name: professional.name,
      work_start_time: professional.work_start_time || '',
      work_end_time: professional.work_end_time || '',
      lunch_start_time: professional.lunch_start_time || '',
      lunch_end_time: professional.lunch_end_time || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfessional(null);
    reset(defaultFormValues);
  };

  if (loading.professionals) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
            <p className="mt-2 text-gray-600">Gerencie a sua equipe</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Profissional
            </button>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {professionals.length === 0 ? (
                 <div className="text-center py-12">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum profissional</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comece adicionando um profissional à sua equipe.
                    </p>
                  </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Nome</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Horário de Trabalho</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Horário de Almoço</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {professionals.map((professional) => (
                      <tr key={professional.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{professional.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {professional.work_start_time && professional.work_end_time 
                            ? `${professional.work_start_time} - ${professional.work_end_time}`
                            : 'Não definido'
                          }
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {professional.lunch_start_time && professional.lunch_end_time 
                            ? `${professional.lunch_start_time} - ${professional.lunch_end_time}`
                            : 'Não definido'
                          }
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => handleEditProfessional(professional)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(professional)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseModal}></div>
              <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                      <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome *</label>
                        <input
                          type="text"
                          {...register('name')}
                          placeholder="Ex: Joana Santos"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="work_start_time" className="block text-sm font-medium text-gray-700">Início do Trabalho</label>
                          <input
                            type="time"
                            {...register('work_start_time')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="work_end_time" className="block text-sm font-medium text-gray-700">Fim do Trabalho</label>
                          <input
                            type="time"
                            {...register('work_end_time')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="lunch_start_time" className="block text-sm font-medium text-gray-700">Início do Almoço</label>
                          <input
                            type="time"
                            {...register('lunch_start_time')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="lunch_end_time" className="block text-sm font-medium text-gray-700">Fim do Almoço</label>
                          <input
                            type="time"
                            {...register('lunch_end_time')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-base font-medium text-white hover:from-pink-600 hover:to-violet-600 sm:ml-3 sm:w-auto sm:text-sm">
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Excluir Profissional"
          message={`Tem certeza que deseja excluir o profissional "${professionalToDelete?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
}
