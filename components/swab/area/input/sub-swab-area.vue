<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import CircleMinus from "~icons/akar-icons/circle-minus";

export interface Props {
  order: number;
  disabled?: boolean;
  modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  modelValue: "",
});

const emit = defineEmits(["update:modelValue", "remove"]);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const validationRules = {
  modelValue: {
    required,
    $lazy: true,
  },
};

const { isInvalid, isFormInvalid } = useValidation(validationRules, {
  modelValue,
});

const subSwabAreaNameRequiredState = computed(() =>
  isFormInvalid("modelValue", ["required"])
);

const formInvalidState = computed(() => {
  let issubSwabAreaNameInvalid = null;

  if (isInvalid.value) {
    issubSwabAreaNameInvalid = subSwabAreaNameRequiredState.value;
  }

  return {
    subSwabAreaName: issubSwabAreaNameInvalid,
  };
});
</script>

<template>
  <b-form-group
    :style="{
      marginBottom: '0.25rem !important',
    }"
    :state="formInvalidState.subSwabAreaName"
  >
    <b-input-group :prepend="`${order}`">
      <b-form-input
        v-model="modelValue"
        type="text"
        placeholder="กรอกชื่อจุดตรวจรอง"
        :state="formInvalidState.subSwabAreaName"
      >
      </b-form-input>

      <b-input-group-append>
        <b-button
          v-if="!disabled"
          variant="light"
          class="border"
          @click="emit('remove')"
        >
          <CircleMinus />
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <b-form-invalid-feedback
      v-if="isInvalid"
      :state="subSwabAreaNameRequiredState"
    >
      กรุณากรอกจุดตรวจย่อยที่ {{ order }}
    </b-form-invalid-feedback>
  </b-form-group>
</template>
