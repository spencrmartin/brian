# **🧠 Brian - Tu Base de Conocimiento Personal**

**Léelo en otros idiomas:** [English](./README.md) · [Français](./README.fr.md) · [Español](./README.es.md) · [Deutsch](./README.de.md) · [Português](./README.pt.md) · [Italiano](./README.it.md) · [简体中文](./README.zh.md) · [日本語](./README.ja.md) · [한국어](./README.ko.md) · [Русский](./README.ru.md)

<img width="303" height="202" alt="Screenshot 2026-02-20 at 4 30 00 PM" src="https://github.com/user-attachments/assets/c5ac10bc-14ce-4113-b116-f40b379c1726" />

> Un juego de palabras con "brain" (cerebro): Brian es tu repositorio de conocimiento inteligente con búsqueda de similitud basada en vectores, hermosa visualización de grafos e integración fluida con Goose. ¡Porque fallo al escribirlo 9 de cada 10 veces y cometo este error todo el tiempo, ahora tú también puedes!
<img width="1528" height="1109" alt="Screenshot 2026-02-19 at 3 35 51 PM" src="https://github.com/user-attachments/assets/5c849425-6c69-4d44-bd11-e19d828272f5" />

<img width="1527" height="1110" alt="Screenshot 2026-02-19 at 3 36 05 PM" src="https://github.com/user-attachments/assets/6de1efb2-5059-49e7-81a9-6b1999f6f147" />



## ✨ Características

### Gestión Central del Conocimiento
- **📚 Elementos de Conocimiento**: Almacena enlaces, notas, fragmentos de código y artículos
- **🔍 Búsqueda Inteligente**: Búsqueda de texto completo con FTS5 + similitud vectorial TF-IDF
- **🏷️ Sistema de Etiquetas**: Organiza los elementos con etiquetas para un filtrado sencillo
- **🔗 Vistas Previas de Enlaces**: Extracción automática de metadatos desde las URLs
- **📄 Compatibilidad con Google Docs**: Integración fluida con documentos de Google Drive

<img width="824" height="758" alt="Screenshot 2026-02-04 at 12 32 03 PM" src="https://github.com/user-attachments/assets/780881d8-84b3-43ef-8a84-2626302d8fbf" />


### Bases de Conocimiento Multiproyecto
- **🗂️ Múltiples Proyectos**: Organiza el conocimiento en espacios de proyecto separados

<img width="341" height="468" alt="Screenshot 2026-02-04 at 12 31 45 PM" src="https://github.com/user-attachments/assets/398433a8-21ed-40f9-b280-198bb0be0da7" />


### Visualización de Grafos
- **🕸️ Grafo Dirigido por Fuerzas**: Visualización interactiva con D3.js que muestra las conexiones
- **🎨 Resaltado por Temas**: Pasa el cursor sobre las etiquetas para ver conexiones temáticas con sombras de colores
- **🔍 Zoom Semántico**: Transiciones fluidas entre las vistas de proyecto, región y elemento
- **🌌 Universo del Conocimiento**: Aleja el zoom para ver todos los proyectos como "galaxias" en un espacio unificado
- **📍 Regiones de Conocimiento**: Agrupa elementos relacionados con límites visuales

<img width="1631" height="907" alt="Screenshot 2026-02-04 at 12 31 10 PM" src="https://github.com/user-attachments/assets/334cb713-1881-4a50-af62-28128d1dc9c8" />

### Zoom Jerárquico (Universo del Conocimiento)
- **🔭 Vista Multiescala**: Haz zoom sin interrupciones desde elementos individuales hasta todo el universo del conocimiento
- **🪐 Contornos de Proyecto**: Límites visuales alrededor de los clústeres de proyectos al alejar el zoom
- **✨ Renderizado Semántico**: Las etiquetas, los nodos y los enlaces se adaptan según el nivel de zoom
- **📊 Indicador de Zoom**: Muestra en tiempo real el nivel de zoom y la vista semántica actual


### Integración con IA
- **🤖 Integración con Goose**: Usa Brian directamente desde el asistente de IA Goose mediante MCP
- **🧭 Perfiles de Región**: Configura el comportamiento de la IA por cada región de conocimiento
- **💡 Contexto Inteligente**: Obtén contexto de conocimiento relevante para cualquier tema

