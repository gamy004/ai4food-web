<script lang="ts" setup>
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
</script>

<template>
  <div class="swab-plan__list">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลจุดตรวจ swab</p>

      <b-button variant="dark" @click="fetch"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <b-list-group v-if="true" class="list-group__swab-plan">
          <swab-plan-list-item></swab-plan-list-item>
          <swab-plan-list-item></swab-plan-list-item>
        </b-list-group>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูลจุดตรวจ swab ที่ต้องบันทึก
          </b-card-text>
        </b-card>
      </b-col>
    </b-col>
  </div>
</template>
