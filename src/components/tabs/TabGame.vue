<script setup lang="ts">
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Network,
  AlertTriangle
} from 'lucide-vue-next'
import { CubeFaces, RotationDirection } from '../../types/cube'
import { GameSolution } from '../../types/graph'
import { rotateCube } from '../../core/cubeOperations'
import { isTowerSolved } from '../../core/towerValidator'
import CubeControl from '../CubeControl.vue'
import TowerLateral from '../TowerLateral.vue'
import Modal from '../Modal.vue'

const props = defineProps<{
  cubes: CubeFaces[]
  solutions: GameSolution[]
  currentSolutionIndex: number
}>()

const emit = defineEmits<{
  (e: 'update:cubes', newCubes: CubeFaces[]): void
  (e: 'goToExplanation'): void
  (e: 'applySolution', index: number): void
}>()

// El contador de soluciones solo se revela cuando el usuario presiona "RESOLVER"
const hasUserRequestedSolve = ref(false)

// Orden vertical de los cubos en la torre [0, 1, 2, 3]
const cubeOrder = ref<number[]>([0, 1, 2, 3])

// Control de rotación individual
function handleRotateCube(cubeIndex: number, direction: RotationDirection) {
  const updated = [...props.cubes]
  updated[cubeIndex] = rotateCube(updated[cubeIndex], direction)
  emit('update:cubes', updated)

  // Si con esta rotación manual se resolvió, disparar confeti!
  if (isTowerSolved(updated)) {
    triggerConfetti()
  }
}

// Swap vertical entre niveles de la columna
function handleSwap(indexA: number, indexB: number) {
  const newOrder = [...cubeOrder.value]
  const temp = newOrder[indexA]
  newOrder[indexA] = newOrder[indexB]
  newOrder[indexB] = temp
  cubeOrder.value = newOrder

  // Reordenar también los cubos para reflejar su nueva posición en la torre
  const reorderedCubes = newOrder.map(idx => props.cubes[idx])
  if (isTowerSolved(reorderedCubes)) {
    triggerConfetti()
  }
}

// Estado de victoria
const isSolved = computed(() => {
  const currentTowerCubes = cubeOrder.value.map(idx => props.cubes[idx])
  return isTowerSolved(currentTowerCubes)
})

// Navegación de soluciones
function handlePrevSolution() {
  if (props.solutions.length === 0) return
  const nextIdx = props.currentSolutionIndex > 1 ? props.currentSolutionIndex - 1 : props.solutions.length
  emit('applySolution', nextIdx)
}

function handleNextSolution() {
  if (props.solutions.length === 0) return
  const nextIdx = props.currentSolutionIndex < props.solutions.length ? props.currentSolutionIndex + 1 : 1
  emit('applySolution', nextIdx)
}

// Modal de Resolver
const isModalOpen = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const isConfirmOtherSolutions = ref(false)

function handleSolveClick() {
  // Al presionar resolver, se revela el contador de soluciones
  hasUserRequestedSolve.value = true

  if (props.solutions.length === 0) {
    modalTitle.value = 'Sin Solución'
    modalMessage.value = 'Esta combinación de cubos no tiene ninguna solución matemática posible según la Teoría de Grafos.'
    isConfirmOtherSolutions.value = false
    isModalOpen.value = true
    return
  }

  if (isSolved.value) {
    modalTitle.value = 'Confirmación'
    modalMessage.value = 'El juego ya está resuelto.\n¿Deseas que el programa encuentre y aplique otra solución posible?'
    isConfirmOtherSolutions.value = true
    isModalOpen.value = true
  } else {
    modalTitle.value = 'Resolver Juego'
    modalMessage.value = `Se han encontrado ${props.solutions.length} soluciones válidas.\n¿Deseas que el programa aplique la solución óptima automáticamente?`
    isConfirmOtherSolutions.value = false
    isModalOpen.value = true
  }
}

