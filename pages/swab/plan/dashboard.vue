<script setup lang="ts">
definePageMeta({
  title: "Ai4FoodSafety - Swab Plan Create Page",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: {
    name: "/",
  },
});

const show = ref(false);

const route = useRoute();

const { today, onlyMonth, onlyDate, formatShortYear } = useDate();

const currentDate = today();

const filter = reactive({
  date: (route.query.date as string) || onlyMonth(currentDate),
});

const from = reactive({
  swabPlanDate: onlyDate(currentDate),
  swabRound: formatShortYear(currentDate),
});

const createPlan = () => {
  show.value = true;
};
</script>

<template>
  <div class="page__swab-plan-create mt-4">
    <h2 class="font-weight-bold">แผนการตรวจ</h2>

    <b-row align-v="end">
      <b-col cols="12" md="9">
        <swab-plan-filter v-model="filter"></swab-plan-filter>
      </b-col>
      <b-col cols="12" md="3" class="text-end">
        <b-button variant="outline-primary" @click="createPlan">
          สร้างแผน
        </b-button>
      </b-col>
    </b-row>

    <swab-plan-modal-manage
      v-model:show-value="show"
      v-model:model-value="from"
    />
  </div>
</template>
