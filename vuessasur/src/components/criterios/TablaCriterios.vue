<template>
  <v-card class="mt-2" style="width: 100%; overflow-x: auto;">
    <v-card-title class="text-h6">
      Criterios de Derivación ({{ criterios.length }} registros)
    </v-card-title>

    <v-table fixed-header height="400px">
      <thead>
        <tr>
          <th class="font-weight-bold">Especialidad</th>
          <th class="font-weight-bold">Patología</th>
          <th class="font-weight-bold">Criterios de Derivación</th>
          <th class="font-weight-bold">Exámenes Previos</th>
          <th class="font-weight-bold">Observaciones</th>
          <th class="font-weight-bold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="criterio in criterios" :key="criterio.id">
          <td>{{ criterio.especialidad }}</td>
          <td>{{ criterio.patologia }}</td>
          <td class="text-truncate" style="max-width: 200px;" :title="criterio.criteriosDerivacion">
            {{ criterio.criteriosDerivacion || 'N/A' }}
          </td>
          <td class="text-truncate" style="max-width: 200px;" :title="criterio.examenesPrevios">
            {{ criterio.examenesPrevios || 'N/A' }}
          </td>
          <td class="text-truncate" style="max-width: 200px;" :title="criterio.observaciones">
            {{ criterio.observaciones || 'N/A' }}
          </td>
          <td>
            <v-btn
              size="small"
              color="primary"
              variant="text"
              @click="editCriterio(criterio)"
            >
              Editar
            </v-btn>
            <v-btn
              size="small"
              color="error"
              variant="text"
              @click="deleteCriterio(criterio.id)"
            >
              Eliminar
            </v-btn>
          </td>
        </tr>
        <tr v-if="criterios.length === 0">
          <td colspan="6" class="text-center text-grey">
            No hay criterios registrados
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
defineProps({
  criterios: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['edit', 'delete']);

const editCriterio = (criterio) => {
  emit('edit', criterio);
};

const deleteCriterio = (id) => {
  if (confirm('¿Está seguro de que desea eliminar este criterio?')) {
    emit('delete', id);
  }
};
</script>
