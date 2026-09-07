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
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
  border-radius: 18px;
  background: rgba(22, 26, 38, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
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
  background: rgba(255, 255, 255, 0.05);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
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

