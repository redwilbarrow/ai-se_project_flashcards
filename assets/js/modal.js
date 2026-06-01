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
  confirmationModal.classList.add("modal_visible");
}

function closeConfirmationModal() {
  confirmationModal.classList.remove("modal_visible");
  confirmCallback = null;
}

cancelBtn.addEventListener("click", closeConfirmationModal);

confirmBtn.addEventListener("click", () => {
  if (confirmCallback) {
    confirmCallback();
  }

  closeConfirmationModal();
});

/* I wanted to make it so that if the user clicks outside of the modal or
 * hits the 'Esc' button, it will close the modal. So, I asked Copilot how.
 * This was the solution we came up with.
 */
confirmationModal.addEventListener("mousedown", (evt) => {
  if (evt.target === confirmationModal) {
    closeConfirmationModal();
  }
});

document.addEventListener("keydown", (evt) => {
  const isModalOpen = confirmationModal.classList.contains("modal_visible");

  if (evt.key === "Escape" && isModalOpen) {
    closeConfirmationModal();
  }
});

export { openConfirmationModal };
