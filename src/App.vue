<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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

// Estado reactivo desacoplado:
// baseCubes: combinación inmutable que define el puzzle (GL y lista de soluciones)
// towerCubes: orientación física actual en la torre del juego
const savedState = loadCurrentGameState()
const baseCubes = ref<CubeFaces[]>(savedState.baseCubes)
const towerCubes = ref<CubeFaces[]>(savedState.towerCubes)

// Flag para indicar si hubo modificaciones en la combinación sin haber pulsado JUGAR
const hasPendingChanges = ref<boolean>(savedState.hasPendingChanges ?? false)

// Solución actualmente seleccionada (1-indexed)
const currentSolutionIndex = ref<number>(savedState.activeSolutionIndex || 1)

// Historial de partidas
const history = ref<SavedGame[]>(getHistory())

// Soluciones matemáticas calculadas reactivamente a partir de la COMBINACIÓN BASE
const solutions = computed(() => {
  return solveInstantInsanity(baseCubes.value)
})

const hasSolution = computed(() => solutions.value.length > 0)
const solutionCount = computed(() => solutions.value.length)

// Estado resuelto en tiempo real de la torre
const isSolved = computed(() => isTowerSolved(towerCubes.value))

// Validaciones de acceso requeridas por el usuario:
// 1. A 'Juego' solo se accede si no hay cambios pendientes sin jugar en Combinación
const canAccessGame = computed(() => !hasPendingChanges.value)

// 2. A 'Explicación' solo se accede si el juego está resuelto Y no hay cambios pendientes
const canAccessExplanation = computed(() => !hasPendingChanges.value && isSolved.value)

function persistState() {
  saveCurrentGameState({
    baseCubes: baseCubes.value,
    towerCubes: towerCubes.value,
    activeSolutionIndex: currentSolutionIndex.value,
    hasPendingChanges: hasPendingChanges.value
  })
}

// Actualizar combinación base desde la pestaña Combinación
function updateBaseCubes(newCubes: CubeFaces[]) {
  baseCubes.value = JSON.parse(JSON.stringify(newCubes))
  // Al cambiar la combinación del puzzle, la torre se reinicia con la nueva configuración
  towerCubes.value = JSON.parse(JSON.stringify(newCubes))
  // Marcamos que hay cambios pendientes que requieren pulsar JUGAR
  hasPendingChanges.value = true
  if (currentSolutionIndex.value > solutions.value.length) {
    currentSolutionIndex.value = solutions.value.length > 0 ? 1 : 0
  }
  persistState()
}

// Actualizar cubos de la torre (rotación o swap en el juego)
function updateTowerCubes(newTowerCubes: CubeFaces[]) {
  towerCubes.value = newTowerCubes
  persistState()
}

// Iniciar juego desde la pestaña Combinación
function handlePlay() {
  const count = solutions.value.length
  // Guardar partida en el historial con la combinación base
  saveGameToHistory({
    cubes: JSON.parse(JSON.stringify(baseCubes.value)),
    hasSolution: count > 0,
    solutionCount: count
  })
  history.value = getHistory()
  hasPendingChanges.value = false
  persistState()
  activeTab.value = 'game'
}

// Aplicar solución matemática directamente a la torre del juego (sin alterar baseCubes ni GL)
function applySolution(index: number) {
  if (solutions.value.length === 0) return
  const validIdx = Math.max(1, Math.min(index, solutions.value.length))
  currentSolutionIndex.value = validIdx

  const sol = solutions.value[validIdx - 1]
  if (sol && sol.cubeOrientations) {
    towerCubes.value = JSON.parse(JSON.stringify(sol.cubeOrientations))
    persistState()
  }
}

// Aplicar una partida del historial
function handleApplyGame(selectedCubes: CubeFaces[]) {
  baseCubes.value = JSON.parse(JSON.stringify(selectedCubes))
  towerCubes.value = JSON.parse(JSON.stringify(selectedCubes))
  currentSolutionIndex.value = 1
  hasPendingChanges.value = false
  persistState()
  activeTab.value = 'game'
}

// Borrar historial
function handleClearHistory() {
  clearHistory()
  history.value = []
}

// Control seguro de navegación entre pestañas
function handleTabChange(tab: ActiveTab) {
  if (tab === 'game' && !canAccessGame.value) return
  if (tab === 'explanation' && !canAccessExplanation.value) return
  activeTab.value = tab
}

// Redireccionar si el estado invalida la pestaña activa actual
watch(canAccessGame, (canAccess) => {
  if (!canAccess && (activeTab.value === 'game' || activeTab.value === 'explanation')) {
    activeTab.value = 'combination'
  }
})

watch(canAccessExplanation, (canAccess) => {
  if (!canAccess && activeTab.value === 'explanation') {
    activeTab.value = 'game'
  }
})

// Al montar, si no hay historial previo, registrar la configuración inicial
onMounted(() => {
  if (history.value.length === 0) {
    saveGameToHistory({
      cubes: JSON.parse(JSON.stringify(baseCubes.value)),
      hasSolution: solutions.value.length > 0,
      solutionCount: solutions.value.length
    })
    history.value = getHistory()
  }

  // Comprobación de seguridad de la pestaña inicial
  if (!canAccessGame.value && (activeTab.value === 'game' || activeTab.value === 'explanation')) {
    activeTab.value = 'combination'
  } else if (!canAccessExplanation.value && activeTab.value === 'explanation') {
    activeTab.value = 'game'
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
      :can-access-game="canAccessGame"
      :can-access-explanation="canAccessExplanation"
      @update:active-tab="handleTabChange"
    />

    <main class="main-content">
      <Transition name="tab-slide" mode="out-in">
        <!-- Pestaña 1: Combinación (usa baseCubes) -->
        <TabCombination
          v-if="activeTab === 'combination'"
          :cubes="baseCubes"
          :has-pending-changes="hasPendingChanges"
          @update:cubes="updateBaseCubes"
          @play="handlePlay"
        />

        <!-- Pestaña 2: Juego (usa towerCubes interactivos) -->
        <TabGame
          v-else-if="activeTab === 'game'"
          :cubes="towerCubes"
          :solutions="solutions"
          :current-solution-index="currentSolutionIndex"
          :is-solved="isSolved"
          @update:cubes="updateTowerCubes"
          @go-to-explanation="canAccessExplanation && (activeTab = 'explanation')"
          @go-to-combination="activeTab = 'combination'"
          @apply-solution="applySolution"
        />

        <!-- Pestaña 3: Explicación (GL usa baseCubes inmutables; soluciones sincronizan towerCubes) -->
        <TabExplanation
          v-else-if="activeTab === 'explanation'"
          :cubes="baseCubes"
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

@media (max-width: 520px) {
  .main-content {
    padding: 10px 8px;
  }
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
