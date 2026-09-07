<script setup lang="ts">
import { CubeFaces, ColorCode } from '../types/cube'
import { COLORS } from '../core/constants'

withDefaults(
  defineProps<{
    faces: CubeFaces
    label?: string
    cubeId?: number
    size?: 'small' | 'medium' | 'large'
    showNumbers?: boolean
  }>(),
  {
    size: 'medium',
    showNumbers: false
  }
)

function getColorHex(code: ColorCode): string {
  return COLORS[code]?.hex || '#374151'
}

function getTextColor(code: ColorCode): string {
  return COLORS[code]?.textColor || '#ffffff'
}
</script>

<template>
  <div class="cube-unfolded" :class="`size-${size}`">
    <div v-if="label || cubeId" class="unfolded-header">
      <span v-if="cubeId" class="cube-badge" :style="{ borderColor: `var(--cube-${cubeId})` }">
        {{ cubeId }})
      </span>
      <span v-if="label" class="cube-label">{{ label }}</span>
    </div>

    <!-- Red plana desplegada en cruz (1 Arriba, 4 en medio, 1 Abajo) -->
    <div class="cross-grid">
      <!-- Fila 1: Cara 3 (Superior) -->
      <div class="grid-cell empty"></div>
      <div
        class="grid-cell face face-3"
        :style="{ backgroundColor: getColorHex(faces.c3), color: getTextColor(faces.c3) }"
        :title="`Cara 3: ${COLORS[faces.c3]?.name}`"
      >
        <span class="face-code">{{ faces.c3 }}</span>
        <span v-if="showNumbers" class="face-num">3</span>
      </div>
      <div class="grid-cell empty"></div>
      <div class="grid-cell empty"></div>

      <!-- Fila 2: Cara 1, Cara 5, Cara 2, Cara 6 -->
      <div
        class="grid-cell face face-1"
        :style="{ backgroundColor: getColorHex(faces.c1), color: getTextColor(faces.c1) }"
        :title="`Cara 1: ${COLORS[faces.c1]?.name}`"
      >
        <span class="face-code">{{ faces.c1 }}</span>
        <span v-if="showNumbers" class="face-num">1</span>
      </div>
      <div
        class="grid-cell face face-5"
        :style="{ backgroundColor: getColorHex(faces.c5), color: getTextColor(faces.c5) }"
        :title="`Cara 5: ${COLORS[faces.c5]?.name}`"
      >
        <span class="face-code">{{ faces.c5 }}</span>
        <span v-if="showNumbers" class="face-num">5</span>
      </div>
      <div
        class="grid-cell face face-2"
        :style="{ backgroundColor: getColorHex(faces.c2), color: getTextColor(faces.c2) }"
        :title="`Cara 2: ${COLORS[faces.c2]?.name}`"
      >
        <span class="face-code">{{ faces.c2 }}</span>
        <span v-if="showNumbers" class="face-num">2</span>
      </div>
      <div
        class="grid-cell face face-6"
        :style="{ backgroundColor: getColorHex(faces.c6), color: getTextColor(faces.c6) }"
        :title="`Cara 6: ${COLORS[faces.c6]?.name}`"
      >
        <span class="face-code">{{ faces.c6 }}</span>
        <span v-if="showNumbers" class="face-num">6</span>
      </div>

      <!-- Fila 3: Cara 4 (Inferior) -->
      <div class="grid-cell empty"></div>
      <div
        class="grid-cell face face-4"
        :style="{ backgroundColor: getColorHex(faces.c4), color: getTextColor(faces.c4) }"
        :title="`Cara 4: ${COLORS[faces.c4]?.name}`"
      >
        <span class="face-code">{{ faces.c4 }}</span>
        <span v-if="showNumbers" class="face-num">4</span>
      </div>
      <div class="grid-cell empty"></div>
      <div class="grid-cell empty"></div>
    </div>
  </div>
</template>

<style scoped>
.cube-unfolded {
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.unfolded-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cube-badge {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.cube-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.cross-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 3px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.grid-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}

.grid-cell.empty {
  background: transparent;
  box-shadow: none;
  border: none;
}

.face-code {
  font-size: 1.05rem;
  line-height: 1;
}

.face-num {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.55rem;
  opacity: 0.7;
}

/* Tamaños */
.size-small .grid-cell {
  width: 22px;
  height: 22px;
}
.size-small .face-code {
  font-size: 0.75rem;
}

.size-medium .grid-cell {
  width: 32px;
  height: 32px;
}
.size-medium .face-code {
  font-size: 0.95rem;
}

.size-large .grid-cell {
  width: 40px;
  height: 40px;
}
.size-large .face-code {
  font-size: 1.15rem;
}
</style>
