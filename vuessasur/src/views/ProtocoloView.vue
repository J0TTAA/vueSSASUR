<script setup>
import { ref, onMounted, watch } from 'vue';
// Importamos componentes de Vuetify (ajusta según tu configuración)
// Si usas auto-importación (vite-plugin-vuetify), podrías no necesitar esta línea.
import { VContainer, VRow, VCol, VSelect, VCard, VCardText, VSheet, VAlert } from 'vuetify/components';

// 1. Importa los componentes de vue-leaflet
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
} from "@vue-leaflet/vue-leaflet";

// 2. Importa el CSS de Leaflet
import "leaflet/dist/leaflet.css";

// 3. Importa los servicios API
import {
  listEspecialidades,
  getPatologiasPorEspecialidadId,
  listCriterios,
  searchLocationsBySpecialty
} from '../services/criteriosService'; // Ajusta la ruta si es necesario

// 4. Refs de estado
const especialidades = ref([]);
const patologias = ref([]);
const allCriterios = ref([]); // Lista maestra con datos mapeados
const selectedEspecialidad = ref(null); // Objeto {id, nombre}
const selectedPatologia = ref(null);    // Objeto {id, nombre}
const criterioInfo = ref(null);         // Objeto {criterios, examenes, observaciones}
const ubicaciones = ref([]);
const mapCenter = ref([-38.7364, -72.5904]); // Centro inicial del mapa
const zoom = ref(13);
const patologiasLoading = ref(false);
const ubicacionesLoading = ref(false);

// Helper para extraer texto (nombre) de objetos
function extractText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.nombre) return String(value.nombre);
    if (value.name) return String(value.name);
    // Búsqueda recursiva (ajustada para la estructura del backend)
    if (value.patologia) return extractText(value.patologia);
    if (value.especialidad) return extractText(value.especialidad);
  }
  return '';
}

// 5. Carga de datos inicial
async function loadInitialData() {
  console.log("Cargando datos iniciales para Protocolo...");
  try {
    const [especialidadesData, criteriosData] = await Promise.all([
      listEspecialidades(),
      listCriterios({ all: true }) // Carga todos los criterios
    ]);

    especialidades.value = especialidadesData;
    console.log(`Especialidades cargadas: ${especialidades.value.length}`);

    // Mapeamos los criterios guardando los IDs como NÚMEROS
    allCriterios.value = (criteriosData || []).map((c, index) => {
      // Intentamos obtener y parsear los IDs
      const espIdRaw = c.patologia?.especialidad?.id;
      const patIdRaw = c.patologia?.id;
      const espId = espIdRaw !== undefined && espIdRaw !== null ? parseInt(espIdRaw, 10) : null;
      const patId = patIdRaw !== undefined && patIdRaw !== null ? parseInt(patIdRaw, 10) : null;

      // Log detallado para los primeros 5 mapeos
      if (index < 5) {
          console.log(`Mapeando criterio ID ${c.id}: EspID Raw='${espIdRaw}', Parsed=${espId} | PatID Raw='${patIdRaw}', Parsed=${patId}`);
      }
      // Log de advertencia si algún ID es nulo o NaN después de parsear
      if (espId === null || isNaN(espId) || patId === null || isNaN(patId)) {
          console.warn(`Criterio ID ${c.id} tiene especialidad_id (${espId}) o patologia_id (${patId}) inválido tras parseo.`);
      }

      return {
        id: c.id,
        especialidad_id: espId, // Guardamos como número o null
        patologia_id: patId,   // Guardamos como número o null
        especialidadNombre: extractText(c.patologia?.especialidad).toString().trim(),
        patologiaNombre: extractText(c.patologia).toString().trim(),
        criteriosDerivacion: c.criterios || '',
        examenesPrevios: c.examenes_previos || '',
        observaciones: c.observaciones || ''
      };
    });
    console.log(`Criterios cargados y mapeados: ${allCriterios.value.length}`);
     if (allCriterios.value.length > 0) {
        // Mostramos el primer criterio mapeado para verificar los IDs numéricos
        console.log("Primer criterio mapeado:", JSON.stringify(allCriterios.value[0]));
     }

  } catch (error) {
    console.error("Error cargando datos iniciales:", error);
    alert("Error al cargar los datos iniciales.");
  }
}

onMounted(loadInitialData);

// 6. Watchers para manejar selecciones

