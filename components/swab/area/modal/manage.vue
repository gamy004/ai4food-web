<script lang="ts" setup>
import { required } from "@vuelidate/validators";
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
const { isErrorDataExists, isErrorDataDuplicate } = useRequest();
const {
  getSwabAreaById,
  getSwabAreaByMainSwabAreaId,
  getContactZoneByName,
  api: swabApi,
} = useSwab();

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
  contactZone: null,
});

const { duplicateFields } = useValidationRule();

const validationRules = {
  mainSwabAreaName: { required, $lazy: true },
  subSwabAreas: {
    isDuplicated: duplicateFields(["subSwabAreaName"]),
    $lazy: true,
  },
};

const { validate, isInvalid, isFormInvalid, resetValidation } = useValidation(
  validationRules,
  form
);

const modalRef = ref();
const submitting = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);

const addSubSwabArea = () => {
  form.subSwabAreas.push({ subSwabAreaName: "", contactZone: null });
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
  form.contactZone = null;
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
  error.value = null;

  validate();

  if (isInvalid.value) {
    return toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");
  }

  submitting.value = true;

  try {
    const { facility, contactZone } = form;

    if (facility) {
      const body: BodyManageSwabArea = {
        swabAreaName: form.mainSwabAreaName,
        subSwabAreas: form.subSwabAreas.map(
          ({ id, subSwabAreaName, contactZone }) => {
            const payload: any = { swabAreaName: subSwabAreaName, contactZone };

            if (id) {
              payload.id = id;
            }

            return payload;
          }
        ),
        facility,
        contactZone,
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
    }
  } catch (errorResponse) {
    error.value = errorResponse;

    toast.error("ไม่สามารถบันทึกพื้นที่ swab ได้ กรุณาลองใหม่อีกครั้ง");

    emit("error", errorResponse);
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

const contactZoneNames = ["Zone 1", "Zone 2", "Zone 3"];

const allContactZones = computed(() =>
  contactZoneNames.map((name) => getContactZoneByName(name)).filter(Boolean)
);

const mainSwabAreaNameRequiredState = computed(() =>
  isFormInvalid("mainSwabAreaName", ["required"])
);

const mainSwabAreaNameExistsState = computed(() =>
  error.value
    ? !isErrorDataExists(error.value, "SwabArea", "swabAreaName")
    : null
);

const subSwabAreaNameIsDuplicatedState = computed(() =>
  isFormInvalid("subSwabAreas", ["isDuplicated"])
);

const formInvalidState = computed(() => {
  let isMainSwabAreaNameInvalid = null;

  if (isInvalid.value) {
    isMainSwabAreaNameInvalid = mainSwabAreaNameRequiredState.value;
  }

  if (error.value) {
    isMainSwabAreaNameInvalid = mainSwabAreaNameExistsState.value;
  }

  return {
    mainSwabAreaName: isMainSwabAreaNameInvalid,
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
  () => idValue.value,
  (id) => {
    if (id) {
      const swabArea = getSwabAreaById(id);

      if (swabArea) {
        form.mainSwabAreaName = swabArea.swabAreaName;
        form.facility = { id: swabArea.facilityId };
        form.contactZone = swabArea.contactZoneId
          ? { id: swabArea.contactZoneId }
          : null;

        if (swabArea.subSwabAreaIds.length) {
          const subSwabAreas = getSwabAreaByMainSwabAreaId(swabArea.id);

          if (subSwabAreas.length) {
            form.subSwabAreas = subSwabAreas.map(
              ({ id, swabAreaName, contactZoneId }) => ({
                id,
                subSwabAreaName: swabAreaName,
                contactZone: contactZoneId ? { id: contactZoneId } : null,
              })
            );
          }
        }
      }
    } else {
      clearState();
    }
  },
  { immediate: true }
);

defineExpose({ clearState });

onBeforeMount(async () => {
  await swabApi().loadAllContactZone();
});
</script>

<template>
  <modal ref="modalRef" id="swabAreaCreateModal" v-model="showValue">
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
              :only-swab="false"
              label-cols-lg="4"
            ></facility-select>
          </b-col>

          <b-col cols="12">
            <b-form-group
              id="fieldset-main-swab-area-name"
              label-cols-lg="4"
              label="ชื่อจุดตรวจหลัก"
              label-for="mainSwabAreaName"
              :state="formInvalidState.mainSwabAreaName"
            >
              <b-form-input
                id="mainSwabAreaName"
                v-model="form.mainSwabAreaName"
                :state="formInvalidState.mainSwabAreaName"
                type="text"
                placeholder="จุดตรวจหลัก"
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
          <b-col cols="12">
            <contact-zone-select
              id="contact-zone"
              :options="allContactZones"
              v-model="form.contactZone"
              show-label
              clearable
              label-cols-lg="4"
            ></contact-zone-select>
          </b-col>
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
              <hr />

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
                <div
                  v-if="
                    isInvalid &&
                    subSwabAreaNameIsDuplicatedState !== null &&
                    !subSwabAreaNameIsDuplicatedState
                  "
                  class="alert alert-danger"
                  role="alert"
                >
                  ชื่อจุดตรวจย่อยไม่สามารถซ้ำกันได้ภายในจุดตรวจหลัก
                  กรุณาเปลี่ยนชื่อจุดที่ซ้ำกัน
                </div>

                <template
                  v-for="(_, subIndex) in form.subSwabAreas"
                  :key="`sub-swab-area-${subIndex}`"
                >
                  <hr v-if="subIndex !== 0" />

                  <swab-area-input-sub-swab-area
                    :disabled="submitting"
                    :order="subIndex + 1"
                    :contact-zone-options="allContactZones"
                    v-model="form.subSwabAreas[subIndex]"
                    @remove="removeSubSwabArea(subIndex)"
                  >
                  </swab-area-input-sub-swab-area>
                </template>
              </div>
            </b-col>
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
