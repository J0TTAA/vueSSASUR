<script setup>
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';

// 1. Importa los componentes de vue-leaflet
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
} from "@vue-leaflet/vue-leaflet";

// 2. Importa el CSS de Leaflet (¡Importante!)
import "leaflet/dist/leaflet.css";

// 3. Configuración del icono del marcador (igual que en React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// 4. URL base del servidor FHIR
const FHIR_BASE_URL = 'http://10.66.153.179:8080/fhir';

// 5. Estados reactivos
const especialidades = ref([]);
const selectedEspecialidad = ref('');
const ubicaciones = ref([]);
const selectedUbicacionId = ref(null);
const especialidadesPorUbicacion = ref([]);
const selectedLocation = ref(null);
const zoom = ref(15);

/**
 * Extrae los IDs de ubicaciones de un JSON de servicios filtrados.
 * @param {string} json - El JSON que contiene los servicios filtrados.
 * @returns {Array<string>} - Un arreglo de IDs de ubicaciones.
 */
const extraerIdsDeUbicaciones = (json) => {
  const regex = /Location\/(\d+)/g;
  let match;
  const ids = [];
  while ((match = regex.exec(json)) !== null) {
    ids.push(match[1]);
  }
  return ids;
};

/**
 * Obtiene los detalles de las ubicaciones mediante sus IDs.
 * @param {Array<string>} ids - Arreglo de IDs de ubicaciones.
 * @returns {Promise<Array>} - Una promesa con los detalles de las ubicaciones.
 */
const obtenerUbicacionesPorIds = async (ids) => {
  const ubicacionesPromises = ids.map(async (id) => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/Location/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error obteniendo ubicación ${id}:`, error);
      return null;
    }
  });

  const ubicacionesResultados = await Promise.all(ubicacionesPromises);
  return ubicacionesResultados.filter(Boolean);
};

/**
 * Obtiene las especialidades desde HealthcareService
 */
const fetchEspecialidades = async () => {
  try {
    const response = await fetch(`${FHIR_BASE_URL}/HealthcareService`);
    const data = await response.json();
    const servicios = data.entry || [];

    // Extrae especialidades únicas de los servicios de salud
    const especialidadesUnicas = [...new Set(
      servicios.map(item => item.resource.specialty?.[0]?.coding?.[0]?.display).filter(Boolean)
    )];
    especialidades.value = especialidadesUnicas;
  } catch (error) {
    console.error('Error fetching especialidades:', error);
  }
};

/**
 * Obtiene las ubicaciones iniciales desde Location
 */
const fetchUbicaciones = async () => {
  try {
    const response = await fetch(`${FHIR_BASE_URL}/Location`);
    const data = await response.json();
    const ubicacionesData = data.entry || [];

    // Mapea las ubicaciones para obtener el id y nombre
    const ubicacionesMapeadas = ubicacionesData.map(item => ({
      id: item.resource.id,
      name: item.resource.name || 'Nombre no disponible',
    }));
    ubicaciones.value = ubicacionesMapeadas;
  } catch (error) {
    console.error('Error fetching ubicaciones:', error);
  }
};

/**
 * Maneja el cambio de especialidad seleccionada.
 * Filtra los servicios de salud por la especialidad seleccionada
 * y obtiene las ubicaciones asociadas.
 */
const handleEspecialidadChange = async (especialidadSeleccionada) => {
  selectedUbicacionId.value = null;
  selectedLocation.value = null;
  especialidadesPorUbicacion.value = [];

  if (!especialidadSeleccionada) {
    // Si no hay especialidad seleccionada, cargar todas las ubicaciones
    await fetchUbicaciones();
    return;
  }

  try {
    const response = await fetch(`${FHIR_BASE_URL}/HealthcareService`);
    const textData = await response.text();
    const serviciosSalud = JSON.parse(textData).entry || [];

    // Filtra los servicios por la especialidad seleccionada
    const serviciosFiltrados = serviciosSalud.filter(
      item => item.resource.specialty?.[0]?.coding?.[0]?.display === especialidadSeleccionada
    );

    const jsonString = JSON.stringify(serviciosFiltrados);
    const idsUbicaciones = extraerIdsDeUbicaciones(jsonString);

    // Obtiene las ubicaciones asociadas a los servicios filtrados
    const ubicacionesFinales = await obtenerUbicacionesPorIds(idsUbicaciones);
    
    // Mapea las ubicaciones al formato esperado
    ubicaciones.value = ubicacionesFinales.map(ubicacion => ({
      id: ubicacion.id,
      name: ubicacion.name || 'Nombre no disponible',
    }));
  } catch (error) {
    console.error('Error fetching ubicaciones:', error);
    ubicaciones.value = [];
  }
};

/**
 * Maneja el cambio de ubicación seleccionada.
 * Obtiene los detalles de la ubicación y la geolocalización asociada.
 */
const handleUbicacionChange = async (ubicacionId) => {
  selectedLocation.value = null;

  if (!ubicacionId) {
    return;
  }

  try {
    const response = await fetch(`${FHIR_BASE_URL}/Location/${ubicacionId}`);
    const locationData = await response.json();

    // Busca la extensión de geolocalización para obtener la latitud y longitud
    const geolocationExtension = locationData.extension?.find(
      ext => ext.url === "http://hl7.org/fhir/StructureDefinition/geolocation"
    );
    const latitude = geolocationExtension?.extension?.find(
      ext => ext.url === "latitude"
    )?.valueDecimal;
    const longitude = geolocationExtension?.extension?.find(
      ext => ext.url === "longitude"
    )?.valueDecimal;

    if (latitude && longitude) {
      selectedLocation.value = {
        latitude,
        longitude,
        name: locationData.name || 'Ubicación sin nombre'
      };
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
  }
};

// Watchers para manejar cambios en los selects
watch(selectedEspecialidad, (newValue) => {
  handleEspecialidadChange(newValue);
});

watch(selectedUbicacionId, (newValue) => {
  handleUbicacionChange(newValue);
});

// Carga inicial de datos
onMounted(() => {
  fetchEspecialidades();
  fetchUbicaciones();
});
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
          clearable
        >
          <template v-slot:prepend-item>
            <v-list-item
              title="--Seleccione--"
              @click="selectedEspecialidad = ''"
            />
            <v-divider></v-divider>
          </template>
        </v-select>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-select
          label="Seleccionar Ubicación"
          v-model="selectedUbicacionId"
          :items="ubicaciones"
          item-title="name"
          item-value="id"
          variant="outlined"
          clearable
        >
          <template v-slot:prepend-item>
            <v-list-item
              title="--Seleccione--"
              @click="selectedUbicacionId = null"
            />
            <v-divider></v-divider>
          </template>
        </v-select>
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
        :zoom="zoom"
        :center="[selectedLocation.latitude, selectedLocation.longitude]"
        style="height: 600px; width: 100%;"
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