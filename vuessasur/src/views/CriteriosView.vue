<script setup>
import { ref, onMounted, watch, computed } from 'vue';

// 1. Importamos componentes
import BarraBusqueda from '../components/criterios/BarraBusqueda.vue';
import TablaCriterios from '../components/criterios/TablaCriterios.vue';
import ModalCrearPatologia from '../components/criterios/ModalCrearPatologia.vue';

// 2. Importamos servicios
import {
  listCriterios,
  createCriterio,
  updateCriterio,
  deleteCriterio as removeCriterio,
  listEspecialidades,
  getPatologiasPorEspecialidadId,
  createEspecialidad,
  deletePatologia,
  listPatologias,
  getSpecialtyAssignments,
  syncSpecialtyPathologies
} from '../services/criteriosService';
import { normalizeText } from '../services/http'; // Asegúrate de que esta función exista y funcione como se espera
import SpecialtyPathologyManager from '../components/criterios/SpecialtyPathologyManager.vue';

// 3. Refs de estado
const formData = ref({
  id: '',
  especialidad: null, // Objeto {id, nombre}
  patologia: null,    // Objeto {id, nombre}
  criteriosDerivacion: '',
  examenesPrevios: '',
  observaciones: ''
});

const openModal = ref(false); // Modal "Crear Patología"
const especialidades = ref([]); // Lista de objetos {id, nombre}
const patologias = ref([]);     // Lista de objetos {id, nombre} (cargada por API)
const patologiasLoading = ref(false); // Indicador de carga para el select de patologías
const filters = ref({ // Estado para los filtros de la barra de búsqueda
  searchEspecialidad: '', searchPatologia: '', selectedEspecialidades: [], selectedPatologias: []
});
const newPatologiaData = ref({ // Estado para el modal de creación de patología
  especialidad: null, patologia: '', criteriosDerivacion: '', examenesPrevios: '', observaciones: ''
});
const allCriterios = ref([]); // Lista maestra de criterios (para la tabla y búsqueda)
const filteredCriterios = ref([]); // Lista filtrada de criterios para mostrar en la tabla
const catalogoPatologias = ref([]); // Catálogo completo de patologías disponibles
const specialtyAssignments = ref({}); // Asignaciones especialidad ↔ patologías
const assignmentsLoading = ref(false);
const assignmentsSaving = ref(false);

// Estado para el modal de administración de especialidades
const openAdminEspModal = ref(false);
const newEspecialidadNombre = ref('');
const adminEspLoading = ref(false);

// 4. Funciones de Normalización y Extracción
function extractText(value) {
  // Extrae el nombre de objetos anidados o devuelve el string
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.nombre) return String(value.nombre);
    if (value.name) return String(value.name);
    // Busca recursivamente si la estructura es más compleja
    if (value.patologia) return extractText(value.patologia);
    if (value.especialidad) return extractText(value.especialidad);
  }
  return '';
}

const extractName = (value) => extractText(value);

// 5. Lógica de negocio (Filtro de la tabla)
const handleFilterChange = (key, value) => {
  // Actualiza el estado de los filtros y aplica el filtro a la tabla
  filters.value[key] = value;
  applyFilters();
};

const applyFilters = () => {
  // Filtra la lista `allCriterios` basada en los `filters` actuales
  let filtered = [...allCriterios.value];
  const espSearch = normalizeText(filters.value.searchEspecialidad);
  const patSearch = normalizeText(filters.value.searchPatologia);

  // Filtra por texto de búsqueda
  if (espSearch) {
    filtered = filtered.filter(criterio => normalizeText(criterio.especialidad).includes(espSearch));
  }
  if (patSearch) {
    filtered = filtered.filter(criterio => normalizeText(criterio.patologia).includes(patSearch));
  }
  // Filtra por IDs seleccionados en los dropdowns del buscador
  if (filters.value.selectedEspecialidades.length > 0 && filters.value.selectedEspecialidades[0]) {
    filtered = filtered.filter(criterio => filters.value.selectedEspecialidades.includes(criterio.especialidad_id));
  }
  if (filters.value.selectedPatologias.length > 0 && filters.value.selectedPatologias[0]) {
    filtered = filtered.filter(criterio => filters.value.selectedPatologias.includes(criterio.patologia_id));
  }
  filteredCriterios.value = filtered;
};

