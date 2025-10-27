// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import CriteriosView from '../views/CriteriosView.vue'
import EspecialidadesView from '../views/EspecialidadesView.vue'
import ProtocoloView from '../views/ProtocoloView.vue'

// 1. IMPORTA LA NUEVA VISTA
import ContactosView from '../views/ContactosView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/criterios' 
    },
    {
      path: '/criterios',
      name: 'criterios',
      component: CriteriosView
    },
    {
      path: '/Especialidades',
      name: 'especialidades',
      component: EspecialidadesView
    },
    {
      path: '/protocolos',
      name: 'protocolos',
      component: ProtocoloView
    },
    // 2. AÑADE LA NUEVA RUTA
    {
      path: '/contactos', // Coincide con el 'to' del Header
      name: 'contactos',
      component: ContactosView
    }
  ]
})

export default router