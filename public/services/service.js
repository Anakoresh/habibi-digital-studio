document.addEventListener("DOMContentLoaded", () => {
    const startButtons = document.querySelectorAll(".start-project-btn");
    startButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const serviceName = btn.dataset.service;
            const encodedService = encodeURIComponent(serviceName);
            window.location.href = `/start-project.html?service=${encodedService}`;
        });
    });
});