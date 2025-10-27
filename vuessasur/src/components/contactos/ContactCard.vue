<script setup>
// Definimos las props que el componente espera
defineProps({
  contacto: {
    type: Object,
    required: true,
  },
});

// Definimos los eventos que este componente 'emite' hacia el padre
// Esto reemplaza las props 'onDelete' y 'onEdit'
const emit = defineEmits(['edit', 'delete']);

// Función para formatear la fecha (la lógica visual se mantiene)
const formatFecha = (fecha) => {
  return fecha ? new Date(fecha).toLocaleString() : 'N/A';
};
</script>

<template>
  <v-card variant="outlined" class="mb-4">
    
    <v-card-text>
      
      <v-card-title class="pa-0 mb-2 text-h6">
        {{ contacto.nombre }} {{ contacto.apellido }}
      </v-card-title>

      <p class="text-medium-emphasis">
        <strong>Teléfono:</strong> {{ contacto.telefono || 'N/A' }}
      </p>
      <p class="text-medium-emphasis">
        <strong>Email:</strong> {{ contacto.correo || 'N/A' }}
      </p>
      <p class="text-medium-emphasis">
        <strong>Dirección:</strong> {{ contacto.direccion || 'N/A' }}
      </p>
      <p class="text-medium-emphasis">
        <strong>Cargo:</strong> {{ contacto.cargo || 'N/A' }}
      </p>
      <p class="text-medium-emphasis">
        <strong>Establecimiento:</strong> {{ contacto.establecimiento || 'N/A' }}
      </p>
      <p class="text-medium-emphasis">
        <strong>Fecha de Creación:</strong> {{ formatFecha(contacto.fechaCreacion) }}
      </p>
    </v-card-text>

    <v-card-actions>
      <v-btn variant="outlined" color="primary" @click="emit('edit', contacto)">
        Editar
      </v-btn>
      <v-btn variant="outlined" color="secondary" @click="emit('delete', contacto.id)">
        Eliminar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
/* Ajustes para que se parezca más a MUI */
.v-card-title {
  /* Evita el espaciado extra por defecto de v-card-title */
  line-height: 1.5rem; 
}
.v-card-text p {
  margin-bottom: 4px; /* Espaciado entre líneas */
}
.v-card-actions {
  padding-left: 16px; /* Coincide con el padding de v-card-text */
  padding-bottom: 16px;
}
</style>