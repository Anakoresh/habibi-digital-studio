const slider = document.getElementById("budget-slider");
const thumb = document.getElementById("thumb");
const value = document.getElementById("value");

const max = 5000; 

let isDragging = false;

thumb.addEventListener("mousedown", () => {
  isDragging = true;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const rect = slider.getBoundingClientRect();
  let x = e.clientX - rect.left; 

  if (x < 0) x = 0;
  if (x > rect.width) x = rect.width;

  const percent = x / rect.width;
  const amount = Math.round(percent * max);

  thumb.style.left = `${x}px`;
  value.textContent = `$${amount.toLocaleString()}`;
});

// brif.js (ES module)
document.addEventListener("DOMContentLoaded", () => {
  const stepContainers = Array.from(document.querySelectorAll(".step-container"));
  const progressDiv = document.querySelector(".progress-div");
  const serviceBoxes = Array.from(document.querySelectorAll(".check-box-container"));
  const step3Container = stepContainers.find(sc => sc.querySelector("h4") && sc.querySelector("h4").textContent.includes("Step 3"));
  const step2Container = stepContainers.find(sc => sc.querySelector("h4") && sc.querySelector("h4").textContent.includes("Step 2"));
  // Map service index -> id of step3 block (in the same order as your service list)
  const serviceToStep3Id = [
    "website-development-project",
    "web-application-project",
    "website-redesign-project",
    "site-audit",
    "quick-fixes",
    "ui-design-project",
    "one-page-project"
  ];

    stepContainers.forEach((sc, idx) => {
    const stepNum = idx + 1;
    const plus = sc.querySelector(".task-container img[src*='plus']");
    const minus = sc.querySelector(".task-container img[src*='minus']");

    if (stepNum === 1) {
        openStep(sc);
    } else {
        closeStep(sc);
    }
    });

  stepContainers.forEach(sc => {
    const task = sc.querySelector(".task-container");
    if (!task) return;
    task.style.cursor = "pointer";
    task.addEventListener("click", () => {
      const isOpen = sc.classList.contains("open");
      if (isOpen) {
        closeStep(sc, true);
      } else {
        stepContainers.forEach(other => {
          if (other !== sc) closeStep(other, true);
        });
        openStep(sc, true);
      }
    });
  });

  serviceBoxes.forEach((box, idx) => {
    box.dataset.serviceIndex = idx;
    box.addEventListener("click", () => {
      const checkImg = box.querySelector(".check-box img");
      const selected = box.classList.toggle("selected");
      if (checkImg) {
        if (selected) checkImg.style.display = "block";
        else checkImg.style.display = "none";
      }
      updateStep3Visibility();
      updateProgress();
    });
  });

  function updateStep3Visibility() {
    if (!step3Container.classList.contains("open")) return; 

    serviceToStep3Id.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add("d-none");
        el.classList.remove("d-flex");
    });

    const selectedIndexes = serviceBoxes
      .filter(b => b.classList.contains("selected"))
      .map(b => Number(b.dataset.serviceIndex));

    selectedIndexes.forEach(i => {
        const id = serviceToStep3Id[i];
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("d-none");
            el.classList.add("d-flex");
        }
    });

    const msg = getOrCreateStep3Message();
    if (selectedIndexes.length === 0) {
        msg.textContent = "Please select at least one project in Step 1.";
        msg.style.display = "block";
    } else {
        msg.style.display = "none";
    }
}

  function updateProgress() {
    let percent = 0;

    const step1Selected = serviceBoxes.some(b => b.classList.contains("selected"));
    const step2Ok = checkStep2RequiredFilled();
    const step3Status = checkStep3Status();

    if (step1Selected) percent += 33;
    if (step2Ok) percent += 33;
    if (step3Status.allRequiredFilled) percent += 34; 

    progressDiv.style.background = `linear-gradient(to right, #00F0FF 0%, #00F0FF ${percent}%, transparent ${percent}%, transparent 100%)`;
  }

  function checkStep2RequiredFilled() {
    if (!step2Container) return false;
    const containers = Array.from(step2Container.querySelectorAll(".project-detail-container"));
    const requiredElems = [];
    containers.forEach(cont => {
      const p = cont.querySelector("p");
      if (p && p.querySelector && p.querySelector("mark")) {
        const field = cont.querySelector("input, textarea, select");
        if (field) requiredElems.push(field);
      }
    });
    if (requiredElems.length === 0) return false; 
    return requiredElems.every(el => {
      const v = (el.value || "").toString().trim();
      return v.length > 0;
    });
  }

  function checkStep3Status() {
    const selectedIndexes = serviceBoxes
        .filter(b => b.classList.contains("selected"))
        .map(b => Number(b.dataset.serviceIndex));

    if (selectedIndexes.length === 0) return { filled: false, allRequiredFilled: false };

    let allRequiredFilled = true; 
    let anyFilled = false; 
    let hasRequired = false; 

    for (const i of selectedIndexes) {
        const id = serviceToStep3Id[i];
        const block = document.getElementById(id);
        if (!block) continue;

        const requiredFieldsContainers = Array.from(block.querySelectorAll(".project-detail-container"))
            .filter(cont => cont.querySelector("p mark"));

        if (requiredFieldsContainers.length > 0) hasRequired = true;

        const requiredFilled = requiredFieldsContainers.every(cont => {
            const field = cont.querySelector("input, textarea, select");
            return field && field.value.trim().length > 0;
        });

        if (!requiredFilled) allRequiredFilled = false;

        const allFields = Array.from(block.querySelectorAll("input, textarea, select"));
        if (allFields.some(f => f.value.trim().length > 0)) anyFilled = true;
    }

    if (!hasRequired) {
      allRequiredFilled = anyFilled;
    }

    return { filled: anyFilled, allRequiredFilled };
  }

  function getOrCreateStep3Message() {
    let msg = step3Container.querySelector(".step3-empty-msg");
    if (!msg) {
      msg = document.createElement("div");
      msg.className = "step3-empty-msg";
      msg.style.color = "#E6E6E6";
      msg.style.padding = "12px 0";
      msg.style.fontSize = "18px";
      step3Container.appendChild(msg);
    }
    return msg;
  }

    function openStep(sc) {
        sc.classList.add("open");
        sc.classList.remove("closed");

        const plus = sc.querySelector(".task-container img[src*='plus']");
        const minus = sc.querySelector(".task-container img[src*='minus']");

        if (plus) plus.classList.add("d-none");
        if (minus) minus.classList.remove("d-none");

        if (sc.querySelector(".services-check-boxes")) {
            sc.querySelector(".services-check-boxes").classList.remove("d-none");
        } else {
            sc.querySelectorAll(".project-details-form").forEach(f => f.classList.remove("d-none"));
        }

        if (sc === step3Container) updateStep3Visibility();
    }

    function closeStep(sc) {
        sc.classList.remove("open");
        sc.classList.add("closed");

        const plus = sc.querySelector(".task-container img[src*='plus']");
        const minus = sc.querySelector(".task-container img[src*='minus']");

        if (plus) plus.classList.remove("d-none");
        if (minus) minus.classList.add("d-none");

        if (sc.querySelector(".services-check-boxes")) {
            sc.querySelector(".services-check-boxes").classList.add("d-none");
        } else {
            sc.querySelectorAll(".project-details-form").forEach(f => f.classList.add("d-none"));
        }

        if (sc === step3Container) {
            const msg = step3Container.querySelector(".step3-empty-msg");
            if (msg) msg.style.display = "none";
        }
    }

  document.addEventListener("input", (e) => {
    updateProgress();
  });

  updateProgress();

  const slider = document.getElementById("budget-slider");
  const thumb = document.getElementById("thumb");
  const valueEl = document.getElementById("value");
  const MAX_BUDGET = 5000;

  if (slider && thumb && valueEl) {
    let dragging = false;

    const rectWidth = () => slider.getBoundingClientRect().width;

    function setByClientX(clientX) {
      const rect = slider.getBoundingClientRect();
      let x = clientX - rect.left;
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      thumb.style.left = `${x}px`;
      const percent = x / rect.width;
      const amount = Math.round(percent * MAX_BUDGET);
      valueEl.textContent = `$${amount.toLocaleString()}`;
    }

    // mouse
    thumb.addEventListener("mousedown", (e) => {
      e.preventDefault();
      dragging = true;
    });
    document.addEventListener("mouseup", () => { dragging = false; });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      setByClientX(e.clientX);
    });

    // touch
    thumb.addEventListener("touchstart", (e) => {
      dragging = true;
      e.preventDefault();
    }, {passive:false});
    document.addEventListener("touchend", () => { dragging = false; });
    document.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
      if (touch) setByClientX(touch.clientX);
    }, {passive:false});

    // click on slider to jump
    slider.addEventListener("click", (e) => {
      setByClientX(e.clientX);
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get("service");

  if (service) {
    const serviceBoxes = document.querySelectorAll(".check-box-container p");
    serviceBoxes.forEach(p => {
      if (p.textContent.trim() === service) {
        const box = p.closest(".check-box-container");
        box.classList.add("selected");
        const checkImg = box.querySelector(".check-box img");
        if (checkImg) checkImg.style.display = "block";
      }
    });
    updateStep3Visibility(); 
    updateProgress(); 
  }
});


