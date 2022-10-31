<script setup>
import { useToast } from "vue-toastification";
import EyeClosed from "~icons/bi/eye-slash-fill";
import Eye from "~icons/bi/eye-fill";

definePageMeta({
  title: "Ai4FoodSafety - Login",

  layout: "center",

  middleware: [
    "public"
  ]
});

const toast = useToast();
const router = useRouter();
const { api: authApi } = useAuth();

const invalid = ref(false);
const error = ref(false);
const loading = ref(false);
const isPassword = ref(true)

const form = reactive({
  username: "",
  password: ""
});

const onFormSubmitted = async () => {
  error.value = false;
  invalid.value = false;

  if (form.username == "" || form.password == "") {
    invalid.value = true;

    return toast("กรุณาป้อนบัญชีผู้ใช้ และรหัสผ่านเพื่อเข้าใช้งาน", { timeout: 1000 });
  } else {
    try {
      loading.value = true;

      await authApi().login(form.username, form.password);

      toast.success("Login สำเร็จ กำลังเข้าสู่ระบบ", { timeout: 1000 });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (e) {
      console.log(e);
      error.value = true;
      toast.error("Login ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { timeout: 1000 });
    } finally {
      loading.value = false;
    }
  }
}

const usernameInvalidState = computed(() => invalid.value ? form.username.length > 0 : null);
const passwordInvalidState = computed(() => invalid.value ? form.password.length > 0 : null);
const inputPasswordType = computed(() => isPassword.value ? "password" : "text");

const showPassword = () => {
  isPassword.value = !isPassword.value;
}
</script>

<template>
  <div class="col-md-6 col-lg-4">
    <b-card class="mt-4">
      <b-form class="w-100" @submit="onFormSubmitted">
        <div class="row d-flex justify-content-center">
          <!-- Login Form -->
          <div class="d-grid gap-2">
            <div v-if="error" class="alert alert-danger" role="alert">
              บัญชีผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง
            </div>

            <b-form-group id="username-group" label="บัญชีผู้ใช้:" label-for="username">
              <b-form-input id="username" v-model="form.username" :state="usernameInvalidState" type="text" />
              <b-form-invalid-feedback :state="usernameInvalidState">
                กรุณาป้อนบัญชีผู้ใช้
              </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id="password-group" label="รหัสผ่าน:" label-for="username">
              <b-input-group>
                <b-form-input id="password" v-model="form.password" :state="passwordInvalidState"
                  :type="inputPasswordType" />

                <span class="has-float-label"></span>

                <b-form-invalid-feedback :state="passwordInvalidState">
                  กรุณาป้อนรหัสผ่าน
                </b-form-invalid-feedback>

                <b-input-group-append>
                  <b-input-group-text @click="showPassword">
                    <EyeClosed v-if="isPassword" />
                    <Eye v-else />
                  </b-input-group-text>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>

            <button-arrow-right variant="primary" type="submit" size="lg" :loading="loading">
              Login
            </button-arrow-right>
          </div>
        </div>
      </b-form>
    </b-card>
  </div>
</template>
