<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isAlert?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click="emit('cancel')">
      <div class="modal-content glass-panel" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>

        <div class="modal-actions">
          <button
            v-if="!isAlert && cancelText"
            class="glass-btn btn-cancel"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </button>
          <button
            class="glass-btn btn-primary"
            @click="emit('confirm')"
          >
            {{ confirmText || 'Aceptar' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(6, 8, 12, 0.82);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  width: 100%;
  max-width: 440px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-radius: var(--radius-container);
  background: var(--surface-glass-elevated);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid transparent;
  background-image: linear-gradient(var(--surface-glass-elevated), var(--surface-glass-elevated)), var(--specular-border);
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  box-shadow: var(--glass-shadow);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.modal-message {
  font-size: 0.98rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 6px;
}

.btn-cancel {
  background-image: linear-gradient(var(--control-well), var(--control-well)), var(--specular-border);
}

.btn-cancel:hover {
  background-image: linear-gradient(var(--surface-glass-hover), var(--surface-glass-hover)), var(--specular-border);
}

/* Transición */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

