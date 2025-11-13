// ========================
// Product Modal Logic
// ========================
closeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  productSelection.style.display = "none";
  Array.from(productCombo.options).forEach((option) => {
    if (option.value !== "") {
      productCombo.removeChild(option);
    }
  });
  productCombo.value = "";
  productSection.style.display = "none";
  productImageGrid.innerHTML = "";
  productMask.innerHTML = "";
  Webflow.require("ix2").init();
});

productCombo.addEventListener("change", (e) => {
  const selectedOption = productCombo.options[productCombo.selectedIndex];
  if (selectedOption.value === "") {
    document.querySelectorAll(".variant-link-image-wrapper").forEach((btn) => {
      btn.classList.remove("selected-product-image");
    });
    return;
  }
  const productInfo = {
    price: selectedOption.dataset.price,
    description: selectedOption.dataset.description,
  };
  document.querySelectorAll(".variant-link-image-wrapper").forEach((btn) => {
    btn.classList.toggle(
      "selected-product-image",
      btn.dataset.productID === selectedOption.value
    );
  });
  setProductInfo(productInfo);
});

function setProductInfo(product) {
  productDescription.textContent = product.description;
  productPrice.textContent = "$" + product.price;
}
