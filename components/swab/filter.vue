<script setup lang="ts">
import Datepicker from "@vuepic/vue-datepicker";
import { DateRangeInterface, Shift } from "~~/composables/useDate.js";
import { useHiddenState } from "~~/composables/useHiddenState";
import { ColState, useColState } from "~~/composables/useColState";
import { BooleanState } from "~~/composables/useBooleanState";
import { PaginationState } from "~~/composables/usePagination";

export interface FormData {
  date?: string;
  dateRange?: DateRangeInterface;
  shift?: Shift;
  swabPeriodId?: string;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
  productId?: string;
}

export interface Props {
  disabled?: boolean;
  showShiftAll?: boolean;
  modelValue: FormData;
  hiddenState?: BooleanState<
    | "date"
    | "dateRange"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
    | "product"
  >;
  colState?: ColState<
    | "date"
    | "dateRange"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
    | "product"
  >;
  clearableState?: BooleanState<
    | "date"
    | "dateRange"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
    | "product"
  >;
  paginationState?: PaginationState;
  placeholderDate?: string;
  // invalidState?: FormInvalidData
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showShiftAll: false,
  placeholderDate: "",
});

const emit = defineEmits(["update:modelValue"]);
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const { onlyDate, updateDateRangeQueryParams } = useDate();

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const hiddenState = computed(() => useHiddenState(props.hiddenState));
const colState = useColState(props.colState);
const clearableState = useClearableState(props.clearableState);

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

const formDate = computed({
  get: () => form.value.date,
  set: (value) => {
    let updatedQuery: any = getUpdatedQuery();

    updatePaginateState();

    const updatedValue = onlyDate(value);

    form.value.date = updatedValue;

    updateQueryParams({
      ...updatedQuery,
      date: updatedValue,
    });
  },
});

const formDateRange = computed({
  get: () => form.value.dateRange,
  set: (value) => {
    updatePaginateState();

    form.value.dateRange = value;

    updateDateRangeQueryParams(value, { currentPage: 1 });
  },
});

const formFacility = computed({
  get: () => {
    return form.value.facilityId ? { id: form.value.facilityId } : null;
  },
  set: (value) => {
    let updatedQuery: any = getUpdatedQuery();

    updatePaginateState();

    if (updatedQuery.mainSwabAreaId) {
      delete updatedQuery.mainSwabAreaId;
    }

    if (updatedQuery.facilityItemId) {
      delete updatedQuery.facilityItemId;
    }

    form.value.mainSwabAreaId = null;
    form.value.facilityItemId = null;

    if (value && value.id) {
      form.value.facilityId = value.id;

      updatedQuery.facilityId = value.id;
    } else {
      form.value.facilityId = null;

      if (updatedQuery.facilityId) {
        delete updatedQuery.facilityId;
      }
    }

    updateQueryParams({
      ...updatedQuery,
    });
  },
});

const formSwabPeriod = computed({
  get: () => {
    return form.value.swabPeriodId ? { id: form.value.swabPeriodId } : null;
  },

  set: (value) => {
    let updatedQuery: any = getUpdatedQuery();

    updatePaginateState();

    if (value && value.id) {
      updatedQuery.swabPeriodId = value.id;

      form.value.swabPeriodId = value.id;
    } else {
      delete updatedQuery.swabPeriodId;

      form.value.swabPeriodId = null;
    }

    updateQueryParams({
      ...updatedQuery,
    });
  },
});

const formFacilityItemId = computed({
  get: () => {
    return form.value.facilityItemId ? { id: form.value.facilityItemId } : null;
  },
  set: (value) => {
    const { facilityItemId, ...otherQueries } = getUpdatedQuery();

    let updatedQuery: any = { ...otherQueries };

    updatePaginateState();

    if (value && value.id) {
      form.value.facilityItemId = value.id;

      updatedQuery.facilityItemId = value.id;
    } else {
      form.value.facilityItemId = null;

      delete updatedQuery.facilityItemId;
    }

    updateQueryParams({
      ...updatedQuery,
    });
  },
});

const formMainSwabArea = computed({
  get: () => {
    return form.value.mainSwabAreaId ? { id: form.value.mainSwabAreaId } : null;
  },

  set: (value) => {
    let updatedQuery: any = getUpdatedQuery();

    updatePaginateState();

    if (value && value.id) {
      updatedQuery.mainSwabAreaId = value.id;

      form.value.mainSwabAreaId = value.id;
    } else {
      delete updatedQuery.mainSwabAreaId;

      form.value.mainSwabAreaId = null;
    }

    updateQueryParams({
      ...updatedQuery,
    });
  },
});