function handleConfirmModal() {
  isModalOpen.value = false
  if (props.solutions.length > 0) {
    if (isConfirmOtherSolutions.value) {
      handleNextSolution()
    } else {
      emit('applySolution', 1)
    }
    triggerConfetti()
  }
}

function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#9B1639', '#FFFFFF', '#10AF6B', '#FFEA4E']
    })
  } catch {
    // Entorno sin canvas-confetti
  }
}
</script>

<template>
  <div class="tab-game-view">
    <!-- Grid de los 4 Cubos con controles de rotación -->
    <div class="cubes-controls-row">
      <div
        v-for="(cube, idx) in cubes"
        :key="idx"
        class="cube-item"
      >
        <CubeControl
          :cube-id="idx + 1"
          :faces="cube"
          @rotate="handleRotateCube(idx, $event)"
        />
      </div>
    </div>

    <!-- Barra central: Navegación de Soluciones y Botones de Acción -->
    <div class="center-controls-bar">
      <!-- Selector de Soluciones: SOLO visible tras presionar RESOLVER (o si está resuelto) -->
      <div
        v-if="solutions.length > 0 && (hasUserRequestedSolve || isSolved)"
        class="solution-nav-bar glass-panel"
      >
        <button
          class="nav-arrow-btn"
          title="Solución anterior"
          @click="handlePrevSolution"
        >
          <ChevronLeft :size="18" />
        </button>
        <span class="solution-counter">
          {{ currentSolutionIndex > 0 ? currentSolutionIndex : 1 }} / {{ solutions.length }}
        </span>
        <button
          class="nav-arrow-btn"
          title="Siguiente solución"
          @click="handleNextSolution"
        >
          <ChevronRight :size="18" />
        </button>
      </div>

      <!-- Indicador si NO tiene solución -->
      <div v-else-if="solutions.length === 0" class="no-solution-badge glass-panel">
        <AlertTriangle :size="18" class="alert-icon" />
        <span>Sin solución matemática</span>
      </div>

      <!-- Botones Resolver y Explicación -->
      <div class="action-buttons-group">
        <!-- Botón RESOLVER: animación llamativa constante mientras no esté resuelto -->
        <button
          class="glass-btn solve-btn"
          :class="{
            'btn-solve-pulsing': !isSolved,
            'btn-accent-red': isSolved
          }"
          @click="handleSolveClick"
        >
          <Sparkles :size="18" />
          <span>RESOLVER</span>
        </button>

        <button
          class="glass-btn btn-accent-blue explain-btn"
          @click="emit('goToExplanation')"
        >
          <Network :size="18" />
          <span>EXPLICACIÓN</span>
        </button>
      </div>
    </div>

    <!-- Vistas Laterales de la Torre (4x4) -->
    <div class="tower-lateral-section">
      <TowerLateral
        :cubes="cubes"
        :cube-order="cubeOrder"
        :is-solved="isSolved"
        @swap="handleSwap"
      />
    </div>

    <!-- Modal de confirmación con iconos limpios -->
    <Modal
      :is-open="isModalOpen"
      :title="modalTitle"
      :message="modalMessage"
      confirm-text="Sí, Por Favor"
      cancel-text="No, gracias"
      :is-alert="solutions.length === 0"
      @confirm="handleConfirmModal"
      @cancel="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
.tab-game-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.cubes-controls-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  justify-items: center;
}

.cube-item {
  width: 100%;
  max-width: 220px;
}

.center-controls-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.solution-nav-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 16px;
  border-radius: 12px;
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
  transform: scale(1.08);
}

.solution-counter {
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: 1px;
  color: #ffffff;
}

.no-solution-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  font-weight: 600;
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.35);
  background: rgba(239, 68, 68, 0.1);
}

.alert-icon {
  flex-shrink: 0;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.solve-btn, .explain-btn {
  padding: 10px 26px;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  gap: 8px;
}

.tower-lateral-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Responsividad para móviles */
@media (max-width: 860px) {
  .cubes-controls-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .cubes-controls-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .cube-item {
    max-width: 100%;
  }
}
</style>
