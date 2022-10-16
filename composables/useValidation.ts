import useVuelidate from "@vuelidate/core";

export const useValidation = (validationRules, form) => {
  // const invalid = ref(false);

  const v$ = useVuelidate(validationRules, form);

  const isInvalid = computed(() => v$.value.$invalid === true);

  const isFormInvalid = (field, rules = []) => {
    return isInvalid.value
      ? !rules.some((rule) => v$.value[field][rule].$invalid)
      : null;
  };

  const isFormArrayInvalid = (rootField, subField, index, rules = []) => {
    let isFormArrayInvalid = false;
    console.log(v$.value[rootField]);

    // const validationItem =
    //   v$.value[rootField].$each.$response.$errors[index][subField];

    // if (validationItem && validationItem.length > 0) {
    //   isFormArrayInvalid = rules.some((rule) => {
    //     return validationItem.some((itemRule) => {
    //       return itemRule.$validator === rule;
    //     });
    //   });
    // }

    return isInvalid.value ? isFormArrayInvalid : null;
  };

  const validate = (): void => {
    // invalid.value = false;

    v$.value.$touch();

    // if (v$.value.$invalid) {
    //   invalid.value = true;
    // }
  };

  const resetValidation = (): void => {
    // invalid.value = false;
    v$.value.$reset();
  };

  return {
    v$,
    isInvalid,
    isFormInvalid,
    isFormArrayInvalid,
    validate,
    resetValidation,
  };
};
