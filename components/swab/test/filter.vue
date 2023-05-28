<script setup lang="ts">
import { computed } from "vue";
import CarbonClose from "~icons/carbon/close";
import CarbonSearch from "~icons/carbon/search";
import { useRoute } from "vue-router";
import { BooleanState } from "~~/composables/useBooleanState";
import { ColState } from "~~/composables/useColState";
import { useHiddenState } from "~~/composables/useHiddenState";
import { FormData as SwabFilterFormData } from "../filter.vue";
import { PaginationState } from "~~/composables/usePagination";
import { SwabStatus } from "~~/composables/useSwab";
import SwabSampleType from "~/models/SwabSampleType";
import { SwabSampleTypeSelectData } from "../sample-type/select.vue";

export interface FormData extends SwabFilterFormData {
  swabTestCode?: string | null;
  swabStatus?: SwabStatus;
  swabSampleTypeId?: string | null;
  isReported?: boolean;
}

export interface Props {
  disabled?: boolean;
  modelValue: FormData;
  hiddenState?: BooleanState<
    | "date"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
    | "swabTestCode"
    | "swabStatus"
    | "swabSampleType"
    | "isReported"
    | "product"
  >;
  clearableState?: BooleanState<
    | "date"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
    | "product"
  >;
  colState?: ColState<
    | "date"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
    | "swabTestCode"
    | "swabStatus"
    | "swabSampleType"
    | "isReported"
    | "product"
  >;
  paginationState?: PaginationState;
  placeholderDate?: string;
  swabStatusOptions?: SwabStatus[];
  // invalidState?: FormInvalidData
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholderDate: "",
  swabTestCode: "",
  swabStatus: SwabStatus.ALL,
  swabStatusOptions: () => [
    SwabStatus.PENDING,
    SwabStatus.NORMAL,
    SwabStatus.DETECTED,
  ],
});

const emit = defineEmits(["update:modelValue"]);
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const swabTestHiddenState = computed(() => useHiddenState(props.hiddenState));
const swabTestFilterColState = useColState(props.colState);
const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const swabTestCode = ref(form.value.swabTestCode);

const getUpdatedQuery = () => {
  let updatedQuery: any = { ...getCurrentQuery() };

  if (updatedQuery.currentPage && updatedQuery.currentPage !== "1") {
    updatedQuery = {
      ...updatedQuery,
      currentPage: 1,
    };
  }

  return updatedQuery;
};

const updatePaginateState = () => {
  if (props.paginationState && props.paginationState.currentPage !== 1) {
    props.paginationState.currentPage = 1;
  }
};

const formSwabTestCode = computed({
  get: () => {
    return swabTestCode.value;
  },
  set: (value) => {
    swabTestCode.value = value;
  },
});

const formSwabStatus = computed({
  get: () => {
    return form.value.swabStatus;
  },
  set: (value) => {
    let query: any = getUpdatedQuery();

    updatePaginateState();

    form.value.swabStatus = value;

    updateQueryParams({
      ...query,
      swabStatus: value,
    });
  },
});

const formSwabSampleType = computed({
  get: () => {
    return form.value.swabSampleTypeId
      ? { id: form.value.swabSampleTypeId }
      : null;
  },
  set: (value) => {
    let query: any = getUpdatedQuery();

    updatePaginateState();

    if (value?.id) {
      form.value.swabSampleTypeId = value.id;

      query.swabSampleTypeId = value.id;
    } else {
      form.value.swabSampleTypeId = null;

      delete query.swabSampleTypeId;
    }

    updateQueryParams({
      ...query,
    });
  },
});

const formIsReported = computed({
  get: () => {
    return form.value.isReported;
  },
  set: (value) => {
    let query: any = getUpdatedQuery();

    updatePaginateState();

    form.value.isReported = value;

    updateQueryParams({
      ...query,
      isReported: value,
    });
  },
});

