<template>
  <div>
    <v-textarea
      label="Criterios de Derivación"
      name="criteriosDerivacion"
      :model-value="formData.criteriosDerivacion"
      @update:model-value="onChange"
      variant="outlined"
      rows="4"
      class="mb-4"
    />
    <v-textarea
      label="Exámenes Previos para Derivación"
      name="examenesPrevios"
      :model-value="formData.examenesPrevios"
      @update:model-value="onChange"
      variant="outlined"
      rows="4"
      class="mb-4"
    />
    <v-textarea
      label="Observaciones / Sugerencias Manejo APS"
      name="observaciones"
      :model-value="formData.observaciones"
      @update:model-value="onChange"
      variant="outlined"
      rows="4"
    />
  </div>
</template>

<script setup>
defineProps({
  formData: Object,
  onChange: Function // Asumimos que onChange maneja el evento
});
</script>
