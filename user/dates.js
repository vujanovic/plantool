const dateInputs = document.querySelectorAll("input[data-placeholder]");

dateInputs.forEach((input) => {
  if (!input.value) {
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", input.getAttribute("data-placeholder"));
  }

  input.addEventListener("focus", function () {
    this.type =
      this.getAttribute("name") !== "ceremonyHour" ? "date" : "datetime-local";
  });

  input.addEventListener("blur", function () {
    if (!this.value) {
      this.type = "text";
      this.setAttribute("placeholder", this.getAttribute("data-placeholder"));
    }
  });
});
