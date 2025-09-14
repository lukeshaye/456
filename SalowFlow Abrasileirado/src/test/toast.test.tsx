import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastComponent, ToastContainer } from '../react-app/components/Toast';
import type { Toast } from '../react-app/components/Toast';

describe('Toast Components', () => {
  describe('ToastComponent', () => {
    const mockToast: Toast = {
      id: '1',
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully',
    };

    it('should render toast with correct content', () => {
      const mockOnRemove = vi.fn();
      render(<ToastComponent toast={mockToast} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('should call onRemove when close button is clicked', () => {
      const mockOnRemove = vi.fn();
      render(<ToastComponent toast={mockToast} onRemove={mockOnRemove} />);
      
      const closeButton = screen.getByRole('button', { name: /fechar/i });
      fireEvent.click(closeButton);
      
      expect(mockOnRemove).toHaveBeenCalledWith('1');
    });

    it('should render different variants correctly', () => {
      const mockOnRemove = vi.fn();
      
      const errorToast: Toast = {
        id: '2',
        type: 'error',
        title: 'Error!',
        message: 'Something went wrong',
      };
      
      render(<ToastComponent toast={errorToast} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('ToastContainer', () => {
    it('should render multiple toasts', () => {
      const mockToasts: Toast[] = [
        {
          id: '1',
          type: 'success',
          title: 'Success!',
          message: 'First toast',
        },
        {
          id: '2',
          type: 'error',
          title: 'Error!',
          message: 'Second toast',
        },
      ];
      
      const mockOnRemove = vi.fn();
      render(<ToastContainer toasts={mockToasts} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();
    });

    it('should render empty container when no toasts', () => {
      const mockOnRemove = vi.fn();
      render(<ToastContainer toasts={[]} onRemove={mockOnRemove} />);
      
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });
  });
});
