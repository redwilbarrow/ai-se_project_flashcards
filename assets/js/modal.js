/* Note for reviewer:
 * The Project 1 Part 8 submission instructions link to the
 * "Configurable Version" modal lesson, but I do not currently have
 * access to that lesson. This implementation follows the expected
 * reusable modal behavior based on the available project requirements.
 */

const modal = document.querySelector("#modal");
const modalContainer = modal.querySelector(".modal__container");
const modalTitle = modal.querySelector(".modal__title");
const modalMessage = modal.querySelector(".modal__message");
const cancelBtn = modal.querySelector(".modal__btn_type_cancel");
const confirmBtn = modal.querySelector(".modal__btn_type_confirm");

let confirmCallback = null;

const modalVisibleClass = "modal_visible";

function openModal() {
  modal.classList.add(modalVisibleClass);
  document.addEventListener("keydown", handleEscClose);
  modal.addEventListener("mousedown", handleOverlayMouseDown);
}

function closeModal() {
  modal.classList.remove(modalVisibleClass);
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("mousedown", handleOverlayMouseDown);
  resetModal();
}

function handleEscClose(evt) {
  if (evt.key !== "Escape") {
    return;
  }

  closeModal();
}

function handleOverlayMouseDown(evt) {
  if (evt.target !== evt.currentTarget) {
    return;
  }

  closeModal();
}

function showError(message) {
  modalTitle.classList.add("modal__title_type_error");
  modalTitle.textContent = "An error has occurred";
  modalMessage.textContent = message;
  modalMessage.classList.remove("modal__message_hidden");
  confirmBtn.textContent = "Dismiss";
  cancelBtn.classList.add("modal__btn_hidden");
  modalContainer.classList.add("modal__container_type_error");

  confirmCallback = null;
  openModal();
}

function openConfirmationModal(itemType, onConfirm) {
  modalTitle.classList.remove("modal__title_type_error");
  modalTitle.textContent = `Are you sure you want to delete this ${itemType}`;

  confirmCallback = onConfirm;
  openModal();
}

function resetModal() {
  modalTitle.textContent = "";
  modalMessage.textContent = "";
  modalMessage.classList.add("modal__message_hidden");
  confirmBtn.textContent = "Delete";
  cancelBtn.textContent = "Cancel";
  cancelBtn.classList.remove("modal__btn_hidden");
  modalContainer.classList.remove("modal__container_type_error");

  confirmCallback = null;
}

cancelBtn.addEventListener("click", closeModal);

confirmBtn.addEventListener("click", () => {
  if (confirmCallback) {
    confirmCallback();
  }

  closeModal();
});

export { openModal, closeModal, openConfirmationModal, showError };
