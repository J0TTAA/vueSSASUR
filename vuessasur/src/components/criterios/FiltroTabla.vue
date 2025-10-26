<template>
  <v-sheet class="d-flex ga-2 pa-2" style="border-bottom: 2px solid #ddd;">

    <v-text-field
      label="Buscar Especialidad"
      variant="outlined"
      density="compact"
      hide-details
    />

    <v-text-field
      label="Buscar Patología"
      variant="outlined"
      density="compact"
      hide-details
    />

    <v-select
      label="Filtrar Especialidades"
      :items="especialidades"
      multiple
      chips
      closable-chips
      variant="outlined"
      density="compact"
      hide-details
      style="min-width: 200px;"
    />

    <v-select
      label="Filtrar Patologías"
      :items="filteredPatologias"
      multiple
      chips
      closable-chips
      variant="outlined"
      density="compact"
      hide-details
      style="min-width: 200px;"
    />

  </v-sheet>
</template>

<script setup>
// Declaramos las props que necesita el template
defineProps({
  especialidades: {
    type: Array,
    default: () => []
  },
  criterios: {
    type: Array,
    default: () => []
  },
  filteredPatologias: { // Asumimos que esta lógica ahora vive en el padre
    type: Array,
    default: () => []
  }
  // 'onFilterChange' se ignora por ahora
});

// La lógica de 'useEffect' se moverá al componente padre.
</script>