// Cuando cambia la Especialidad seleccionada
watch(selectedEspecialidad, async (newEspecialidad) => {
  selectedPatologia.value = null; // Limpia patología
  criterioInfo.value = null;
  patologias.value = [];
  ubicaciones.value = [];

  const especialidadId = newEspecialidad?.id;
  const especialidadNombre = newEspecialidad?.nombre;

  // Carga patologías si hay ID
  if (especialidadId) {
    patologiasLoading.value = true;
    try {
      patologias.value = await getPatologiasPorEspecialidadId(especialidadId);
      console.log(`Patologías para ${especialidadNombre} (ID: ${especialidadId}): ${patologias.value.length}`);
    } catch (error) {
      console.error("Error cargando patologías:", error);
    } finally {
      patologiasLoading.value = false;
    }
  }

  // Carga ubicaciones si hay nombre
  if (especialidadNombre) {
    ubicacionesLoading.value = true;
    try {
      // Limpia el nombre antes de usarlo en la URL
      const nombreLimpio = especialidadNombre.trim();
      const nombreCodificado = encodeURIComponent(nombreLimpio);
      const ubiData = await searchLocationsBySpecialty(nombreCodificado);
      ubicaciones.value = ubiData.filter(loc => loc.latitude && loc.longitude);
      console.log(`Ubicaciones para ${nombreLimpio}: ${ubicaciones.value.length}`);
      if (ubicaciones.value.length > 0) {
        mapCenter.value = [ubicaciones.value[0].latitude, ubicaciones.value[0].longitude];
      } else {
        mapCenter.value = [-38.7364, -72.5904]; // Resetear al centro por defecto si no hay ubicaciones
      }
    } catch (error) {
      console.error(`Error al buscar ubicaciones para ${nombreLimpio}:`, error);
      ubicaciones.value = []; // Limpia ubicaciones en caso de error
      mapCenter.value = [-38.7364, -72.5904]; // Resetear al centro por defecto
    } finally {
      ubicacionesLoading.value = false;
    }
  }
});

// Cuando cambia la Patología seleccionada (¡Lógica de búsqueda corregida!)
watch(selectedPatologia, (newPatologia) => {
  // 1. Obtenemos los IDs seleccionados (asegurándonos de que sean números o null)
  const espId = selectedEspecialidad.value?.id ? parseInt(selectedEspecialidad.value.id, 10) : null;
  const patId = newPatologia?.id ? parseInt(newPatologia.id, 10) : null;

  console.log(`Watcher Patología: Buscando EspID=${espId} (tipo ${typeof espId}), PatID=${patId} (tipo ${typeof patId})`);

  // Log para ver el contenido de allCriterios justo antes de buscar
  // console.log("CONTENIDO DE allCriterios (primeros 5) al buscar:", JSON.stringify(allCriterios.value.slice(0,5), null, 2));

  // 2. Solo buscamos si ambos IDs son números válidos
  if (typeof espId === 'number' && !isNaN(espId) && typeof patId === 'number' && !isNaN(patId)) {

    // 3. Buscamos en la lista maestra comparando NÚMEROS
    const criterio = allCriterios.value.find(c => {
      // Log *dentro* del find para cada comparación (puede ser mucho log si la lista es grande)
      // console.log(`Comparando: (${c.especialidad_id} === ${espId}) && (${c.patologia_id} === ${patId}) ?`);
      return c.especialidad_id === espId && c.patologia_id === patId;
    });

    // 4. Si encontramos el criterio, actualizamos criterioInfo
    if (criterio) {
      criterioInfo.value = {
        criterios: criterio.criteriosDerivacion || 'No disponibles',
        examenes: criterio.examenesPrevios || 'No disponibles',
        observaciones: criterio.observaciones || 'No disponibles'
      };
      console.log("¡Criterio ENCONTRADO!:", JSON.stringify(criterio));
    } else {
      // 5. Si no se encuentra, limpiamos y mostramos log de depuración
      criterioInfo.value = null;
      console.warn("No se encontró criterio para la combinación seleccionada (IDs numéricos).");
      // Log para ayudar: Muestra los primeros 5 criterios que SÍ tienen esa especialidad_id
      const criteriosConEsaEsp = allCriterios.value.filter(c => c.especialidad_id === espId).slice(0, 5);
      console.log(`Primeros 5 criterios en allCriterios con EspID ${espId}:`, JSON.stringify(criteriosConEsaEsp, null, 2));
    }
  } else {
    // 6. Si falta algún ID, limpiamos criterioInfo
    criterioInfo.value = null;
    console.log("Watcher Patología: Falta EspID o PatID, limpiando detalles.");
  }
});