// --- Funciones CRUD (Criterios) ---
const handleCreateCriterio = async () => {
  // Guarda o actualiza un criterio
  if (!formData.value.especialidad || !formData.value.patologia) {
    alert('Por favor, seleccione una Especialidad y una Patología.');
    return;
  }

  // El backend espera NOMBRES, no IDs, para crear/actualizar
  // Asegúrate de que esto coincida con tu API
  const payload = {
    especialidad: formData.value.especialidad.nombre,
    patologia: formData.value.patologia.nombre,
    criterios: formData.value.criteriosDerivacion,
    examenes_previos: formData.value.examenesPrevios,
    observaciones: formData.value.observaciones
  };
  try {
    if (formData.value.id) { // Actualiza si hay ID
      await updateCriterio(formData.value.id, payload);
    } else { // Crea si no hay ID
      await createCriterio(payload);
    }
    await loadCriterios(); // Recarga la lista de criterios
    alert('Criterio guardado exitosamente');
  } catch (e) {
    alert(`Error al guardar criterio: ${e?.message || 'Error desconocido'}`);
    return;
  }
  // Limpia el formulario
  formData.value = {
    id: '', especialidad: null, patologia: null, criteriosDerivacion: '', examenesPrevios: '', observaciones: ''
  };
};

const openCreatePatologiaModal = () => {
  // Pre-rellena la especialidad en el modal si ya está seleccionada en el form principal
  if (formData.value.especialidad) {
     try {
       newPatologiaData.value.especialidad = structuredClone(formData.value.especialidad);
       console.log("Especialidad copiada al modal:", newPatologiaData.value.especialidad);
     } catch (e) {
       console.error("Error clonando especialidad:", e);
       // Fallback simple por si structuredClone falla
       newPatologiaData.value.especialidad = JSON.parse(JSON.stringify(formData.value.especialidad));
     }
  } else {
    newPatologiaData.value.especialidad = null;
    console.log("No hay especialidad seleccionada para copiar al modal.");
  }
  // Limpia los otros campos del modal
  newPatologiaData.value.patologia = '';
  newPatologiaData.value.criteriosDerivacion = '';
  newPatologiaData.value.examenesPrevios = '';
  newPatologiaData.value.observaciones = '';

  openModal.value = true; // Abre el modal
};


const handleCreatePatologia = async () => {
  // Lógica para guardar desde el modal "Crear Patología"
  if (!newPatologiaData.value.especialidad || !newPatologiaData.value.patologia) {
    alert('Por favor, complete la especialidad y la patología para crear.');
    return;
  }
  try {
    // Llama a createCriterio, asumiendo que el backend crea la patología si no existe
    await createCriterio({
      especialidad: newPatologiaData.value.especialidad.nombre,
      patologia: newPatologiaData.value.patologia,
      criterios: newPatologiaData.value.criteriosDerivacion,
      examenes_previos: newPatologiaData.value.examenesPrevios,
      observaciones: newPatologiaData.value.observaciones
    });
    await loadInitialData(); // Recarga todo (especialidades, criterios)
  } catch (e) {
    alert(`Error al crear patología/criterio: ${e?.message || 'Error desconocido'}`);
    return;
  }
  // Limpia y cierra el modal
  newPatologiaData.value = {
    especialidad: null, patologia: '', criteriosDerivacion: '', examenesPrevios: '', observaciones: ''
  };
  openModal.value = false;
  alert('Patología y criterio creados exitosamente');
};

const handlePatologiaDataChange = (key, value) => {
  // Actualiza el estado del modal cuando cambian sus campos
  newPatologiaData.value[key] = value;
};

/**
 * ¡CORREGIDO! Carga los datos en el formulario al editar.
 */
