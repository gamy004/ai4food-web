<script lang="ts" setup>
import SwabPlan from "~/models/SwabPlan";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";

export interface Props {
  items: Array<SwabPlan>;
}

const props = defineProps<Props>();

const displayData = computed(() => {
  return props.items;
});

const emit = defineEmits(["update:item", "delete:item"]);

const promptEdit = (id) => {
  emit("update:item", id);
};

const promptRemove = (id) => {
  emit("delete:item", id);
};
</script>

<template>
  <div>
    <b-list-group-item
      v-for="item in displayData"
      :key="item.id"
      class="d-flex justify-content-between align-items-center py-4"
    >
      <b-container>
        <b-row>
          <b-col cols="12" md="3">
            <div class="d-flex flex-row">
              <div class="col col-4">
                <div class="fw-bold">จุดตรวจ</div>
                <div class="fw-bold">รายละเอียด</div>
              </div>
              <div class="col col-8">
                <div>{{ item.totalItems }} จุด</div>
                <div style="word-wrap: break-word">
                  {{ item.swabPlanNote ? item.swabPlanNote : "-" }}
                </div>
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
          <b-col cols="12" md="4">
            <div class="d-flex flex-row">
              <div class="col col-4">
                <div class="fw-bold">ช่วงเวลา</div>
                <div class="fw-bold">ชุดอักษร</div>
              </div>
              <div class="col col-8">
                <div>
                  {{ item.swabPeriod ? item.swabPeriod.swabPeriodName : "-" }}
                </div>
                <div>{{ item.swabPlanCode }}</div>
              </div>
            </div>
          </b-col>
          <b-col cols="4" md="2">
            <h5>
              <b-badge :variant="item.publish ? 'success' : 'danger'" pill>
                {{ item.publish ? "ยืนยันแผน" : "ฉบับร่าง" }}
              </b-badge>
            </h5>
          </b-col>
          <b-col cols="8" md="1">
            <b-button variant="link" class="p-0" @click="promptEdit(item.id)">
              <CarbonEdit
                style="
                   {
                    fontsize: '1em';
                  }
                "
              />
            </b-button>
            <b-button
              variant="link"
              class="ms-3 p-0 text-danger"
              @click="promptRemove(item.id)"
            >
              <CarbonTrashCan
                style="
                   {
                    fontsize: '1em';
                  }
                "
              />
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-list-group-item>
  </div>
</template>
