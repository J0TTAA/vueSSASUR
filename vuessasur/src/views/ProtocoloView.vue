<script setup>
import { ref } from 'vue';

// 1. Importa los componentes de vue-leaflet
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
} from "@vue-leaflet/vue-leaflet";

// 2. Importa el CSS de Leaflet (¡Importante!)
import "leaflet/dist/leaflet.css";

// 3. Reemplazos de 'useState' con datos de ejemplo
const especialidades = ref([
  'CARDIOLOGIA', 'DERMATOLOGIA', 'GINECOLOGIA'
]);
const patologias = ref([
  { id: 1, text: 'Patología A (Cardio)' },
  { id: 2, text: 'Patología B (Cardio)' }
]);

const selectedEspecialidad = ref('');
const selectedPatologia = ref(''); // En React esto era un ID

const criterioInfo = ref(null); // Se mantiene null para mostrar el texto por defecto

// Datos de ejemplo para el mapa
const ubicaciones = ref([
  { id: '1', name: 'Hospital Regional (Ejemplo)', latitude: -38.7359, longitude: -72.5904 },
  { id: '2', name: 'CESFAM (Ejemplo)', latitude: -38.7400, longitude: -72.6000 }
]);

const zoom = ref(13);

// NOTA: El 'L.Icon.Default' que estaba en React
// no es necesario con vue-leaflet y Vite.
</script>

<template>
  <v-container style="max-width: 1200px;" class="pa-2">
    
    <h2 class="text-h6">Criterios de Aceptación</h2>

    <v-row class="mt-4">
      <v-col cols="12" sm="6">
        <v-select
          label="Especialidad"
          v-model="selectedEspecialidad"
          :items="especialidades"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          label="Patología"
          v-model="selectedPatologia"
          :items="patologias"
          item-title="text"
          item-value="id"
          :disabled="!selectedEspecialidad"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" sm="6">
        <v-card variant="outlined">
          <v-card-text>
            <h3 class="text-h6 mb-2">Criterios de Derivación</h3>
            <p class="text-body-1">
              {{ criterioInfo ? criterioInfo.criterios : 'Seleccione una patología para ver detalles.' }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6">
        <v-card variant="outlined">
          <v-card-text>
            <h3 class="text-h6 mb-2">Exámenes Requeridos</h3>
            <p class="text-body-1">
              {{ criterioInfo ? criterioInfo.examenes : 'Seleccione una patología para ver detalles.' }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-text>
            <h3 class="text-h6 mb-2">Observaciones</h3>
            <p class="text-body-1">
              {{ criterioInfo ? criterioInfo.observaciones : 'Seleccione una patología para ver detalles.' }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-sheet v-if="selectedPatologia && ubicaciones.length > 0" class="mt-6 map-container">
      
      <l-map
        :use-global-leaflet="false"
        v-model:zoom="zoom"
        :center="[ubicaciones[0]?.latitude || -38.7364, ubicaciones[0]?.longitude || -72.5904]"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <template v-for="loc in ubicaciones" :key="loc.id">
          <l-marker
            v-if="loc.latitude && loc.longitude"
            :lat-lng="[loc.latitude, loc.longitude]"
          >
            <l-popup>{{ loc.name }}</l-popup>
          </l-marker>
        </template>

      </l-map>
    </v-sheet>

  </v-container>
</template>

<style scoped>
/* Damos altura al contenedor del mapa (React lo hacía en línea) */
.map-container {
  height: 400px;
  width: 100%;
}
</style>