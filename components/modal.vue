<script lang="ts" setup>
import { useModal } from "~~/composables/useModal";

export interface Props {
  modelValue?: boolean;
  title?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  title: "Title",
  hideHeader: false,
  hideFooter: false,
  closable: false,
});

const { registerModal, showModal, hideModal } = useModal();

const modalRef = ref();

onMounted(() => {
  registerModal(modalRef);

  watch(
    () => props.modelValue,
    (value) => {
      if (value) {
        showModal();
      } else {
        hideModal();
      }
    },
    { immediate: true }
  );
});

defineExpose({ showModal, hideModal });
</script>

<template>
  <div
    ref="modalRef"
    class="modal fade"
    aria-hidden="true"
    aria-labelledby="modalLabel"
    tabindex="-1"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div v-if="!hideHeader" class="modal-header">
          <h5 id="modalLabel" class="modal-title">
            <slot name="title">{{ title }}</slot>
          </h5>

          <button
            v-if="closable"
            type="button"
            class="btn-close"
            aria-label="Close"
            @click.prevent="hideModal"
          />
        </div>

        <div class="modal-body">
          <slot>message</slot>
        </div>

        <div v-if="!hideFooter" class="modal-footer">
          <slot name="footer">
            <button class="btn btn-primary" @click.prevent="hideModal">
              ปิด
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
