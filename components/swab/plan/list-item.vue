<script lang="ts" setup>
const mockItems = reactive([
  {
    id: 1,
    swabPlanDate: "",
    swabPlanCode: "N38",
    swabPeriod: { name: "หลังประกอบเครื่อง" },
    shift: "Day",
    swabPlanNote: "หลัง Super Big Cleaning Day38",
  },
  {
    id: 2,
    swabPlanDate: "",
    swabPlanCode: "N39",
    swabPeriod: { name: "หลังประกอบเครื่อง" },
    shift: "Day",
    swabPlanNote: "หลัง Super Big Cleaning Day39",
  },
]);
</script>

<template>
  <div>
    <div class="fw-bold mb-3">1 มิถุนายน 2566</div>
    <b-list-group-item
      v-for="item in mockItems"
      :key="item.id"
      class="d-flex justify-content-between align-items-center py-4"
    >
      <b-container>
        <b-row>
          <b-col cols="12" md="4">
            <div class="d-flex flex-row">
              <div class="col col-4">
                <div class="fw-bold">จุดตรวจ</div>
                <div class="fw-bold">รายละเอียด</div>
              </div>
              <div class="col col-8">
                <div>24 จุด</div>
                <div>{{ item.swabPlanNote }}</div>
              </div>
            </div>
          </b-col>
          <b-col cols="12" md="2">
            <div class="d-flex flex-row">
              <div class="col col-4">
                <div class="fw-bold">กะ</div>
              </div>
              <div class="col col-8">
                <div>{{ item.shift }}</div>
              </div>
            </div>
          </b-col>
          <b-col cols="12" md="3">
            <div class="d-flex flex-row">
              <div class="col col-4">
                <div class="fw-bold">ช่วงเวลา</div>
                <div class="fw-bold">ชุดอักษร</div>
              </div>
              <div class="col col-8">
                <div>{{ item.swabPeriod.name }}</div>
                <div>{{ item.swabPlanCode }}</div>
              </div>
            </div>
          </b-col>
          <b-col cols="4" md="2">
            <b-badge variant="success" pill> ยืนยันแผน </b-badge>
          </b-col>
          <b-col cols="8" md="1"> ... </b-col>
        </b-row>
      </b-container>
    </b-list-group-item>
  </div>
</template>
