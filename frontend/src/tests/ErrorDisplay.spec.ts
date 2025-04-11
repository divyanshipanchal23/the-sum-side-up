import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import ErrorDisplay from '../components/ErrorDisplay.vue';

describe('ErrorDisplay Component', () => {
  const renderComponent = (props = {}) => {
    return render(ErrorDisplay, {
      props: {
        error: 'Test error message',
        canRetry: false,
        ...props
      }
    });
  };

  it('renders the error message', () => {
    renderComponent();
    
    // Check that the component renders
    expect(screen.getByText('Test error message')).toBeDefined();
  });

  it('does not render any content when error is null', () => {
    const { container } = renderComponent({ error: null });
    
    // Check that the error message is not in the document
    expect(screen.queryByText('Test error message')).toBeNull();
    
    // With Vue's v-if, a comment node is left, but no visible content
    expect(container.textContent).toBe('');
  });

  it('shows the retry button when canRetry is true', () => {
    renderComponent({ canRetry: true });
    
    // Check that the retry button is rendered
    expect(screen.getByText('Try Again')).toBeDefined();
  });

  it('does not show the retry button when canRetry is false', () => {
    renderComponent({ canRetry: false });
    
    // Check that the retry button is not rendered
    expect(screen.queryByText('Try Again')).toBeNull();
  });

  it('emits retry event when retry button is clicked', async () => {
    const { emitted } = renderComponent({ canRetry: true });
    
    // Click the retry button
    await fireEvent.click(screen.getByText('Try Again'));
    
    // Check that the retry event was emitted
    expect(emitted().retry).toBeTruthy();
    expect(emitted().retry.length).toBe(1);
  });

  it('emits dismiss event when dismiss button is clicked', async () => {
    const { emitted } = renderComponent();
    
    // Click the dismiss button (it has an sr-only text "Dismiss")
    await fireEvent.click(screen.getByText('Dismiss'));
    
    // Check that the dismiss event was emitted
    expect(emitted().dismiss).toBeTruthy();
    expect(emitted().dismiss.length).toBe(1);
  });
}); 