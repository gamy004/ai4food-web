<script lang="ts" setup>
import { ButtonVariant, InputSize } from "bootstrap-vue-3/src/types";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import RaphaelArrowright2 from "~icons/raphael/arrowright2";

export interface Props {
  variant: ButtonVariant
  size?: InputSize
  disabled?: boolean
  block?: boolean
  type?: string
  loading?: boolean
}

// export interface Events {
//     (e: 'click'): void
// }

const props = withDefaults(
  defineProps<Props>(),
  {
    variant: "primary",
    size: "md",
    disabled: false,
    block: false,
    type: "button",
    loading: false
  }
);

// defineEmits<Events>();

const isDisabled = computed(() => {
  return props.disabled || props.loading;
});

</script>

<template>
  <b-button :disabled="isDisabled" :block="block" :variant="variant" :size="size" :type="type">
    <LineMdLoadingTwotoneLoop v-if="loading" :style="{ fontSize: '1.25em' }" />

    <div v-else class="d-flex align-items-center justify-content-center">
      <div class="me-4">
        <slot />
      </div>

      <RaphaelArrowright2 />
    </div>
  </b-button>
</template>
