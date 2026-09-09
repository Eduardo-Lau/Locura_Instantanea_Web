<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Trash2,
  CheckCircle2,
  XCircle,
  Play,
  History,
  ChevronDown
} from 'lucide-vue-next'
import { SavedGame } from '../../types/history'
import { CubeFaces } from '../../types/cube'
import { COLOR_LIST } from '../../core/constants'
import CubeUnfolded from '../CubeUnfolded.vue'
import Modal from '../Modal.vue'

const props = defineProps<{
  history: SavedGame[]
}>()

const emit = defineEmits<{
  (e: 'applyGame', cubes: CubeFaces[]): void
  (e: 'clearHistory'): void
}>()

const selectedGameId = ref<number | null>(null)

// Seleccionar automáticamente la partida más reciente al cargar
watch(
  () => props.history,
  (newHist) => {
    if (newHist.length > 0 && (!selectedGameId.value || !newHist.some(g => g.id === selectedGameId.value))) {
      selectedGameId.value = newHist[0].id
    }
  },
  { immediate: true }
)

const activeGame = computed<SavedGame | null>(() => {
  if (!selectedGameId.value) return null
  return props.history.find(g => g.id === selectedGameId.value) || null
})

// Modal para confirmar borrado
const isClearModalOpen = ref(false)

// Custom dropdown state
const isHistoryDropdownOpen = ref(false)
const historySelectRef = ref<HTMLElement | null>(null)

function handleClickOutsideHistory(e: MouseEvent) {
  if (historySelectRef.value && !historySelectRef.value.contains(e.target as Node)) {
    isHistoryDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutsideHistory)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutsideHistory)
})

function handleConfirmClear() {
  isClearModalOpen.value = false
  emit('clearHistory')
}

function handleApply() {
  if (activeGame.value) {
    emit('applyGame', JSON.parse(JSON.stringify(activeGame.value.cubes)))
  }
}

const faceLabels: { key: keyof CubeFaces; label: string }[] = [
  { key: 'c1', label: 'Cara 1' },
  { key: 'c2', label: 'Cara 2' },
  { key: 'c3', label: 'Cara 3' },
  { key: 'c4', label: 'Cara 4' },
  { key: 'c5', label: 'Cara 5' },
  { key: 'c6', label: 'Cara 6' }
]

function getColorName(code: string): string {
  return COLOR_LIST.find(c => c.code === code)?.name || code
}
</script>

