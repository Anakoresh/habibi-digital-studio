const modalContainer = document.querySelector(".sucsess-message-container");
const closeModalBtn = document.querySelector(".close-modal");
const consultationModal = document.querySelector(".consultation-request-container");
const consultationBtns = document.querySelectorAll(".consultation-btn");
const consultationCancelBtn = document.querySelector(".consultation-cancel-btn");

closeModalBtn.addEventListener("click", () => {
    closeModal();
})

function closeModal() {
    modalContainer.classList.add("d-none");
}

function openModal() {
    modalContainer.classList.remove("d-none");
    setTimeout(() => {
        closeModal();
    }, 4500);
}

consultationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        openConsultationModal();
    });
});

function openConsultationModal() {
    consultationModal.classList.remove("d-none");
}

consultationCancelBtn.addEventListener("click", () => {
    closeConsultationModal();
})

function closeConsultationModal() {
    consultationModal.classList.add("d-none");
}

document.addEventListener("DOMContentLoaded", () => {
    const consultationSubmitBtn = consultationModal.querySelector("button:not(.consultation-cancel-btn)");
    if (!consultationSubmitBtn) return;
    consultationSubmitBtn.dataset.originalText = consultationSubmitBtn.textContent;

    consultationSubmitBtn.addEventListener("click", async () => {
        const nameInput = consultationModal.querySelector("input[type='text']");
        const emailInput = consultationModal.querySelector("input[type='email']");
        const whatsappInput = consultationModal.querySelector("input[type='tel']");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const whatsapp = whatsappInput.value.trim();

        if (!name || !email) {
            alert("Please fill all required fields (*) before sending your request.");
            return;
        }

        setButtonLoading(consultationSubmitBtn, true);

        let message = "<b>New Consultation Request:</b>\n\n";
        message += `<b>Name:</b> ${name}\n`;
        message += `<b>Email:</b> ${email}\n`;
        if (whatsapp) message += `<b>WhatsApp:</b> ${whatsapp}\n`;

        const res = await sendToTelegram(message);

        setButtonLoading(consultationSubmitBtn, false);

        if (res && res.ok) {
            openModal();
            closeConsultationModal();
            nameInput.value = "";
            emailInput.value = "";
            whatsappInput.value = "";
        } else {
            alert("Failed to send the consultation request. Please try again later.");
        }
    });
});

async function sendToTelegram(message) {
    try {
        const res = await fetch("/api/send-telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        return await res.json();
    } catch (err) {
        console.error("Telegram send error:", err);
        return null;
    }
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = "Sending...";
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}