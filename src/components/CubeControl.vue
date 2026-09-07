<script setup lang="ts">
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw
} from 'lucide-vue-next'
import { CubeFaces, RotationDirection, ColorCode } from '../types/cube'
import { COLORS } from '../core/constants'

defineProps<{
  cubeId: number
  faces: CubeFaces
}>()

const emit = defineEmits<{
  (e: 'rotate', direction: RotationDirection): void
}>()

function getColorHex(code: ColorCode): string {
  return COLORS[code]?.hex || '#374151'
}

function getTextColor(code: ColorCode): string {
  return COLORS[code]?.textColor || '#ffffff'
}
</script>

<template>
  <div class="cube-control glass-card">
    <!-- Encabezado con ID del cubo y Cara Trasera en la esquina superior derecha -->
    <div class="cube-top-bar">
      <div class="cube-badge-container">
        <span class="cube-num" :style="{ color: `var(--cube-${cubeId})` }">
          {{ cubeId }})
        </span>
      </div>

      <!-- Cara Trasera (C2) visible en la esquina superior derecha como en Java -->
      <!-- Cara Trasera (C2) visible en la esquina superior derecha -->
      <div class="back-face-indicator" title="Cara Trasera (Opuesta)">
        <div
          class="back-tile"
          :style="{ backgroundColor: getColorHex(faces.c2), color: getTextColor(faces.c2) }"
        >
          {{ faces.c2 }}
        </div>
      </div>
    </div>

    <!-- Área de Cubo interactivo con sus 6 flechas -->
    <!-- Área de Cubo interactivo con sus 6 controles con iconos Lucide -->
    <div class="cube-interactive-area">
      <!-- Botón Arriba -->
      <div class="arrow-row top-arrow">
        <button
          class="cube-arrow-btn"
          title="Rotar hacia arriba"
          aria-label="Rotar hacia arriba"
          @click="emit('rotate', 'up')"
        >
          
          <ArrowUp :size="15" />
        </button>
      </div>

      <!-- Fila central: Flecha Izq, Caras Frontales y laterales, Flecha Der -->
      <div class="cube-middle-row">
        <button
          class="cube-arrow-btn"
          title="Rotar hacia la izquierda"
          aria-label="Rotar hacia la izquierda"
          @click="emit('rotate', 'left')"
        >
          
          <ArrowLeft :size="15" />
        </button>

        <!-- Bloque central del cubo con sus caras visibles -->
        <div class="cube-3d-faces">
          <!-- Cara Superior (C3) -->
          <div
            class="cube-edge-face face-top"
            :style="{ backgroundColor: getColorHex(faces.c3), color: getTextColor(faces.c3) }"
            title="Cara Superior"
          >
            <span>{{ faces.c3 }}</span>
          </div>

          <div class="cube-middle-faces">
            <!-- Cara Izquierda (C6) -->
            <div
              class="cube-edge-face face-left"
              :style="{ backgroundColor: getColorHex(faces.c6), color: getTextColor(faces.c6) }"
              title="Cara Izquierda"
            >
              <span>{{ faces.c6 }}</span>
            </div>

            <!-- Cara Frontal (C1) -->
            <div
              class="cube-front-face"
              :style="{ backgroundColor: getColorHex(faces.c1), color: getTextColor(faces.c1) }"
              title="Cara Frontal"
            >
              <span class="front-code">{{ faces.c1 }}</span>
            </div>

            <!-- Cara Derecha (C5) -->
            <div
              class="cube-edge-face face-right"
              :style="{ backgroundColor: getColorHex(faces.c5), color: getTextColor(faces.c5) }"
              title="Cara Derecha"
            >
              <span>{{ faces.c5 }}</span>
            </div>
          </div>

          <!-- Cara Inferior (C4) -->
          <div
            class="cube-edge-face face-bottom"
            :style="{ backgroundColor: getColorHex(faces.c4), color: getTextColor(faces.c4) }"
            title="Cara Inferior"
          >
            <span>{{ faces.c4 }}</span>
          </div>
        </div>

        <button
          class="cube-arrow-btn"
          title="Rotar hacia la derecha"
          aria-label="Rotar hacia la derecha"
          @click="emit('rotate', 'right')"
        >
          
          <ArrowRight :size="15" />
        </button>
      </div>

      <!-- Botón Abajo -->
      <div class="arrow-row bottom-arrow">
        <button
          class="cube-arrow-btn"
          title="Rotar hacia abajo"
          aria-label="Rotar hacia abajo"
          @click="emit('rotate', 'down')"
        >
          
          <ArrowDown :size="15" />
        </button>
      </div>

      <!-- Botones de giro Antihorario y Horario -->
      <div class="rotational-arrows">
        <button
          class="cube-arrow-btn rotate-btn"
          title="Giro Antihorario (Z)"
          aria-label="Giro Antihorario"
          @click="emit('rotate', 'counterclockwise')"
        >
          
          <RotateCcw :size="15" />
        </button>
        <button
          class="cube-arrow-btn rotate-btn"
          title="Giro Horario (Z)"
          aria-label="Giro Horario"
          @click="emit('rotate', 'clockwise')"
        >
          
          <RotateCw :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cube-control {
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 170px;
  position: relative;
}

.cube-top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 0 4px;
}

.cube-num {
  font-size: 1.2rem;
  font-weight: 800;
  font-family: var(--font-mono);
}

.back-face-indicator {
  display: flex;
  align-items: center;
}

.back-tile {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.cube-interactive-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.arrow-row {
  display: flex;
  justify-content: center;
}

.cube-middle-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cube-3d-faces {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.cube-middle-faces {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* Cara frontal principal */
.cube-front-face {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: var(--font-mono);
  font-size: 1.3rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  border: 2px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.15s ease;
}

/* Caras periféricas (arriba, abajo, izq, der) */
.cube-edge-face {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-family: var(--font-mono);
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 0.85rem;
}

.face-top, .face-bottom {
  width: 50px;
  height: 14px;
}

.face-left, .face-right {
  width: 14px;
  height: 50px;
}

.face-top span, .face-bottom span, .face-left span, .face-right span {
  transform: scale(0.85);
}

.rotational-arrows {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 4px 6px 0;
  margin-top: 2px;
}

.rotate-btn {
  font-size: 1.1rem;
  font-weight: bold;
}
</style>
