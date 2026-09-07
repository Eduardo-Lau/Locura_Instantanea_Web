<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpDown, Check } from 'lucide-vue-next'
import { CubeFaces, ColorCode } from '../types/cube'
import { COLORS } from '../core/constants'

defineProps<{
  cubes: CubeFaces[]
  cubeOrder: number[] // [0, 1, 2, 3] orden de abajo a arriba
  isSolved: boolean
}>()

const emit = defineEmits<{
  (e: 'swap', indexA: number, indexB: number): void
}>()

function getColorHex(code: ColorCode): string {
  return COLORS[code]?.hex || '#374151'
}

function getTextColor(code: ColorCode): string {
  return COLORS[code]?.textColor || '#ffffff'
}

// Control de animación física de intercambio
const swappingPair = ref<{ idxA: number; idxB: number } | null>(null)

function triggerPhysicalSwap(indexA: number, indexB: number) {
  if (swappingPair.value) return // Evitar solapamiento si ya está animando

  swappingPair.value = { idxA: indexA, idxB: indexB }

  setTimeout(() => {
    emit('swap', indexA, indexB)
    swappingPair.value = null
  }, 260)
}
</script>

<template>
  <div class="tower-container glass-panel">
    <div class="tower-header">
      <h2 class="tower-title">Vistas Laterales de la Torre</h2>
      <div v-if="isSolved" class="badge-solved">
        <Check :size="18" stroke-width="3" />
        <span>¡RESUELTO!</span>
      </div>
    </div>

    <!-- Matriz de la torre (de arriba a abajo: nivel 4 al nivel 1) -->
    <div class="tower-grid-wrapper">
      <div class="tower-levels">
        <!-- Renderizamos desde el nivel superior (índice 3) hasta la base (índice 0) -->
        <div
          v-for="(cubeIdx, level) in [...cubeOrder].reverse()"
          :key="cubeIdx"
          class="tower-level-row"
          :class="{
            'swapping-down': swappingPair && swappingPair.idxA === (cubeOrder.length - 1 - level),
            'swapping-up': swappingPair && swappingPair.idxB === (cubeOrder.length - 1 - level)
          }"
        >
          <!-- Controles de Swap vertical y etiqueta del nivel -->
          <div class="level-indicator">
            <!-- Botón de intercambio entre niveles con animación física -->
            <button
              v-if="level < 3"
              class="swap-btn"
              title="Intercambiar posición de los cubos"
              @click="triggerPhysicalSwap(cubeOrder.length - 1 - level, cubeOrder.length - 2 - level)"
            >
              <ArrowUpDown :size="14" />
            </button>
            <div v-else class="swap-placeholder"></div>

            <span class="level-label" :style="{ color: `var(--cube-${cubeIdx + 1})` }">
              {{ cubeIdx + 1 }})
            </span>
          </div>

          <!-- Las 4 caras laterales visibles de la columna (C3, C5, C4, C6) -->
          <div class="lateral-faces">
            <!-- Cara 3 (Frontal de la torre) -->
            <div
              class="tower-face-tile"
              :style="{
                backgroundColor: getColorHex(cubes[cubeIdx].c3),
                color: getTextColor(cubes[cubeIdx].c3)
              }"
              title="Cara Lateral 1 (C3)"
            >
              {{ cubes[cubeIdx].c3 }}
            </div>

            <div class="column-separator"></div>

            <!-- Cara 5 (Derecha de la torre) -->
            <div
              class="tower-face-tile"
              :style="{
                backgroundColor: getColorHex(cubes[cubeIdx].c5),
                color: getTextColor(cubes[cubeIdx].c5)
              }"
              title="Cara Lateral 2 (C5)"
            >
              {{ cubes[cubeIdx].c5 }}
            </div>

            <div class="column-separator"></div>

            <!-- Cara 4 (Trasera de la torre) -->
            <div
              class="tower-face-tile"
              :style="{
                backgroundColor: getColorHex(cubes[cubeIdx].c4),
                color: getTextColor(cubes[cubeIdx].c4)
              }"
              title="Cara Lateral 3 (C4)"
            >
              {{ cubes[cubeIdx].c4 }}
            </div>

            <div class="column-separator"></div>

            <!-- Cara 6 (Izquierda de la torre) -->
            <div
              class="tower-face-tile"
              :style="{
                backgroundColor: getColorHex(cubes[cubeIdx].c6),
                color: getTextColor(cubes[cubeIdx].c6)
              }"
              title="Cara Lateral 4 (C6)"
            >
              {{ cubes[cubeIdx].c6 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tower-container {
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  max-width: 560px;
  margin: 0 auto;
  position: relative;
  overflow: visible;
}

.tower-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.tower-title {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: var(--text-primary);
  text-align: center;
}

.badge-solved {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #34d399;
  border-radius: 20px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.8px;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
}

.tower-grid-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.tower-levels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.tower-level-row {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  transition: transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

.tower-level-row.swapping-down {
  transform: translateY(58px);
  z-index: 5;
}

.tower-level-row.swapping-up {
  transform: translateY(-58px);
  z-index: 5;
}

.level-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 60px;
  justify-content: flex-end;
}

.swap-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #c7d2fe;
  cursor: pointer;
  transition: all 0.15s ease;
}

.swap-btn:hover {
  background: rgba(99, 102, 241, 0.55);
  border-color: rgba(99, 102, 241, 0.8);
  color: #ffffff;
  transform: scale(1.12);
}

.swap-placeholder {
  width: 28px;
  height: 28px;
}

.level-label {
  font-weight: 800;
  font-size: 1.15rem;
  font-family: var(--font-mono);
}

.lateral-faces {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(14, 18, 28, 0.6);
  backdrop-filter: blur(12px);
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.tower-face-tile {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: var(--font-mono);
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(0, 0, 0, 0.2);
  user-select: none;
  transition: transform 0.15s ease;
}

.column-separator {
  width: 1px;
  height: 38px;
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 480px) {
  .tower-container {
    padding: 16px 10px;
  }
  .tower-face-tile {
    width: 38px;
    height: 38px;
    font-size: 1.05rem;
  }
  .lateral-faces {
    gap: 6px;
    padding: 4px 6px;
  }
  .level-indicator {
    width: 48px;
  }
}
</style>
