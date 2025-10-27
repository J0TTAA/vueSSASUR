<script setup>
// 1. Importamos la tarjeta de contacto que acabamos de crear
import ContactCard from './ContactCard.vue';

// Definimos las props que espera (la lista de contactos)
defineProps({
  contactos: {
    type: Array,
    default: () => [],
  },
});

// Definimos los eventos que este componente "subirá" a la vista principal
const emit = defineEmits(['edit', 'delete']);
</script>

<template>
  <v-row>
    
    <template v-if="contactos.length > 0">
      
      <v-col
        v-for="contacto in contactos"
        :key="contacto.id"
        cols="12"
        sm="6"
        md="4"
      >
        <ContactCard
          :contacto="contacto"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </v-col>
    </template>

    <template v-else>
      <v-col cols="12">
        <p>No hay contactos disponibles.</p>
      </v-col>
    </template>
    
  </v-row>
</template>