<img width="609" height="779" alt="Screenshot 2026-02-04 at 12 32 30 PM" src="https://github.com/user-attachments/assets/f89a48bd-c61f-4b53-bb4b-347ed6d612d3" />


## 🚀 Inicio Rápido

### Requisitos Previos

- **Python 3.8+** - [Descargar](https://www.python.org/downloads/)
- **Node.js 16+** - [Descargar](https://nodejs.org/)
- **pnpm** - [Instalar](https://pnpm.io/installation) (`npm install -g pnpm`)
- **Goose** (opcional) - Para la integración con el asistente de IA - https://github.com/block/goose 

### Instalación con Un Solo Comando

```bash
# Clona el repositorio
git clone https://github.com/yourusername/brian.git
cd brian

# Ejecuta el script de configuración
./setup.sh
```

¡Eso es todo! El script de configuración hará lo siguiente:
- ✅ Instalar todas las dependencias de Python
- ✅ Instalar todas las dependencias del frontend
- ✅ Crear el directorio de datos de Brian
- ✅ Configurar la extensión de Goose automáticamente
- ✅ Crear cómodos scripts de inicio/parada

### Iniciar Brian

```bash
./start.sh
```

Esto inicia tanto el servidor backend (puerto 8080) como el frontend (puerto 5173).

Abre tu navegador en: **http://localhost:5173**

### Detener Brian

```bash
./stop.sh
```

## 📖 Uso

### Añadir Elementos de Conocimiento

**Mediante la interfaz web:**
1. Abre http://localhost:5173
2. Haz clic en el botón "+"
3. Elige el tipo de elemento (enlace, nota, fragmento, artículo)
4. Completa los detalles y añade etiquetas
5. ¡Guarda!

**Mediante Goose:**
```
Tú: Añade este enlace a Brian: https://example.com con las etiquetas "ai, research"
Goose: ✓ ¡Añadido a tu base de conocimiento!
```

### Gestionar Proyectos

**Crear un Proyecto:**
1. Haz clic en el Selector de Proyectos en la parte superior central
2. Haz clic en "New Project"
3. Introduce un nombre, una descripción, y elige un icono y un color
4. Haz clic en Create

**Cambiar de Proyecto:**
- Haz clic en el Selector de Proyectos y elige un proyecto
- Selecciona "All Projects" para ver todo en todas las bases de conocimiento

**Editar Proyectos:**
- Pasa el cursor sobre un proyecto en el selector y haz clic en el icono de editar (lápiz)
- Cambia el nombre, la descripción, el icono o el color

### Visualización de Grafos

La vista de grafo muestra las conexiones entre elementos según la similitud de su contenido:

- **Colores de Nodo**: Azul (enlaces), Verde (notas), Ámbar (fragmentos), Morado (artículos)
- **Grosor de Línea**: Indica la fuerza de la similitud
- **Resaltado por Temas**: Pasa el cursor sobre las etiquetas para ver conexiones temáticas
- **Detalles del Nodo**: Haz clic en cualquier nodo para ver todos los detalles en un panel inferior
- **Zoom y Desplazamiento**: Desplázate para hacer zoom, arrastra para moverte
- **Arrastrar Nodos**: Reposiciona los nodos arrastrándolos

### Universo del Conocimiento (Zoom Jerárquico)

Al ver "All Projects", puedes explorar todo tu universo del conocimiento:

1. **Alejar** (escala < 0.3): Ver todos los proyectos como clústeres distintos con límites de contorno
2. **Zoom Medio** (escala 0.3-0.5): Ver las regiones de conocimiento dentro de los proyectos
3. **Acercar** (escala > 0.5): Ver elementos individuales con todas las etiquetas

El indicador de zoom en la parte inferior izquierda muestra tu nivel de zoom actual y la vista semántica.

### Regiones de Conocimiento

Las regiones ayudan a organizar elementos relacionados dentro de un proyecto:

1. Haz clic en el botón Regions en la barra de herramientas
2. Crea una nueva región con un nombre y un color
3. Añade elementos a las regiones seleccionándolos en el grafo
4. Las regiones aparecen como límites visuales en la vista de grafo

### Búsqueda

**Mediante la interfaz web:**
- Usa la barra de búsqueda en la parte superior
- Los resultados muestran tanto coincidencias exactas como elementos similares
- Filtra por tipo, etiquetas o proyecto

**Mediante Goose:**
```
Tú: Busca "machine learning" en Brian
Goose: Se encontraron 5 elementos relacionados con machine learning...
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Ubicación de la base de datos
BRIAN_DB_PATH=~/.brian/brian.db

# Servidor de la API
BRIAN_HOST=127.0.0.1
BRIAN_PORT=8080
BRIAN_DEBUG=false

# Frontend (opcional)
VITE_PORT=5173           # Puerto del servidor de desarrollo del frontend (reserva automática si está ocupado)
VITE_API_URL=http://127.0.0.1:8080  # URL de la API del backend para el proxy
```

**Configuración Dinámica de Puertos:**
- Si `VITE_PORT` está ocupado, el frontend usará automáticamente el siguiente puerto disponible
- Útil al ejecutar varias instancias o cuando los puertos están ocupados

### Integración con Goose

El script de configuración configura Goose automáticamente. La configuración se añade a `~/.config/goose/config.yaml`:

```yaml
extensions:
  brian:
    provider: mcp
    config:
      command: "/path/to/brian/venv/bin/python"
      args:
        - "-m"
        - "brian_mcp.server"
      env:
        BRIAN_DB_PATH: "~/.brian/brian.db"
```

**Después de la configuración, reinicia Goose para cargar la extensión de Brian.**

## 🛠️ Desarrollo

### Configuración Manual

Si prefieres la instalación manual:

```bash
# Configuración del backend
python3 -m venv venv
source venv/bin/activate
pip install -e .

# Configuración del frontend
cd frontend
pnpm install

# Iniciar el backend
python -m brian.main

# Iniciar el frontend (en otra terminal)
cd frontend
pnpm dev
```

### Estructura del Proyecto

```
brian/
├── brian/                  # Backend Python package
│   ├── api/               # FastAPI routes
│   ├── database/          # SQLite database layer
│   │   ├── migrations.py  # Database migrations
│   │   ├── repository.py  # Data access layer
│   │   └── schema.py      # Database schema
│   ├── models/            # Data models
│   │   └── knowledge_item.py
│   └── services/          # Business logic
│       ├── similarity.py  # Similarity calculations
│       └── clustering.py  # Item clustering
├── brian_mcp/             # MCP server for Goose integration
├── frontend/              # React frontend
│   └── src/
│       ├── components/    # React components
│       │   ├── SimilarityGraph.jsx    # Main graph visualization
│       │   ├── ProjectSelector.jsx    # Project management UI
│       │   ├── ProjectPill.jsx        # Project indicator component
│       │   ├── Timeline.jsx           # Chronological view
│       │   ├── InfinitePinboard.jsx   # Spatial canvas
│       │   ├── RegionEditDialog.jsx   # Region management
│       │   └── Settings.jsx           # App settings
│       ├── contexts/      # React contexts
│       │   └── SettingsContext.jsx
│       ├── store/         # State management
│       │   └── useStore.js  # Zustand store
│       └── lib/           # Utilities
├── setup.sh               # One-command installation
├── start.sh               # Start both servers
└── stop.sh                # Stop both servers
```

### Ejecutar las Pruebas

```bash
# Activa el entorno virtual
source venv/bin/activate

# Ejecuta las pruebas de Python
pytest

# Prueba el servidor MCP
python test_mcp_simple.py

# Prueba la funcionalidad de búsqueda
python test_search_fix.py
```

## 🎨 Características de la Interfaz

### Selector de Proyectos
- Botón grande con forma de píldora en la parte superior central
- Muestra el proyecto actual con icono, nombre y recuento de elementos
- El modo "All Projects" muestra el icono de universo con los recuentos totales
- Menú desplegable con todos los proyectos, opción de crear nuevo y editar
- Más de 25 iconos de Lucide para elegir

### Vista de Línea de Tiempo
- Visualización cronológica de todos los elementos
- Agrupados por fecha
- Píldoras de proyecto que muestran el origen del elemento
- Líneas temáticas que conectan elementos relacionados
- Animaciones fluidas

### Vista de Grafo
- Diseño dirigido por fuerzas con D3.js
- Cálculos de similitud en tiempo real
- Selección interactiva de nodos
- Filtrado por temas con sombras
- Panel inferior para la vista detallada con píldoras de proyecto
- Animación pulsante en los nodos seleccionados
- **Zoom jerárquico** con renderizado semántico
- **Contornos de proyecto** al ver todos los proyectos
- **Indicador de zoom** que muestra el nivel actual

### Navegación
- Botones circulares con iconos que siguen los patrones de interfaz modernos
- Transiciones fluidas entre vistas
- Diseño adaptable
- Atajos de teclado (próximamente)

## 🔌 Herramientas MCP de Goose

Cuando se integra con Goose, Brian proporciona estas herramientas:

### Gestión del Conocimiento

#### `create_knowledge_item`
Añade nuevos elementos a tu base de conocimiento.
```
Parameters:
- title: Item title
- content: Main content
- item_type: link, note, snippet, or paper
- url: Optional URL
- tags: Optional list of tags
- project_id: Optional project to add to
```

#### `search_knowledge`
Busca en tu base de conocimiento con búsqueda de texto completo y por similitud.
```
Parameters:
- query: Search query
- limit: Max results (default: 10)
- project_id: Optional project filter
```

#### `find_similar_items`
Encuentra elementos similares a un elemento dado.
```
Parameters:
- item_id: UUID of the reference item
- limit: Max results (default: 5)
```

#### `get_item_details`
Obtén todos los detalles de un elemento específico.
```
Parameters:
- item_id: UUID of the item
```

#### `update_knowledge_item`
Actualiza el contenido, las etiquetas u otras propiedades de un elemento de conocimiento existente.
```
Parameters:
- item_id: UUID of the item to update
- title: Optional new title
- content: Optional new content
- tags: Optional new tags list
- url: Optional new URL
```

#### `delete_knowledge_item`
Elimina un elemento de conocimiento de la base de datos. Esta acción no se puede deshacer.
```
Parameters:
- item_id: UUID of the item to delete
```

### Gestión de Proyectos

#### `list_projects`
Enumera todos los proyectos de la base de conocimiento.

#### `create_project`
Crea un nuevo proyecto de base de conocimiento.
```
Parameters:
- name: Project name
- description: Optional description
- icon: Optional emoji icon
- color: Optional hex color
```

#### `switch_project`
Cambia el proyecto predeterminado para los nuevos elementos.
```
Parameters:
- project_id: UUID of the project
```

#### `get_project_context`
Obtén el contexto de conocimiento de un proyecto específico.
```
Parameters:
- project_id: Optional project ID
- query: Optional query to filter items
- limit: Max items (default: 20)
```

### Gestión de Regiones

#### `list_regions`
Enumera todas las regiones de conocimiento.

#### `create_region`
Crea una nueva región de conocimiento.
```
Parameters:
- name: Region name
- description: Optional description
- color: Optional hex color
- item_ids: Optional items to include
```

#### `get_region_context`
Obtén el contexto de conocimiento de una región específica.
```
Parameters:
- region_id: UUID of the region
- query: Optional query to filter items
```

### Contexto e Inteligencia

#### `get_knowledge_context`
Obtén elementos de conocimiento relevantes para un tema.
```
Parameters:
- topic: Topic to get context for
- limit: Max items (default: 5)
```

#### `suggest_regions`
Sugiere regiones relevantes para una consulta.
```
Parameters:
- query: Query to find relevant regions
- limit: Max regions (default: 3)
```

#### `debug_item_connections`
Depura las conexiones de similitud de un elemento.
```
Parameters:
- item_id: UUID of the item to debug
```

### Gestión de Conexiones

Conexiones explícitas entre elementos de conocimiento para el grafo y el seguimiento de relaciones.

#### `create_connection`
Crea una conexión explícita entre dos elementos.
```
Parameters:
- source_item_id: UUID of the source item
- target_item_id: UUID of the target item
- connection_type: Optional - related, references, extracted_from, inspired_by, etc.
- strength: Optional - 0.0 to 1.0 (default: 1.0)
- notes: Optional notes about the connection
```

#### `get_item_connections`
Obtén todas las conexiones explícitas de un elemento.
```
Parameters:
- item_id: UUID of the item
```

#### `update_connection`
Actualiza una conexión existente.
```
Parameters:
- connection_id: ID of the connection to update
- connection_type: Optional new type
- strength: Optional new strength 0.0-1.0
- notes: Optional new notes
```

#### `delete_connection`
Elimina una conexión explícita entre elementos.
```
Parameters:
- connection_id: ID of the connection to delete
```

## 📊 Algoritmo de Similitud

Brian utiliza un enfoque híbrido para encontrar conexiones:

1. **Vectorización TF-IDF**: Convierte el texto en vectores numéricos
2. **Similitud del Coseno**: Mide el ángulo entre vectores
3. **Filtrado por Umbral**: Solo muestra conexiones por encima de una similitud de 0.15
4. **Puntuaciones IDF Globales**: Precalculadas para todos los documentos
5. **Consciente del Proyecto**: Puede filtrar las conexiones por proyecto

Esto crea conexiones significativas entre elementos relacionados sin necesidad de enlazarlos manualmente.

## 🐛 Solución de Problemas

### El backend no inicia
```bash
# Comprueba si el puerto 8080 está en uso
lsof -i :8080

# Revisa los registros
tail -f backend.log
```

### El frontend no inicia
```bash
# Comprueba si el puerto 5173 está en uso
lsof -i :5173

# Revisa los registros
tail -f frontend.log

# Reinstala las dependencias
cd frontend && pnpm install
```

### Goose no ve la extensión de Brian
```bash
# Verifica la configuración
cat ~/.config/goose/config.yaml

# Comprueba que la ruta de Python es correcta
which python  # Should be inside brian/venv/bin/

# Reinicia Goose
```

### Problemas con la base de datos
```bash
# Comprueba que la base de datos existe
ls -la ~/.brian/brian.db

# Restablece la base de datos (ADVERTENCIA: elimina todos los datos)
rm ~/.brian/brian.db
# Reinicia el backend para volver a crearla
```

### El grafo no muestra los contornos de proyecto
- Asegúrate de estar en el modo "All Projects" (haz clic en Selector de Proyectos → All Projects)
- Aleja el zoom considerablemente (escala < 0.4) para ver los límites de los proyectos
- Comprueba que tienes elementos en varios proyectos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! No dudes en enviar un Pull Request.

1. Haz un fork del repositorio
2. Crea tu rama de característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT; consulta el archivo LICENSE para más detalles.

## 🙏 Agradecimientos

- Construido con [FastAPI](https://fastapi.tiangolo.com/)
- Frontend impulsado por [React](https://react.dev/) y [Vite](https://vitejs.dev/)
- Visualización de grafos con [D3.js](https://d3js.org/)
- Componentes de interfaz de [shadcn/ui](https://ui.shadcn.com/)
- Iconos de [Lucide](https://lucide.dev/)
- Gestión de estado con [Zustand](https://zustand-demo.pmnd.rs/)
- Animaciones con [Framer Motion](https://www.framer.com/motion/)
- Integración con Goose mediante [MCP](https://modelcontextprotocol.io/)

## 📚 Documentación

- [Guía de Inicio Rápido](QUICKSTART.md)
- [Referencia de Comandos](COMMANDS.md)
- [Integración con Google Drive](GOOGLE_DRIVE_INTEGRATION.md)
- [Guía de Visualización de Grafos](GRAPH_VISUALIZATION_EXPLAINED.md)
- [Filtrado por Temas](THEME_FILTERING.md)

## 🗺️ Hoja de Ruta

### Completado Recientemente
- ✅ Bases de conocimiento multiproyecto
- ✅ Selector de proyectos con iconos personalizados
- ✅ Zoom jerárquico (Universo del Conocimiento)
- ✅ Contornos de proyecto y zoom semántico
- ✅ Vista de Todos los Proyectos
- ✅ Píldoras de proyecto en la Línea de Tiempo y el Grafo
- ✅ Configuración dinámica de puertos (variables de entorno VITE_PORT, VITE_API_URL)
- ✅ Asignación automática de proyecto para las nuevas regiones
- ✅ Solucionados los problemas de carga inicial del Modo Universo
- ✅ Solucionada la persistencia de regiones entre las vistas de proyecto

### Próximamente
- 🔜 Control deslizante de zoom
- 🔜 Botones de zoom predefinidos (Todo / Proyecto / Elementos)
- 🔜 Navegación con migas de pan
- 🔜 Atajos de teclado para la navegación
- 🔜 Carga de imágenes con interpretación por LLM
- 🔜 Componentes de tarjeta estandarizados

---

**Hecho con 🧠 y ❤️**

*Un juego de palabras con "brain" (cerebro): porque tu conocimiento merece un hogar inteligente.*
