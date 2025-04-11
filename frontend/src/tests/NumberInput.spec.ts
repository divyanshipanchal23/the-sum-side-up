import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import NumberInput from '../components/NumberInput.vue';

describe('NumberInput Component', () => {
  const renderComponent = (props = {}) => {
    return render(NumberInput, {
      props: {
        modelValue: 5,
        min: 0,
        max: 10,
        ...props
      }
    });
  };

  it('renders correctly with default props', () => {
    renderComponent();
    const input = screen.getByRole('spinbutton');
    expect(input).toBeDefined();
    expect(input.value).toBe('5');
  });

  it('updates value when typing', async () => {
    const { emitted } = renderComponent();
    const input = screen.getByRole('spinbutton');
    
    // Clear the input and type a new value
    await fireEvent.update(input, '7');
    
    // Check that the modelValue was emitted
    expect(emitted()['update:modelValue']).toBeTruthy();
    
    // Get the last emitted value
    const lastEmittedValue = emitted()['update:modelValue'][emitted()['update:modelValue'].length - 1];
    expect(lastEmittedValue[0]).toBe(7);
  });

  it('prevents values outside min/max range', async () => {
    const { emitted } = renderComponent({ min: 1, max: 10 });
    const input = screen.getByRole('spinbutton');
    
    // Try to set a value below the minimum
    await fireEvent.update(input, '0');
    
    // Get the last emitted value for the minimum test
    const minEmittedValue = emitted()['update:modelValue'][emitted()['update:modelValue'].length - 1];
    expect(minEmittedValue[0]).toBe(1); // Should be constrained to min=1
    
    // Try to set a value above the maximum
    await fireEvent.update(input, '20');
    
    // Get the last emitted value for the maximum test
    const maxEmittedValue = emitted()['update:modelValue'][emitted()['update:modelValue'].length - 1];
    expect(maxEmittedValue[0]).toBe(10); // Should be constrained to max=10
  });

  it('displays the label when provided', () => {
    renderComponent({ label: 'Test Label' });
    expect(screen.getByText('Test Label')).toBeDefined();
  });

  it('renders increment/decrement buttons when showNumberButtons is true', () => {
    renderComponent({ showNumberButtons: true });
    expect(screen.getByLabelText('Increase value')).toBeDefined();
    expect(screen.getByLabelText('Decrease value')).toBeDefined();
  });

  it('increments value when clicking the increment button', async () => {
    const { emitted } = renderComponent({ showNumberButtons: true, modelValue: 5 });
    const incrementButton = screen.getByLabelText('Increase value');
    
    await fireEvent.click(incrementButton);
    
    // Get the last emitted value
    const lastEmittedValue = emitted()['update:modelValue'][emitted()['update:modelValue'].length - 1];
    expect(lastEmittedValue[0]).toBe(6);
  });

  it('decrements value when clicking the decrement button', async () => {
    const { emitted } = renderComponent({ showNumberButtons: true, modelValue: 5 });
    const decrementButton = screen.getByLabelText('Decrease value');
    
    await fireEvent.click(decrementButton);
    
    // Get the last emitted value
    const lastEmittedValue = emitted()['update:modelValue'][emitted()['update:modelValue'].length - 1];
    expect(lastEmittedValue[0]).toBe(4);
  });

  it('disables increment button at max value', async () => {
    renderComponent({ showNumberButtons: true, modelValue: 10, max: 10 });
    const incrementButton = screen.getByLabelText('Increase value');
    
    // Check if the disabled attribute exists
    expect(incrementButton.hasAttribute('disabled')).toBe(true);
  });

  it('disables decrement button at min value', async () => {
    renderComponent({ showNumberButtons: true, modelValue: 0, min: 0 });
    const decrementButton = screen.getByLabelText('Decrease value');
    
    // Check if the disabled attribute exists
    expect(decrementButton.hasAttribute('disabled')).toBe(true);
  });
}); 