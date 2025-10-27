<script setup>
// Definimos las props (los valores y las funciones)
const props = defineProps({
  cargo: String,
  especialidad: String,
  establecimiento: String,
  searchQuery: String,
  onInputChange: Function,
  onReset: Function,
});

// En React, 'onInputChange' recibe un objeto 'event' (e)
// con 'e.target.name' y 'e.target.value'.
// En Vue, '@update:model-value' solo envía el 'value'.
// Creamos una función 'handleChange' que SIMULA el objeto 'event'
// para que la lógica de la vista principal (que aún no hemos hecho)
// no necesite cambiarse.
const handleChange = (event) => {
  // 'event.target' no existe, así que lo creamos
  const { name, value } = event.target;
  props.onInputChange({ target: { name, value } });
};

// ...Sin embargo, <v-text-field> no nos da 'name'.
// Una forma más simple es crear funciones separadas.
// Ignoraremos 'onInputChange' por ahora y emitiremos eventos.

const emit = defineEmits([
  'update:cargo', 
  'update:especialidad', 
  'update:establecimiento', 
  'update:searchQuery', 
  'reset'
]);
</script>

<template>
  <v-row>
    <v-col cols="12" sm="3">
      <v-text-field
        label="Cargo"
        :model-value="cargo"
        @update:model-value="emit('update:cargo', $event)"
        variant="outlined"
        density="compact"
      />
    </v-col>
    <v-col cols="12" sm="3">
      <v-text-field
        label="Especialidad"
        :model-value="especialidad"
        @update:model-value="emit('update:especialidad', $event)"
        variant="outlined"
        density="compact"
      />
    </v-col>
    <v-col cols="12" sm="3">
      <v-text-field
        label="Establecimiento"
        :model-value="establecimiento"
        @update:model-value="emit('update:establecimiento', $event)"
        variant="outlined"
        density="compact"
      />
    </v-col>
    <v-col cols="12" sm="3">
      <v-text-field
        label="Buscar"
        :model-value="searchQuery"
        @update:model-value="emit('update:searchQuery', $event)"
        variant="outlined"
        density="compact"
      />
    </v-col>
    <v-col cols="12">
      <v-btn color="secondary" variant="flat" @click="emit('reset')">
        Resetear Filtros
      </v-btn>
    </v-col>
  </v-row>
</template>