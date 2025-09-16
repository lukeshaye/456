import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseAuth } from '../auth/SupabaseAuthProvider';
import { useAppStore } from '../../shared/store';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToastHelpers } from '../contexts/ToastContext';
import { Users, Plus, Edit, Trash2, Phone, Mail, MessageCircle, X } from 'lucide-react';
import type { ClientType } from '../../shared/types';
import { CreateClientSchema } from '../../shared/types';

// --- Definição de Tipos ---
interface ClientFormData {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

const defaultFormValues: ClientFormData = {
    name: '',
    phone: '',
    email: '',
    notes: '',
};

/**
 * Página para gerir os clientes (Criar, Ler, Atualizar, Apagar).
 */
export default function Clients() {
  const { user } = useSupabaseAuth();
  const { 
    clients, 
    loading, 
    fetchClients, 
    addClient, 
    updateClient, 
    deleteClient 
  } = useAppStore();
  const { showSuccess, showError } = useToastHelpers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: defaultFormValues
  });

  useEffect(() => {
    if (user) {
      fetchClients(user.id);
    }
  }, [user, fetchClients]);

  const onSubmit = async (formData: ClientFormData) => {
    if (!user) return;
    try {
      if (editingClient) {
        await updateClient({ ...editingClient, ...formData });
        showSuccess('Cliente atualizado!', 'As alterações foram salvas com sucesso.');
      } else {
        await addClient(formData, user.id);
        showSuccess('Cliente adicionado!', 'O novo cliente foi adicionado à sua base de dados.');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', (error as Error).message);
      showError('Erro ao salvar cliente', 'Tente novamente ou contacte o suporte se o problema persistir.');
    }
  };

  const handleDeleteClick = (client: ClientType) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !clientToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteClient(clientToDelete.id!);
      showSuccess('Cliente removido!', 'O cliente foi removido da sua base de dados.');
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cliente:', (error as Error).message);
      showError('Erro ao remover cliente', 'Tente novamente ou contacte o suporte se o problema persistir.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };
  
  const handleEditClient = (client: ClientType) => {
    setEditingClient(client);
    reset({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset(defaultFormValues);
  };
  
  const sendWhatsAppMessage = (client: ClientType) => {
    if (!client.phone) return;
    const message = `Olá, ${client.name}! Tudo bem?`;
    const phoneNumber = client.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading.clients) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
       <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="mt-2 text-gray-600">Gerencie a sua base de clientes</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </button>
          </div>
        </div>

        <div className="mt-8">
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando o seu primeiro cliente.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="px-6 py-4 flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {client.phone}
                        </div>
                      )}
                      
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {client.email}
                        </div>
                      )}
                      
                      {client.notes && (
                        <div className="text-sm text-gray-600 mt-2">
                          <p className="italic">"{client.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* UX Melhorada: Div dos botões com layout corrigido */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    {/* Grupo de Ações Primárias (Editar/Excluir) */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      >
                        <Edit className="w-4 h-4 mr-1.5" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(client)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Excluir
                      </button>
                    </div>
                    
                    {/* Ação Secundária (WhatsApp) */}
                    {client.phone && (
                      <button
                        onClick={() => sendWhatsAppMessage(client)}
                        title="Enviar mensagem no WhatsApp"
                        className="inline-flex items-center justify-center p-2 border border-green-300 shadow-sm rounded-full text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-8 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                      </h3>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nome *
                        </label>
                        <input
                          type="text"
                          {...register('name')}
                          placeholder="Ex: Maria Silva"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          {...register('phone')}
                          placeholder="Ex: (11) 99999-9999"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          {...register('email')}
                          placeholder="Ex: maria@email.com"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notas
                        </label>
                        <textarea
                          {...register('notes')}
                          rows={3}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          placeholder="Preferências, observações, histórico..."
                        />
                        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-base font-medium text-white hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Salvando...' : (editingClient ? 'Atualizar' : 'Criar')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
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
          title="Excluir Cliente"
          message={`Tem certeza que deseja excluir o cliente "${clientToDelete?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
}