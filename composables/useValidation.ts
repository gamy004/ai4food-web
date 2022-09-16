import useVuelidate from "@vuelidate/core";

export const useValidation = (validationRules, form) => {
    const invalid = ref(false);

    const v$ = useVuelidate(validationRules, form);

    const isInvalid = computed(() => invalid.value === true);

    const isFormInvalid = (field, rules = []) => {
        return invalid.value ? !rules.some(rule => v$.value[field][rule].$invalid) : null;
    };

    const validate = (): void => {
        invalid.value = false;

        v$.value.$touch();

        if (v$.value.$invalid) {
            console.log(v$);

            invalid.value = true;
        }
    }

    return {
        isInvalid,
        isFormInvalid,
        validate
    }
}