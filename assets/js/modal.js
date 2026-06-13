/* Note for reviewer:
 ** The Project 1 Part 8 submission instructions link to the
 ** "Configurable Version" modal lesson, but I do not currently have
 ** access to that lesson. This implementation follows the expected
 ** reusable modal behavior based on the available project requirements.
 **/

const modalVisibleClass = "modal_visible";

let activeModalCleanup = null;

function openModal(modalElement, onClose = null) {
  modalElement.classList.add(modalVisibleClass);
  activeModalCleanup = onClose;
  document.addEventListener("keydown", handleEscClose);
  modalElement.addEventListener("mousedown", handleOverlayMouseDown);
}

function closeModal(modalElement) {
  modalElement.classList.remove(modalVisibleClass);
  document.removeEventListener("keydown", handleEscClose);
  modalElement.removeEventListener("mousedown", handleOverlayMouseDown);

  if (activeModalCleanup) {
    activeModalCleanup();
    activeModalCleanup = null;
  }
}

function handleEscClose(evt) {
  if (evt.key !== "Escape") {
    return;
  }

  const openedModal = document.querySelector(`.${modalVisibleClass}`);

  if (openedModal) {
    closeModal(openedModal);
  }
}

function handleOverlayMouseDown(evt) {
  if (evt.target !== evt.currentTarget) {
    return;
  }

  closeModal(evt.currentTarget);
}

// Confirmation Modal Logic

const confirmationModal = document.querySelector("#confirmation-modal");
const modalTextItemType = confirmationModal.querySelector(
  ".modal__text_item-type",
);
const cancelBtn = confirmationModal.querySelector(".modal__btn_type_cancel");
const confirmBtn = confirmationModal.querySelector(".modal__btn_type_confirm");

let confirmCallback = null;

function openConfirmationModal(itemType, onConfirm) {
  modalTextItemType.textContent = itemType;
  confirmCallback = onConfirm;

  openModal(confirmationModal, () => {
    confirmCallback = null;
  });
}

function closeConfirmationModal() {
  closeModal(confirmationModal);
}

cancelBtn.addEventListener("click", closeConfirmationModal);

confirmBtn.addEventListener("click", () => {
  if (confirmCallback) {
    confirmCallback();
  }

  closeConfirmationModal();
});

export { openModal, closeModal, openConfirmationModal };
