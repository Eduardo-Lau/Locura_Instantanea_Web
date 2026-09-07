<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  AlertTriangle,
  Sparkles
} from 'lucide-vue-next'
import { CubeFaces } from '../../types/cube'
import { GameSolution } from '../../types/graph'
import { getGeneralGraphEdges } from '../../core/graphSolver'
import { CUBE_EDGE_COLORS } from '../../core/constants'
import GraphSvg from '../GraphSvg.vue'

const props = defineProps<{
  cubes: CubeFaces[]
  solutions: GameSolution[]
  currentSolutionIndex: number
}>()

const emit = defineEmits<{
  (e: 'update:currentSolutionIndex', index: number): void
  (e: 'applySolution', index: number): void
}>()

// Bloque de explicación teórica colapsable (cerrado por defecto)
const isTheoryOpen = ref(false)

// Solución actualmente seleccionada para visualizar
const activeSolution = computed<GameSolution | null>(() => {
  if (props.solutions.length === 0) return null
  const idx = props.currentSolutionIndex > 0 ? props.currentSolutionIndex - 1 : 0
  return props.solutions[idx] || props.solutions[0]
})

// 12 Aristas del Grafo General
const generalEdges = computed(() => getGeneralGraphEdges(props.cubes))

// Al cambiar de solución, se aplica sincronizadamente al juego y la torre de forma inmediata
function handlePrev() {
  if (props.solutions.length === 0) return
  const nextIdx = props.currentSolutionIndex > 1 ? props.currentSolutionIndex - 1 : props.solutions.length
  emit('update:currentSolutionIndex', nextIdx)
  emit('applySolution', nextIdx)
}

function handleNext() {
  if (props.solutions.length === 0) return
  const nextIdx = props.currentSolutionIndex < props.solutions.length ? props.currentSolutionIndex + 1 : 1
  emit('update:currentSolutionIndex', nextIdx)
  emit('applySolution', nextIdx)
}

function handleApplyCurrent() {
  if (activeSolution.value) {
    emit('applySolution', props.currentSolutionIndex || 1)
  }
}
</script>

