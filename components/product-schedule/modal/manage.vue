<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { BodyManageProduct } from "~~/composables/useProduct";
import { ResponseErrorT } from "~~/composables/useRequest";
import DatePicker from "@vuepic/vue-datepicker";


export interface Props {
    idValue: string | null;
    showValue?: boolean;
    clearable?: boolean;
    disabled?: boolean;
}

const toast = useToast();
const {
    timeStringToTimePicker,
    timePickerToTimeString
} = useDate();
const { isErrorDataExists } = useRequest();
const { getProductById, getProductScheduleById, api: productApi } = useProduct();

const props = withDefaults(defineProps<Props>(), {
    idValue: null,
    showValue: false,
    clearable: false,
    disabled: false
});

const emit = defineEmits([
    "update:idValue",
    "update:showValue",
    "success",
    "error",
]);

const modalRef = ref();
const submitting = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);
// const show = ref(false);

const form = reactive({
    productScheduleDate: null,
    productId: null,
    productScheduleAmount: null,
    productScheduleStartedAt: null,
    productScheduleEndedAt: null,
});

const validationRules = {
    productScheduleDate: { required, $lazy: true },
    productId: { required, $lazy: true },
    productScheduleAmount: { required, $lazy: true },
    productScheduleStartedAt: { required, $lazy: true },
    productScheduleEndedAt: { required, $lazy: true }
    // alternateProductCode: { required, $lazy: true },
};

const { validate, isInvalid, isFormInvalid, resetValidation } = useValidation(
    validationRules,
    form
);

const productIdRequiredState = computed(() =>
    isFormInvalid("productId", ["required"])
)


const productIdExistsState = computed(() =>
    error.value ? !isErrorDataExists(error.value, "Product", "productId") : null
);

const productScheduleDateRequiredState = computed(() =>
    isFormInvalid("productId", ["required"])
)


const productScheduleDateExistsState = computed(() =>
    error.value ? !isErrorDataExists(error.value, "Product", "productScheduleDate") : null
);

const productScheduleAmountRequiredState = computed(() =>
    isFormInvalid("productScheduleAmount", ["required"])
)


const productScheduleAmountExistsState = computed(() =>
    error.value ? !isErrorDataExists(error.value, "Product", "productScheduleAmount") : null
);

const productScheduleStartedAtRequiredState = computed(() =>
    isFormInvalid("productScheduleStartedAt", ["required"])
)


const productScheduleStartedAtExistsState = computed(() =>
    error.value ? !isErrorDataExists(error.value, "Product", "productScheduleStartedAt") : null
);

const productScheduleEndedAtRequiredState = computed(() =>
    isFormInvalid("productScheduleEndedAt", ["required"])
)


const productScheduleEndedAtExistsState = computed(() =>
    error.value ? !isErrorDataExists(error.value, "Product", "productScheduleEndedAt") : null
);

const formInvalidState = computed(() => {
    let isProductIdInvalid = null;
    let isProductScheduleDateInvalid = null;
    let isProductScheduleAmountInvalid = null;
    let isProductScheduleStartedAtInvalid = null;
    let isProductScheduleEndedAtInvalid = null;

    if (isInvalid.value) {
        isProductIdInvalid = productIdRequiredState.value;
        isProductScheduleDateInvalid = productScheduleDateRequiredState.value;
        isProductScheduleAmountInvalid = productScheduleAmountRequiredState.value;
        isProductScheduleStartedAtInvalid = productScheduleStartedAtRequiredState.value;
        isProductScheduleEndedAtInvalid = productScheduleEndedAtRequiredState.value;

    }

    if (error.value) {
        isProductIdInvalid = productIdExistsState.value;
        isProductScheduleDateInvalid = productScheduleDateExistsState.value;
        isProductScheduleAmountInvalid = productScheduleAmountExistsState.value;
        isProductScheduleStartedAtInvalid = productScheduleStartedAtExistsState.value;
        isProductScheduleEndedAtInvalid = productScheduleEndedAtExistsState.value;
    }

    return {
        productId: isProductIdInvalid,
        productScheduleDate: isProductScheduleDateInvalid,
        productScheduleAmount: isProductScheduleAmountInvalid,
        productScheduleStartedAt: isProductScheduleStartedAtInvalid,
        productScheduleEndedAt: isProductScheduleEndedAtInvalid
    };
});

const idValue = computed({
    get: () => props.idValue,

    set: (value) => emit("update:idValue", value),
});

const showValue = computed({
    get: () => props.showValue,

    set: (value) => emit("update:showValue", value),
});

const actionText = computed(() => (idValue.value ? "อัพเดต" : "เพิ่ม"));

const clearState = () => {
    resetValidation();

    error.value = null;

    form.productScheduleDate = null;
    form.productId = null;
    form.productScheduleAmount = null;
    form.productScheduleStartedAt = null;
    form.productScheduleEndedAt = null;
};

const onCancel = () => {
    if (idValue.value) {
        idValue.value = null;
    } else {
        clearState();
    }

    showValue.value = false;
};

