<template>
  <v-app-bar color="white" flat style="border-bottom: 1px solid #e0e0e0;">

    <v-toolbar-title class="flex-grow-1 ml-4" style="color: black;">
      Servicio de Salud Araucanía Gobierno de Chile
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn to="/contactos" text color="black">Contactos</v-btn>
    <v-btn to="/protocolos" text color="black">Protocolos</v-btn>
    <v-btn to="/Especialidades" text color="black">Especialidades</v-btn>
    <v-btn to="/criterios" text color="black">Criterios</v-btn>

  </v-app-bar>
</template>

<script setup>
// No se necesita lógica (script) para esta parte visual.
// Vue Router (instalado con create-vue) manejará las props 'to' en v-btn.
</script>

<style scoped>
/* 'scoped' asegura que estos estilos solo se aplican a este componente */
.v-toolbar-title {
  flex-grow: 1;
}
</style>
