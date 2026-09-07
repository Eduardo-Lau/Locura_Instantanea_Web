<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CubeFaces } from './types/cube'
import { SavedGame } from './types/history'
import { solveInstantInsanity } from './core/graphSolver'
import { isTowerSolved } from './core/towerValidator'
import {
  getHistory,
  saveGameToHistory,
  clearHistory,
  loadCurrentGameState,
  saveCurrentGameState
} from './storage/persistence'
import Header, { ActiveTab } from './components/Header.vue'
import TabCombination from './components/tabs/TabCombination.vue'
import TabGame from './components/tabs/TabGame.vue'
import TabExplanation from './components/tabs/TabExplanation.vue'
import TabHistory from './components/tabs/TabHistory.vue'

// Pestaña activa
const activeTab = ref<ActiveTab>('game')

// Estado reactivo de los 4 cubos
const savedState = loadCurrentGameState()
const cubes = ref<CubeFaces[]>(savedState.cubes)

// Solución actualmente seleccionada (1-indexed)
const currentSolutionIndex = ref<number>(savedState.activeSolutionIndex || 1)

// Historial de partidas
const history = ref<SavedGame[]>(getHistory())

// Soluciones matemáticas calculadas reactivamente por Teoría de Grafos
const solutions = computed(() => {
  return solveInstantInsanity(cubes.value)
})

const hasSolution = computed(() => solutions.value.length > 0)
const solutionCount = computed(() => solutions.value.length)

// Estado resuelto en tiempo real
const isSolved = computed(() => isTowerSolved(cubes.value))

// Actualizar cubos y persistir
function updateCubes(newCubes: CubeFaces[]) {
  cubes.value = newCubes
  // Ajustar índice de solución si cambió el número de soluciones
  if (currentSolutionIndex.value > solutions.value.length) {
    currentSolutionIndex.value = solutions.value.length > 0 ? 1 : 0
  }
  saveCurrentGameState({
    cubes: cubes.value,
    activeSolutionIndex: currentSolutionIndex.value
  })
}

// Iniciar juego desde la pestaña Combinación
function handlePlay() {
  const count = solutions.value.length
  // Guardar partida en el historial
  saveGameToHistory({
    cubes: JSON.parse(JSON.stringify(cubes.value)),
    hasSolution: count > 0,
    solutionCount: count
  })
  history.value = getHistory()
  activeTab.value = 'game'
}

// Aplicar solución matemática directamente a los cubos del juego
function applySolution(index: number) {
  if (solutions.value.length === 0) return
  const validIdx = Math.max(1, Math.min(index, solutions.value.length))
  currentSolutionIndex.value = validIdx

  const sol = solutions.value[validIdx - 1]
  if (sol && sol.cubeOrientations) {
    cubes.value = JSON.parse(JSON.stringify(sol.cubeOrientations))
    saveCurrentGameState({
      cubes: cubes.value,
      activeSolutionIndex: validIdx
    })
  }
}

// Aplicar una partida del historial
function handleApplyGame(selectedCubes: CubeFaces[]) {
  updateCubes(selectedCubes)
  activeTab.value = 'game'
}

// Borrar historial
function handleClearHistory() {
  clearHistory()
  history.value = []
}

// Al montar, si no hay historial previo, registrar la configuración inicial
onMounted(() => {
  if (history.value.length === 0) {
    saveGameToHistory({
      cubes: JSON.parse(JSON.stringify(cubes.value)),
      hasSolution: solutions.value.length > 0,
      solutionCount: solutions.value.length
    })
    history.value = getHistory()
  }
})
</script>

<template>
  <div class="app-root">
    <Header
      :active-tab="activeTab"
      :is-solved="isSolved"
      :has-solution="hasSolution"
      :solution-count="solutionCount"
      @update:active-tab="activeTab = $event"
    />

    <main class="main-content">
      <Transition name="tab-slide" mode="out-in">
        <!-- Pestaña 1: Combinación -->
        <TabCombination
          v-if="activeTab === 'combination'"
          :cubes="cubes"
          @update:cubes="updateCubes"
          @play="handlePlay"
        />

        <!-- Pestaña 2: Juego -->
        <TabGame
          v-else-if="activeTab === 'game'"
          :cubes="cubes"
          :solutions="solutions"
          :current-solution-index="currentSolutionIndex"
          @update:cubes="updateCubes"
          @go-to-explanation="activeTab = 'explanation'"
          @apply-solution="applySolution"
        />

        <!-- Pestaña 3: Explicación -->
        <TabExplanation
          v-else-if="activeTab === 'explanation'"
          :cubes="cubes"
          :solutions="solutions"
          :current-solution-index="currentSolutionIndex"
          @update:current-solution-index="currentSolutionIndex = $event"
          @apply-solution="applySolution"
        />

        <!-- Pestaña 4: Historial -->
        <TabHistory
          v-else-if="activeTab === 'history'"
          :history="history"
          @apply-game="handleApplyGame"
          @clear-history="handleClearHistory"
        />
      </Transition>
    </main>

    <footer class="app-footer">
      <p>Locura Instantánea • Implementado con Vue 3, TypeScript y Teoría de Grafos </p>
    </footer>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.app-footer {
  text-align: center;
  padding: 24px 16px 16px;
  color: var(--text-muted);
  font-size: 0.82rem;
  letter-spacing: 0.3px;
}

/* Transición entre pestañas */
.tab-slide-enter-active,
.tab-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tab-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.tab-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
