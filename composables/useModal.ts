import { Modal } from "bootstrap";

export const useModal = () => {
  const modal = ref();

  const registerModal = (modalRef, registerOptions = {}) => {
    modal.value = new Modal(modalRef.value, registerOptions);

    return modal;
  };

  const showModal = () => {
    modal?.value.show();
  };

  const hideModal = () => {
    modal?.value.hide();
  };

  return {
    registerModal,
    showModal,
    hideModal
  };
};
