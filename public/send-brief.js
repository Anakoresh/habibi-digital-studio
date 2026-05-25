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
        "one-page-project",                 // 0: Landing Page
        "website-development-project",      // 1: Multi-page Website
        "ui-design-project",                // 2: UI Design
        "site-audit",                       // 3: Site Audit
        "quick-fixes",                      // 4: Quick Fixes
        "website-redesign-project",         // 5: Redesign
        "web-application-project",          // 6: Web App
        "telegram-mini-app-project",        // 7: Telegram Mini App
        "ai-automation-project"             // 8: AI & Automation
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
    
    document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));

    const selectedServices = document.querySelectorAll(".check-box-container.selected");
    if (selectedServices.length === 0) {
        allFilled = false;
    }

    const step2 = Array.from(document.querySelectorAll('.step-container')).find(s => s.innerText.includes('Step 2'));
    const step2Required = step2.querySelectorAll("p mark");
    
    step2Required.forEach(mark => {
        const cont = mark.closest(".project-detail-container");
        const input = cont.querySelector("input, select, textarea");
        if (!input || input.value.trim() === "" || (input.tagName === "SELECT" && !input.value)) {
            allFilled = false;
            input.classList.add('error-border');
        }
    });

    selectedServices.forEach(box => {
        const i = Number(box.dataset.serviceIndex);
        const id = serviceToStep3Id[i];
        const block = document.getElementById(id);
        if (block) {
            const required = block.querySelectorAll("p mark");
            required.forEach(mark => {
                const cont = mark.closest(".project-detail-container");
                const input = cont.querySelector("input, select, textarea");
                if (!input || input.value.trim() === "" || (input.tagName === "SELECT" && !input.value)) {
                    allFilled = false;
                    input.classList.add('error-border');
                }
            });
        }
    });

    return allFilled;
}

document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.querySelector(".send-btn-wrap button");
    sendBtn.dataset.originalText = sendBtn.textContent;

    sendBtn.addEventListener("click", async () => {
        const oldErr = document.querySelector(".error-msg-text");
        if (oldErr) oldErr.remove();

        if (!checkRequiredFields()) {
            const errMsg = document.createElement("p");
            errMsg.className = "error-msg-text space-grotesk-font";
            errMsg.style.color = "#FF4EFF"; 
            errMsg.style.marginBottom = "10px";
            errMsg.style.textAlign = "center";
            errMsg.textContent = "Please fill all required fields (*) before sending.";
            
            sendBtn.parentElement.insertBefore(errMsg, sendBtn);
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

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
}

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
