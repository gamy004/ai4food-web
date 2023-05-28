<script setup lang="ts">
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import DatePicker from "@vuepic/vue-datepicker";
import { required } from "@vuelidate/validators";
import { useToast } from "vue-toastification";

export interface Props {
  id?: string;
}

const props = defineProps<Props>();

const toast = useToast();
const { isErrorIdNotFound } = useRequest();
const {
  today,
  onlyDate,
  dateToShift,
  // timePickerToTimeShift,
  timeStringToTimePicker,
} = useDate();
const { redirect } = useNavigation();
const { api: swabApi } = useSwab();
const currentDate = today();
const loading = ref(false);
const exception = ref(null);
const error = ref(false);
const submitting = ref(false);

const form = reactive({
  swabProductDate: onlyDate(currentDate),
  swabProductSwabedAt: {
    hours: currentDate.getHours(),
    minutes: currentDate.getMinutes(),
    seconds: 0,
  },
  swabProductNote: null,
  productLot: null,
  productDate: onlyDate(currentDate),
  product: null,
  facility: null,
  facilityItem: null,
  // facilityItem: null,
  shift: dateToShift(currentDate),
  swabPeriod: null,
  swabSampleType: null,
});

const validationRules = {
  swabProductDate: { required, $lazy: true },
  swabProductSwabedAt: { required, $lazy: true },
  shift: { required, $lazy: true },
  facility: { required, $lazy: true },
  facilityItem: { required, $lazy: true },
  productLot: { required, $lazy: true },
  productDate: { required, $lazy: true },
  product: { required, $lazy: true },
  swabPeriod: { required, $lazy: true },
};

const { validate, isInvalid, isFormInvalid } = useValidation(
  validationRules,
  form
);

const productFormInvalidState = computed(() => ({
  productLot: isFormInvalid("productLot", ["required"]),
  productDate: isFormInvalid("productDate", ["required"]),
  product: isFormInvalid("product", ["required"]),
}));

const fetch = async (id) => {
  exception.value = null;
  error.value = false;
  loading.value = true;

  try {
    const swabProductHistory = await swabApi().loadSwabProductHistoryById(id);

    form.shift = swabProductHistory.shift;

    form.swabProductDate = swabProductHistory.swabProductDate;

    form.swabPeriod = { id: swabProductHistory.swabPeriodId };

    if (swabProductHistory.swabProductSwabedAt) {
      form.swabProductSwabedAt = timeStringToTimePicker(
        swabProductHistory.swabProductSwabedAt
      );
    }

    if (swabProductHistory.swabProductNote) {
      form.swabProductNote = swabProductHistory.swabProductNote;
    }

    if (swabProductHistory.productLot) {
      form.productLot = swabProductHistory.productLot;
    }

    if (swabProductHistory.productDate) {
      form.productDate = swabProductHistory.productDate;
    }

    if (swabProductHistory.productId) {
      form.product = { id: swabProductHistory.productId };
    }

    if (swabProductHistory.facilityItem) {
      form.facility = { id: swabProductHistory.facilityItem.facilityId };

      form.facilityItem = { id: swabProductHistory.facilityItem.id };
    }

    if (swabProductHistory.swabTest?.swabSampleType) {
      form.swabSampleType = {
        id: swabProductHistory.swabTest.swabSampleType.id,
      };
    }
  } catch (e) {
    exception.value = e;
    error.value = true;

    toast.error("ไม่สามารถโหลดข้อมูล swab ได้ กรุณาลองใหม่อีกครั้ง");
  } finally {
    loading.value = false;
  }
};

