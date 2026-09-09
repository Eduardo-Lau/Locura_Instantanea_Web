<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { ColorCode, ColorDef } from '../types/cube'
import { COLOR_LIST } from '../core/constants'

const props = defineProps<{
  modelValue: ColorCode
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ColorCode): void
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function selectColor(color: ColorDef) {
  emit('update:modelValue', color.code)
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

function getCurrentColor(): ColorDef {
  return COLOR_LIST.find(c => c.code === props.modelValue) || COLOR_LIST[0]
}
</script>

<template>
  <div ref="rootRef" class="custom-color-select">
    <!-- Botón / Trigger actual -->
    <button
      type="button"
      class="select-trigger glass-panel"
      :class="{ 'is-open': isOpen }"
      @click.stop="toggle"
    >
      <span
        class="color-dot"
        :style="{ backgroundColor: getCurrentColor().hex }"
      ></span>
      <span class="color-text">{{ getCurrentColor().name }}</span>
      <ChevronDown class="chevron-icon" :class="{ rotated: isOpen }" :size="15" />
    </button>

    <!-- Menú Desplegable flotante con Glassmorphism -->
    <Transition name="dropdown-anim">
      <div v-if="isOpen" class="dropdown-menu glass-panel">
        <button
          v-for="color in COLOR_LIST"
          :key="color.code"
          type="button"
          class="dropdown-item"
          :class="{ selected: color.code === modelValue }"
          @click.stop="selectColor(color)"
        >
          <span
            class="color-dot"
            :style="{ backgroundColor: color.hex }"
          ></span>
          <span class="color-text">{{ color.name }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-color-select {
  position: relative;
  width: 125px;
  user-select: none;
}

.select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 9px;
  background: rgba(22, 26, 38, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: space-between;
}

.select-trigger:hover,
.select-trigger.is-open {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(28, 33, 48, 0.85);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
}

.color-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.color-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff; /* Texto blanco como solicitó el usuario */
  text-align: left;
  flex: 1;
}

.chevron-icon {
  color: #94a3b8;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

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
  z-index: 100;
  overflow: hidden;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
  width: 100%;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.selected {
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.4);
}

/* Animación del dropdown */
.dropdown-anim-enter-active,
.dropdown-anim-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-anim-enter-from,
.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

@media (max-width: 520px) {
  .custom-color-select {
    width: 94px;
  }

  .select-trigger {
    padding: 5px 6px;
    gap: 4px;
    border-radius: 7px;
  }

  .color-dot {
    width: 10px;
    height: 10px;
  }

  .color-text {
    font-size: 0.78rem;
  }

  .chevron-icon {
    width: 13px;
    height: 13px;
  }

  .dropdown-menu {
    width: 105px;
    padding: 3px;
  }

  .dropdown-item {
    padding: 5px 6px;
    gap: 5px;
  }
}
</style>

