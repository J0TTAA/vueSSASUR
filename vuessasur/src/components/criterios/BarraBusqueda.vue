<template>
  <v-row class="mb-2">
    <v-col cols="12" sm="3">
      <v-text-field
        label="Buscar Especialidad"
        :model-value="filters.searchEspecialidad"
        @update:model-value="handleFilterChange('searchEspecialidad', $event)"
        variant="outlined"
        density="compact"
        clearable
      />
    </v-col>

    <v-col cols="12" sm="3">
      <v-text-field
        label="Buscar Patología"
        :model-value="filters.searchPatologia"
        @update:model-value="handleFilterChange('searchPatologia', $event)"
        variant="outlined"
        density="compact"
        clearable
      />
    </v-col>

    <v-col cols="12" sm="3">
      <v-select
        label="Filtrar Especialidades"
        :items="['Todas', ...especialidades]"
        :model-value="filters.selectedEspecialidades[0] || 'Todas'"
        @update:model-value="handleFilterChange('selectedEspecialidades', [$event === 'Todas' ? '' : $event])"
        variant="outlined"
        density="compact"
        clearable
      />
    </v-col>

    <v-col cols="12" sm="3">
      <v-select
        label="Filtrar Patologías"
        :items="['Todas', ...patologias]"
        :model-value="filters.selectedPatologias[0] || 'Todas'"
        @update:model-value="handleFilterChange('selectedPatologias', [$event === 'Todas' ? '' : $event])"
        variant="outlined"
        density="compact"
        clearable
        :disabled="!patologias.length"
      />
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  handleFilterChange: {
    type: Function,
    default: () => {}
  },
  especialidades: {
    type: Array,
    default: () => []
  },
  patologias: {
    type: Array,
    default: () => []
  }
});
</script>