const onSubmit = async () => {
    error.value = null;

    validate();

    if (isInvalid.value) {
        return toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");
    }

    submitting.value = true;

    try {

        console.log("do something");
        const body =
        {
            "productScheduleAmount": Number(form.productScheduleAmount),
            "productScheduleDate": form.productScheduleDate,
            "productScheduleStartedAt": timePickerToTimeString(form.productScheduleStartedAt),
            "productScheduleEndedAt": timePickerToTimeString(form.productScheduleEndedAt),
            "product": { 'id': form.productId.id }
        }

        await productApi().updateProductSchedule(idValue.value, body);
        setTimeout(() => {
            toast.success("นำเข้าข้อมูลแผลการผลิตสำเร็จ", { timeout: 1000 });

            emit("success");
        }, 1000);

    } catch (errorResponse) {
        error.value = errorResponse;

        toast.error(
            `ไม่สามารถ${actionText.value}รายการสินค้าได้ กรุณาลองใหม่อีกครั้ง`
        );

        emit("error", errorResponse);
    } finally {
        setTimeout(() => {
            submitting.value = false;
            showValue.value = false;
        }, 1000);
    }
};

defineExpose({ clearState });

watch(
    () => idValue.value,
    (id) => {
        if (id) {
            const productSchedule = getProductScheduleById(id);

            if (productSchedule) {
                form.productScheduleDate = productSchedule.productScheduleDate;
                form.productId = { id: productSchedule.productId };
                form.productScheduleAmount = productSchedule.productScheduleAmount;
                form.productScheduleStartedAt = timeStringToTimePicker(productSchedule.productScheduleStartedAt);
                form.productScheduleEndedAt = timeStringToTimePicker(productSchedule.productScheduleEndedAt);
            }
            console.log(productSchedule);
        }
        else {
            clearState();
        }
        console.log("do something", id)
    },
    { immediate: true }
);
</script>

<template>
    <b-form @submit="onSubmit">
        <modal ref="modalRef" id="productCreateModal" v-model="showValue">
            <template #title> {{ actionText }}ตารางเวลารายการสินค้า </template>

            <template #default>
                <div class="row row-gap-2">
                    <b-col cols="12">
                        <b-form-group id="fieldset-product-schedule-date" label-cols-lg="4" label="วันที่ผลิต"
                            label-for="productScheduleDate" :state="formInvalidState.productScheduleDate">
                            <date-picker id="productScheduleDate" v-model="form.productScheduleDate"
                                class="form-control p-0 border-0" :enable-time-picker="false" locale="th" utc
                                :clearable="false" />

                        </b-form-group>
                    </b-col>
                    <b-col cols="12">
                        <b-form-group id="fieldset-product-schedule-start" label-cols-lg="4" label="เวลาเริ่ม"
                            label-for="productScheduleStartedAt" :state="formInvalidState.productScheduleStartedAt">
                            <date-picker id="productScheduleStartedAt" v-model.number="form.productScheduleStartedAt"
                                class="form-control p-0 border-0" :disabled="submitting" time-picker auto-apply
                                :clearable="false" />

                        </b-form-group>
                    </b-col>
                    <b-col cols="12">
                        <b-form-group id="fieldset-product-schedule-end" label-cols-lg="4" label="เวลาสิ้นสุด"
                            label-for="productScheduleEndedAt" :state="formInvalidState.productScheduleEndedAt">
                            <date-picker id="productScheduleEndedAt" v-model.number="form.productScheduleEndedAt"
                                class="form-control p-0 border-0" :disabled="submitting" time-picker auto-apply
                                :clearable="false" />

                        </b-form-group>
                    </b-col>
                    <b-col cols="12">
                        <b-form-group id="fieldset-product-schedule-id" label-cols-lg="4" label="รหัสสินค้า"
                            label-for="productId" :state="formInvalidState.productId">
                            <product-select id="productId" v-model="form.productId" :disabled="disabled"
                                :clearable="clearable" />

                        </b-form-group>
                    </b-col>

                    <b-col cols="12">
                        <b-form-group id="fieldset-product-schedule-amount" label-cols-lg="4" label="จำนวนสินค้า"
                            label-for="productScheduleAmount" :state="formInvalidState.productId">
                            <b-form-input id="productScheduleAmount" v-model="form.productScheduleAmount"
                                :state="formInvalidState.productScheduleAmount" type="number"
                                placeholder="กรอกจำนวนสินค้า"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <!-- <b-col cols="12">
                        <b-form-group id="fieldset-product-name" label-cols-lg="4" label="วันที่ผลิต"
                            label-for="productName" :state="formInvalidState.productName">
                            <date-picker id="swabAreaSwabedAt" v-model.number="form.productScheduleDate"
                                class="form-control p-0 border-0" :disabled="submitting" auto-apply
                                :clearable="false" />

                            <b-form-invalid-feedback v-if="error" :state="productNameExistsState">
                                ชื่อสินค้าซ้ำ
                            </b-form-invalid-feedback>

                            <b-form-invalid-feedback v-if="isInvalid" :state="productNameRequiredState">
                                กรุณากรอกชื่อสินค้า
                            </b-form-invalid-feedback>
                        </b-form-group>
                    </b-col> -->

                </div>
            </template>

            <template #footer>
                <b-button v-if="!submitting" variant="light" @click.prevent="onCancel">
                    ยกเลิก
                </b-button>

                <b-button type="submit" variant="primary" :disabled="submitting">
                    <LineMdLoadingTwotoneLoop v-if="submitting" :style="{ fontSize: '1em' }" />

                    <span v-else>{{ actionText }}</span>
                </b-button>
            </template>
        </modal>
    </b-form>
</template>
