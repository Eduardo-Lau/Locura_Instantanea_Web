<script setup lang="ts">
import { SlidersHorizontal, Gamepad2, Network, History, Lock } from 'lucide-vue-next'

export type ActiveTab = 'combination' | 'game' | 'explanation' | 'history'

const props = withDefaults(
  defineProps<{
    activeTab: ActiveTab
    isSolved: boolean
    hasSolution: boolean
    solutionCount: number
    canAccessGame?: boolean
    canAccessExplanation?: boolean
  }>(),
  {
    canAccessGame: true,
    canAccessExplanation: true
  }
)

const emit = defineEmits<{
  (e: 'update:activeTab', tab: ActiveTab): void
}>()

const tabs = [
  { id: 'combination' as ActiveTab, label: 'Combinación', icon: SlidersHorizontal },
  { id: 'game' as ActiveTab, label: 'Juego', icon: Gamepad2 },
  { id: 'explanation' as ActiveTab, label: 'Explicación', icon: Network },
  { id: 'history' as ActiveTab, label: 'Historial', icon: History }
]

function isTabDisabled(tabId: ActiveTab): boolean {
  if (tabId === 'game') return !props.canAccessGame
  if (tabId === 'explanation') return !props.canAccessExplanation
  return false
}

function getTabTooltip(tabId: ActiveTab): string {
  if (tabId === 'game' && !props.canAccessGame) {
    return 'Debes pulsar "JUGAR" en la pestaña Combinación para iniciar la partida'
  }
  if (tabId === 'explanation') {
    if (!props.canAccessGame) {
      return 'Debes pulsar "JUGAR" en la pestaña Combinación'
    }
    if (!props.canAccessExplanation) {
      return 'Debes resolver la torre primero para ver la explicación matemática'
    }
  }
  return ''
}

function handleTabClick(tabId: ActiveTab) {
  if (isTabDisabled(tabId)) return
  emit('update:activeTab', tabId)
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Título con letras coloreadas y animación moderna de barrido de luz y flotación -->
      <div class="brand-section">
        <h1 class="game-title">
          <span class="letter letter-rojo" style="--i: 1">L</span>
          <span class="letter letter-rojo" style="--i: 2">O</span>
          <span class="letter letter-rojo" style="--i: 3">C</span>
          <span class="letter letter-rojo" style="--i: 4">U</span>
          <span class="letter letter-rojo" style="--i: 5">R</span>
          <span class="letter letter-blanco" style="--i: 6">A</span>
          <span class="space"> </span>
          <span class="letter letter-blanco" style="--i: 7">I</span>
          <span class="letter letter-blanco" style="--i: 8">N</span>
          <span class="letter letter-verde" style="--i: 9">S</span>
          <span class="letter letter-verde" style="--i: 10">T</span>
          <span class="letter letter-verde" style="--i: 11">A</span>
          <span class="letter letter-verde" style="--i: 12">N</span>
          <span class="letter letter-amarillo" style="--i: 13">T</span>
          <span class="letter letter-amarillo" style="--i: 14">Á</span>
          <span class="letter letter-amarillo" style="--i: 15">N</span>
          <span class="letter letter-amarillo" style="--i: 16">E</span>
          <span class="letter letter-amarillo" style="--i: 17">A</span>
        </h1>
        <div class="author-subtitle">By Eduardo Lau</div>
      </div>

      <!-- Navegación por pestañas (Tabs) con iconos modernos de Lucide -->
      <nav class="tabs-nav glass-panel" aria-label="Navegación principal">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{
            active: activeTab === tab.id,
            disabled: isTabDisabled(tab.id)
          }"
          :disabled="isTabDisabled(tab.id)"
          :title="getTabTooltip(tab.id)"
          @click="handleTabClick(tab.id)"
        >
          <component :is="tab.icon" class="tab-icon" :size="18" />
          <span class="tab-label">{{ tab.label }}</span>
          <Lock v-if="isTabDisabled(tab.id)" :size="12" class="tab-lock-icon" />
          <span
            v-else-if="tab.id === 'game' && isSolved"
            class="solved-dot"
            title="¡Torre Resuelta!"
          ></span>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 24px 16px 12px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.brand-section {
  text-align: center;
  position: relative;
}

.game-title {
  font-size: clamp(2.2rem, 5.5vw, 3.6rem);
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  line-height: 1.1;
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
  user-select: none;
}

/* Animación de flotación ondulante y brillo de letras */
.letter {
  display: inline-block;
  transition: transform 0.25s ease, filter 0.25s ease;
  animation: floatTitleLetter 2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.12s);
}

.letter:hover {
  transform: translateY(-6px) scale(1.15) !important;
  filter: brightness(1.3);
}

@keyframes floatTitleLetter {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.author-subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  letter-spacing: 2.5px;
  margin-top: 6px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.85;
}

.space {
  display: inline-block;
  width: 14px;
}

/* Letras de colores con resplandor suave */
.letter-rojo {
  color: #fb7185;
  text-shadow: 0 0 20px rgba(225, 29, 72, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8);
}
.letter-blanco {
  color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8);
}
.letter-verde {
  color: #34d399;
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8);
}
.letter-amarillo {
  color: #fde047;
  text-shadow: 0 0 20px rgba(250, 204, 21, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* Tabs Nav */
.tabs-nav {
  display: flex;
  align-items: center;
  padding: 6px;
  gap: 8px;
  border-radius: 14px;
  background: rgba(18, 22, 34, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  max-width: 100%;
  overflow-x: auto;
}

.tab-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #94a3b8;
  background: transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.tab-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.tab-btn.active {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4));
  border: 1px solid rgba(165, 180, 252, 0.4);
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.35);
}

.tab-btn.disabled,
.tab-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  filter: grayscale(0.6);
}

.tab-btn.disabled:hover,
.tab-btn:disabled:hover {
  color: #94a3b8;
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

.tab-lock-icon {
  margin-left: 2px;
  color: #f87171;
  opacity: 0.9;
  flex-shrink: 0;
}

.tab-icon {
  flex-shrink: 0;
}

.solved-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  position: absolute;
  top: 7px;
  right: 7px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.7;
  }
}

@media (max-width: 640px) {
  .app-header {
    padding: 16px 10px 8px;
  }
  .tab-btn {
    padding: 7px 12px;
    font-size: 0.85rem;
    gap: 6px;
  }
}
</style>
