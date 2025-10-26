<script setup>
import { ref } from 'vue';

// 1. Importamos los componentes de Vue que creamos
import BarraBusqueda from '../components/criterios/BarraBusqueda.vue';
import TablaCriterios from '../components/criterios/TablaCriterios.vue';
import ModalCrearPatologia from '../components/criterios/ModalCrearPatologia.vue';

// 2. Definimos los 'estados' (refs) que la plantilla necesita para mostrarse.
// (Estos reemplazarían tus 'useState' de React. Los llenamos con datos de ejemplo).

const formData = ref({
  id: '',
  especialidad: '',
  patologia: '',
  criteriosDerivacion: '',
  examenesPrevios: '',
  observaciones: ''
});

const openModal = ref(false);

const especialidades = ref([
  'CARDIOLOGIA', 'DERMATOLOGIA', 'GINECOLOGIA', 'TRAUMATOLOGIA'
]);

const patologias = ref([
  'INSUFICIENCIA CARDIACA', 'PSORIASIS', 'VPH'
]);

const filters = ref({
  searchEspecialidad: '',
  searchPatologia: '',
  selectedEspecialidades: [],
  selectedPatologias: []
});

const newPatologiaData = ref({
  especialidad: '',
  patologia: '',
  criteriosDerivacion: '',
  examenesPrevios: '',
  observaciones: ''
});

const allCriterios = ref([
  { id: 1, especialidad: 'CARDIOLOGIA', patologia: 'INSUFICIENCIA CARDIACA', criteriosDerivacion: 'Dolor torácico persistente, disnea de esfuerzo, edema de miembros inferiores', examenesPrevios: 'ECG, Radiografía de tórax, Ecocardiograma', observaciones: 'Derivar con urgencia si hay signos de descompensación' },
  { id: 2, especialidad: 'DERMATOLOGIA', patologia: 'PSORIASIS', criteriosDerivacion: 'Lesiones cutáneas extensas, afectación articular, falta de respuesta al tratamiento tópico', examenesPrevios: 'Biopsia de piel, Hemograma completo', observaciones: 'Considerar tratamiento sistémico si afecta más del 10% de la superficie corporal' },
  { id: 3, especialidad: 'GINECOLOGIA', patologia: 'VPH', criteriosDerivacion: 'Lesiones cervicales de alto grado, VPH de alto riesgo persistente', examenesPrevios: 'Papanicolaou, Colposcopia, Biopsia cervical', observaciones: 'Seguimiento estricto cada 6 meses' }
]);

const filteredCriterios = ref([...allCriterios.value]);

// 3. Funciones de manejo y lógica de negocio
const handleFilterChange = (key, value) => {
  filters.value[key] = value;
  applyFilters();
};

const applyFilters = () => {
  let filtered = [...allCriterios.value];

  if (filters.value.searchEspecialidad) {
    filtered = filtered.filter(criterio =>
      criterio.especialidad.toLowerCase().includes(filters.value.searchEspecialidad.toLowerCase())
    );
  }

  if (filters.value.searchPatologia) {
    filtered = filtered.filter(criterio =>
      criterio.patologia.toLowerCase().includes(filters.value.searchPatologia.toLowerCase())
    );
  }

  if (filters.value.selectedEspecialidades.length > 0 && filters.value.selectedEspecialidades[0]) {
    filtered = filtered.filter(criterio =>
      filters.value.selectedEspecialidades.includes(criterio.especialidad)
    );
  }

  if (filters.value.selectedPatologias.length > 0 && filters.value.selectedPatologias[0]) {
    filtered = filtered.filter(criterio =>
      filters.value.selectedPatologias.includes(criterio.patologia)
    );
  }

  filteredCriterios.value = filtered;
};

const handleCreateCriterio = () => {
  if (!formData.value.patologia) {
    alert('Por favor seleccione una patología');
    return;
  }

  const newCriterio = {
    id: Date.now(),
    especialidad: formData.value.especialidad,
    patologia: formData.value.patologia,
    criteriosDerivacion: formData.value.criteriosDerivacion,
    examenesPrevios: formData.value.examenesPrevios,
    observaciones: formData.value.observaciones
  };

  allCriterios.value.push(newCriterio);
  filteredCriterios.value.push(newCriterio);

  // Limpiar formulario
  formData.value = {
    id: '',
    especialidad: '',
    patologia: '',
    criteriosDerivacion: '',
    examenesPrevios: '',
    observaciones: ''
  };

  alert('Criterio creado exitosamente');
};

