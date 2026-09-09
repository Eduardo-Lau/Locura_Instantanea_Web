<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dices, Sparkles, Play, AlertCircle } from 'lucide-vue-next'
import { CubeFaces, ColorCode } from '../../types/cube'
import { generateRandomCubes, generateSolvableCubes } from '../../core/generator'
import CubeUnfolded from '../CubeUnfolded.vue'
import ColorSelect from '../ColorSelect.vue'

const props = defineProps<{
  cubes: CubeFaces[]
  hasPendingChanges?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:cubes', newCubes: CubeFaces[]): void
  (e: 'play'): void
}>()

// Clon local editable
const localCubes = ref<CubeFaces[]>(JSON.parse(JSON.stringify(props.cubes)))

// Mantener sincronizado si cambian los cubos externamente (ej. Historial)
watch(
  () => props.cubes,
  (newCubes) => {
    localCubes.value = JSON.parse(JSON.stringify(newCubes))
  },
  { deep: true }
)

// Sincronizar cambios de color
function handleColorChange(cubeIdx: number, faceKey: keyof CubeFaces, newColor: ColorCode) {
  localCubes.value[cubeIdx][faceKey] = newColor
  emit('update:cubes', JSON.parse(JSON.stringify(localCubes.value)))
}

function handleRandom() {
  const randomized = generateRandomCubes()
  localCubes.value = randomized
  emit('update:cubes', randomized)
}

function handleRandomSolvable() {
  const solvable = generateSolvableCubes()
  localCubes.value = solvable
  emit('update:cubes', solvable)
}

function handlePlay() {
  emit('update:cubes', JSON.parse(JSON.stringify(localCubes.value)))
  emit('play')
}

const faceLabels: { key: keyof CubeFaces; label: string; placement: 'bottom' | 'top' }[] = [
  { key: 'c1', label: 'Cara 1', placement: 'bottom' },
  { key: 'c2', label: 'Cara 2', placement: 'bottom' },
  { key: 'c3', label: 'Cara 3', placement: 'bottom' },
  { key: 'c4', label: 'Cara 4', placement: 'top' },
  { key: 'c5', label: 'Cara 5', placement: 'top' },
  { key: 'c6', label: 'Cara 6', placement: 'top' }
]

const openDropdownId = ref<string | null>(null)

function handleDropdownToggle(id: string, isOpen: boolean) {
  if (isOpen) {
    openDropdownId.value = id
  } else if (openDropdownId.value === id) {
    openDropdownId.value = null
  }
}
</script>

<template>
  <div class="tab-combination-view">
    <!-- Barra superior de acciones (Aleatorio) con iconos minimalistas de Lucide -->
    <div class="actions-bar">
      <button class="glass-btn btn-accent-red" @click="handleRandom">
        <Dices :size="18" />
        <span>ALEATORIO</span>
      </button>
      <button
        class="glass-btn btn-accent-blue"
        title="Generar una configuración que tenga al menos una solución garantizada"
        @click="handleRandomSolvable"
      >
        <Sparkles :size="18" />
        <span>ALEATORIO CON SOLUCIÓN</span>
      </button>
    </div>

    <!-- Panel de selección de Caras para los 4 Cubos con Círculo de Color y Texto Blanco -->
    <div class="cubes-config-grid">
      <div
        v-for="(cube, cubeIdx) in localCubes"
        :key="cubeIdx"
        class="cube-config-column glass-panel"
        :style="{ zIndex: openDropdownId?.startsWith(`c${cubeIdx}-`) ? 60 : (10 - cubeIdx) }"
      >
        <h3 class="cube-col-title" :style="{ color: `var(--cube-${cubeIdx + 1})` }">
          Cubo {{ cubeIdx + 1 }}
        </h3>

        <div class="faces-selectors-list">
          <div
            v-for="face in faceLabels"
            :key="face.key"
            class="face-select-row"
            :style="{ zIndex: openDropdownId === `c${cubeIdx}-${face.key}` ? 30 : 1 }"
          >
            <span class="face-label">{{ face.label }}</span>

            <!-- Selector con círculo de color y texto blanco -->
            <ColorSelect
              :model-value="cube[face.key]"
              :placement="face.placement"
              :is-open="openDropdownId === `c${cubeIdx}-${face.key}`"
              @update:model-value="handleColorChange(cubeIdx, face.key, $event)"
              @update:is-open="handleDropdownToggle(`c${cubeIdx}-${face.key}`, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Vistas desplegadas en cruz (1 Arriba, 4 en medio, 1 Abajo) de cada cubo -->
    <div class="unfolded-cubes-row">
      <div
        v-for="(cube, cubeIdx) in localCubes"
        :key="`unfolded-${cubeIdx}`"
        class="unfolded-item"
      >
        <CubeUnfolded
          :faces="cube"
          :cube-id="cubeIdx + 1"
          size="medium"
        />
      </div>
    </div>

    <!-- Botón JUGAR principal con icono moderno Play -->
    <div class="play-action-container">
      <Transition name="fade">
        <div v-if="hasPendingChanges" class="pending-notice">
          <AlertCircle :size="16" class="notice-icon" />
          <span>Cambios sin aplicar. Pulsa <strong>JUGAR</strong> para iniciar la partida.</span>
        </div>
      </Transition>
      <button
        class="glass-btn btn-primary play-btn"
        :class="{ 'pulse-attention': hasPendingChanges }"
        @click="handlePlay"
      >
        <Play :size="20" />
        <span>JUGAR</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tab-combination-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.actions-bar {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}

.cubes-config-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  position: relative;
  z-index: 10;
}

.cube-config-column {
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}

.cube-col-title {
  font-size: 1.15rem;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.5px;
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
  position: relative;
}

.face-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.unfolded-cubes-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  justify-items: center;
  padding: 12px 0;
  position: relative;
  z-index: 1;
}

.play-action-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.pending-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  font-size: 0.88rem;
  font-weight: 600;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.15);
  text-align: center;
}

.notice-icon {
  flex-shrink: 0;
  color: #f59e0b;
}

.pulse-attention {
  animation: pulseButton 1.6s infinite ease-in-out;
}

@keyframes pulseButton {
  0%, 100% {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.8);
    transform: scale(1.03);
  }
}

.play-btn {
  padding: 12px 48px;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 1px;
  gap: 10px;
}

/* Responsividad para tablet y móvil */
@media (max-width: 860px) {
  .cubes-config-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .unfolded-cubes-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
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
  .unfolded-cubes-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    gap: 10px;
  }
  .play-btn {
    width: 100%;
    padding: 12px 24px;
    font-size: 1.05rem;
  }
}
</style>