<template>
  <div class="tab-explanation-view">
    <div class="explanation-card glass-panel">
      <h2 class="explanation-title">Solución Matemática por Teoría de Grafos</h2>

      <!-- Bloque colapsable de teoría (por defecto cerrado) -->
      <div class="theory-collapsible">
        <button
          class="theory-toggle-btn glass-btn"
          @click="isTheoryOpen = !isTheoryOpen"
        >
          <div class="toggle-left">
            <BookOpen :size="17" />
            <span>Fundamento Teórico y Algoritmo Matemático</span>
          </div>
          <ChevronDown
            class="chevron-toggle"
            :class="{ rotated: isTheoryOpen }"
            :size="18"
          />
        </button>

        <Transition name="expand">
          <div v-if="isTheoryOpen" class="explanation-text-box">
            <p><strong>1. MODELADO MATEMÁTICO:</strong></p>
            <p>• Los <strong>4 vértices</strong> representan los 4 colores (Rojo, Blanco, Verde, Amarillo).</p>
            <p>• Cada uno de los 4 cubos aporta <strong>3 aristas</strong> al grafo general <strong>GL</strong>, correspondientes a sus 3 pares de caras opuestas (12 aristas en total).</p>
            <br />
            <p><strong>2. CONDICIÓN DE RESOLUCIÓN (H1 y H2):</strong></p>
            <p>• Se buscan dos subgrafos <strong>G1 (H1)</strong> y <strong>G2 (H2)</strong> tales que cada uno contenga exactamente una arista de cada cubo (4 aristas).</p>
            <p>• Cada subgrafo debe ser <strong>2-regular</strong> (todos los vértices tienen grado estrictamente igual a 2).</p>
            <p>• <strong>Disyunción:</strong> G1 y G2 no pueden compartir ninguna arista.</p>
            <br />
            <p><strong>3. ORIENTACIÓN ESPACIAL EN LA TORRE:</strong></p>
            <p>• En <strong>G1 (H1)</strong>: Se orientan las 4 aristas como un ciclo dirigido; el nodo origen va a la <strong>Izquierda</strong> y el nodo destino va a la <strong>Derecha</strong>.</p>
            <p>• En <strong>G2 (H2)</strong>: Se orientan las 4 aristas; el nodo origen va al <strong>Frente (Superior)</strong> y el destino va <strong>Atrás (Inferior)</strong>.</p>
            <p>• El par de caras restante de cada cubo queda libre en la base superior e inferior de la columna.</p>
          </div>
        </Transition>
      </div>

      <!-- Selector de Soluciones y Leyenda (sincronizado automáticamente) -->
      <div v-if="solutions.length > 0" class="solution-nav-section">
        <div class="nav-controls">
          <button class="nav-arrow-btn" title="Solución anterior" @click="handlePrev">
            <ChevronLeft :size="18" />
          </button>
          <span class="solution-counter">{{ currentSolutionIndex || 1 }} / {{ solutions.length }}</span>
          <button class="nav-arrow-btn" title="Siguiente solución" @click="handleNext">
            <ChevronRight :size="18" />
          </button>
        </div>

        <!-- Leyenda de colores de cubos -->
        <div class="cube-legend-row">
          <span
            v-for="id in [1, 2, 3, 4]"
            :key="id"
            class="legend-badge"
            :style="{ color: CUBE_EDGE_COLORS[id] }"
          >
            ● Cubo {{ id }}
          </span>
        </div>

        <button class="glass-btn btn-primary apply-sol-btn" @click="handleApplyCurrent">
          <Sparkles :size="16" />
          <span>APLICADA A LA TORRE</span>
        </button>
      </div>

      <div v-else class="no-solution-alert">
        <AlertTriangle :size="18" />
        <span>Esta configuración no tiene ninguna solución matemática válida.</span>
      </div>
    </div>

    <!-- Visualización de los 3 Grafos (GL, G1, G2) -->
    <div class="graphs-grid">
      <!-- GL: Grafo General (12 aristas) -->
      <GraphSvg
        title="GL : General"
        subtitle="12 Aristas (3 por cubo)"
        :edges="generalEdges"
      />

      <!-- G1: Subgrafo Horizontal (4 aristas de grado 2) -->
      <GraphSvg
        title="G1 : Horizontal"
        subtitle="Subgrafo H1 (Izquierda - Derecha)"
        :edges="activeSolution ? activeSolution.h1.edges : []"
      />

      <!-- G2: Subgrafo Vertical (4 aristas de grado 2) -->
      <GraphSvg
        title="G2 : Vertical"
        subtitle="Subgrafo H2 (Frente - Atrás)"
        :edges="activeSolution ? activeSolution.h2.edges : []"
      />
    </div>

    <!-- Desglose de caras resultantes para los 4 cubos en la solución actual -->
    <div v-if="activeSolution" class="solution-cubes-preview glass-panel">
      <h3 class="preview-title">Orientación Espacial Resultante de los Cubos</h3>
      <div class="solution-cubes-row">
        <div
          v-for="(resolvedFaces, cIdx) in activeSolution.cubeOrientations"
          :key="cIdx"
          class="solution-cube-box glass-card"
        >
          <!-- Cara Superior (C3) -->
          <div class="mini-face top-face" :class="`tile-${resolvedFaces.c3}`">
            {{ resolvedFaces.c3 }}
          </div>

          <div class="mini-middle-row">
            <!-- Cara Izquierda (C6) -->
            <div class="mini-face left-face" :class="`tile-${resolvedFaces.c6}`">
              {{ resolvedFaces.c6 }}
            </div>

            <!-- Centro con ID de cubo -->
            <div class="mini-center-id" :style="{ color: CUBE_EDGE_COLORS[cIdx + 1] }">
              {{ cIdx + 1 }}
            </div>

            <!-- Cara Derecha (C5) -->
            <div class="mini-face right-face" :class="`tile-${resolvedFaces.c5}`">
              {{ resolvedFaces.c5 }}
            </div>
          </div>

          <!-- Cara Inferior (C4) -->
          <div class="mini-face bottom-face" :class="`tile-${resolvedFaces.c4}`">
            {{ resolvedFaces.c4 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-explanation-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.explanation-card {
  width: 100%;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.explanation-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
  letter-spacing: 0.5px;
}

.theory-collapsible {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.theory-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
}

.toggle-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chevron-toggle {
  transition: transform 0.25s ease;
  color: #94a3b8;
}

.chevron-toggle.rotated {
  transform: rotate(180deg);
}

.explanation-text-box {
  background: rgba(15, 17, 23, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.explanation-text-box strong {
  color: #ffffff;
}

.solution-nav-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-arrow-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(155, 22, 57, 0.4);
  border: 1px solid rgba(155, 22, 57, 0.6);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-arrow-btn:hover {
  background: rgba(155, 22, 57, 0.7);
}

.solution-counter {
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 1.15rem;
  color: #ffffff;
}

.cube-legend-row {
  display: flex;
  gap: 16px;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.95rem;
  flex-wrap: wrap;
  justify-content: center;
}

.apply-sol-btn {
  margin-top: 4px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  gap: 8px;
}

.no-solution-alert {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: #f87171;
  font-weight: 600;
  font-size: 0.98rem;
}

.graphs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  width: 100%;
  justify-items: center;
}

.solution-cubes-preview {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.preview-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.solution-cubes-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  justify-items: center;
}

.solution-cube-box {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 120px;
}

.mini-middle-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-face {
  width: 28px;
  height: 28px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

.mini-center-id {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 1.2rem;
}

/* Transición expandible */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 860px) {
  .graphs-grid {
    grid-template-columns: 1fr;
  }
  .solution-cubes-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
