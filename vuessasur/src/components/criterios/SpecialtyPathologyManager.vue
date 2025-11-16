<script setup>
import { computed, reactive, ref, watch } from 'vue';

const props = defineProps({
  specialties: {
    type: Array,
    default: () => []
  },
  pathologies: {
    type: Array,
    default: () => []
  },
  initialAssignments: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['create-specialty', 'save']);

const normalizedSpecialties = computed(() =>
  (props.specialties || []).map((specialty) => ({
    id: specialty?.id ?? String(specialty?.name ?? ''),
    name: specialty?.name ?? specialty?.nombre ?? '',
    original: specialty
  }))
);

const selectedSpecialty = ref(null);
const assignments = reactive({});

const synchronizeAssignments = (source) => {
  Object.keys(assignments).forEach((key) => {
    delete assignments[key];
  });
  Object.entries(source || {}).forEach(([key, value]) => {
    assignments[key] = Array.isArray(value) ? [...new Set(value)] : [];
  });
};

synchronizeAssignments(props.initialAssignments);

watch(
  () => props.initialAssignments,
  (value) => {
    synchronizeAssignments(value || {});
  },
  { deep: true }
);

watch(
  normalizedSpecialties,
  (list) => {
    if (!list || list.length === 0) {
      selectedSpecialty.value = null;
      return;
    }
    if (!selectedSpecialty.value || !list.some((item) => item.id === selectedSpecialty.value)) {
      selectedSpecialty.value = list[0].id;
    }
  },
  { immediate: true }
);

const selectedSpecialtyName = computed(() => {
  if (!selectedSpecialty.value) return 'ninguna';
  const match = props.specialties.find((s) => s.id === selectedSpecialty.value);
  return match?.name ?? match?.nombre ?? 'ninguna';
});

const assignedPathologies = computed(() => {
  if (!selectedSpecialty.value) return [];
  const ids = assignments[selectedSpecialty.value] || [];
  return props.pathologies.filter((path) => ids.includes(path.id));
});

const availablePathologies = computed(() => {
  if (!selectedSpecialty.value) return props.pathologies;
  const ids = new Set(assignments[selectedSpecialty.value] || []);
  return props.pathologies.filter((path) => !ids.has(path.id));
});

const assignPathology = (path) => {
  if (!selectedSpecialty.value) return;
  const list = assignments[selectedSpecialty.value] || [];
  if (!list.includes(path.id)) {
    assignments[selectedSpecialty.value] = [...list, path.id];
  }
};

const removePathology = (path) => {
  if (!selectedSpecialty.value) return;
  const list = assignments[selectedSpecialty.value] || [];
    assignments[selectedSpecialty.value] = list.filter((id) => id !== path.id);
};

const handleCreateSpecialty = () => {
  emit('create-specialty');
};

const handleSave = () => {
  emit('save', JSON.parse(JSON.stringify(assignments)));
};
</script>

<template>
  <v-card class="pa-4" outlined>
    <v-row class="g-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedSpecialty"
          :items="normalizedSpecialties"
          label="Seleccionar Especialidad"
          item-title="name"
          item-value="id"
          :menu-props="{ maxHeight: 320 }"
          density="comfortable"
          variant="outlined"
          :loading="loading"
          :disabled="loading || !normalizedSpecialties.length"
          hide-details="auto"
        />
        <v-btn class="mt-3" color="primary" block @click="handleCreateSpecialty">
          Crear Nueva Especialidad
        </v-btn>
      </v-col>

      <v-col cols="12" md="4">
        <div class="list-container">
          <v-list density="compact" class="pa-0">
          <v-subheader>Patologías disponibles</v-subheader>
          <v-list-item
            v-for="path in availablePathologies"
            :key="path.id"
            @click="assignPathology(path)"
            class="hoverable"
          >
            <v-list-item-title>{{ path.name }}</v-list-item-title>
            <v-spacer />
            <v-icon color="success">mdi-plus</v-icon>
          </v-list-item>
          <v-list-item v-if="!availablePathologies.length">
            <v-list-item-title class="text-grey">
              No hay patologías disponibles
            </v-list-item-title>
          </v-list-item>
          </v-list>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="list-container">
          <v-list density="compact" class="pa-0">
          <v-subheader>Patologías asignadas a {{ selectedSpecialtyName }}</v-subheader>
          <v-list-item
            v-for="path in assignedPathologies"
            :key="path.id"
            @click="removePathology(path)"
            class="hoverable"
          >
            <v-list-item-title>{{ path.name }}</v-list-item-title>
            <v-spacer />
            <v-icon color="error">mdi-close</v-icon>
          </v-list-item>
          <v-list-item v-if="!assignedPathologies.length">
            <v-list-item-title class="text-grey">
              No hay patologías asignadas
            </v-list-item-title>
          </v-list-item>
          </v-list>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row justify="end">
      <v-btn color="primary" :loading="saving" :disabled="saving || loading" @click="handleSave">
        Guardar Cambios
      </v-btn>
    </v-row>
  </v-card>
</template>

<style scoped>
.hoverable:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.list-container {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
}
</style>

