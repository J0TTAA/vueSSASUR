<template>
  <v-app>

    <Header />

    <v-main>

      <router-view />

    </v-main>
  </v-app>
</template>

<script setup>
// (Asegúrate de que esta ruta sea correcta)
import Header from './components/Header.vue'
</script>
