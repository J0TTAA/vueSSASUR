import { createRouter, createWebHistory } from 'vue-router'
import CriteriosView from '../views/CriteriosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 1. AÑADIDO: Ruta raíz (http://localhost:5173/)
      path: '/',
      // Redirige automáticamente a la vista de criterios
      redirect: '/criterios'
    },
    {
      // 2. TU RUTA: (http://localhost:5173/criterios)
      path: '/criterios',
      name: 'criterios',
      component: CriteriosView
    }
    // (Más adelante puedes añadir las otras rutas aquí)
    // { path: '/contactos', component: ContactosView },
    // { path: '/protocolos', component: ProtocolosView },
  ]
})

export default router