const create = async () => {
  let promise;

  try {
    promise = await swabApi().createSwabProductHistory(form);

    toast.success("เพิ่มบันทึกการตรวจสินค้าสำเร็จ", { timeout: 1000 });
  } catch (error) {
    toast.error("เพิ่มบันทึกการตรวจสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  }

  return promise;
};

const update = async () => {
  let promise;

  try {
    promise = await swabApi().updateSwabProductHistory(props.id, form);

    toast.success("อัพเดต swab สินค้าสำเร็จ", { timeout: 1000 });
  } catch (error) {
    toast.error("อัพเดต swab สินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  }

  return promise;
};

const onFormSubmitted = async () => {
  validate();

  if (isInvalid.value) {
    return toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");
  }

  submitting.value = true;

  if (props.id) {
    await update();
  } else {
    await create();
  }

  setTimeout(() => {
    submitting.value = false;

    redirect();
  }, 1000);
};

watch(
  () => props.id,
  async (value) => {
    if (value) {
      await fetch(value);
    }

    watch(
      () => form.facility,
      () => {
        form.facilityItem = null;
      }
    );

    // watch(
    //   () => form.swabProductSwabedAt,
    //   () => {
    //     form.shift = timePickerToTimeShift(form.swabProductSwabedAt);
    //   }
    // );
  },
  { immediate: true }
);
</script>

<template>
  <div class="swab-product-history__form">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูล swab สินค้า</p>

      <p v-if="exception && isErrorIdNotFound(exception)" class="text-danger">
        ไม่พบข้อมูลที่ต้องการแก้ไข
      </p>

      <b-button variant="dark" @click="fetch"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-form v-else id="formSwabProductHistory" @submit="onFormSubmitted">
        <b-row class="mt-4">
          <b-col>
            <h6 class="fw-bold">ข้อมูลจุดตรวจ :</h6>

            <b-row class="px-3">
              <b-col md="4" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="swabProductDate"
                    class="form-label min-w-75px d-block col-12 col-md-auto"
                    >วันที่
                  </label>

                  <date-picker
                    id="swabProductDate"
                    v-model.number="form.swabProductDate"
                    class="form-control p-0 border-0"
                    :enable-time-picker="false"
                    locale="th"
                    disabled
                    auto-apply
                    :clearable="false"
                  />

                  <b-form-invalid-feedback
                    :state="isFormInvalid('swabProductDate', ['required'])"
                  >
                    กรุณาเลือกวัน
                  </b-form-invalid-feedback>
                </div>
              </b-col>

              <b-col md="4" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="swabProductSwabedAt"
                    class="form-label min-w-75px d-block col-12 col-md-auto"
                    >เวลา
                  </label>

                  <date-picker
                    id="swabProductSwabedAt"
                    v-model.number="form.swabProductSwabedAt"
                    class="form-control p-0 border-0"
                    :disabled="submitting"
                    time-picker
                    auto-apply
                    :clearable="false"
                  />

                  <b-form-invalid-feedback
                    :state="isFormInvalid('swabProductSwabedAt', ['required'])"
                  >
                    กรุณาเลือกเวลา
                  </b-form-invalid-feedback>
                </div>
              </b-col>

              <b-col md="4" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="shift"
                    class="form-label min-w-75px d-block col-12 col-md-auto"
                    >กะ</label
                  >

                  <shift-select
                    class="col-9"
                    disabled
                    v-model="form.shift"
                  ></shift-select>
                </div>
              </b-col>

              <b-col md="4" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="swabPeriod"
                    class="form-label min-w-75px d-block col-12 col-md-auto"
                    >ช่วงตรวจ
                  </label>

                  <div class="form-control p-0 border-0">
                    <swab-period-select
                      id="swabPeriod"
                      v-model="form.swabPeriod"
                      disabled
                    />

                    <b-form-invalid-feedback
                      :state="isFormInvalid('swabPeriod', ['required'])"
                    >
                      กรุณาเลือกช่วงตรวจ
                    </b-form-invalid-feedback>
                  </div>
                </div>
              </b-col>

              <b-col md="4" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="facility"
                    class="form-label min-w-75px d-block col-12 col-md-auto"
                    >เครื่อง
                  </label>

                  <div class="form-control p-0 border-0">
                    <facility-select
                      id="facility"
                      v-model="form.facility"
                      :disabled="submitting"
                      default-value="ขึ้นรูป"
                    />
                  </div>
                </div>
              </b-col>

              <b-col md="4" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="facilityItem"
                    class="form-label min-w-75px d-block col-12 col-md-auto"
                    >ไลน์
                  </label>

                  <div class="form-control p-0 border-0">
                    <facility-item-select
                      id="facilityItem"
                      v-model="form.facilityItem"
                      :disabled="submitting || !form.facility"
                      :facility-id="form.facility ? form.facility.id : null"
                    />

                    <b-form-invalid-feedback
                      :state="isFormInvalid('facilityItem', ['required'])"
                    >
                      กรุณาเลือกไลน์
                    </b-form-invalid-feedback>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col>
            <h6 class="fw-bold">ข้อมูลสินค้าที่ตรวจ :</h6>

            <swab-product-form
              v-model="form"
              :disabled="submitting"
              :invalid-state="productFormInvalidState"
              class="px-3"
            />
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col md="6">
            <h6 class="fw-bold">ข้อมูลตัวอย่าง :</h6>

            <b-row class="px-3">
              <b-col>
                <div class="input-group align-items-baseline">
                  <label
                    for="swabSampleType"
                    class="form-label min-w-125px d-block col-12 col-md-auto"
                    >ประเภทตัวอย่าง
                  </label>

                  <div class="form-control p-0 border-0">
                    <swab-sample-type-select
                      id="swabSampleType"
                      lazy
                      disabled
                      v-model="form.swabSampleType"
                    ></swab-sample-type-select>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col>
            <h6 class="fw-bold" for="swabProductNote">
              หมายเหตุ : <span class="text-secondary">(Optional)</span>
            </h6>

            <b-row class="px-3">
              <b-col>
                <b-form-textarea
                  id="swabProductNote"
                  v-model="form.swabProductNote"
                  :disabled="submitting"
                  rows="3"
                  max-rows="3"
                  no-resize
                />
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-row align-h="center" class="my-4">
          <b-col cols="auto">
            <b-button
              variant="outline-primary"
              size="lg"
              :disabled="submitting"
              @click="redirect"
            >
              ยกเลิก
            </b-button>
          </b-col>

          <b-col cols="auto">
            <button-arrow-right
              variant="primary"
              size="lg"
              :loading="submitting"
              type="submit"
            >
              บันทึก
            </button-arrow-right>
          </b-col>
        </b-row>
      </b-form>
    </b-col>
  </div>
</template>