const formProduct = computed({
  get: () => {
    return form.value.productId ? { id: form.value.productId } : null;
  },

  set: (value) => {
    let updatedQuery: any = getUpdatedQuery();

    updatePaginateState();

    if (value && value.id) {
      updatedQuery.productId = value.id;

      form.value.productId = value.id;
    } else {
      delete updatedQuery.productId;

      form.value.productId = null;
    }

    updateQueryParams({
      ...updatedQuery,
    });
  },
});

watch(
  () => form.value.shift,
  (value) => {
    let updatedQuery: any = getUpdatedQuery();

    updatePaginateState();

    // if (value === Shift.ALL) {
    //   delete updatedQuery.shift;
    // } else {
    updatedQuery.shift = value;
    // }

    updateQueryParams({
      ...updatedQuery,
    });
  }
);
</script>

<template>
  <div class="swab-area-history__filter">
    <div class="row row-gap-2">
      <div
        v-if="!hiddenState.isHidden('date', false)"
        :class="[colState.colClass('date', 'md-8')]"
      >
        <div class="input-group align-items-baseline">
          <label for="date" class="form-label d-block min-w-75px">วันที่</label>

          <Datepicker
            v-model="formDate"
            :enable-time-picker="false"
            locale="th"
            class="col"
            utc
            auto-apply
            :clearable="clearableState.isClearable('date')"
            :disabled="disabled"
            :placeholder="placeholderDate"
          />
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('dateRange', true)"
        :class="[colState.colClass('dateRange', 'md-8')]"
      >
        <div class="input-group align-items-baseline">
          <label for="dateRage" class="form-label d-block min-w-75px"
            >วันที่</label
          >

          <date-picker-range
            id="dateRage"
            class="col"
            v-model="formDateRange"
            locale="th"
            auto-apply
            :clearable="clearableState.isClearable('dateRange')"
            :disabled="disabled"
            :placeholder="placeholderDate"
          />
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('shift', false)"
        :class="[colState.colClass('shift', 'md-4')]"
      >
        <div class="input-group align-items-baseline">
          <label for="shift" class="form-label d-block min-w-75px">กะ</label>

          <shift-select
            id="shift"
            class="col"
            :clearable="clearableState.isClearable('shift')"
            :disabled="disabled"
            :showAll="showShiftAll"
            v-model="form.shift"
          ></shift-select>
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('swabPeriod', false)"
        :class="[colState.colClass('swabPeriod', 12)]"
      >
        <div class="input-group align-items-baseline">
          <label for="swabPeriod" class="form-label d-block min-w-75px"
            >ช่วงตรวจ</label
          >

          <swab-period-select
            id="swabPeriod"
            class="col"
            :clearable="clearableState.isClearable('swabPeriod')"
            :disabled="disabled"
            v-model="formSwabPeriod"
          ></swab-period-select>
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('facility', false)"
        :class="[colState.colClass('facility', 12)]"
      >
        <div class="input-group align-items-baseline">
          <label for="facility" class="form-label d-block min-w-75px"
            >เครื่อง</label
          >

          <facility-select
            id="facility"
            class="col"
            style="margin-bottom: 0rem !important"
            :clearable="clearableState.isClearable('facility')"
            :disabled="disabled"
            :facility-item-id="form.facilityItemId"
            v-model="formFacility"
          ></facility-select>
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('facilityItem', false)"
        :class="[colState.colClass('facilityItem', 12)]"
      >
        <div class="input-group align-items-baseline">
          <label for="facilityItem" class="form-label d-block min-w-75px"
            >ไลน์</label
          >

          <div class="form-control p-0 border-0 col">
            <facility-item-select
              id="facilityItem"
              :clearable="clearableState.isClearable('facilityItem')"
              :disabled="disabled"
              :facility-id="form.facilityId"
              v-model="formFacilityItemId"
            />
          </div>
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('mainSwabArea', true)"
        :class="[colState.colClass('mainSwabArea', 12)]"
      >
        <div class="input-group align-items-baseline">
          <label for="mainSwabArea" class="form-label d-block min-w-75px"
            >จุดตรวจ</label
          >

          <swab-area-select
            id="mainSwabArea"
            class="col"
            :clearable="clearableState.isClearable('mainSwabArea')"
            :disabled="disabled"
            :facility-id="form.facilityId"
            v-model="formMainSwabArea"
          ></swab-area-select>
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('product', true)"
        :class="[colState.colClass('product', 12)]"
      >
        <div class="input-group align-items-baseline">
          <label for="product" class="form-label d-block min-w-75px"
            >สินค้า</label
          >

          <product-select
            id="product"
            class="col"
            :clearable="clearableState.isClearable('product')"
            :disabled="disabled"
            v-model="formProduct"
          ></product-select>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>
