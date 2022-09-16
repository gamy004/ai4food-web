import { UnwrapNestedRefs } from "vue";

export interface PaginationState {
  perPage?: number;
  currentPage?: number;
}

export const usePagination = (options: PaginationState) => {
  const $state = reactive<PaginationState>({
    ...options,
  });

  const paginate = (data: any[]) => {
    return data.filter((_, idx) => {
      return (
        idx >= ($state.currentPage - 1) * $state.perPage &&
        idx < $state.currentPage * $state.perPage
      );
    });
  };

  return {
    $state,
    paginate,
  };
};
