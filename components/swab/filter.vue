<script setup lang="ts">
import Datepicker from "@vuepic/vue-datepicker";
import { Shift } from "~~/composables/useDate.js";
import { useHiddenState } from "~~/composables/useHiddenState";
import { ColState, useColState } from "~~/composables/useColState";
import { BooleanState } from "~~/composables/useBooleanState";

export interface FormData {
  date: string;
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
  // invalidState?: FormInvalidData
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showShiftAll: false,
});

const emit = defineEmits(["update:modelValue"]);
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const { onlyDate } = useDate();

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const hiddenState = computed(() => useHiddenState(props.hiddenState));
const colState = useColState(props.colState);
const clearableState = useClearableState(props.clearableState);

const formDate = computed({
  get: () => form.value.date,
  set: (value) => {
    const updatedValue = onlyDate(value);

    form.value.date = updatedValue;

    updateQueryParams({
      ...getCurrentQuery(),
      date: updatedValue,
    });
  },
});

const formFacility = computed({
  get: () => {
    return form.value.facilityId ? { id: form.value.facilityId } : null;
  },
  set: (value) => {
    const updatedQuery = { ...getCurrentQuery() };

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
    const updatedQuery = {
      ...getCurrentQuery(),
    };

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
    const { facilityItemId, ...otherQueries } = getCurrentQuery();

    const updatedQuery = {
      ...otherQueries,
    };

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
    const updatedQuery = {
      ...getCurrentQuery(),
    };

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
    const updatedQuery = {
      ...getCurrentQuery(),
    };

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
    const updatedQuery = { ...getCurrentQuery() };

    if (value === Shift.ALL) {
      delete updatedQuery.shift;
    } else {
      updatedQuery.shift = value;
    }

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
        :class="[colState.colClass('date', 8)]"
      >
        <div class="input-group align-items-baseline">
          <label for="date" class="form-label d-block min-w-75px">วันที่</label>

          <Datepicker
            v-model="formDate"
            :enable-time-picker="false"
            locale="th"
            utc
            auto-apply
            :clearable="clearableState.isClearable('date')"
            class="col"
          />
        </div>
      </div>

      <div
        v-if="!hiddenState.isHidden('shift', false)"
        :class="[colState.colClass('shift', 4)]"
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
            :clearable="clearableState.isClearable('facility')"
            :disabled="disabled"
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