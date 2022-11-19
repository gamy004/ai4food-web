<script setup lang="ts">
import { computed } from "vue";
import CarbonSearch from "~icons/carbon/search";
import { useRoute } from "vue-router";
import { BooleanState } from "~~/composables/useBooleanState";
import { ColState } from "~~/composables/useColState";
import { useHiddenState } from "~~/composables/useHiddenState";
import { FormData as SwabFilterFormData } from "../filter.vue";
import { PaginationState } from "~~/composables/usePagination";

export interface FormData extends SwabFilterFormData {
  swabTestCode?: string;
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
  >;
  clearableState?: BooleanState<
    | "date"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
  >;
  colState?: ColState<
    | "date"
    | "shift"
    | "swabPeriod"
    | "facility"
    | "facilityItem"
    | "mainSwabArea"
    | "swabTestCode"
  >;
  paginationState?: PaginationState;
  // invalidState?: FormInvalidData
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits(["update:modelValue"]);
const route = useRoute();
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const swabTestHiddenState = computed(() => useHiddenState(props.hiddenState));
const swabTestFilterColState = useColState(props.colState);
const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const swabTestCode = ref(form.value.swabTestCode || "");

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

const onSearchSwabTestCode = () => {
  const { value } = swabTestCode;

  let updatedQuery = getUpdatedQuery();

  updatePaginateState();

  if (value && value.length) {
    form.value.swabTestCode = value;
    updatedQuery.swabTestCode = value;
  } else {
    form.value.swabTestCode = null;

    if (updatedQuery.swabTestCode) {
      delete updatedQuery.swabTestCode;
    }
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
          show-shift-all
          v-model="form"
        >
          <div
            v-if="!swabTestHiddenState.isHidden('swabTestCode')"
            :class="[swabTestFilterColState.colClass('swabTestCode', 12)]"
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
                @keyup.enter="onSearchSwabTestCode"
              />

              <b-input-group-append>
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
        </swab-filter>
      </b-row>
    </b-col>
  </div>
</template>
