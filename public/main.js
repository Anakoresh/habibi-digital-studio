const burgerBtn = document.getElementById("burger-btn");
const menu = document.getElementById("menu");
const menuLinks = document.querySelectorAll(".menu a");

burgerBtn.addEventListener("click", () => {
    menu.classList.toggle("d-flex");
})

function closeMenu(event) {
  if (
    !menu.contains(event.target) &&
    !burgerBtn.contains(event.target) &&
    menu.classList.contains("d-flex")
  ) {
    menu.classList.remove("d-flex");
  }
}

window.addEventListener("click", closeMenu);
window.addEventListener("touchstart", closeMenu);

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("d-flex");
  });
});