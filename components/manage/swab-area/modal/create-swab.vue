<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

export interface Props {
    modelValue: string | null;
}

const toast = useToast();

const props = withDefaults(defineProps<Props>(), {
    modelValue: null
});

const emit = defineEmits([
    "update:modelValue",
    "success"
]);

const modalRef = ref();
const submitting = ref(false);
const show = ref(false);

const modelValue = computed({
    get: () => props.modelValue,

    set: value => emit("update:modelValue", value)
});

const onSubmit = async () => {
    submitting.value = true;

    try {
        // do something
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
}

watch(() => modelValue.value, (value) => {
    if (value) {
        show.value = true;
    } else {
        show.value = false;
    }
}, { immediate: true });
</script>
    
<template>
    <modal ref="modalRef" id="swabAreaCreateModal" v-model="show">
        <template #title>
            เพิ่มรายการจุดตรวจ
        </template>

        <template #default>
            <b-container>
                <b-row>
                    <div class="input-group align-items-center">
                        <label for="swabName"
                            class="form-label min-w-125px d-block col-12 col-md-auto">ชื่อเครื่องจักร</label>
                        <div class="form-control p-0 border-0">
                            <b-form-input id="swabName" :disabled="disabled" type="text"
                                placeholder="กรุณากรอกชื่อเครื่องจักร" />
                        </div>
                    </div>
                </b-row>
                <b-row class="mt-2">
                    <div class="input-group align-items-center">
                        <label for="swabName"
                            class="form-label min-w-125px d-block col-12 col-md-auto">จุดตรวจหลัก</label>
                        <div class="form-control p-0 border-0">
                            <b-form-input id="swabName" :disabled="disabled" type="text"
                                placeholder="กรอกชื่อจุดตรวจ" />
                        </div>
                    </div>
                </b-row>
                <b-row class="mt-2">
                    <div class="input-group align-items-center">
                        <label for="swabName"
                            class="form-label min-w-125px d-block col-12 col-md-auto">จุดตรวจย่อย</label>
                        <div class="form-control p-0 border-0">
                            <b-form-input id="swabName" :disabled="disabled" type="text"
                                placeholder="กรอกชื่อจุดตรวจ" />
                        </div>
                    </div>
                </b-row>
                <b-row class="mt-2">
                    <div class="input-group align-items-center">
                        <label for="areaName"
                            class="form-label min-w-125px d-block col-12 col-md-auto">ชื่อบริเวณ/พื้นที่</label>
                        <div class="form-control p-0 border-0">
                            <b-form-textarea id="areaName" :disabled="disabled" type="text"
                                placeholder="กรอกชื่อบริเวณ/พื้นที่" />
                        </div>
                    </div>
                </b-row>
                <b-row class="mt-2">
                    <div class="input-group align-items-center">
                        <label for="detail"
                            class="form-label min-w-125px d-block col-12 col-md-auto">รายละเอียด</label>
                        <div class="form-control p-0 border-0">
                            <b-form-textarea id="detail" :disabled="disabled" type="text"
                                placeholder="กรอกรายละเอียด(ถ้ามี)" />
                        </div>
                    </div>
                </b-row>
            </b-container>


        </template>

        <template #footer>
            <b-button v-if="!submitting" variant="light" @click.prevent="modelValue = null">
                ยกเลิก
            </b-button>

            <b-button variant="outline-primary" :disabled="submitting" @click.prevent="onSubmit">
                <LineMdLoadingTwotoneLoop v-if="submitting" :style="{ fontSize: '1em' }" />

                <span v-else>บันทึกรายการ</span>
            </b-button>
        </template>
    </modal>
</template>