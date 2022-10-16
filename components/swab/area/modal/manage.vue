<script lang="ts" setup>
import { helpers, required } from "@vuelidate/validators";
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import CirclePlusFill from "~icons/akar-icons/circle-plus-fill";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ResponseErrorT } from "~~/composables/useRequest";
import { BodyManageSwabArea } from "~~/composables/useSwab";

export interface Props {
  idValue: string | null;
  showValue: boolean;
}

const toast = useToast();
const { isErrorDataExists } = useRequest();
const { api: swabApi } = useSwab();

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

const form = reactive({
  mainSwabAreaName: "",
  subSwabAreas: [],
  facility: null,
});

const validationRules = {
  mainSwabAreaName: { required, $lazy: true },
};

const { v$, validate, isInvalid, isFormInvalid, resetValidation } =
  useValidation(validationRules, form);

const modalRef = ref();
const submitting = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);
const show = ref(false);

const addSubSwabArea = () => {
  form.subSwabAreas.push({ subSwabAreaName: "" });
};

const removeSubSwabArea = (subIndex) => {
  form.subSwabAreas.splice(subIndex, 1);
};

const clearState = () => {
  resetValidation();

  error.value = null;

  form.mainSwabAreaName = "";
  form.subSwabAreas = [];
  form.facility = null;
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
  validate();

  if (isInvalid.value) {
    return toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");
  }

  submitting.value = true;

  try {
    const body: BodyManageSwabArea = {
      swabAreaName: form.mainSwabAreaName,
      subSwabAreas: form.subSwabAreas,
      facility: form.facility,
    };

    let swabArea;

    if (idValue.value) {
      swabArea = await swabApi().upadateMainSwabArea(idValue.value, body);
    } else {
      swabArea = await swabApi().createMainSwabArea(body);
    }

    setTimeout(() => {
      showValue.value = false;

      if (idValue.value) {
        idValue.value = null;
      } else {
        clearState();
      }

      toast.success("บันทึกพื้นที่ swab สำเร็จ", { timeout: 1000 });

      emit("success", swabArea);
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถบันทึกพื้นที่ swab ได้ กรุณาลองใหม่อีกครั้ง");
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

const mainSwabAreaNameRequiredState = computed(() =>
  isFormInvalid("mainSwabAreaName", ["required"])
);

const mainSwabAreaNameExistsState = computed(() =>
  error.value
    ? !isErrorDataExists(error.value, "SwabArea", "swabAreaName")
    : null
);

const formInvalidState = computed(() => {
  let isMainSwabAreaNameInvalid = null;
  // let isFacilityInvalid = null;
  // let isAlternateFacilityInvalid = null;

  if (isInvalid.value) {
    isMainSwabAreaNameInvalid = mainSwabAreaNameRequiredState.value;
    // isFacilityInvalid = facilityRequiredState.value;
    // isAlternateFacilityInvalid = alternateFacilityRequiredState.value;
  }

  if (error.value) {
    isMainSwabAreaNameInvalid = mainSwabAreaNameExistsState.value;
    // isFacilityInvalid = facilityExistsState.value;
    // isAlternateFacilityInvalid = alternateFacilityExistsState.value;
  }

  return {
    mainSwabAreaName: isMainSwabAreaNameInvalid,
    // subSwabAreas: form.subSwabAreas.map((_, index) => {
    //   return isInvalid.value
    //     ? isFormArrayInvalid("subSwabAreas", "subSwabAreaName", index, [
    //         "required",
    //       ])
    //     : null;
    // }),
    // facility: isFacilityInvalid,
    // alternateProductCode: isAlternateProductCodeInvalid,
  };
});

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const idValue = computed({
  get: () => props.idValue,

  set: (value) => emit("update:idValue", value),
});

watch(
  () => showValue.value,
  (value) => {
    if (value) {
      show.value = true;
    } else {
      show.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <modal ref="modalRef" id="swabAreaCreateModal" v-model="show">
    <template #title> เพิ่มรายการจุดตรวจ </template>

    <template #default>
      <b-container>
        <b-row class="row-gap-2">
          <b-col cols="12">
            <facility-select
              id="facility"
              v-model="form.facility"
              required
              show-label
            ></facility-select>
          </b-col>

          <b-col cols="12">
            <b-form-group
              id="fieldset-main-swab-area-name"
              label-cols-lg="4"
              label="จุดตรวจหลัก"
              label-for="mainSwabAreaName"
              :state="formInvalidState.mainSwabAreaName"
            >
              <b-form-input
                id="mainSwabAreaName"
                v-model="form.mainSwabAreaName"
                :state="formInvalidState.mainSwabAreaName"
                type="text"
                placeholder="กรอกจุดตรวจหลัก"
              ></b-form-input>

              <b-form-invalid-feedback
                v-if="error"
                :state="mainSwabAreaNameExistsState"
              >
                จุดตรวจหลักซ้ำ
              </b-form-invalid-feedback>

              <b-form-invalid-feedback
                v-if="isInvalid"
                :state="mainSwabAreaNameRequiredState"
              >
                กรุณากรอกจุดตรวจหลัก
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="mt-2">
          <!-- <div class="input-group align-items-center">
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
          </div> -->
        </b-row>

        <b-row class="mt-3">
          <div class="input-group align-items-center">
            <b-col>
              <div
                class="d-flex align-items-baseline justify-content-between mb-2"
              >
                <label
                  for="swabName"
                  class="form-label min-w-125px d-block col-md-auto"
                  >จุดตรวจย่อย</label
                >
                <b-button
                  v-if="!submitting"
                  variant="success"
                  @click="addSubSwabArea"
                >
                  <CirclePlusFill />&nbsp;
                  <span>เพิ่มจุดย่อย</span>
                </b-button>
              </div>

              <div class="d-grid gap-1 mt-3">
                <template v-for="(_, subIndex) in form.subSwabAreas">
                  <swab-area-input-sub-swab-area
                    :disabled="submitting"
                    :order="subIndex + 1"
                    v-model="form.subSwabAreas[subIndex].subSwabAreaName"
                    @remove="removeSubSwabArea(subIndex)"
                  >
                  </swab-area-input-sub-swab-area>
                  <!-- <b-form-group
                    :style="{
                      marginBottom: '0.25rem !important',
                    }"
                    :state="formInvalidState.subSwabAreas[subIndex]"
                  >
                    <b-input-group :prepend="`${subIndex + 1}`">
                      <b-form-input
                        :id="`subSwabName${subIndex + 1}`"
                        v-model="form.subSwabAreas[subIndex].subSwabAreaName"
                        type="text"
                        placeholder="กรอกชื่อจุดตรวจรอง"
                      >
                      </b-form-input>

                      <b-input-group-append>
                        <b-button
                          v-if="!submitting"
                          :id="`removeSubSwabName${subIndex + 1}`"
                          variant="light"
                          class="border"
                          @click="removeSubSwabArea(subIndex)"
                        >
                          <CircleMinus />
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>
                  </b-form-group> -->

                  <!-- <div class="form-control p-0 border-0">
                    <b-form-input
                      v-model="form.subSwabAreas[n - 1].swabAreaName"
                      id="subSwabName{{n}}"
                      type="text"
                      placeholder="กรอกชื่อจุดตรวจรอง"
                    />

                    <b-button
                      v-if="!submitting"
                      variant="light"
                      @click="removeSubSwabArea"
                    >
                      <CircleMinus />
                    </b-button>
                  </div> -->
                </template>
              </div>
            </b-col>
          </div>
        </b-row>

        <!-- <b-row class="mt-2">
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
        </b-row> -->
      </b-container>
    </template>

    <template #footer>
      <!-- <b-button v-if="!submitting" variant="light" @click="removeSubSwabArea">
        <CircleMinus />
      </b-button>
      <b-button v-if="!submitting" variant="light" @click="addSubSwabArea">
        <CirclePlusFill />
      </b-button> -->
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
