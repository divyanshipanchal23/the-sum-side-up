<template>
  <div class="number-input-container">
    <div class="input-label" v-if="label">{{ label }}</div>
    
    <div class="input-controls">
      <button 
        @click="decrementValue" 
        class="control-button" 
        :disabled="modelValue <= min"
      >
        -
      </button>
      
      <input 
        type="number" 
        :value="modelValue" 
        @input="updateValue($event)"
        :min="min"
        :max="max"
        :step="step"
        class="number-field"
      />
      
      <button 
        @click="incrementValue" 
        class="control-button" 
        :disabled="modelValue >= max"
      >
        +
      </button>
    </div>
    
    <div v-if="showNumberButtons" class="quick-number-buttons">
      <button 
        v-for="num in quickNumbers" 
        :key="num" 
        @click="setValue(num)"
        class="quick-number-button"
        :class="{ 'selected': modelValue === num }"
      >
        {{ num }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: number;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  showNumberButtons?: boolean;
  quickNumbers?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  label: '',
  min: 0,
  max: 20,
  step: 1,
  showNumberButtons: false,
  quickNumbers: () => [1, 2, 3, 4, 5, 10]
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value);
  
  if (!isNaN(value)) {
    // Ensure the value is within the min/max bounds
    const boundedValue = Math.min(Math.max(value, props.min), props.max);
    console.log(`NumberInput: emitting update from ${props.modelValue} to ${boundedValue}`);
    emit('update:modelValue', boundedValue);
  }
};

const incrementValue = () => {
  if (props.modelValue < props.max) {
    const newValue = props.modelValue + props.step;
    console.log(`NumberInput: incrementing from ${props.modelValue} to ${newValue}`);
    emit('update:modelValue', newValue);
  }
};

const decrementValue = () => {
  if (props.modelValue > props.min) {
    const newValue = props.modelValue - props.step;
    console.log(`NumberInput: decrementing from ${props.modelValue} to ${newValue}`);
    emit('update:modelValue', newValue);
  }
};

const setValue = (value: number) => {
  console.log(`NumberInput: setting value from ${props.modelValue} to ${value}`);
  emit('update:modelValue', value);
};
</script>

<style scoped>
.number-input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
}

.input-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.input-controls {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.control-button {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #6366f1;
  color: white;
  font-size: 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-button:hover:not(:disabled) {
  background-color: #4f46e5;
}

.control-button:disabled {
  background-color: #c7d2fe;
  cursor: not-allowed;
}

.number-field {
  width: 80px;
  height: 40px;
  text-align: center;
  margin: 0 0.5rem;
  font-size: 1.2rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  outline: none;
}

.number-field:focus {
  border-color: #6366f1;
}

.quick-number-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.quick-number-button {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e5e7eb;
  color: #4b5563;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-number-button:hover {
  background-color: #d1d5db;
}

.quick-number-button.selected {
  background-color: #6366f1;
  color: white;
}
</style> 