import { get } from "lodash";
import useVuelidate from "@vuelidate/core";

export const useValidation = (validationRules, form) => {
  // const invalid = ref(false);

  const v$ = useVuelidate(validationRules, form);

  const isValidated = computed(() => v$.value.$dirty === true);

  const isInvalid = computed(() => v$.value.$invalid === true);

  const isFormInvalid = (field, rules = []) => {
    return isInvalid.value
      ? !rules.some((rule) => {
          // console.log(field, rule, v$.value[field][rule].$invalid);

          return get(v$.value, field)[rule].$invalid;
        })
      : undefined;
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
    validate,
    isValidated,
    isInvalid,
    isFormInvalid,
    resetValidation,
  };
};
