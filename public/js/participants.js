document.querySelector("#togglesidebar").addEventListener("click", () => {
  console.log("Clicked");
  document.querySelector(".menu").toggleAttribute("hidden");
});
