<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

export interface Props {
  modelValue: string | null;
}

const toast = useToast();

const { api: swabApi, getSwabAreaById } = useSwab();
const { getFacilityById } = useFacility();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(["update:modelValue", "success", "error"]);

const modalRef = ref();
const deletePermission = ref(null);
const deletedSwabArea = ref(null);
const deletedFacility = ref(null);
const loading = ref(false);
const submitting = ref(false);
const error = ref(false);
const show = ref(false);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const reFetch = () => {
  error.value = false;

  fetchDeletePermission(modelValue.value);
};

const fetchDeletePermission = async (swabAreaId) => {
  deletePermission.value = null;

  loading.value = true;

  try {
    deletePermission.value = await swabApi().loadDeletePermissionSwabArea(
      swabAreaId
    );
  } catch (error) {
    error.value = true;

    toast.error("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  submitting.value = true;

  try {
    const deletedSwabArea = await swabApi().deleteMainSwabArea(
      modelValue.value
    );

    setTimeout(() => {
      toast.success("ลบสินค้าสำเร็จ", { timeout: 1000 });

      modelValue.value = null;

      emit("success", deletedSwabArea);
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถลบสินค้าได้ กรุณาลองใหม่อีกครั้ง");

    emit("error", error);
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

watch(
  () => modelValue.value,
  (value) => {
    if (value) {
      deletedSwabArea.value = getSwabAreaById(value);
      deletedFacility.value = getFacilityById(deletedSwabArea.value.facilityId);

      fetchDeletePermission(value);

      show.value = true;
    } else {
      show.value = false;
      deletedSwabArea.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <b-form @submit="onSubmit">
    <modal ref="modalRef" id="modalDeleteProduct" v-model="show">
      <template #title> คุณต้องการลบข้อมูลสินค้านี้ใช่ไหม </template>

      <template #default>
        <div v-if="error" class="text-center">
          <p>พบข้อผิดพลาดในการโหลดข้อมูลสินค้า</p>

          <b-button variant="dark" @click="reFetch"> โหลดข้อมูลใหม่ </b-button>
        </div>

        <div v-else>
          <div
            v-if="loading"
            class="d-flex justify-content-center align-items-center my-4"
          >
            <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
          </div>

          <div v-else>
            <div>
              <p>คุณยืนยันที่จะลบข้อมูลสินค้านี้ใช่ไหม</p>

              <div
                v-if="deletePermission && deletePermission.canDelete"
                class="alert alert-danger"
                role="alert"
              >
                <div v-if="deletedSwabArea">
                  <div>
                    <b>จุด swab หลัก:</b> {{ deletedSwabArea.swabAreaName }}
                  </div>
                  <div>
                    <b>เครื่องจักร:</b> {{ deletedFacility.facilityName }}
                  </div>
                </div>
              </div>

              <div v-else>
                <p v-if="deletedSwabArea">
                  ไม่สามารถลบข้อมูลจุดตรวจ
                  <b>{{ deletedSwabArea.swabAreaName }}</b> ได้
                </p>

                <div class="alert alert-danger" role="alert">
                  <div
                    v-if="
                      deletePermission &&
                      deletePermission.countSwabAreaHistories > 0
                    "
                  >
                    <div><b>สาเหตุ:</b> ข้อมูลจุดตรวจมีการผูกข้อมูล</div>
                    <div>
                      <b>ข้อมูลการตรวจจุดตรวจ:</b>
                      {{ deletePermission.countSwabAreaHistories }} รายการ
                    </div>
                  </div>
                </div>

                <p>
                  หากจุดตรวจถูกลบ ข้อมูลที่ผูกกับจุดตรวจนี้ทั้งหมดจะถูกลบ
                  คุณแน่ใจว่าต้องการลบจุดตรวจนี้ใช่ไหม
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <b-button
          v-if="!submitting"
          variant="light"
          @click.prevent="modelValue = null"
        >
          ยกเลิก
        </b-button>

        <b-button
          type="submit"
          variant="danger"
          :disabled="loading || submitting"
        >
          <LineMdLoadingTwotoneLoop
            v-if="submitting"
            :style="{ fontSize: '1em' }"
          />

          <span v-else>ลบ</span>
        </b-button>
      </template>
    </modal>
  </b-form>
</template>
