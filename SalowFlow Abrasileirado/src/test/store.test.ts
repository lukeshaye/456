import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../shared/store';

// Mock do Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [{ id: 1, name: 'Test Client', user_id: 'test-user' }],
        error: null,
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          data: [{ id: 1, name: 'Updated Client', user_id: 'test-user' }],
          error: null,
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null,
      })),
    })),
  })),
};

vi.mock('../react-app/supabaseClient', () => ({
  supabase: mockSupabase,
}));

describe('App Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      clients: [],
      products: [],
      professionals: [],
      appointments: [],
      financialEntries: [],
      loading: {
        clients: false,
        products: false,
        professionals: false,
        appointments: false,
        financialEntries: false,
      },
    });
  });

  describe('Clients', () => {
    it('should add a client', async () => {
      const store = useAppStore.getState();
      const clientData = { name: 'Test Client', email: 'test@example.com', phone: '123456789' };
      
      await store.addClient(clientData, 'test-user');
      
      expect(store.clients).toHaveLength(1);
      expect(store.clients[0].name).toBe('Test Client');
    });

    it('should update a client', async () => {
      const store = useAppStore.getState();
      
      // First add a client
      await store.addClient({ name: 'Test Client', email: 'test@example.com', phone: '123456789' }, 'test-user');
      
      const client = store.clients[0];
      const updatedClient = { ...client, name: 'Updated Client' };
      
      await store.updateClient(updatedClient);
      
      expect(store.clients[0].name).toBe('Updated Client');
    });

    it('should delete a client', async () => {
      const store = useAppStore.getState();
      
      // First add a client
      await store.addClient({ name: 'Test Client', email: 'test@example.com', phone: '123456789' }, 'test-user');
      
      const clientId = store.clients[0].id!;
      await store.deleteClient(clientId);
      
      expect(store.clients).toHaveLength(0);
    });
  });

  describe('Loading States', () => {
    it('should set loading state correctly', () => {
      const store = useAppStore.getState();
      
      store.setLoading('clients', true);
      expect(store.loading.clients).toBe(true);
      
      store.setLoading('clients', false);
      expect(store.loading.clients).toBe(false);
    });
  });
});
