<script setup lang="ts">
import Datepicker from "@vuepic/vue-datepicker";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { Shift } from "~~/composables/useDate.js";
import { HiddenState, useHiddenState } from "~~/composables/useHiddenState";
import Facility from "~~/models/Facility.js";
import SwabArea from "~~/models/SwabArea.js";
import SwabPeriod from "~~/models/SwabPeriod.js";

export interface FormData {
  date?: string;
  shift?: Shift;
  swabPeriodId?: string;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
}

export interface Props {
  disabled?: boolean;
  modelValue: FormData;
  hiddenState?: HiddenState<'date' | 'shift' | 'swabPeriod' | 'facility' | 'facilityItem' | 'mainSwabArea'>
  // invalidState?: FormInvalidData
}

const props = withDefaults(
  defineProps<Props>(),
  {
    disabled: false
  }
);

const emit = defineEmits(["update:modelValue"]);
const route = useRoute();
const router = useRouter();
const { onlyDate } = useDate();
const { getFacilityByIds, api: facilityApi } = useFacility();
const { getSwabPeriodByNames, getSwabAreaByIds, api: swabApi } = useSwab();
const loading = ref(false);
const error = ref(false);
const refMainSwabAreaInput = ref(null);
const facilityIds = ref([]);
// const swabPeriodIds = ref([]);
const mainSwabAreaIds = ref([]);

const form = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const hiddenState = useHiddenState(props.hiddenState);

const formFacility = computed({
  get: () => {
    return form.value.facilityId
      ? { id: form.value.facilityId }
      : null;
  },
  set: (value) => {
    if (value && value.id) {
      const updatedQuery = { ...route.query };

      if (updatedQuery.mainSwabAreaId) {
        delete updatedQuery.mainSwabAreaId;
      }

      if (updatedQuery.facilityItemId) {
        delete updatedQuery.facilityItemId;
      }

      form.value.mainSwabAreaId = null;
      form.value.facilityItemId = null;
      form.value.facilityId = value.id;

      updatedQuery.facilityId = value.id;

      router.replace({
        query: {
          ...updatedQuery
        }
      });
    }
  }
});

const formFacilityItemId = computed({
  get: () => {
    return form.value.facilityItemId
      ? { id: form.value.facilityItemId }
      : null;
  },
  set: (value) => {
    const { facilityItemId, ...otherQueries } = route.query;

    const updatedQuery = {
      ...otherQueries
    };

    if (value && value.id) {
      form.value.facilityItemId = value.id;

      updatedQuery.facilityItemId = value.id;
    } else {
      form.value.facilityItemId = null;
    }

    router.replace({
      query: {
        ...updatedQuery
      }
    });
  }
});

const formDate = computed({
  get: () => form.value.date,
  set: (value) => {
    console.log(value);

    const updatedValue = onlyDate(value);

    form.value.date = updatedValue;

    router.replace({
      query: {
        ...route.query,
        date: updatedValue
      }
    });
  }
})

const swabPeriodNames = [
  "ก่อน Super Big Cleaning",
  "หลัง Super Big Cleaning",
  "หลังประกอบเครื่อง",
  "ก่อนล้างระหว่างงาน",
  "หลังล้างระหว่างงาน",
  "เดินไลน์หลังพัก 4 ชม.",
  "ก่อนล้างท้ายกะ",
  "หลังล้างท้ายกะ"
];

const swabPeriodOptions = computed(() => {
  const swabPeriods = getSwabPeriodByNames(swabPeriodNames);

  return swabPeriods.map(({ id, swabPeriodName }) => ({ value: id, text: swabPeriodName }));
});

const facilityOptions = computed(() => {
  const facilities = getFacilityByIds(facilityIds.value);

  return facilities.map(({ id, facilityName }) => ({ value: id, text: facilityName }));
});

const mainSwabAreaOptions = computed(() => {
  const { facilityId } = form.value;

  const mainSwabAreas = getSwabAreaByIds(mainSwabAreaIds.value, { facilityId });

  return mainSwabAreas.map(({ id, swabAreaName }) => ({ value: id, text: swabAreaName }));
});

watch(() => form.value.shift, (value) => {
  router.replace({
    query: {
      ...route.query,
      shift: value
    }
  });
});

