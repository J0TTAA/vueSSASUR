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
  'CARDIOLOGIA', 'DERMATOLOGIA', 'GINECOLOGIA', 'TRAUMATOLOGIA'
]);
const selectedEspecialidad = ref('');

const ubicaciones = ref([
  { id: '1', name: 'Hospital Regional de Temuco' },
  { id: '2', name: 'CESFAM Pedro de Valdivia' },
  { id: '3', name: 'Clínica Alemana de Temuco' }
]);
const selectedUbicacionId = ref(null);

const especialidadesPorUbicacion = ref([
  'Especialidad de Ejemplo 1', 'Especialidad de Ejemplo 2'
]);

// Coordenadas de Temuco para el ejemplo del mapa
const selectedLocation = ref({
  latitude: -38.7359,
  longitude: -72.5904,
  name: "Hospital Regional de Temuco (Ejemplo)"
});

// El zoom inicial del mapa
const zoom = ref(15);
</script>

<template>
  <v-container style="max-width: 90%; width: 1200px;" class="pa-3">
    
    <h1 class="text-h4 mb-4">
      Especialidades de Servicios de Salud
    </h1>

    <v-row>
      <v-col cols="12" md="6">
        <v-select
          label="Seleccionar Especialidad"
          v-model="selectedEspecialidad"
          :items="especialidades"
          variant="outlined"
          placeholder="--Seleccione--"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-select
          label="Seleccionar Ubicación"
          v-model="selectedUbicacionId"
          :items="ubicaciones"
          item-title="name"
          item-value="id"
          variant="outlined"
          placeholder="--Seleccione--"
        />
      </v-col>
    </v-row>

    <h2 class="text-h5 mt-6">
      Especialidades por Ubicación:
    </h2>

    <div v-if="especialidadesPorUbicacion.length > 0">
      <ul>
        <li v-for="(especialidad, index) in especialidadesPorUbicacion" :key="index">
          {{ especialidad }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p class="text-body-1">No hay especialidades para esta ubicación.</p>
    </div>

    <div v-if="selectedLocation" class="map-container mt-5">
      <l-map
        :use-global-leaflet="false"
        v-model:zoom="zoom"
        :center="[selectedLocation.latitude, selectedLocation.longitude]"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <l-marker :lat-lng="[selectedLocation.latitude, selectedLocation.longitude]">
          <l-popup>{{ selectedLocation.name }}</l-popup>
        </l-marker>
      </l-map>
    </div>

  </v-container>
</template>

<style scoped>
/* Damos altura al contenedor del mapa (React lo hacía en línea) */
.map-container {
  height: 600px;
  width: 100%;
}
</style>