const onSearchSwabTestCode = () => {
  const { value } = swabTestCode;

  if (value && value.length) {
    onUpdateSwabTestCode(value);
  } else {
    onClearSwabTestCode();
  }
};

const onUpdateSwabTestCode = (value) => {
  let updatedQuery = getUpdatedQuery();

  updatePaginateState();

  form.value.swabTestCode = value;

  updatedQuery.swabTestCode = value;

  updateQueryParams(updatedQuery);
};

const onClearSwabTestCode = () => {
  let updatedQuery = getUpdatedQuery();

  updatePaginateState();

  form.value.swabTestCode = null;

  swabTestCode.value = "";

  if (updatedQuery.swabTestCode) {
    delete updatedQuery.swabTestCode;
  }

  updateQueryParams(updatedQuery);
};
</script>

<template>
  <div class="swab-area-history__filter">
    <b-col>
      <b-row class="row-gap-2">
        <swab-filter
          :hidden-state="hiddenState"
          :clearable-state="clearableState"
          :col-state="colState"
          :pagination-state="paginationState"
          :disabled="disabled"
          :placeholder-date="placeholderDate"
          show-shift-all
          v-model="form"
        >
          <div
            v-if="!swabTestHiddenState.isHidden('swabStatus', true)"
            :class="[swabTestFilterColState.colClass('swabStatus', 4)]"
          >
            <div class="input-group align-items-baseline">
              <label for="swabStatus" class="form-label d-block min-w-75px"
                >ผลตรวจ</label
              >

              <swab-status-select
                id="swabStatus"
                class="col"
                show-all
                :options="swabStatusOptions"
                v-model="formSwabStatus"
              ></swab-status-select>
            </div>
          </div>

          <div
            v-if="!swabTestHiddenState.isHidden('swabSampleType', true)"
            :class="[swabTestFilterColState.colClass('swabSampleType', 4)]"
          >
            <div class="input-group align-items-baseline">
              <label for="swabSampleType" class="form-label d-block min-w-125px"
                >ประเภทตัวอย่าง</label
              >

              <swab-sample-type-select
                id="swabSampleType"
                class="col"
                once
                clearable
                v-model="formSwabSampleType"
              ></swab-sample-type-select>
            </div>
          </div>

          <div
            v-if="!swabTestHiddenState.isHidden('swabTestCode')"
            :class="[swabTestFilterColState.colClass('swabTestCode', 8)]"
          >
            <b-input-group>
              <label
                for="swabTestCode"
                class="form-label d-flex align-items-end min-w-75px"
                >รหัส</label
              >

              <b-form-input
                id="swabTestCode"
                v-model="formSwabTestCode"
                type="text"
                :disabled="disabled"
                @keyup.enter.prevent="onSearchSwabTestCode"
              />

              <b-input-group-append>
                <b-input-group-text v-if="form.swabTestCode" class="bg-light">
                  <b-button
                    variant="link"
                    class="p-0"
                    @click="onClearSwabTestCode"
                  >
                    <CarbonClose class="text-dark" />
                  </b-button>
                </b-input-group-text>

                <b-input-group-text class="bg-light">
                  <b-button
                    variant="link"
                    class="p-0"
                    @click="onSearchSwabTestCode"
                  >
                    <CarbonSearch class="text-dark" />
                  </b-button>
                </b-input-group-text>
              </b-input-group-append>
            </b-input-group>
          </div>

          <div
            v-if="!swabTestHiddenState.isHidden('isReported', true)"
            :class="[swabTestFilterColState.colClass('isReported', 4)]"
          >
            <div class="input-group align-items-end mt-2">
              <b-form-checkbox
                id="isReported"
                v-model="formIsReported"
                name="isReported"
                :value="true"
                :unchecked-value="false"
              >
                แสดงเฉพาะตัวอย่างที่ถูกรายงาน
              </b-form-checkbox>
            </div>
          </div>
        </swab-filter>
      </b-row>
    </b-col>
  </div>
</template>
