<script lang="ts" setup>
import { useToast } from "vue-toastification";
import checkLg from "~icons/bi/check-lg";
import crossIcon from "~icons/akar-icons/cross";

export interface Props {
  modelValue: string | null;
  swabTestId: string;
}

const props = defineProps<Props>();

const emit = defineEmits(["update:modelValue"]);

const toast = useToast();

const {
  getBacteriaByNames,
  getBacteriaStateBySwabTestId,
  api: labApi,
} = useLab();

const submitting = ref(false);
const availableBacteria = computed(() => getBacteriaByNames(["Listeria"]));

const submittingSwabTestId = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

async function onSubmit(hasBacteria) {
  submitting.value = true;

  let bacteriaSpecies = [];

  if (hasBacteria) {
    bacteriaSpecies = availableBacteria.value.map((bacteria) => ({
      bacteriaId: bacteria.id,
    }));
  }

  try {
    await labApi().updateSwabTestById(props.swabTestId, bacteriaSpecies);
  } catch (e) {
    toast.error("อัพเดตผลตรวจ  Lab ไม่สำเร็จ", { timeout: 1000 });
  } finally {
    submitting.value = false;
  }
}

const stateBacteria = computed({
  get: () => {
    return getBacteriaStateBySwabTestId(props.swabTestId);
  },

  set: async (value) => {
    submittingSwabTestId.value = props.swabTestId;

    await onSubmit(value);

    submittingSwabTestId.value = null;
  },
});
</script>
<template>
  <div class="d-flex justify-content-center">
    <b-form-radio
      v-model="stateBacteria"
      :name="`radio-${swabTestId}-has-bateria`"
      :disabled="submitting"
      :value="true"
      button
      button-variant="outline-danger"
      class="button__lab-result me-1"
    >
      <checkLg :style="{ fontSize: '1em' }" />
    </b-form-radio>

    <b-form-radio
      v-model="stateBacteria"
      :name="`radio-${swabTestId}-not-has-bateria`"
      :disabled="submitting"
      :value="false"
      class="button__lab_result me-1"
      button
      button-variant="outline-success"
    >
      <crossIcon :style="{ fontSize: '1em' }" />
    </b-form-radio>
  </div>
</template>
