<script lang="ts" setup>
export interface Props {
  showValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
});

const emit = defineEmits(["update:showValue", "confirm"]);

const modalRef = ref();

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const onCancel = () => {
  showValue.value = false;
};

const onSubmit = async () => {
  emit("confirm");
  showValue.value = false;
};
</script>

<template>
  <b-form @submit="onSubmit">
    <modal ref="modalRef" id="productCreateModal" v-model="showValue">
      <template #title> <span>ยืนยันการนำเข้าข้อมูล</span></template>

      <template #default>
        <div class="p-3">
          <div class="mb-4">
            พบข้อมูลผลการตรวจเชื้อบางรายการที่มีสถานะ
            <b style="color: red">ไม่พบข้อมูลในระบบ</b>
          </div>

          <div>
            หากกด <b style="color: #0d6efd">ยืนยัน</b>
            ข้อมูลที่มีสถานะ
            <b style="color: red">ไม่พบข้อมูลในระบบ</b>
            จะไม่ถูกบันทึกลงฐานข้อมูล
          </div>
        </div>
      </template>

      <template #footer>
        <b-button variant="light" @click.prevent="onCancel"> ยกเลิก </b-button>

        <b-button type="submit" variant="primary" @click.prevent="onSubmit">
          ยืนยัน
        </b-button>
      </template>
    </modal>
  </b-form>
</template>
