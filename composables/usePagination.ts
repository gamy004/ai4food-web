import { ComputedRef } from "vue";

export interface Pagination {
  $state: PaginationState;
  paginate: Function;
  offset: ComputedRef<number>;
  resetPage: Function;
}

export interface PaginationState {
  perPage: number;
  currentPage: number;
}

export const usePagination = (options: PaginationState) => {
  const $state = reactive<PaginationState>({
    ...options,
  });

  const offset = computed(() => ($state.currentPage - 1) * $state.perPage);

  const paginate = (data: any[]) => {
    return data.filter((_, idx) => {
      return idx >= offset.value && idx < $state.currentPage * $state.perPage;
    });
  };

  const resetPage = () => {
    $state.currentPage = 1;
  };

  return {
    $state,
    paginate,
    offset,
    resetPage,
  };
};