<template>
  <div class="tab-history-view">
    <!-- Barra superior de Selección y Acciones -->
    <!-- Barra superior de Selección y Acciones con iconos Lucide -->
    <div class="history-top-bar glass-panel">
      <button
        class="glass-btn btn-accent-red"
        :disabled="history.length === 0"
        @click="isClearModalOpen = true"
      >
        <Trash2 :size="16" />
        <span>BORRAR HISTORIAL</span>
      </button>

      <div v-if="history.length > 0" class="game-select-section" ref="historySelectRef">
        <label class="select-label">Número de Partida:</label>
        <div class="custom-select-wrapper">
          <button 
            type="button" 
            class="select-trigger glass-panel" 
            :class="{ 'is-open': isHistoryDropdownOpen }"
            @click.stop="isHistoryDropdownOpen = !isHistoryDropdownOpen"
          >
            <span :class="activeGame?.hasSolution ? 'text-green' : 'text-red'">
              Partida {{ activeGame?.id }} ({{ activeGame?.solutionCount }})
            </span>
            <ChevronDown class="chevron-icon" :class="{ rotated: isHistoryDropdownOpen }" :size="15" />
          </button>
          
          <Transition name="dropdown-anim">
            <div v-if="isHistoryDropdownOpen" class="dropdown-menu glass-panel">
              <button
                v-for="game in history"
                :key="game.id"
                type="button"
                class="dropdown-item"
                :class="[
                  game.id === selectedGameId ? 'selected' : '', 
                  game.hasSolution ? 'text-green' : 'text-red'
                ]"
                @click.stop="selectedGameId = game.id; isHistoryDropdownOpen = false"
              >
                Partida {{ game.id }} ({{ game.solutionCount }})
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Estado de solución de la partida seleccionada -->
      <div v-if="activeGame" class="solution-status-badge">
        <span v-if="activeGame.hasSolution" class="status-yes">
          <CheckCircle2 :size="18" class="status-icon" />
          <span>SÍ tiene solución ({{ activeGame.solutionCount }})</span>
        </span>
        <span v-else class="status-no">
          <span class="status-icon">✖</span> NO tiene solución
          <XCircle :size="18" class="status-icon" />
          <span>NO tiene solución</span>
        </span>
      </div>
    </div>

    <!-- Si el historial está vacío -->
    <div v-if="history.length === 0" class="empty-history glass-panel">
      <History :size="48" class="empty-icon" />
      <h3>Aún no tienes partidas en el historial</h3>
      <p>Configura cubos en la pestaña <strong>Combinación</strong> y pulsa <strong>JUGAR</strong> para registrar partidas.</p>
    </div>

    <!-- Detalle de la partida seleccionada -->
    <div v-else-if="activeGame" class="history-game-detail">
      <!-- Columnas con los colores de las caras en solo-lectura -->
      <div class="cubes-config-grid">
        <div
          v-for="(cube, cubeIdx) in activeGame.cubes"
          :key="cubeIdx"
          class="cube-config-column glass-panel"
        >
          <h3 class="cube-col-title" :style="{ color: `var(--cube-${cubeIdx + 1})` }">
            Cubo {{ cubeIdx + 1 }}
          </h3>

          <div class="faces-selectors-list">
            <div
              v-for="face in faceLabels"
              :key="face.key"
              class="face-select-row"
            >
              <span class="face-label">{{ face.label }}</span>
              <div class="face-value-badge" :class="`tile-${cube[face.key]}`">
                {{ getColorName(cube[face.key]) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vistas desplegadas en cruz de la partida -->
      <div class="unfolded-cubes-row">
        <div
          v-for="(cube, cubeIdx) in activeGame.cubes"
          :key="`hist-unfolded-${cubeIdx}`"
          class="unfolded-item"
        >
          <CubeUnfolded
            :faces="cube"
            :cube-id="cubeIdx + 1"
            size="medium"
          />
        </div>
      </div>

      <!-- Botón APLICAR -->
      <!-- Botón APLICAR con icono Play -->
      <div class="apply-action-container">
        <button class="glass-btn btn-primary apply-btn" @click="handleApply">
          <Play :size="18" />
          <span>APLICAR ESTA PARTIDA AL JUEGO</span>
        </button>
      </div>
    </div>

    <!-- Modal de confirmación de borrado -->
    <Modal
      :is-open="isClearModalOpen"
      title="Borrar Historial"
      message="¿Estás seguro de que deseas eliminar todas las partidas guardadas en el historial? Esta acción no se puede deshacer."
      confirm-text="Sí, Borrar"
      cancel-text="Cancelar"
      @confirm="handleConfirmClear"
      @cancel="isClearModalOpen = false"
    />
  </div>
</template>

<style scoped>
.tab-history-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.history-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 14px 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 200;
}

.game-select-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.custom-select-wrapper {
  position: relative;
  width: 220px;
  user-select: none;
}

.select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 9px;
  background: rgba(22, 26, 38, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.95rem;
}

.select-trigger:hover,
.select-trigger.is-open {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(28, 33, 48, 0.85);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
}

.text-green { color: #10b981; }
.text-red { color: #ef4444; }

.chevron-icon { color: #94a3b8; transition: transform 0.2s ease; }
.chevron-icon.rotated { transform: rotate(180deg); }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background: rgba(18, 22, 33, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  z-index: 0 !important;
  overflow: hidden;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
  width: 100%;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: left;
}

.dropdown-item:hover { background: rgba(255, 255, 255, 0.1); }
.dropdown-item.selected {
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.4);
}

.dropdown-anim-enter-active, .dropdown-anim-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-anim-enter-from, .dropdown-anim-leave-to { opacity: 0; transform: translateY(-4px) scale(0.97); }

.solution-status-badge {
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.status-yes {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
  gap: 8px;
}

.status-no {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 6px;
  gap: 8px;
}

.status-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.empty-history {
  padding: 40px;
  padding: 44px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 500px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 8px;
  color: #6366f1;
  opacity: 0.8;
  margin-bottom: 6px;
}

.history-game-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  width: 100%;
}

.cubes-config-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}

.cube-config-column {
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cube-col-title {
  font-size: 1.15rem;
  font-weight: 800;
  text-align: center;
}

.faces-selectors-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.face-select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.face-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.face-value-badge {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  min-width: 90px;
  text-align: center;
}

.unfolded-cubes-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  justify-items: center;
}

.apply-action-container {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.apply-btn {
  padding: 12px 36px;
  font-size: 1.1rem;
  font-weight: 800;
  gap: 10px;
}

@media (max-width: 860px) {
  .cubes-config-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .unfolded-cubes-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
  .history-top-bar {
    justify-content: center;
  }
}

@media (max-width: 520px) {
  .cubes-config-grid {
    grid-template-columns: 1fr;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .cube-config-column {
    padding: 10px 8px;
    gap: 8px;
  }
  .cube-col-title {
    font-size: 1rem;
  }
  .faces-selectors-list {
    gap: 6px;
  }
  .face-select-row {
    gap: 4px;
  }
  .face-label {
    font-size: 0.8rem;
    font-weight: 600;
  }
  .face-value-badge {
    padding: 4px 6px;
    font-size: 0.78rem;
    min-width: 68px;
    border-radius: 5px;
  }
  .unfolded-cubes-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .apply-btn {
    width: 100%;
    padding: 12px 18px;
    font-size: 0.95rem;
  }
}
</style>

