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

function collectFormData() {
    const data = {};

    const services = Array.from(document.querySelectorAll(".check-box-container.selected p"))
                          .map(p => p.textContent.trim());
    data.step1_services = services;

    const step2Fields = Array.from(document.querySelectorAll(".step-container:nth-child(2) .project-detail-container"));
    data.step2 = {};
    step2Fields.forEach(f => {
        const label = f.querySelector("p")?.textContent.replace(/\*/g,'').trim();
        const input = f.querySelector("input, select, textarea");
        if (label && input) data.step2[label] = input.value.trim();
    });

    data.step3 = {};
    const serviceToStep3Id = [
        "website-development-project",
        "web-application-project",
        "website-redesign-project",
        "site-audit",
        "quick-fixes",
        "ui-design-project",
        "one-page-project"
    ];
    const selectedIndexes = Array.from(document.querySelectorAll(".check-box-container.selected"))
                                 .map(b => Number(b.dataset.serviceIndex));

    selectedIndexes.forEach(i => {
        const id = serviceToStep3Id[i];
        const block = document.getElementById(id);
        if (!block) return;
        const fields = Array.from(block.querySelectorAll(".project-detail-container"));
        data.step3[id] = {};
        fields.forEach(f => {
            const label = f.querySelector("p")?.textContent.replace(/\*/g,'').trim();
            const input = f.querySelector("input, select, textarea");
            if (label && input) data.step3[id][label] = input.value.trim();
        });
    });

    return data;
}

function checkRequiredFields() {
    let allFilled = true;

    const step2Required = Array.from(document.querySelectorAll(".step-container:nth-child(2) .project-detail-container p mark"))
                               .map(mark => mark.closest(".project-detail-container"));
    step2Required.forEach(cont => {
        const input = cont.querySelector("input, select, textarea");
        if (!input || input.value.trim() === "") allFilled = false;
    });

    const selectedIndexes = Array.from(document.querySelectorAll(".check-box-container.selected"))
                                 .map(b => Number(b.dataset.serviceIndex));
    const serviceToStep3Id = [
        "website-development-project",
        "web-application-project",
        "website-redesign-project",
        "site-audit",
        "quick-fixes",
        "ui-design-project",
        "one-page-project"
    ];
    selectedIndexes.forEach(i => {
        const id = serviceToStep3Id[i];
        const block = document.getElementById(id);
        if (!block) return;
        const required = Array.from(block.querySelectorAll(".project-detail-container p mark"))
                              .map(mark => mark.closest(".project-detail-container"));
        required.forEach(cont => {
            const input = cont.querySelector("input, select, textarea");
            if (!input || input.value.trim() === "") allFilled = false;
        });
    });

    return allFilled;
}

document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.querySelector(".contacts-btns button");
    sendBtn.dataset.originalText = sendBtn.textContent;

    sendBtn.addEventListener("click", async () => {
        if (!checkRequiredFields()) {
            alert("Please fill all required fields (*) before sending your brief.");
            return;
        }

        setButtonLoading(sendBtn, true);

        const formData = collectFormData();

        let message = "<b>New Project Brief:</b>\n\n";
        message += "<b>Step 1: Services</b>\n";
        message += formData.step1_services.join(", ") + "\n\n";

        message += "<b>Step 2: Project Details</b>\n";
        for (const [key, value] of Object.entries(formData.step2)) {
            message += `<b>${key}</b> ${value}\n`;
        }
        message += "\n";

        message += "<b>Step 3: Service-specific Questions</b>\n";
        for (const [serviceId, fields] of Object.entries(formData.step3)) {
            message += `<i>${serviceId}</i>\n`;
            for (const [key, value] of Object.entries(fields)) {
                message += `<b>${key}</b> ${value}\n`;
            }
            message += "\n";
        }

        const res = await sendToTelegram(message);

        setButtonLoading(sendBtn, false);

        if (res && res.ok) {
            openModal();
        } else {
            alert("Failed to send the brief. Please try again later.");
        }
    });
});

const modalContainer = document.querySelector(".sucsess-message-container");
const closeModalBtn = document.querySelector(".close-modal");

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

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = "Sending...";
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}
