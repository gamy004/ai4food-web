<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import { ContactZoneSelectData } from "~/components/contact-zone/select.vue";
import ContactZone from "~/models/ContactZone";
import CircleMinus from "~icons/akar-icons/circle-minus";

export interface SubSwabAreaModelValue {
  id?: string;
  subSwabAreaName: string;
  contactZone?: ContactZoneSelectData | null;
}

export interface Props {
  order: number;
  disabled?: boolean;
  modelValue: SubSwabAreaModelValue;
  contactZoneOptions?: ContactZone[];
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  contactZoneOptions: () => [],
});

const emit = defineEmits(["update:modelValue", "remove"]);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const validationRules = {
  modelValue: {
    subSwabAreaName: {
      required,
      $lazy: true,
    },
  },
};

const { isInvalid, isValidated, isFormInvalid } = useValidation(
  validationRules,
  {
    modelValue,
  }
);

const subSwabAreaNameRequiredState = computed(() =>
  isFormInvalid("modelValue.subSwabAreaName", ["required"])
);

const formInvalidState = computed(() => {
  let isSubSwabAreaNameInvalid = null;

  if (isInvalid.value) {
    isSubSwabAreaNameInvalid = subSwabAreaNameRequiredState.value;
  }

  return {
    subSwabAreaName: isSubSwabAreaNameInvalid,
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
    <template #label>
      <span>จุดตรวจย่อยที่{{ order }}</span>

      <b-button
        v-if="!disabled"
        variant="link"
        class="ms-2 p-0 text-danger"
        @click="emit('remove')"
      >
        <CircleMinus />
      </b-button>
    </template>
    <b-row class="row-gap-2">
      <b-col cols="12">
        <b-form-group
          label-cols-lg="4"
          label="ชื่อจุดตรวจ"
          label-for="mainSwabAreaName"
        >
          <b-form-input
            v-model="modelValue.subSwabAreaName"
            type="text"
            :placeholder="`จุดตรวจย่อยที่ ${order}`"
            :state="formInvalidState.subSwabAreaName"
          >
          </b-form-input>

          <b-form-invalid-feedback
            v-if="isInvalid"
            :state="subSwabAreaNameRequiredState"
          >
            กรุณากรอกจุดตรวจย่อยที่ {{ order }}
          </b-form-invalid-feedback>
        </b-form-group>
      </b-col>

      <b-col cols="12">
        <contact-zone-select
          id="contact-zone"
          :options="contactZoneOptions"
          v-model="modelValue.contactZone"
          show-label
          clearable
          label-cols-lg="4"
        ></contact-zone-select>
      </b-col>
    </b-row>

    <!-- <b-input-group :prepend="`${order}`">
      <b-form-input
        v-model="modelValue.subSwabAreaName"
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

    <contact-zone-select
      id="contact-zone"
      :options="contactZoneOptions"
      v-model="modelValue.contactZone"
      show-label
      label-cols-lg="4"
    ></contact-zone-select>

    <b-form-invalid-feedback
      v-if="isInvalid"
      :state="subSwabAreaNameRequiredState"
    >
      กรุณากรอกจุดตรวจย่อยที่ {{ order }}
    </b-form-invalid-feedback> -->
  </b-form-group>
</template>
