# Práctica — Consumo de APIs y Visualización Web (Flask + CommunityDragon)

## 1. Introducción

Esta aplicación web muestra una **lista de campeones de League of Legends** consumiendo datos desde una **API externa** y renderizándolos dinámicamente en una página HTML.  
El proyecto está diseñado para reforzar:

- Consumo de datos desde una API REST.
- Visualización de información en HTML (estructura clara).
- Uso de peticiones asíncronas en el cliente con **`fetch`**.
- Comprensión de arquitectura **cliente-servidor** mediante un backend ligero con **Flask** (opcional en el enunciado, implementado en este proyecto).

---

## 2. Objetivos de la práctica (según enunciado)

### 2.1 Página HTML simple
Se crea una vista `champions.html` que lista campeones en tarjetas (nombre + icono) de forma clara.

### 2.2 Consumo de API mediante `fetch`
En el **frontend** (`searchbar.js`) se usa `fetch()` para pedir información de detalle de un campeón (bio corta + datos) cuando el usuario hace click en una tarjeta.

### 2.3 Servidor de aplicaciones (opcional)
Se implementa un servidor Flask (`app.py`) para:
- Servir las plantillas HTML (`templates/`)
- Servir recursos estáticos (`static/`)
- Consumir la API externa desde servidor (con `requests`) y pasar datos a la vista.

## 3. Arquitectura general (cliente-servidor)

**Servidor (Flask)**
1. El usuario entra en `/` o `/champions`.
2. Flask llama al servicio `services/champion_service.py`.
3. Este servicio consume la API externa (CommunityDragon) con `requests`.
4. Flask renderiza el HTML y entrega la lista de campeones a la plantilla.

**Cliente (Navegador)**
1. El HTML se renderiza con tarjetas de campeones.
2. `searchbar.js`:
   - Filtra campeones en vivo (sin recargar página).
   - Abre un popup/modal al hacer click en un campeón.
   - Llama con `fetch()` al endpoint de detalle del campeón para mostrar una “nota interesante”.

---

## 4. API externa utilizada (CommunityDragon)

La aplicación usa endpoints públicos (sin API key) de CommunityDragon:

### 4.1 Lista de campeones
- **URL**:  
  `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json`
- **Uso**: obtener lista base (id, name, alias, roles, etc.)

### 4.2 Iconos de campeones
- **URL**:  
  `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/{championId}.png`
- **Uso**: mostrar icono en cada tarjeta y en el popup.

### 4.3 Detalle de campeón (para “dato interesante”)
- **URL**:  
  `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/{championId}.json`
- **Uso** (frontend con `fetch`): extraer `title`, `shortBio`, `tacticalInfo`, `skins`, etc.

> Nota: Se intentó añadir splash art como fondo del popup. En algunos casos devolvía 404 por formato de URL/ID de skin. La funcionalidad está documentada en el código como “feature experimental” (puede activarse o sustituirse por Data Dragon si se desea).

---

## 5. Estructura del proyecto (por carpetas)
mi_proyecto_flask_lol/
│
├── app.py
├── requirements.txt
│
├── services/
│ ├── init.py
│ └── champion_service.py
│
├── templates/
│ ├── base.html
│ └── champions.html
│
└── static/
├── css/
│ └── style.css
├── scripts/
│ └── searchbar.js
└── img/
└── roles/
├── top.svg
├── jungle.svg
├── mid.svg
├── adc.svg
└── support.svg

---

## 6. Explicación del código (por archivos)

### 6.1 `app.py` (servidor Flask)
Responsabilidades:
- Crear la aplicación Flask.
- Definir rutas principales:
  - `/` y `/champions` → renderizan la misma vista con la lista.
- Llamar al servicio `get_all_champions()` y pasar resultado a la plantilla.

**Qué devuelve**: HTML renderizado (plantilla Jinja2) con la lista de campeones ya cargada.

---

### 6.2 `services/champion_service.py` (consumo de API en servidor)
Responsabilidades:
- Llamar a `champion-summary.json` usando `requests`.
- Validar respuesta HTTP.
- Filtrar el placeholder `id = -1`.
- Ordenar la lista alfabéticamente para una UI más limpia.

