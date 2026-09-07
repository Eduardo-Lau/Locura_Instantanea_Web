<script setup lang="ts">
import { computed } from 'vue'
import { ColorCode } from '../types/cube'
import { GraphEdge } from '../types/graph'
import { COLORS, CUBE_EDGE_COLORS } from '../core/constants'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    edges: GraphEdge[]
    width?: number
    height?: number
  }>(),
  {
    width: 280,
    height: 280
  }
)

// Posiciones de los 4 nodos (R, B, V, A) exactamente como en el software original
const NODE_POSITIONS: Record<ColorCode, { x: number; y: number }> = {
  R: { x: 65, y: 65 },
  B: { x: 215, y: 65 },
  V: { x: 65, y: 215 },
  A: { x: 215, y: 215 }
}

const NODES: ColorCode[] = ['R', 'B', 'V', 'A']

interface RenderEdge {
  id: string
  pathD: string
  color: string
  cubeId: number
  labelPos: { x: number; y: number }
}

// Genera los paths SVG con curvas separadas para aristas que comparten extremos
const renderEdges = computed<RenderEdge[]>(() => {
  // Agrupar aristas por par no ordenado de vértices para calcular curvaturas
  const groups: Record<string, GraphEdge[]> = {}

  for (const edge of props.edges) {
    const pairKey = [edge.u, edge.v].sort().join('-')
    if (!groups[pairKey]) {
      groups[pairKey] = []
    }
    groups[pairKey].push(edge)
  }

  const result: RenderEdge[] = []

  for (const [pairKey, edgeList] of Object.entries(groups)) {
    const total = edgeList.length
    const [c1, c2] = pairKey.split('-') as [ColorCode, ColorCode]

    edgeList.forEach((edge, idx) => {
      const p1 = NODE_POSITIONS[edge.u]
      const p2 = NODE_POSITIONS[edge.v]

      let pathD = ''
      let labelPos = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }

      if (c1 === c2) {
        // Bucle (Loop) sobre el mismo nodo
        // Determinar dirección del bucle hacia afuera del centro del canvas
        const dirX = p1.x < 140 ? -1 : 1
        const dirY = p1.y < 140 ? -1 : 1
        const loopDist = 35 + idx * 15

        const cx1 = p1.x + dirX * loopDist
        const cy1 = p1.y
        const cx2 = p1.x
        const cy2 = p1.y + dirY * loopDist

        pathD = `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`
        labelPos = { x: p1.x + dirX * (loopDist * 0.75), y: p1.y + dirY * (loopDist * 0.75) }
      } else {
        // Arista entre dos nodos distintos
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.hypot(dx, dy)

        // Vector unitario perpendicular
        const nx = -dy / dist
        const ny = dx / dist

        // Separación simétrica de curvas
        const offset = total === 1 ? 0 : (idx - (total - 1) / 2) * 22

        if (offset === 0) {
          pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`
          labelPos = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
        } else {
          // Punto de control cuadrático desplazado perpendicularmente
          const midX = (p1.x + p2.x) / 2
          const midY = (p1.y + p2.y) / 2
          const ctrlX = midX + nx * offset * 1.5
          const ctrlY = midY + ny * offset * 1.5

          pathD = `M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`
          // Punto en la curva t=0.5
          labelPos = {
            x: 0.25 * p1.x + 0.5 * ctrlX + 0.25 * p2.x,
            y: 0.25 * p1.y + 0.5 * ctrlY + 0.25 * p2.y
          }
        }
      }

      result.push({
        id: `${edge.cubeId}-${edge.pairIndex}-${idx}`,
        pathD,
        color: CUBE_EDGE_COLORS[edge.cubeId] || '#9ca3af',
        cubeId: edge.cubeId,
        labelPos
      })
    })
  }

  return result
})
</script>

<template>
  <div class="graph-card glass-panel">
    <div class="graph-header">
      <h3 class="graph-title">{{ title }}</h3>
      <div v-if="subtitle" class="graph-subtitle">{{ subtitle }}</div>
    </div>

    <div class="svg-container">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        class="graph-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Aristas -->
        <g class="edges-group">
          <path
            v-for="edge in renderEdges"
            :key="edge.id"
            :d="edge.pathD"
            :stroke="edge.color"
            stroke-width="2.5"
            fill="none"
            stroke-linecap="round"
            class="graph-edge-path"
          />
        </g>

        <!-- Etiquetas de Aristas con ID del cubo (1, 2, 3, 4) -->
        <g class="edge-labels-group">
          <g
            v-for="edge in renderEdges"
            :key="`lbl-${edge.id}`"
            :transform="`translate(${edge.labelPos.x}, ${edge.labelPos.y})`"
          >
            <circle
              r="7"
              fill="#181a22"
              :stroke="edge.color"
              stroke-width="1.5"
            />
            <text
              text-anchor="middle"
              dominant-baseline="central"
              :fill="edge.color"
              font-size="9"
              font-weight="bold"
              font-family="monospace"
            >
              {{ edge.cubeId }}
            </text>
          </g>
        </g>

        <!-- Vértices / Nodos (R, B, V, A) -->
        <g class="nodes-group">
          <g
            v-for="node in NODES"
            :key="node"
            :transform="`translate(${NODE_POSITIONS[node].x}, ${NODE_POSITIONS[node].y})`"
            class="graph-node"
          >
            <!-- Cuadrado redondeado de nodo idéntico al estilo Java -->
            <rect
              x="-18"
              y="-18"
              width="36"
              height="36"
              rx="6"
              :fill="COLORS[node].hex"
              stroke="#ffffff"
              stroke-width="2"
              class="node-rect"
            />
            <text
              text-anchor="middle"
              dominant-baseline="central"
              :fill="COLORS[node].textColor"
              font-size="16"
              font-weight="800"
              font-family="'JetBrains Mono', monospace"
            >
              {{ node }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.graph-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 330px;
}

.graph-header {
  text-align: center;
}

.graph-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.graph-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.svg-container {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graph-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.graph-edge-path {
  transition: stroke 0.2s ease, stroke-width 0.2s ease;
}

.graph-edge-path:hover {
  stroke-width: 4;
}

.node-rect {
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5));
  transition: transform 0.15s ease;
}

.graph-node:hover .node-rect {
  stroke: var(--accent-blue);
  stroke-width: 3;
}
</style>