watch(() => form.value.mainSwabAreaId, (value) => {
  console.log("watch mainSwabAreaId: ", value);

  if (value) {
    router.replace({
      query: {
        ...route.query,
        mainSwabAreaId: value
      }
    });
  }
});

watch(() => form.value.swabPeriodId, (value) => {
  console.log("watch swabPeriodId: ", value);

  if (value) {
    router.replace({
      query: {
        ...route.query,
        swabPeriodId: value
      }
    });
  }
});

const fetch = async () => {
  error.value = false;
  loading.value = true;

  try {
    const promises: [Promise<Facility[]>, Promise<SwabPeriod[]>, Promise<SwabArea[]>] = [
      facilityApi().loadAllSwabFacility(),
      swabApi().loadAllSwabPeriod(), swabApi().loadAllMainSwabArea()
    ];

    const [facilityData, _, mainSwabAreaData] = await Promise.all(promises);

    if (facilityData && facilityData.length) {
      facilityIds.value = facilityData.map(({ id }) => id);
    }

    // if (swabPeriodData && swabPeriodData.length) {
    //     swabPeriodIds.value = swabPeriodData.map(({ id }) => id);
    // }

    if (mainSwabAreaData && mainSwabAreaData.length) {
      mainSwabAreaIds.value = mainSwabAreaData.map(({ id }) => id);
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onBeforeMount(fetch);
</script>

<template>
  <div class="swab-area-history__filter">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูล filter</p>
      <b-button variant="dark" @click="fetch">
        โหลดข้อมูลใหม่
      </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <div class="row">
          <div v-if="!hiddenState.isHidden('date')" class="col-8">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block col-3">วันที่</label>

              <Datepicker v-model="formDate" :enable-time-picker="false" locale="th" utc auto-apply :clearable="false"
                class="col-9" />
            </div>
          </div>

          <div v-if="!hiddenState.isHidden('shift')" class="col-4">
            <div class="input-group align-items-baseline">
              <label for="shift" class="form-label d-block col-3">กะ</label>

              <shift-select v-model="form.shift" class="col-9"></shift-select>
            </div>
          </div>
        </div>

        <div v-if="!hiddenState.isHidden('swabPeriod')" class="row mt-3">
          <div class="col-12">
            <div class="input-group align-items-baseline">
              <label for="swabPeriod" class="form-label d-block col-2">ช่วงตรวจ</label>

              <b-form-select id="swabPeriod" v-model="form.swabPeriodId" :options="swabPeriodOptions" class="col-10" />
            </div>
          </div>
        </div>

        <div v-if="!hiddenState.isHidden('facility')" class="row mt-3">
          <div class="col-12">
            <div class="input-group align-items-baseline">
              <label for="facility" class="form-label d-block col-2">เครื่อง</label>

              <!-- <b-form-select id="facility" v-model="form.facilityId" :options="facilityOptions"
                                class="col-10">
                            </b-form-select> -->

              <!-- <b-form-select id="facility" v-model="formFacility" :options="facilityOptions" class="col-10" /> -->
              <facility-select id="facility" v-model="formFacility" class="col-10"></facility-select>
            </div>
          </div>
        </div>

        <div v-if="!hiddenState.isHidden('facilityItem') && formFacility.id" class="row mt-3">
          <div class="col-12">
            <div class="input-group align-items-baseline">
              <label for="facilityItem" class="form-label d-block col-2">ไลน์</label>

              <!-- <b-form-select id="facilityItem" v-model="form.facilityId" :options="facilityOptions"
                                class="col-10">
                            </b-form-select> -->
              <div class="form-control p-0 border-0">
                <facility-item-select id="facilityItem" v-model="formFacilityItemId" :disabled="disabled"
                  :facility-id="form.facilityId" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="!hiddenState.isHidden('mainSwabArea') && form.facilityId" class="row mt-3">
          <div class="col-12">
            <div class="input-group align-items-baseline">
              <label for="mainSwabArea" class="form-label d-block col-2">จุดตรวจ</label>

              <b-form-select id="mainSwabArea" ref="refMainSwabAreaInput" v-model="form.mainSwabAreaId"
                :options="mainSwabAreaOptions" class="col-10" />
            </div>
          </div>
        </div>
      </b-col>
    </b-col>
  </div>
</template>
