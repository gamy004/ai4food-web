<script lang="ts" setup>
import { Pagination } from "~~/composables/usePagination";

export interface Props {
  pagination: Pagination;
  fromDate: string;
  toDate: string;
  data?: any[];
  hasData?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pagination: () => usePagination({ perPage: 20, currentPage: 1 }),
  data: () => [],
  hasData: false,
});

const paginatedData = computed(() => props.pagination.paginate(props.data));
</script>

<template>
  <div class="page__swab-report-area mt-4">
    <div v-if="hasData">
      <b-table
        id="exportedSwabAreaTable"
        hover
        small
        caption-top
        responsive
        :items="paginatedData"
      />

      <base-pagination
        v-model="pagination.$state.currentPage"
        :per-page="pagination.$state.perPage"
        :total-rows="data.length"
        aria-controls="exportedSwabAreaTable"
      />
    </div>

    <p v-else>
      ไม่พบข้อมูลรายการจุดตรวจ swab ในวันที่
      {{ fromDate === toDate ? fromDate : `${fromDate} ถึง ${toDate}` }}
    </p>
  </div>
</template>
<style module></style>
