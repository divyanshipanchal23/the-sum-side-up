import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import BalanceScale from '../components/BalanceScale.vue';

describe('BalanceScale Component', () => {
  const renderComponent = (props = {}) => {
    return render(BalanceScale, {
      props: {
        leftValue: 5,
        rightValue: 5,
        showFeedback: true,
        ...props
      }
    });
  };

  it('renders correctly with balanced values', () => {
    renderComponent();
    
    // Check that the component renders with proper accessibility attributes
    const scaleElement = screen.getByRole('img');
    expect(scaleElement).toBeDefined();
    expect(scaleElement.getAttribute('aria-label')).toContain('Balance scale with 5 on the left side and 5 on the right side');
    expect(scaleElement.getAttribute('aria-label')).toContain('The scale is balanced');
    
    // Check for balanced text when values are equal
    expect(screen.getByText('The scale is balanced!')).toBeDefined();
  });

  it('shows left side heavier when leftValue > rightValue', () => {
    renderComponent({ leftValue: 8, rightValue: 5 });
    
    // Check accessibility label
    const scaleElement = screen.getByRole('img');
    expect(scaleElement.getAttribute('aria-label')).toContain('The scale is tilted to the left');
    
    // Check for feedback text
    expect(screen.getByText('Left side is heavier')).toBeDefined();
  });

  it('shows right side heavier when leftValue < rightValue', () => {
    renderComponent({ leftValue: 3, rightValue: 5 });
    
    // Check accessibility label
    const scaleElement = screen.getByRole('img');
    expect(scaleElement.getAttribute('aria-label')).toContain('The scale is tilted to the right');
    
    // Check for feedback text
    expect(screen.getByText('Right side is heavier')).toBeDefined();
  });

  it('does not show feedback when showFeedback is false', () => {
    renderComponent({ showFeedback: false });
    
    // Feedback should not be visible
    expect(screen.queryByText('The scale is balanced!')).toBeNull();
  });

  it('renders custom content in slots', () => {
    const { container } = render(BalanceScale, {
      props: {
        leftValue: 10, 
        rightValue: 10
      },
      slots: {
        'left-content': '<div data-testid="custom-left">Custom Left</div>',
        'right-content': '<div data-testid="custom-right">Custom Right</div>'
      }
    });
    
    // Check that the custom content is rendered
    expect(screen.getByTestId('custom-left')).toBeDefined();
    expect(screen.getByTestId('custom-right')).toBeDefined();
    expect(screen.getByText('Custom Left')).toBeDefined();
    expect(screen.getByText('Custom Right')).toBeDefined();
  });

  it('provides screen reader only text for accessibility', () => {
    renderComponent();
    
    // Find the sr-only element containing balance state description
    const srElement = screen.getByText('The scale is balanced. 5 equals 5.');
    
    // Verify it has sr-only class
    expect(srElement.classList.contains('sr-only')).toBe(true);
  });
}); 