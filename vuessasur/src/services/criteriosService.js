import { http, unwrapArrayPayload, unwrapItemPayload } from './http'; // Asegúrate que la ruta a http sea correcta

/**
 * 1. Obtiene todos los criterios (o filtrados por el backend)
 */
export async function listCriterios(params = {}) {
  // Nota: http.get('/criterios', { query: params }) debe manejar
  // la conversión de { all: true } a ?all=true
  const payload = await http.get('/criterios', { query: params });
  return unwrapArrayPayload(payload);
}

/**
 * 2. Obtiene un criterio por ID
 */
export async function getCriterio(id) {
  const payload = await http.get(`/criterios/${id}`);
  return unwrapItemPayload(payload);
}

/**
 * 3. Crea un nuevo criterio
 */
export async function createCriterio(data) {
  // El backend espera 'criterios', 'examenes_previos', etc.
  const payload = await http.post('/criterios', { body: data });
  return unwrapItemPayload(payload);
}

/**
 * 4. Actualiza un criterio por ID
 */
export async function updateCriterio(id, data) {
  const payload = await http.put(`/criterios/${id}`, { body: data });
  return unwrapItemPayload(payload);
}

/**
 * 5. Elimina un criterio por ID
 */
export async function deleteCriterio(id) {
  await http.delete(`/criterios/${id}`);
  return true;
}

/**
 * 6. Obtiene la lista de TODAS las especialidades
 * Llama a: GET /api/especialidades
 */
export async function listEspecialidades() {
  try {
    const payload = await http.get('/especialidades');
    // Devuelve un array de objetos: [{id: 1, nombre: 'CARDIOLOGÍA'}, ...]
    return unwrapArrayPayload(payload);
  } catch (error) {
    console.error("Error al cargar especialidades:", error);
    return [];
  }
}

/**
 * 7. Obtiene patologías por ID de especialidad
 * Llama a: GET /api/especialidades/{id}/patologias
 */
export async function getPatologiasPorEspecialidadId(especialidadId) {
  if (!especialidadId && especialidadId !== 0) { // Considerar si 0 es un ID válido
    console.warn("getPatologiasPorEspecialidadId llamado sin ID válido.");
    return []; // No hacer una llamada si el ID está vacío o inválido
  }
  try {
    const payload = await http.get(`/especialidades/${especialidadId}/patologias`);
    // Devuelve un array de objetos: [{id: 10, nombre: 'Hipertensión'}, ...]
    return unwrapArrayPayload(payload);
  } catch (error) {
    console.error(`Error al cargar patologías para ID ${especialidadId}:`, error);
    return []; // Devuelve vacío en caso de error
  }
}

/**
 * 8. Crea una NUEVA especialidad
 * Llama a: POST /api/especialidades
 */
export async function createEspecialidad(data) {
  try {
    const payload = await http.post('/especialidades', { body: data });
    return unwrapItemPayload(payload);
  } catch (error) {
    console.error("Error al crear especialidad:", error);
    throw error; // Lanza el error para que el componente Vue lo maneje
  }
}

/**
 * 9. Elimina una PATOLOGIA por ID
 * Llama a: DELETE /api/patologias/{id}
 */
export async function deletePatologia(patologiaId) {
  if (!patologiaId && patologiaId !== 0) {
    throw new Error("ID de patología no proporcionado o inválido");
  }
  try {
    await http.delete(`/patologias/${patologiaId}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar patología ${patologiaId}:`, error);
    throw error;
  }
}

/**
 * 10. (NUEVA - Para ProtocoloView) Busca ubicaciones FHIR por nombre de especialidad
 * Llama a: GET /api/fhir/search/especialidad/{nombre}/ubicaciones
 */
export async function searchLocationsBySpecialty(nombreEspecialidadCodificado) {
  if (!nombreEspecialidadCodificado) {
    return [];
  }
  // Log para ver la URL exacta que se está llamando
  const url = `/fhir/search/especialidad/${nombreEspecialidadCodificado}/ubicaciones`;
  console.log(`Intentando buscar ubicaciones con URL: ${url}`);

  try {
    const payload = await http.get(url);

    // DEBUG: Loguear el payload crudo antes de desestructurar
    console.log("Payload recibido de searchLocationsBySpecialty:", payload);

    // Verificamos si la respuesta tiene la estructura esperada por unwrapArrayPayload
    // (unwrapArrayPayload usualmente espera { data: [...] } o similar)
    if (payload && payload.data && Array.isArray(payload.data)) {
        console.log(`Ubicaciones encontradas (antes de unwrap): ${payload.data.length}`);
        return unwrapArrayPayload(payload); // Usamos unwrap si la estructura es compatible
    } else if (Array.isArray(payload)) {
        // Si la API devuelve directamente un array
        console.log(`Ubicaciones encontradas (array directo): ${payload.length}`);
        return payload;
    } else {
        // Si la respuesta no es un array ni tiene 'data'
        console.warn("La respuesta de searchLocationsBySpecialty no tiene el formato esperado (array o {data: [...]}). Payload:", payload);
        return [];
    }

  } catch (error) {
    // Loguear el error DETALLADO
    console.error(`Error detallado al buscar ubicaciones:`, error);
    // Verificar si el error tiene una respuesta (útil para errores HTTP como 4xx, 5xx)
    if (error.response) {
        console.error('Respuesta del error:', error.response.data);
        console.error('Status del error:', error.response.status);
    }
    // Devolvemos array vacío para que la UI no falle, pero el error queda en consola
    return [];
  }
}