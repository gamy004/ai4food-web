<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CircleMinus from "~icons/akar-icons/circle-minus";
import CirclePlusFill from "~icons/akar-icons/circle-plus-fill";

export interface Props {
  modelValue: boolean | null;
}

const toast = useToast();
const { api: swabApi } = useSwab();
const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(["update:modelValue", "success"]);

const form = reactive({
  swabAreaName: "",
  subSwabAreas: [{ swabAreaName: "" }],
  facility: null,
});

const modalRef = ref();
const submitting = ref(false);
const show = ref(false);
const subSwabAreasNumber = ref(1);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const onSubmit = async () => {
  submitting.value = true;

  try {
    await swabApi().createMainSwabArea(form);
    toast.success("บันทึกพื้นที่ swab สำเร็จ", { timeout: 1000 });

    setTimeout(() => {
      modelValue.value = null;
      emit("success");
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถบันทึกพื้นที่ swab ได้ กรุณาลองใหม่อีกครั้ง");
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

const addSub = () => {
  // subSwabAreasNumber.value = subSwabAreasNumber.value + 1;
  // form.subSwabAreas = [...form.subSwabAreas, { swabAreaName: "" }];
  form.subSwabAreas.push({ swabAreaName: "" });
};

const removeSub = (subIndex) => {
  // if (subSwabAreasNumber.value > 1) {
  //   subSwabAreasNumber.value = subSwabAreasNumber.value - 1;
  //   form.subSwabAreas.splice(-1);
  // }

  form.subSwabAreas.splice(subIndex, 1);
};

watch(
  () => modelValue.value,
  (value) => {
    if (value) {
      show.value = true;
    } else {
      show.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <modal ref="modalRef" id="swabAreaCreateModal" v-model="show">
    <template #title> เพิ่มรายการจุดตรวจ </template>

    <template #default>
      <b-container>
        <b-row>
          <div class="input-group align-items-center">
            <label
              for="swabName"
              class="form-label min-w-125px d-block col-12 col-md-auto"
              >ชื่อเครื่องจักร</label
            >
            <div class="form-control p-0 border-0">
              <facility-select
                id="facilityItem"
                v-model="form.facility"
              ></facility-select>
            </div>
          </div>
        </b-row>
        <b-row class="mt-2">
          <div class="input-group align-items-center">
            <label
              for="swabName"
              class="form-label min-w-125px d-block col-12 col-md-auto"
              >จุดตรวจหลัก</label
            >
            <div class="form-control p-0 border-0">
              <b-form-input
                v-model="form.swabAreaName"
                id="swabName"
                type="text"
                placeholder="กรอกชื่อจุดตรวจหลัก"
              />
            </div>
          </div>
        </b-row>

        <hr />

        <b-row class="mt-2">
          <div class="input-group align-items-center">
            <b-col>
              <label
                for="swabName"
                class="form-label min-w-125px d-block col-12 col-md-auto"
                >จุดตรวจย่อย</label
              >
              <div class="d-grid gap-1">
                <template v-for="(_, subIndex) in form.subSwabAreas">
                  <b-form-group
                    :style="{
                      marginBottom: '0.25rem !important',
                    }"
                  >
                    <b-input-group :prepend="`${subIndex + 1}`">
                      <b-form-input
                        :id="`subSwabName${subIndex + 1}`"
                        v-model="form.subSwabAreas[subIndex].swabAreaName"
                        type="text"
                        placeholder="กรอกชื่อจุดตรวจรอง"
                      >
                      </b-form-input>

                      <b-input-group-append>
                        <b-button
                          v-if="!submitting"
                          :id="`removeSubSwabName${subIndex + 1}`"
                          variant="light"
                          class="border"
                          @click="removeSub(subIndex)"
                        >
                          <CircleMinus />
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>
                  </b-form-group>

                  <!-- <div class="form-control p-0 border-0">
                    <b-form-input
                      v-model="form.subSwabAreas[n - 1].swabAreaName"
                      id="subSwabName{{n}}"
                      type="text"
                      placeholder="กรอกชื่อจุดตรวจรอง"
                    />

                    <b-button
                      v-if="!submitting"
                      variant="light"
                      @click="removeSub"
                    >
                      <CircleMinus />
                    </b-button>
                  </div> -->
                </template>

                <b-button v-if="!submitting" variant="light" @click="addSub">
                  <CirclePlusFill />&nbsp;
                  <span>เพิ่มจุดย่อย</span>
                </b-button>
              </div>
            </b-col>
          </div>
        </b-row>

        <!-- <b-row class="mt-2">
          <div class="input-group align-items-center">
            <label
              for="detail"
              class="form-label min-w-125px d-block col-12 col-md-auto"
              >รายละเอียด</label
            >
            <div class="form-control p-0 border-0">
              <b-form-textarea
                id="detail"
                type="text"
                placeholder="กรอกรายละเอียด(ถ้ามี)"
              />
            </div>
          </div>
        </b-row> -->
      </b-container>
    </template>

    <template #footer>
      <!-- <b-button v-if="!submitting" variant="light" @click="removeSub">
        <CircleMinus />
      </b-button>
      <b-button v-if="!submitting" variant="light" @click="addSub">
        <CirclePlusFill />
      </b-button> -->
      <b-button
        v-if="!submitting"
        variant="light"
        @click.prevent="modelValue = null"
      >
        ยกเลิก
      </b-button>
      <b-button
        variant="outline-primary"
        :disabled="submitting"
        @click.prevent="onSubmit"
      >
        <LineMdLoadingTwotoneLoop
          v-if="submitting"
          :style="{ fontSize: '1em' }"
        />

        <span v-else>บันทึกรายการ</span>
      </b-button>
    </template>
  </modal>
</template>