</script>

<template>
  <v-container style="max-width: 1200px;" class="pa-2">

    <h2 class="text-h6">Criterios de Aceptación y Flujo</h2>

    <v-row class="mt-4">
      <v-col cols="12" sm="6">
        <v-select
          label="Especialidad"
          v-model="selectedEspecialidad"
          :items="especialidades"
          item-title="nombre"
          item-value="id"
          :return-object="true"
          variant="outlined"
          density="compact"
          clearable
          placeholder="Seleccione Especialidad"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          label="Patología"
          v-model="selectedPatologia"
          :items="patologias"
          item-title="nombre"
          item-value="id"
          :return-object="true"
          :disabled="!selectedEspecialidad"
          :loading="patologiasLoading"
          variant="outlined"
          density="compact"
          clearable
          placeholder="Seleccione Patología"
        />
      </v-col>
    </v-row>

    <!-- Sección de Detalles del Criterio -->
    <v-row class="mt-2">
      <v-col cols="12" sm="6">
        <v-card variant="outlined" min-height="150">
          <v-card-text>
            <h3 class="text-subtitle-1 mb-2 font-weight-bold">Criterios de Derivación</h3>
            <!-- Usamos v-html para interpretar saltos de línea como <br> -->
            <p class="text-body-2" v-html="criterioInfo ? (criterioInfo.criterios || '').replace(/\n/g, '<br>') : 'Seleccione especialidad y patología para ver detalles.'"></p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card variant="outlined" min-height="150">
          <v-card-text>
            <h3 class="text-subtitle-1 mb-2 font-weight-bold">Exámenes Requeridos</h3>
            <p class="text-body-2" v-html="criterioInfo ? (criterioInfo.examenes || '').replace(/\n/g, '<br>') : 'Seleccione especialidad y patología para ver detalles.'"></p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card variant="outlined" min-height="100">
          <v-card-text>
            <h3 class="text-subtitle-1 mb-2 font-weight-bold">Observaciones</h3>
            <p class="text-body-2" v-html="criterioInfo ? (criterioInfo.observaciones || '').replace(/\n/g, '<br>') : 'Seleccione especialidad y patología para ver detalles.'"></p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mapa Leaflet -->
    <v-sheet v-if="selectedEspecialidad && ubicacionesLoading" class="mt-6">
       <v-alert type="info" variant="tonal" density="compact">
           Cargando establecimientos...
       </v-alert>
    </v-sheet>
    <v-sheet v-else-if="selectedEspecialidad && ubicaciones.length > 0" class="mt-6 map-container">
      <h3 class="text-subtitle-1 mb-2 font-weight-bold">Establecimientos Asociados</h3>
      <l-map
        :key="mapCenter.toString()" <!-- Forza re-renderizado si cambia el centro -->
        :use-global-leaflet="false"
        v-model:zoom="zoom"
        :center="mapCenter"
        style="z-index: 1;" <!-- Asegura que el mapa esté visible -->
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <!-- Marcadores -->
        <template v-for="loc in ubicaciones" :key="loc.id">
          <l-marker
            v-if="loc.latitude && loc.longitude"
            :lat-lng="[loc.latitude, loc.longitude]"
          >
            <l-popup>
              <b>{{ loc.name }}</b><br>
              <span v-if="loc.address?.line">{{ loc.address.line }}<br></span>
              <span v-if="loc.address?.city">{{ loc.address.city }}</span>
            </l-popup>
          </l-marker>
        </template>

      </l-map>
    </v-sheet>
    <v-sheet v-else-if="selectedEspecialidad && !ubicacionesLoading" class="mt-6">
       <v-alert type="warning" variant="tonal" density="compact">
           No se encontraron establecimientos asociados con coordenadas válidas para esta especialidad.
       </v-alert>
    </v-sheet>

  </v-container>
</template>

<style scoped>
.map-container {
  height: 400px;
  width: 100%;
}
.v-card {
  /* Asegura que las cards tengan la misma altura si están en la misma fila */
  display: flex;
  flex-direction: column;
  height: 100%;
}
.v-card-text {
  flex-grow: 1;
}
/* Asegura que el mapa se muestre correctamente */
.leaflet-container {
   z-index: 1 !important;
}
</style>