**Qué devuelve**: una lista `list[dict]` con campeones para renderizar en la plantilla.

---

### 6.3 `templates/base.html` (layout base)
Responsabilidades:
- Estructura HTML común:
  - `<header>` + navegación.
  - `<main>` para contenido.
- Cargar CSS:
  - `static/css/style.css`
- Cargar JavaScript:
  - `static/scripts/searchbar.js`

---

### 6.4 `templates/champions.html` (lista + modal)
Responsabilidades:
- Mostrar input de búsqueda (`#championSearch`).
- Renderizar tarjetas `.champion-card` con:
  - imagen del icono
  - nombre del campeón
- Añadir atributos `data-*` necesarios para JS:
  - `data-name`, `data-alias`, `data-id`, `data-roles`…
- Definir el HTML del popup/modal:
  - `#championModal`, `#modalContent`, `#modalChampionName`, `#modalChampionIcon`, `#modalLanes`, `#modalNoteText`…

---

### 6.5 `static/scripts/searchbar.js` (frontend)
Responsabilidades principales:

#### A) Filtrado en vivo (sin recargar)
- Escucha `input` en `#championSearch`.
- Compara texto con `data-name` y `data-alias`.
- Oculta/enseña tarjetas añadiendo o quitando la clase `.is-hidden`.

#### B) Modal/popup al click
- Escucha click en `#championContainer`.
- Detecta la `.champion-card` clicada.
- Rellena el modal:
  - nombre
  - icono del campeón
  - líneas recomendadas (heurística + overrides)
- Abre el modal.

#### C) `fetch()` de detalle del campeón (dato interesante)
- Llama a `/v1/champions/{id}.json` con `fetch()`.
- Construye un texto “interesante” combinando:
  - título (`title`)
  - bio corta (`shortBio`)
  - info rápida (dificultad, daño, skins)
- Muestra ese texto en `#modalNoteText`.

#### D) Iconos de líneas con SVG locales
- Para top/jungle/mid/adc/support se usan SVG en:
  `static/img/roles/`
- Se renderizan dentro del modal como `<img src="/static/img/roles/{lane}.svg">`.

---

### 6.6 `static/css/style.css` (estilos)
Responsabilidades:
- Estilo general (dark theme).
- Grid de tarjetas.
- Hover y UI básica.
- Estilos del modal:
  - overlay
  - card modal
  - chips de líneas
- Clase `.is-hidden` para el filtrado.

---

## 7. Cómo ejecutar y probar la aplicación

> Importante: **no se abre el HTML con doble click**, porque usa plantillas Jinja (`{% %}` / `{{ }}`), que requieren Flask.

### 7.1 Crear y activar entorno virtual (Windows)
```bash
python -m venv venv
venv\Scripts\activate
```

## 7.2 Cómo ejecutar y probar la aplicación
```bash
pip install -r requirements.txt
```

## 7.3 Ejecutar el Servidor
```bash
python app.py
```

## 7.4 Abrir la web

http://127.0.0.1:5000/

http://127.0.0.1:5000/champions

## 7.5 Comprobaciones útiles

F12 → Console: ver errores JS.

F12 → Network: ver llamadas fetch() al JSON del campeón.

Si cambias JS/CSS y no se refleja: Ctrl + F5.

## 8. Decisiones de diseño (justificación)

Flask se usa como servidor opcional recomendado para reforzar arquitectura cliente-servidor.

Se separa el consumo de API en services/ para mantener app.py limpio.

Se separa templates/ y static/ siguiendo el estándar de Flask.

El filtrado se hace en cliente por eficiencia (sin recargar y sin llamar de nuevo al servidor).

La información “interesante” se carga bajo demanda con fetch() para:

reducir carga inicial

demostrar peticiones asíncronas


## 9 Fallos a Corregir

No se ha llegado a corregir problema con Splasahrts, la Función pickSplashSkinId de Static/scripts/searchbar.js no funciona Correctamente.

No he logrado llegar a conectar con la info de la API de forma correcta.
