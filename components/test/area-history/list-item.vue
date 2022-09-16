<script lang="ts" setup>
import { ComputedRef } from "vue";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import LabTest from "~~/models/LabTest";

export interface Props {
    itemNo?: number;
    prefixTitle?: string;
    // routeName: string;
    history: LabTest;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    prefixTitle: ""
  }
);

const history = ref(props.history);

const checkMarkClassName: ComputedRef<Record<string, boolean>> = computed(() => ({
  "text-secondary": !history.value.isCompleted,
  "text-success": history.value.isCompleted
}));

const badgeVariant: ComputedRef<string> = computed(() => history.value.isCompleted ? "success" : "light");

const badgeText: ComputedRef<string> = computed(() => history.value.isCompleted ? "บันทึกสำเร็จ" : "บันทึกไม่สำเร็จ");

const itemTitle: ComputedRef<string> = computed(() => {
  const { prefixTitle, itemNo } = props;

  let name = prefixTitle;

  if (itemNo) {
    name += ` ${itemNo.toString()}`;
  }

  return name;
});

const pageUpdateSwabAreaHistory: ComputedRef<object> = computed(() => {
  const route = {
    name: "swab-test-name",
    // name: props.routeName,
    params: {
      name: props.history.swabArea.swabAreaName
    },
    query: {
      areaTitle: itemTitle.value,
      id: history.value.id
    }
  };

  return route;
});

</script>

<template>
  <nuxt-link
    v-slot="{ navigate }"
    :to="pageUpdateSwabAreaHistory"
    class="list-group-item__swab-area-history text-decoration-none"
    custom
  >
    <b-list-group-item class="d-flex justify-content-between align-items-center py-4" @click="navigate">
      <span>
        <carbon-checkmark-filled
          :style="{ fontSize: '1em', marginRight: '1rem' }"
          :class="checkMarkClassName"
        />

        <b>{{ itemTitle }} : </b>

        {{ history.swabTest.swabTestCode }}

        <br>

        <b>จุดหลัก : </b>

        {{ history.swabArea.swabAreaName }}
      </span>

      <b-badge :variant="badgeVariant" pill>
        {{ badgeText }}
      </b-badge>
    </b-list-group-item>
  </nuxt-link>
</template>