const handleCreatePatologia = () => {
  if (!newPatologiaData.value.especialidad || !newPatologiaData.value.patologia) {
    alert('Por favor complete todos los campos obligatorios');
    return;
  }

  // Agregar nueva patología a la lista
  if (!patologias.value.includes(newPatologiaData.value.patologia)) {
    patologias.value.push(newPatologiaData.value.patologia);
  }

  // Crear criterio automáticamente
  const newCriterio = {
    id: Date.now(),
    especialidad: newPatologiaData.value.especialidad,
    patologia: newPatologiaData.value.patologia,
    criteriosDerivacion: newPatologiaData.value.criteriosDerivacion,
    examenesPrevios: newPatologiaData.value.examenesPrevios,
    observaciones: newPatologiaData.value.observaciones
  };

  allCriterios.value.push(newCriterio);
  filteredCriterios.value.push(newCriterio);

  // Limpiar datos del modal
  newPatologiaData.value = {
    especialidad: '',
    patologia: '',
    criteriosDerivacion: '',
    examenesPrevios: '',
    observaciones: ''
  };

  openModal.value = false;
  alert('Patología y criterio creados exitosamente');
};

const handlePatologiaDataChange = (key, value) => {
  newPatologiaData.value[key] = value;
};

const handleEditCriterio = (criterio) => {
  formData.value = { ...criterio };
  // Scroll to top of form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDeleteCriterio = (id) => {
  const index = allCriterios.value.findIndex(c => c.id === id);
  if (index > -1) {
    allCriterios.value.splice(index, 1);
    applyFilters(); // Reaplicar filtros para actualizar la vista
    alert('Criterio eliminado exitosamente');
  }
};
</script>

<template>
  <v-container fluid style="max-width: 1200px;">

    <v-sheet style="margin-bottom: 100px; margin-top: 60px;">

      <h1 class="text-h4 mb-4">
        Gestión de Criterios de Derivación
      </h1>

      <v-sheet class="mb-10">
        <v-row>

          <v-col cols="12" sm="4">
            <v-sheet>
              <v-select
                label="Especialidad"
                :items="especialidades"
                v-model="formData.especialidad"
                variant="outlined"
                placeholder="Seleccione una Especialidad"
                class="mb-4"
              />
              <v-select
                label="Patología"
                :items="patologias"
                v-model="formData.patologia"
                variant="outlined"
                placeholder="Seleccione una Patología"
                :disabled="!formData.especialidad"
              />

              <v-btn
                color="primary"
                block
                class="mt-4"
                @click="openModal = true"
              >
                Crear Patología
              </v-btn>
            </v-sheet>
          </v-col>

          <v-col cols="12" sm="8">
            <v-form>
              <v-textarea
                label="Criterios de Derivación"
                rows="3"
                v-model="formData.criteriosDerivacion"
                variant="outlined"
                class="mb-4"
              />
              <v-textarea
                label="Exámenes Previos"
                rows="3"
                v-model="formData.examenesPrevios"
                variant="outlined"
                class="mb-4"
              />
              <v-textarea
                label="Observaciones"
                rows="3"
                v-model="formData.observaciones"
                variant="outlined"
              />

              <v-btn
                type="button"
                :color="formData.id ? 'secondary' : 'primary'"
                block
                class="mt-4"
                :disabled="!formData.patologia"
                @click="handleCreateCriterio"
              >
                {{ formData.id ? 'Actualizar Criterio' : 'Crear Criterio' }}
              </v-btn>
            </v-form>
          </v-col>

        </v-row>
      </v-sheet>

      <ModalCrearPatologia
        v-model="openModal"
        :especialidades="especialidades"
        :newPatologiaData="newPatologiaData"
        :onCreate="handleCreatePatologia"
        :handleChange="handlePatologiaDataChange"
      />
    </v-sheet>

    <v-sheet class="mb-10">
      <BarraBusqueda
        :filters="filters"
        :especialidades="especialidades"
        :patologias="patologias"
        :handleFilterChange="handleFilterChange"
      />
    </v-sheet>

    <TablaCriterios
      :criterios="filteredCriterios"
      @edit="handleEditCriterio"
      @delete="handleDeleteCriterio"
    />

  </v-container>
</template>

<style scoped>
/* Los márgenes 'normal' de MUI se traducen bien con clases como mb-4 */
.mb-4 {
  margin-bottom: 16px;
}
</style>1
