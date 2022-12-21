<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

export interface Props {
  showValue: boolean;
  loadingValue: boolean;
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
  loadingValue: false,
  title: "",
});

const emit = defineEmits([
  "update:showValue",
  "update:loadingValue",
  "confirm",
  "cancel",
]);

const modalRef = ref();
// const isConfirmed = ref(false);

const onCancel = () => {
  showValue.value = false;
  emit("cancel");
};

const onConfirm = async () => {
  //   isConfirmed.value = true;
  emit("confirm");
};

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

// watch(
//   () => props.loadingValue,
//   (loadingValue) => {
//     if (isConfirmed.value && !loadingValue) {
//       showValue.value = false;
//     }
//   }
// );
</script>

<template>
  <modal ref="modalRef" id="warningModal" v-model="showValue">
    <template #title>{{ title }}</template>

    <template #default>
      <slot></slot>
    </template>

    <template #footer>
      <b-button v-if="!loadingValue" variant="light" @click.prevent="onCancel">
        ยกเลิก
      </b-button>
      <b-button
        variant="outline-primary"
        :disabled="loadingValue"
        @click.prevent="onConfirm"
      >
        <LineMdLoadingTwotoneLoop
          v-if="loadingValue"
          :style="{ fontSize: '1em' }"
        />

        <span v-else>ยืนยัน</span>
      </b-button>
    </template>
  </modal>
</template>
