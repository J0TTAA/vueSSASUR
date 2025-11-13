import { http, unwrapArrayPayload } from './http';

export async function getCombinedSpecialties() {
  const payload = await http.get('/fhir/specialties/combined');
  const arr = unwrapArrayPayload(payload);
  return Array.isArray(arr) ? arr : [];
}

export async function getFhirHealth() {
  return http.get('/fhir/health');
}


