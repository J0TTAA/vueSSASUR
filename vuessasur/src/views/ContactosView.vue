<script setup>
import { ref } from 'vue';

// 1. Importamos el componente de lista que creamos
import ContactList from '../components/Contactos/ContactList.vue';
// (No necesitamos importar FilterComponent, ya que la vista lo define en línea)
// (No necesitamos importar ContactCard, ya que ContactList lo usa)

// 2. Reemplazos de 'useState' con datos de ejemplo
const open = ref(false); // Para el modal
const searchQuery = ref('');
const cargo = ref('');
const establecimiento = ref('');

const establecimientos = ref([
  'Hospital Regional', 'CESFAM Pedro de Valdivia', 'Clínica Alemana'
]);

const cargos = ['Médico', 'Priorizador', 'Contralor'];

const newContact = ref({
  id: null,
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  direccion: '',
  cargo: '',
  establecimiento: ''
});

const filteredContactos = ref([
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@ejemplo.com',
    telefono: '9 1234 5678',
    direccion: 'Av. Siempre Viva 123',
    cargo: 'Médico',
    establecimiento: 'Hospital Regional',
    fechaCreacion: '2023-01-01T10:00:00Z'
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'González',
    correo: 'maria.g@ejemplo.com',
    telefono: '9 8765 4321',
    direccion: 'Calle Falsa 456',
    cargo: 'Priorizador',
    establecimiento: 'CESFAM Pedro de Valdivia',
    fechaCreacion: '2023-02-15T11:00:00Z'
  }
]);

// 3. Lógica de 'loading', 'error' y 'handlers' (handleSubmit, etc.) ignorada
</script>

<template>
  <v-container style="max-width: 1200px;" class="pa-5">
    
    <h1 class="text-h4 mb-4">Contactos</h1>

    <v-dialog v-model="open" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          {{ newContact.id ? 'Editar Contacto' : 'Agregar Contacto' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            label="Nombre"
            v-model="newContact.nombre"
            variant="outlined"
            density="compact"
            class="mb-3"
            required
          />
          <v-text-field
            label="Apellido"
            v-model="newContact.apellido"
            variant="outlined"
            density="compact"
            class="mb-3"
            required
          />
          <v-text-field
            label="Correo"
            v-model="newContact.correo"
            variant="outlined"
            density="compact"
            class="mb-3"
            required
          />
          <v-text-field
            label="Teléfono"
            v-model="newContact.telefono"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            label="Dirección"
            v-model="newContact.direccion"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-select
            label="Cargo"
            v-model="newContact.cargo"
            :items="cargos"
            variant="outlined"
            density="compact"
            class="mb-3"
            placeholder="Seleccione un Cargo"
          />
          <v-select
            label="Establecimiento"
            v-model="newContact.establecimiento"
            :items="establecimientos"
            variant="outlined"
            density="compact"
            class="mb-3"
            placeholder="Seleccione un Establecimiento"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="secondary" @click="open = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="open = false">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row class="mt-4">
      
      <v-col cols="12" sm="4">
        <v-sheet border rounded class="pa-4">
          <h2 class="text-h6 mb-4">Filtros</h2>
          
          <v-text-field
            label="Buscar"
            v-model="searchQuery"
            variant="outlined"
            density="compact"
            class="mb-4"
          />
          <v-select
            label="Cargo"
            v-model="cargo"
            :items="['Todos', ...cargos]"
            variant="outlined"
            density="compact"
            class="mb-4"
          />
          <v-select
            label="Establecimiento"
            v-model="establecimiento"
            :items="['Todos', ...establecimientos]"
            variant="outlined"
            density="compact"
            class="mb-4"
          />

          <v-btn color="primary" block class="mb-2">Aplicar Filtros</v-btn>
          <v-btn variant="outlined" block>Limpiar Filtros</v-btn>

          <v-btn color="primary" block class="mt-6" @click="open = true">
            Agregar Contacto
          </v-btn>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="8">
        <ContactList
          :contactos="filteredContactos"
          @delete="() => {}"
          @edit="() => {}"
        />
      </v-col>
    </v-row>

  </v-container>
</template>