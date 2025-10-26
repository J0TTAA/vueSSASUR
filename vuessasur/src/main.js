// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importaciones de Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Importa los íconos de Material Design (MDI)
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // Configura MDI como el set de íconos por defecto
  },
})

const app = createApp(App)

app.use(router)
app.use(vuetify) // Usa Vuetify en tu app

app.mount('#app')
