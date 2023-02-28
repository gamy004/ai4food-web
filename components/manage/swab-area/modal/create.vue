<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import CircleMinus from "~icons/akar-icons/circle-minus";
import CirclePlus from "~icons/akar-icons/circle-plus";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ResponseErrorT } from "~~/composables/useRequest";
import { BodyManageSwabArea } from "~~/composables/useSwab";

export interface Props {
  idValue: string | null;
  showValue?: boolean;
}

const toast = useToast();
const { api: swabApi, getSwabAreaById } = useSwab();

const props = withDefaults(defineProps<Props>(), {
  idValue: null,
  showValue: false,
});

const emit = defineEmits([
  "update:idValue",
  "update:showValue",
  "success",
  "error",
]);

const error: Ref<ResponseErrorT | null> = ref(null);

const form = reactive({
  swabAreaName: null,
  subSwabAreas: [{ id: null, swabAreaName: null }],
  facility: { id: null },
});

const validationRules = {
  productName: { required, $lazy: true },
  productCode: { required, $lazy: true },
  alternateProductCode: { required, $lazy: true },
};
const { validate, isInvalid, isFormInvalid, resetValidation } = useValidation(
  validationRules,
  form
);

const modalRef = ref();
const submitting = ref(false);

const idValue = computed({
  get: () => props.idValue,
  set: (value) => emit("update:idValue", value),
});
const showValue = computed({
  get: () => props.showValue,
  set: (value) => emit("update:showValue", value),
});
const actionText = computed(() => (idValue.value ? "อัพเดต" : "เพิ่ม"));
const clearState = () => {
  resetValidation();
  error.value = null;
  form.swabAreaName = null;
  form.subSwabAreas = [{ id: null, swabAreaName: null }];
  form.facility = { id: null };
};
const onCancel = () => {
  if (idValue.value) {
    idValue.value = null;
  } else {
    clearState();
  }
  showValue.value = false;
};
const onSubmit = async () => {
  submitting.value = true;

  try {
    const body: BodyManageSwabArea = {
      swabAreaName: form.swabAreaName,
      subSwabAreas: form.subSwabAreas,
      facility: form.facility,
    };
    let swabAreaData;
    if (idValue.value) {
      swabAreaData = await swabApi().upadateMainSwabArea(idValue.value, body);
    } else {
      swabAreaData = await swabApi().createMainSwabArea(body);
    }

    setTimeout(() => {
      showValue.value = null;
      emit("success");
      if (idValue.value) {
        idValue.value = null;
      } else {
        clearState();
      }

      toast.success("บันทึกพื้นที่ swab สำเร็จ", { timeout: 1000 });
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถบันทึกพื้นที่ swab ได้ กรุณาลองใหม่อีกครั้ง");
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

const addSub = () => {
  form.subSwabAreas = [...form.subSwabAreas, { id: null, swabAreaName: null }];
};

const removeSub = () => {
  if (form.subSwabAreas.length > 1) {
    form.subSwabAreas.splice(-1);
  }
};

defineExpose({ clearState });
watch(
  () => idValue.value,
  (id) => {
    if (id) {
      const swabAreaData = getSwabAreaById(id);
      if (swabAreaData) {
        console.log(swabAreaData);
        console.log(swabAreaData.subSwabAreasData);
        form.swabAreaName = swabAreaData.swabAreaName;
        form.subSwabAreas = swabAreaData.subSwabAreasData.map((el) => {
          return { id: el.id, swabAreaName: el.swabAreaName };
        });
        form.facility = { id: swabAreaData.facilityId };
      }
    } else {
      clearState();
    }
  },
  { immediate: true }
);
</script>

<template>
  <modal ref="modalRef" id="swabAreaCreateModal" v-model="showValue">
    <template #title> {{ actionText }}รายการจุดตรวจ </template>

    <template #default>
      <b-container>
        <b-row>
          <div class="input-group align-items-center">
            <label
              for="swabName"
              class="form-label min-w-125px d-block col-12 col-md-auto"
              >ชื่อเครื่องจักร</label
            >
            <div class="form-control p-0 border-0">
              <facility-select
                id="facilityItem"
                v-model="form.facility"
              ></facility-select>
            </div>
          </div>
        </b-row>
        <b-row class="mt-2">
          <div class="input-group align-items-center">
            <label
              for="swabName"
              class="form-label min-w-125px d-block col-12 col-md-auto"
              >จุดตรวจหลัก</label
            >
            <div class="form-control p-0 border-0">
              <b-form-input
                v-model="form.swabAreaName"
                id="swabName"
                type="text"
                placeholder="กรอกชื่อจุดตรวจหลัก"
              />
            </div>
          </div>
        </b-row>
        <b-row class="mt-2">
          <div class="input-group align-items-center">
            <b-col>
              <b-col class="min-w-125px col-12 col-md-12">
                <label
                  for="swabName"
                  class="form-label min-w-125px col-8 col-md-auto"
                  >จุดตรวจย่อย</label
                >
                <b-button v-if="!submitting" variant="light" @click="removeSub">
                  <CircleMinus />
                </b-button>
                <b-button v-if="!submitting" variant="light" @click="addSub">
                  <CirclePlus />
                </b-button>
              </b-col>

              <template v-for="(item, index) in form.subSwabAreas">
                <b-col class="mt-2">
                  <div class="form-control p-0 border-0">
                    <b-form-input
                      v-model="item.swabAreaName"
                      id="subSwabName{{index}}"
                      type="text"
                      placeholder="กรอกชื่อจุดตรวจรอง"
                    />
                  </div>
                </b-col>
              </template>
            </b-col>
          </div>
        </b-row>
        <b-row class="mt-2">
          <div class="input-group align-items-center">
            <label
              for="detail"
              class="form-label min-w-125px d-block col-12 col-md-auto"
              >รายละเอียด</label
            >
            <div class="form-control p-0 border-0">
              <b-form-textarea
                id="detail"
                type="text"
                placeholder="กรอกรายละเอียด(ถ้ามี)"
              />
            </div>
          </div>
        </b-row>
      </b-container>
    </template>

    <template #footer>
      <b-button v-if="!submitting" variant="light" @click.prevent="onCancel">
        ยกเลิก
      </b-button>
      <b-button
        variant="outline-primary"
        :disabled="submitting"
        @click.prevent="onSubmit"
      >
        <LineMdLoadingTwotoneLoop
          v-if="submitting"
          :style="{ fontSize: '1em' }"
        />

        <span v-else>บันทึกรายการ</span>
      </b-button>
    </template>
  </modal>
</template>
