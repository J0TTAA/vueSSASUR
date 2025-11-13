<template>
  <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        Crear Nueva Patología y Criterio
      </v-card-title>
      <v-card-text>
        <!-- ¡CORREGIDO AQUÍ! Propiedades item-title/value y return-object -->
        <v-select
          label="Especialidad"
          :items="especialidades"
          item-title="nombre"
          item-value="id"
          :model-value="newPatologiaData.especialidad"
          @update:modelValue="handleChange('especialidad', $event)"
          :return-object="true"
          variant="outlined"
          density="compact"
          class="mb-3"
          placeholder="Seleccione una Especialidad"
          required
        />
        <v-text-field
          label="Nombre Nueva Patología"
          :model-value="newPatologiaData.patologia"
          @update:modelValue="handleChange('patologia', $event)"
          variant="outlined"
          density="compact"
          class="mb-3"
          required
        />
        <v-textarea
          label="Criterios de Derivación"
          :model-value="newPatologiaData.criteriosDerivacion"
          @update:modelValue="handleChange('criteriosDerivacion', $event)"
          variant="outlined"
          density="compact"
          rows="3"
          class="mb-3"
        />
        <v-textarea
          label="Exámenes Previos"
          :model-value="newPatologiaData.examenesPrevios"
          @update:modelValue="handleChange('examenesPrevios', $event)"
          variant="outlined"
          density="compact"
          rows="3"
          class="mb-3"
        />
        <v-textarea
          label="Observaciones"
          :model-value="newPatologiaData.observaciones"
          @update:modelValue="handleChange('observaciones', $event)"
          variant="outlined"
          density="compact"
          rows="3"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="secondary" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="onCreate">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Definimos las props que este componente recibe
const props = defineProps({
  modelValue: Boolean, // Controla si el modal está abierto (usado por v-model)
  especialidades: { // La lista de objetos {id, nombre}
    type: Array,
    default: () => []
  },
  newPatologiaData: { // El objeto ref que contiene los datos del formulario del modal
    type: Object,
    default: () => ({
      especialidad: null,
      patologia: '',
      criteriosDerivacion: '',
      examenesPrevios: '',
      observaciones: ''
    })
  },
  onCreate: { // La función que se llama al hacer clic en Guardar
    type: Function,
    required: true
  },
  handleChange: { // La función para actualizar el objeto newPatologiaData
    type: Function,
    required: true
  }
});

// Definimos los eventos que este componente emite
const emit = defineEmits(['update:modelValue']);

</script>

<style scoped>
.mb-3 {
  margin-bottom: 12px;
}
</style>

