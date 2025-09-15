import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from '../react-app/components/ConfirmationModal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Title',
    message: 'Test message',
  };

  it('should render when open', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = vi.fn();
    render(<ConfirmationModal {...defaultProps} onConfirm={mockOnConfirm} />);
    
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<ConfirmationModal {...defaultProps} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    const mockOnClose = vi.fn();
    render(<ConfirmationModal {...defaultProps} onClose={mockOnClose} />);
    
    const backdrop = screen.getByRole('generic');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render different variants correctly', () => {
    render(<ConfirmationModal {...defaultProps} variant="danger" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    
    render(<ConfirmationModal {...defaultProps} variant="warning" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    
    render(<ConfirmationModal {...defaultProps} variant="info" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Processando...')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByRole('button', { name: /processando/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should use custom button text', () => {
    render(
      <ConfirmationModal 
        {...defaultProps} 
        confirmText="Delete" 
        cancelText="Cancel" 
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
