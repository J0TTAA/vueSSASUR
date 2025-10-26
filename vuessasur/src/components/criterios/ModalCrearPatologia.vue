<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
  >
    <v-card>
      <v-card-title class="text-h5">
        Crear Nueva Patología
      </v-card-title>

      <v-card-text>
        <v-select
          label="Especialidad"
          :items="especialidades"
          :model-value="newPatologiaData.especialidad"
          @update:model-value="handleChange('especialidad', $event)"
          variant="outlined"
          class="mt-4"
        />
        <v-text-field
          label="Nombre de la Patología"
          :model-value="newPatologiaData.patologia"
          @update:model-value="handleChange('patologia', $event)"
          variant="outlined"
          class="mt-4"
        />
        <v-textarea
          label="Criterios de Derivación"
          rows="3"
          :model-value="newPatologiaData.criteriosDerivacion"
          @update:model-value="handleChange('criteriosDerivacion', $event)"
          variant="outlined"
          class="mt-4"
        />
        <v-textarea
          label="Exámenes Previos"
          rows="3"
          :model-value="newPatologiaData.examenesPrevios"
          @update:model-value="handleChange('examenesPrevios', $event)"
          variant="outlined"
          class="mt-4"
        />
        <v-textarea
          label="Observaciones"
          rows="3"
          :model-value="newPatologiaData.observaciones"
          @update:model-value="handleChange('observaciones', $event)"
          variant="outlined"
          class="mt-4"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text @click="$emit('update:modelValue', false)">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="flat" @click="handleCreate">
          Crear Patología
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  onCreate: Function,
  especialidades: Array,
  newPatologiaData: Object,
  handleChange: Function
});

defineEmits(['update:modelValue']);

const handleCreate = () => {
  if (props.onCreate) {
    props.onCreate();
  }
};
</script>