const handleEditCriterio = async (criterio) => {
  console.log("Editando criterio:", criterio);

  // 1. Desactivar temporalmente los watchers para evitar ejecuciones indeseadas
  stopWatcher1?.();
  stopWatcher2?.();

  // 2. Limpiar el formulario y establecer los datos básicos
  // Usamos los nombres 'especialidad' y 'patologia' que vienen del mapeo de loadCriterios
  formData.value = {
    id: criterio.id,
    especialidad: null,
    patologia: null,
    criteriosDerivacion: criterio.criteriosDerivacion,
    examenesPrevios: criterio.examenesPrevios,
    observaciones: criterio.observaciones,
  };

  // 3. Encontrar y setear el objeto especialidad (de la lista 'especialidades' ya cargada)
  const espEncontrada = especialidades.value.find(e => e.id === criterio.especialidad_id);
  if (!espEncontrada) {
    console.error("Error: No se encontró la especialidad para editar:", criterio);
    alert("Error: No se pudo encontrar la especialidad para editar.");
    startWatchers(); // Reactivar watchers antes de salir
    return;
  }
  // Setea el objeto especialidad en el formulario
  formData.value.especialidad = espEncontrada;
  console.log("Especialidad seteada:", formData.value.especialidad);

  // 4. Cargar la lista de patologías ASÍNCRONAMENTE para la especialidad seleccionada
  patologiasLoading.value = true;
  let patologiasParaEspecialidad = [];
  try {
    console.log("Cargando patologías para edición...");
    patologiasParaEspecialidad = await getPatologiasPorEspecialidadId(criterio.especialidad_id);
    patologias.value = patologiasParaEspecialidad; // Actualiza la lista del dropdown de patologías
    console.log("Patologías cargadas:", patologiasParaEspecialidad);
  } catch (error) {
    console.error("Error cargando patologías en modo edición:", error);
    alert("Error al cargar las patologías para editar.");
    patologiasLoading.value = false;
    startWatchers(); // Reactivar watchers antes de salir
    return;
  } finally {
    patologiasLoading.value = false;
  }

  // 5. Encontrar y setear el objeto patología DESPUÉS de cargar la lista
  const patEncontrada = patologiasParaEspecialidad.find(p => p.id === criterio.patologia_id);
  if (patEncontrada) {
    // Setea el objeto patología en el formulario
    formData.value.patologia = patEncontrada;
    console.log("Patología seteada:", formData.value.patologia);
  } else {
    // Si no se encuentra (raro), deja la patología como null
    console.error("No se encontró la patología para editar:", criterio, patologiasParaEspecialidad);
    formData.value.patologia = null;
  }

  // 6. Reactivar los watchers AHORA que el formulario está completo
  startWatchers();
  console.log("Formulario listo para editar:", formData.value);

  // 7. Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


const handleDeleteCriterio = async (id) => {
  // Elimina un criterio específico
  if (confirm('¿Está seguro de que desea eliminar este CRITERIO?')) {
    try {
      await removeCriterio(id);
      await loadInitialData(); // Recarga todo para refrescar la tabla
      alert('Criterio eliminado exitosamente');
    } catch (e) {
      alert(`Error al eliminar criterio: ${e?.message || 'Error desconocido'}`);
    }
  }
};

// --- NUEVAS FUNCIONES DE ADMIN (B.1 y B.2) ---
const handleDeletePatologia = async () => {
  // Elimina una patología y todos sus criterios asociados
  const patologia = formData.value.patologia;
  if (!patologia || !patologia.id) {
    alert("Por favor, seleccione primero la especialidad y patología que desea eliminar.");
    return;
  }

  // Doble confirmación por seguridad
  if (confirm(`¿Está seguro de que desea eliminar la patología "${patologia.nombre}"?`)) {
    if (confirm(`¡ACCIÓN IRREVERSIBLE!\nSe eliminarán TODOS los criterios asociados a "${patologia.nombre}" en TODAS las especialidades.\n\n¿Confirma la eliminación?`)) {
      try {
        await deletePatologia(patologia.id); // Llama a la API para eliminar
        await loadInitialData(); // Recarga todo
        // Limpia el formulario principal
        formData.value = {
          id: '', especialidad: null, patologia: null, criteriosDerivacion: '', examenesPrevios: '', observaciones: ''
        };
        alert('Patología eliminada exitosamente');
      } catch (e) {
        alert(`Error al eliminar la patología: ${e?.message || 'Error desconocido'}`);
      }
    }
  }
};

const handleCreateEspecialidad = async () => {
  // Crea una nueva especialidad desde el modal de admin
  if (!newEspecialidadNombre.value.trim()) {
    alert("Por favor, ingrese un nombre para la nueva especialidad.");
    return;
  }

  adminEspLoading.value = true;
  try {
    const nuevaEsp = await createEspecialidad({ nombre: newEspecialidadNombre.value });
    await loadEspecialidades(); // Recarga la lista de especialidades
    newEspecialidadNombre.value = ''; // Limpia el campo del modal
    alert(`Especialidad "${nuevaEsp.nombre}" creada exitosamente.`);
    // Opcional: openAdminEspModal.value = false; // Cierra el modal automáticamente
  } catch (e) {
    alert(`Error al crear la especialidad: ${e?.message || 'Error desconocido'}`);
  } finally {
    adminEspLoading.value = false;
  }
};

// --- Funciones de Carga de Datos ---
async function loadCriterios() {
  // Carga todos los criterios y los mapea a una estructura plana
  const criterios = await listCriterios({ all: true });

  allCriterios.value = (criterios || []).map(c => {
    // Extrae los nombres de los objetos anidados
    const espNombre = extractText(c.patologia?.especialidad).toString().trim();
    const patNombre = extractText(c.patologia).toString().trim();

    // Crea el objeto plano que usará la tabla y los filtros
    return {
      id: c.id,
      especialidad: espNombre, // Nombre para mostrar en tabla
      patologia: patNombre,   // Nombre para mostrar en tabla
      especialidad_id: c.patologia?.especialidad?.id, // ID para filtros y edición
      patologia_id: c.patologia?.id,             // ID para filtros y edición
      criteriosDerivacion: c.criterios || '',     // Datos del criterio
      examenesPrevios: c.examenes_previos || '',
      observaciones: c.observaciones || ''
    };
  });

  filteredCriterios.value = [...allCriterios.value]; // Inicializa la tabla filtrada
  console.log(`Carga de Criterios: ${allCriterios.value.length} items mapeados.`);
}

async function loadEspecialidades() {
  // Carga la lista de especialidades para el dropdown principal
  const data = await listEspecialidades();
  especialidades.value = (data || []).map((esp) => ({
    id: esp.id,
    nombre: extractName(esp) || esp?.nombre || esp?.name || ''
  }));
  console.log(`Carga de Especialidades: ${especialidades.value.length} items.`);
}

async function loadPatologiasCatalogo() {
  const data = await listPatologias();
  catalogoPatologias.value = (data || []).map((pat) => ({
    id: pat.id,
    nombre: extractName(pat) || pat?.nombre || pat?.name || ''
  }));
  console.log(`Carga de Patologías: ${catalogoPatologias.value.length} items.`);
}

async function loadSpecialtyAssignments() {
  assignmentsLoading.value = true;
  try {
    const payload = await getSpecialtyAssignments();
    const specialties = payload?.specialties ?? payload?.especialidades ?? [];
    const pathologies = payload?.pathologies ?? payload?.patologias ?? [];
    const assignments = payload?.assignments ?? {};

    especialidades.value = specialties.map((esp) => ({
      id: esp.id,
      nombre: extractName(esp) || esp?.name || esp?.nombre || ''
    }));

    catalogoPatologias.value = pathologies.map((pat) => ({
      id: pat.id,
      nombre: extractName(pat) || pat?.name || pat?.nombre || ''
    }));

    specialtyAssignments.value = Object.fromEntries(
      Object.entries(assignments).map(([key, value]) => [key, Array.isArray(value) ? value : []])
    );
  } catch (error) {
    console.error('No se pudo cargar el gestor de especialidades:', error);
    if (!especialidades.value.length) {
      await loadEspecialidades();
    }
    if (!catalogoPatologias.value.length) {
      await loadPatologiasCatalogo();
    }
  } finally {
    assignmentsLoading.value = false;
  }
}

async function loadInitialData() {
  // Carga todos los datos necesarios al iniciar la vista
  console.log("Iniciando carga de datos...");
  try {
    // Ejecuta ambas cargas en paralelo para eficiencia
    await Promise.all([
      loadCriterios(),
      loadEspecialidades(),
      loadPatologiasCatalogo(),
      loadSpecialtyAssignments()
    ]);
    console.log("Carga inicial completada.");
  } catch (e) {
    console.error('Error al cargar datos iniciales:', e);
    alert('Error al cargar datos iniciales: ' + e.message);
  }
}

// --- Watchers ---
let stopWatcher1 = null; // Variable para detener/reactivar el watcher 1
let stopWatcher2 = null; // Variable para detener/reactivar el watcher 2

const startWatchers = () => {
  // Watcher 1: Carga patologías cuando cambia la ESPECIALIDAD seleccionada en el formulario
  stopWatcher1 = watch(() => formData.value.especialidad, async (especialidadObjeto, oldEspecialidadObjeto) => {
    const especialidadId = especialidadObjeto?.id;

    // Limpia la patología seleccionada si el ID de la especialidad realmente cambió
    if (especialidadObjeto?.id !== oldEspecialidadObjeto?.id) {
        console.log("Watcher 1: Especialidad cambió, limpiando patología seleccionada.");
        formData.value.patologia = null;
    } else {
        console.log("Watcher 1: Especialidad no cambió ID (o es null), no limpiar patología.");
    }

    // Si no hay especialidad seleccionada, limpia la lista de patologías
    if (!especialidadId) {
      patologias.value = [];
      return;
    }

    console.log(`Watcher 1: Cargando patologías para ID: ${especialidadId}`);
    patologiasLoading.value = true; // Muestra el spinner en el select de patologías
    try {
      // Llama a la API para obtener las patologías de la especialidad seleccionada
      patologias.value = await getPatologiasPorEspecialidadId(especialidadId);
      console.log(`Watcher 1: Se encontraron ${patologias.value.length} patologías.`);
    } catch (e) {
      patologias.value = []; // Limpia la lista en caso de error
      alert(`Error al cargar patologías para ${especialidadObjeto?.nombre || 'la especialidad seleccionada'}`);
    } finally {
      patologiasLoading.value = false; // Oculta el spinner
    }
  }, { immediate: false }); // No ejecutar inmediatamente al montar

  // Watcher 2: Autocompleta los campos de CRITERIOS cuando cambia la PATOLOGÍA seleccionada
  stopWatcher2 = watch(() => formData.value.patologia, (patologiaObjeto, oldPatologiaObjeto) => {
    // Solo ejecuta si el ID de la patología realmente cambió
    if (patologiaObjeto?.id === oldPatologiaObjeto?.id) {
      console.log("Watcher 2: Patología ID no cambió, saltando búsqueda de criterio.");
      return;
    }

    const espId = formData.value.especialidad?.id;
    const patId = patologiaObjeto?.id;

    console.log(`Watcher 2: Buscando criterio con EspID: ${espId}, PatID: ${patId}`);

    // Si falta alguno de los IDs, limpia los campos del formulario
    if (!espId || !patId) {
      console.log("Watcher 2: Falta ID de especialidad o patología, limpiando campos.");
      formData.value.id = '';
      formData.value.criteriosDerivacion = '';
      formData.value.examenesPrevios = '';
      formData.value.observaciones = '';
      return;
    }

    // Busca el criterio correspondiente en la lista maestra `allCriterios`
    const criterioEncontrado = allCriterios.value.find(c =>
      c.especialidad_id === espId &&
      c.patologia_id === patId
    );

    if (criterioEncontrado) {
      // Si se encuentra, rellena los campos del formulario
      console.log("Watcher 2: Criterio encontrado", criterioEncontrado);
      formData.value.id = criterioEncontrado.id;
      formData.value.criteriosDerivacion = criterioEncontrado.criteriosDerivacion;
      formData.value.examenesPrevios = criterioEncontrado.examenesPrevios;
      formData.value.observaciones = criterioEncontrado.observaciones;
    } else {
      // Si no se encuentra, limpia los campos para permitir crear uno nuevo
      console.log("Watcher 2: No se encontró criterio para esta combinación.");
      formData.value.id = '';
      formData.value.criteriosDerivacion = '';
      formData.value.examenesPrevios = '';
      formData.value.observaciones = '';
    }
  }, { immediate: false }); // No ejecutar inmediatamente al montar
};

onMounted(() => {
  loadInitialData().then(() => {
    // Inicia los watchers DESPUÉS de que se hayan cargado los datos iniciales
    startWatchers();
  });
});

// --- Computed (A.1 Implementado) ---
// Calcula las opciones para el dropdown de patologías del BUSCADOR
const patologiasFilterOptions = computed(() => {
  let base = [...allCriterios.value]; // Empieza con todos los criterios
  const espSearch = normalizeText(filters.value.searchEspecialidad); // Texto búsqueda especialidad
  const patSearch = normalizeText(filters.value.searchPatologia); // Texto búsqueda patología
  const selectedEspId = filters.value.selectedEspecialidades && filters.value.selectedEspecialidades[0]; // ID especialidad seleccionada

  // Filtra por especialidad (ID o texto)
  if (selectedEspId) {
    base = base.filter(criterio => criterio.especialidad_id === selectedEspId);
  } else if (espSearch) {
    base = base.filter(criterio => normalizeText(criterio.especialidad).includes(espSearch));
  }

  // Filtra por texto de patología
  if (patSearch) {
    base = base.filter(criterio => normalizeText(criterio.patologia).includes(patSearch));
  }

  // Crea una lista única de patologías {id, nombre} a partir de los criterios filtrados
  const patologiasMap = new Map();
  base.forEach(c => {
    if (c.patologia_id && !patologiasMap.has(c.patologia_id)) {
      patologiasMap.set(c.patologia_id, { id: c.patologia_id, nombre: c.patologia });
    }
  });
  // Devuelve la lista ordenada alfabéticamente
  return Array.from(patologiasMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
});

// --- Watchers Sincronización Buscador -> Formulario ---
// Actualiza el formulario principal cuando se selecciona algo en la barra de búsqueda

watch(() => filters.value.selectedEspecialidades, (arr) => {
  const espId = Array.isArray(arr) ? arr[0] : null; // Obtiene el ID seleccionado
  // Busca el objeto especialidad completo y lo asigna al formulario
  formData.value.especialidad = especialidades.value.find(e => e.id === espId) || null;
});

watch(() => filters.value.selectedPatologias, (arr) => {
  const patId = Array.isArray(arr) ? arr[0] : null; // Obtiene el ID seleccionado
  // Espera un poco (para que la lista de patologías del formulario se actualice si es necesario)
  setTimeout(() => {
     // Intenta encontrar la patología en la lista cargada por API o en las opciones del filtro
     const listaDePatologias = patologias.value.length > 0 ? patologias.value : patologiasFilterOptions.value;
     formData.value.patologia = listaDePatologias.find(p => p.id === patId) || null;
  }, 200);
});

// --- Gestor de especialidades/patologías ---
const specialtyManagerSpecialties = computed(() => {
  return especialidades.value.map((esp) => {
    const id = esp.id ?? normalizeText(esp.nombre ?? esp.name ?? '');
    const name = esp.nombre ?? esp.name ?? String(id);
    return { id, name };
  });
});

const specialtyManagerPathologies = computed(() => {
  const map = new Map();

  (catalogoPatologias.value || []).forEach((pat) => {
    const id = pat.id ?? normalizeText(pat.nombre ?? pat.name ?? '');
    const name = pat.nombre ?? pat.name ?? String(id);
    if (id) {
      map.set(id, { id, name });
    }
  });

  allCriterios.value.forEach((criterio) => {
    const id = criterio.patologia_id ?? normalizeText(criterio.patologia ?? '');
    const name = criterio.patologia ?? String(id);
    if (id && !map.has(id)) {
      map.set(id, { id, name });
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
});

const specialtyManagerAssignments = computed(() => {
  const base = specialtyAssignments.value || {};
  const clone = {};
  Object.entries(base).forEach(([espId, items]) => {
    clone[espId] = Array.isArray(items) ? [...new Set(items)] : [];
  });

  // Fallback: si no hay datos en base, derive desde criterios actuales
  if (Object.keys(clone).length === 0) {
    allCriterios.value.forEach((criterio) => {
      const espId = criterio.especialidad_id ?? normalizeText(criterio.especialidad ?? '');
      const patId = criterio.patologia_id ?? normalizeText(criterio.patologia ?? '');
      if (!espId || !patId) return;
      if (!clone[espId]) {
        clone[espId] = [];
      }
      if (!clone[espId].includes(patId)) {
        clone[espId].push(patId);
      }
    });
  }

  return clone;
});

const handleCreateSpecialtyFromManager = () => {
  openAdminEspModal.value = true;
};

const handleSaveAssignments = (assignments) => {
  assignmentsSaving.value = true;
  syncSpecialtyPathologies(assignments)
    .then((response) => {
      const updated = response?.assignments ?? assignments;
      specialtyAssignments.value = Object.fromEntries(
        Object.entries(updated).map(([key, value]) => [key, Array.isArray(value) ? value : []])
      );
      alert('Asignaciones guardadas correctamente.');
      // Recargar criterios para reflejar cualquier cambio en la tabla
      loadCriterios();
    })
    .catch((error) => {
      console.error('Error al guardar asignaciones:', error);
      alert(error?.message || 'Error al sincronizar las asignaciones.');
    })
    .finally(() => {
      assignmentsSaving.value = false;
    });
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
          <!-- Columna Izquierda: Selects y Botones de Admin -->
          <v-col cols="12" sm="4">
            <v-sheet>
              <v-select
                label="Especialidad"
                :items="especialidades"
                item-title="nombre"
                item-value="id"
                v-model="formData.especialidad"
                :return-object="true"
                variant="outlined"
                placeholder="Seleccione una Especialidad"
                class="mb-4"
                clearable
              />
              <v-select
                label="Patología"
                :items="patologias"
                item-title="nombre"
                item-value="id"
                v-model="formData.patologia"
                :return-object="true"
                variant="outlined"
                placeholder="Seleccione una Patología"
                :disabled="!formData.especialidad"
                :loading="patologiasLoading"
                clearable
              />

              <!-- Botones de Acción -->
              <v-btn
                color="primary"
                block
                class="mt-4"
                @click="openCreatePatologiaModal"
              >
                Crear Patología (en esta Esp.)
              </v-btn>

              <v-btn
                color="error"
                variant="outlined"
                block
                class="mt-2"
                :disabled="!formData.patologia"
                @click="handleDeletePatologia"
              >
                Eliminar Patología Seleccionada
              </v-btn>

              <v-btn
                color="grey-darken-1"
                variant="outlined"
                block
                class="mt-2"
                @click="openAdminEspModal = true"
              >
                Crear/Administrar Especialidades
              </v-btn>

            </v-sheet>
          </v-col>

          <!-- Columna Derecha: Formulario de Criterios -->
          <v-col cols="12" sm="8">
            <v-form @submit.prevent="handleCreateCriterio">
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
                type="submit"
                :color="formData.id ? 'secondary' : 'primary'"
                block
                class="mt-4"
                :disabled="!formData.especialidad || !formData.patologia"
              >
                {{ formData.id ? 'Actualizar Criterio' : 'Crear Criterio' }}
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-sheet>

      <!-- Modal 1: Crear Patología -->
      <ModalCrearPatologia
        v-model="openModal"
        :especialidades="especialidades"
        :newPatologiaData="newPatologiaData"
        :onCreate="handleCreatePatologia"
        :handleChange="handlePatologiaDataChange"
      />

      <!-- Modal 2: Crear Especialidad -->
      <v-dialog v-model="openAdminEspModal" max-width="500px">
        <v-card>
          <v-card-title class="text-h5">
            Administrar Especialidades
          </v-card-title>
          <v-card-text>
            <v-label class="text-caption">Crear Nueva Especialidad</v-label>
            <v-text-field
              label="Nombre Nueva Especialidad"
              v-model="newEspecialidadNombre"
              variant="outlined"
              density="compact"
              class="mb-2"
              @keydown.enter="handleCreateEspecialidad"
            />
            <v-btn
              color="primary"
              block
              :loading="adminEspLoading"
              @click="handleCreateEspecialidad"
            >
              Guardar Nueva Especialidad
            </v-btn>

          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="secondary" @click="openAdminEspModal = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-sheet>

    <v-sheet class="mb-10">
      <SpecialtyPathologyManager
        :specialties="specialtyManagerSpecialties"
        :pathologies="specialtyManagerPathologies"
        :initial-assignments="specialtyManagerAssignments"
        :loading="assignmentsLoading"
        :saving="assignmentsSaving"
        @create-specialty="handleCreateSpecialtyFromManager"
        @save="handleSaveAssignments"
      />
    </v-sheet>

    <!-- Sección de Búsqueda y Tabla -->
    <v-sheet class="mb-10">
      <BarraBusqueda
        :filters="filters"
        :handleFilterChange="handleFilterChange"
        :items-especialidad="especialidades"
        item-title-especialidad="nombre"
        item-value-especialidad="id"
        :items-patologia="patologiasFilterOptions"
        item-title-patologia="nombre"
        item-value-patologia="id"
      />

      <v-row class="mt-2" align="center">
         <v-col cols="12">
           <v-alert type="info" variant="tonal" density="compact">
             Mostrando {{ filteredCriterios.length }} de {{ allCriterios.length }} criterios.
           </v-alert>
         </v-col>
       </v-row>

    </v-sheet>

    <TablaCriterios
      :criterios="filteredCriterios"
      @edit="handleEditCriterio"
      @delete="handleDeleteCriterio"
    />

  </v-container>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>

