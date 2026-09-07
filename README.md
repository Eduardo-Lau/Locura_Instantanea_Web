# 🎲 Locura Instantánea (Web Edition)

> Versión web moderna, reactiva y didáctica del clásico rompecabezas matemático **"Locura Instantánea"** (Instant Insanity), resuelto óptimamente mediante **Teoría de Grafos**.

Desarrollado con **Vue 3**, **TypeScript**, **Vite** y una interfaz moderna con estilos **Glassmorphism leve**. Totalmente adaptable a dispositivos móviles (smartphones, tablets) y monitores de escritorio, 100% estático y optimizado para alojamiento gratuito en **GitHub Pages**, **Vercel** o **Netlify**.

---

## 🚀 Características Principales

1. **Cuatro Pestañas Interactivas**:
   - **🎛️ Combinación**: Configura manualmente las 6 caras de cada cubo o genera combinaciones aleatorias (`Aleatorio` y `Aleatorio con Solución`). Incluye vista desplegada en cruz en tiempo real.
   - **🎲 Juego**: Control táctil y con clics de rotación 3D en las 6 direcciones para cada cubo. Visualización de las 4 vistas laterales de la torre apilada, botón para intercambiar cubos verticalmente y botón para resolver automáticamente.
   - **📊 Explicación**: Demostración didáctica del modelado matemático con 3 grafos vectoriales SVG interactivos ($G_L$ General, $G_1$ Horizontal y $G_2$ Vertical) con curvatura Bézier para aristas múltiples y etiquetas de cubo.
   - **📜 Historial**: Registro persistente de partidas jugadas en `LocalStorage`, con indicador de si tiene solución, cantidad de soluciones y botón para aplicarla de nuevo al juego.

2. **Estética Glassmorphism**:
   - Fondos oscuros translúcidos con desenfoque de fondo (`backdrop-filter: blur(14px)`), bordes luminosos tenues, contrastes accesibles y animaciones de celebración (confeti).

3. **Arquitectura 100% Estática (SPA)**:
   - Todo el cómputo de búsqueda de subgrafos disjuntos 2-regulares y orientación de ciclos dirigidos ocurre en el navegador en menos de 5 milisegundos.
   - Sin dependencias de servidor backend: cero costo de infraestructura.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Efectos Visuales**: `canvas-confetti` y CSS Glassmorphism
- **Renderizado Gráfico**: SVG reactivo nativo

---

## 📦 Instalación y Ejecución Local

### Prerrequisitos
- Node.js versión 18 o superior
- Gestor de paquetes `npm`

### Pasos

1. **Navegar a la carpeta del proyecto**:
   ```bash
   cd locura_instantanea_web
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```
   El bundle optimizado listo para producción se generará en la carpeta `dist/`.

---

## 🌐 Opciones de Despliegue Gratuito

### Opción 1: GitHub Pages (Recomendada)

Dado que `vite.config.ts` está configurado con `base: './'`, la aplicación funciona en cualquier subruta de GitHub Pages sin ajustes adicionales.

#### Método A: Mediante GitHub Actions (Automático al hacer push)
Crea el archivo `.github/workflows/deploy.yml` con el siguiente contenido:

```yaml
name: Desplegar a GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Instalar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Compilar proyecto
        run: npm run build

      - name: Subir artefacto para Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Desplegar en GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Luego en tu repositorio de GitHub:
1. Ve a **Settings** > **Pages**.
2. En **Build and deployment** > **Source**, selecciona **GitHub Actions**.
3. ¡Listo! Tu web estará online en `https://<tu-usuario>.github.io/<tu-repo>/`.

#### Método B: Mediante la herramienta `gh-pages`
```bash
npm install -D gh-pages
```
Agrega en `package.json` en `"scripts"`:
```json
"deploy": "npm run build && gh-pages -d dist"
```
Y ejecuta:
```bash
npm run deploy
```

---

### Opción 2: Vercel (Ultra rápido y sin configuración)
1. Crea tu nuevo repositorio en GitHub con el contenido de `locura_instantanea_web/`.
2. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **Add New Project** e importa tu repositorio.
4. Vercel detectará automáticamente **Vite** y configurará los comandos de build y output.
5. Haz clic en **Deploy**. Obtendrás una URL gratuita HTTPS instantánea (ej. `https://locura-instantanea.vercel.app`).

---

### Opción 3: Cloudflare Pages / Netlify
- Compatible al 100%. Solo debes indicar:
  - **Build Command**: `npm run build`
  - **Build Output Directory**: `dist`

---

## 🧮 Fundamento Matemático (Teoría de Grafos)

Un juego de Locura Instantánea tiene solución si y solo si su Grafo General $G_L$ (compuesto por 4 vértices para los 4 colores y 12 aristas para los pares opuestos de caras) puede descomponerse en **dos subgrafos disjuntos en aristas** $H_1$ y $H_2$ tales que:
1. Cada subgrafo contiene exactamente una arista de cada cubo.
2. Cada vértice tiene un grado estrictamente igual a 2 en ambos subgrafos.

Al orientar $H_1$ y $H_2$ como ciclos dirigidos, se garantiza que cada color aparezca exactamente una vez en cada una de las 4 caras laterales de la torre de cubos.

---

**Autor original**: Eduardo Lau  
**Versión Web**: Adaptada con Vue 3 & Vite

