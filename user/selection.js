// ========================
// Selection Logic
// ========================

const duplicateServiceMsg = document.querySelector("#duplicateServiceMsg");
const handleSelect = (ev) => {
  const btn = ev.target;
  servicePickedBtn = btn;

  productSection.style.display = "flex";

  arrowScroll.style.display = "none";

  productSection.querySelector("h3").textContent = btn.dataset.name;

  duplicateServiceMsg.style.display = "none";

  providerID = btn.dataset.providerID;
  serviceID = btn.dataset.serviceID;

  const description = btn.dataset.serviceDescription;
  const address = JSON.parse(btn.dataset.address);
  const contactInfo = JSON.parse(btn.dataset.contactInfo);
  const website = btn.dataset.website;

  // handling reviews
  const reviews = JSON.parse(btn.dataset.reviews);
  reviewsContainer.innerHTML = "";

  for (const review of reviews) {
    const newReviewCard = reviewDiv.cloneNode(true);
    const name = newReviewCard.querySelector("#name");
    const comment = newReviewCard.querySelector("#comment");

    name.textContent = review.name;
    comment.textContent = review.comment || "-";

    const stars = newReviewCard.querySelector("#ratingStars");

    for (let i = 0; i < review.grade; i++) {
      stars.children[i].querySelector("div").style.width = "30px";
    }

    newReviewCard.style.display = "flex";

    reviewsContainer.appendChild(newReviewCard);
  }

  serviceDescription.textContent = description || "-";
  serviceAddress.textContent = `${address.street}, ${address.zip} ${address.city}, ${address.country}`;
  serviceMail.textContent = contactInfo.email || "-";
  servicePhone.textContent = contactInfo.phoneNumber || "-";
  serviceWebsite.textContent = website || "-";

  fetch(
    API_LINK +
      `/getServiceImages?providerID=${providerID}&serviceID=${serviceID}`,
    {
      method: "GET",
      credentials: "include",
    }
  )
    .then((res) => res.json())
    .then((data) => {
      for (const img of data.images) {
        const slide = originalProductSlide.cloneNode(true);
        const image = slide.querySelector("img");
        image.src = img.fileURL;
        slide.style.display = "inline-block";
        productMask.appendChild(slide);
      }
      Webflow.destroy();
      Webflow.ready();
      Webflow.require("slider").redraw();
    });

  fetch(
    API_LINK +
      `/commerce/getProducts?providerID=${providerID}&serviceID=${serviceID}`,
    {
      method: "GET",
      credentials: "include",
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data.products?.length) return;

      productSelection.style.display = "flex";
      for (const product of data.products) {
        const option = document.createElement("option");
        option.value = product["_id"];
        option.dataset.price = product.price;
        option.dataset.description = product.description;
        option.textContent = product.name;
        productCombo.appendChild(option);

        const productImageContainer = variantImageWrapper.cloneNode(true);
        const productImg = productImageContainer.querySelector("img");
        productImageContainer.dataset.productID = product["_id"];

        if (product.images.length > 0) {
          fetch(
            API_LINK +
              `/getProductImages?providerID=${providerID}&productID=${product["_id"]}`,
            {
              method: "GET",
              credentials: "include",
            }
          )
            .then((res) => res.json())
            .then((data) => {
              productImg.src = data.images[0].fileURL;
              productImageContainer.style.display = "block";

              productImageContainer.addEventListener("click", () => {
                document
                  .querySelectorAll(".variant-link-image-wrapper")
                  .forEach((btn) => {
                    btn.classList.remove("selected-product-image");
                  });
                productImageContainer.classList.add("selected-product-image");
                productCombo.value = productImageContainer.dataset.productID;
                productCombo.dispatchEvent(
                  new Event("change", { bubbles: true })
                );
              });

              data.images.forEach((img) => {
                const slide = originalProductSlide.cloneNode(true);
                const image = slide.querySelector("img");
                image.src = img.fileURL;
                slide.style.display = "inline-block";
                productMask.appendChild(slide);
              });

              Webflow.destroy();
              Webflow.ready();
              Webflow.require("slider").redraw();

              productImageGrid.appendChild(productImageContainer);
            });
        }
      }
      productCombo.value = data.products[0]["_id"];
      setProductInfo(data.products[0]);
    });

  Webflow.require("ix2").init();
};

// ========================
// Playbook Add/Remove
// ========================
async function addToPlaybookWithProduct() {
  try {
    // 1. Add service to user's playbook
    const playbookRes = await fetch(API_LINK + "/user/addToPlaybook", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: currUserID, providerID, serviceID }),
    });

    const playbookData = await playbookRes.json();

    if (playbookData.status !== 200) {
      duplicateServiceMsg.style.display = "block";
      return;
    }

    servicePickedBtn.textContent = "Verwijderen uit plan";
    servicePickedBtn.style.backgroundColor = "red";
    servicePickedBtn.dataset.productID = productCombo.value;

    servicePickedBtn.removeEventListener("click", handleSelect);
    servicePickedBtn.addEventListener("click", removeFromPlaybookWithProduct);

    // 3. Fix slider layout
    Webflow.require("slider").redraw();

    if (productCombo.value !== "") {
      await addCeremonialProduct();
    } else {
      await createCeremonialServiceWithoutProduct();
    }

    await updateCeremonialMapping();
  } catch (err) {
    console.error("Error in addToPlaybookWithProduct:", err);
  }
}

async function addCeremonialProduct() {
  const res = await fetch(
    API_LINK + `/commerce/addProductCeremonial?userID=${currUserID}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productID: productCombo.value,
        specific: "",
      }),
    }
  );

  const data = await res.json();
  console.log("addProductCeremonial response:", data);

  closeBtn.click();
}

async function createCeremonialServiceWithoutProduct() {
  const bodyData = {
    name: "",
    type: "",
    phoneNumber: "",
    email: "",
    country: "",
    city: "",
    street: "",
    number: "",
    zip: "",
    specific: "",
  };

  const res = await fetch(
    API_LINK +
      `/ceremonial/setNewService?userID=${currUserID}&providerID=${providerID}&serviceID=${serviceID}`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    }
  );

  const data = await res.json();
  console.log("setNewService response:", data);

  if (data.status !== 200) {
    duplicateServiceMsg.style.display = "block";
    return;
  }

  alert("dodat u servise najceremonijalnije");
  closeBtn.click();
}

async function updateCeremonialMapping() {
  const res = await fetch(
    API_LINK + `/ceremonial/getServices?userID=${currUserID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const services = await res.json();
  console.log("ceremonial services:", services);

  if (!services || !services.data || !Array.isArray(services.data)) {
    console.warn("Unexpected ceremonial services format:", services);
    return;
  }

  const providerIdToMatch = servicePickedBtn.dataset.providerID || providerID;

  const matchingService = services.data.find(
    (service) => service.providerID === providerIdToMatch
  );

  if (!matchingService) {
    console.warn(
      "No ceremonial service found for providerID:",
      providerIdToMatch
    );
    return;
  }

  ceremonialIDs[matchingService.serviceID] = matchingService["_id"];
  servicePickedBtn.dataset.serviceIdToDelete = matchingService["_id"];
}

const removeFromPlaybookWithProduct = (e) => {
  const btn = e.target;

  console.log("clicked");

  fetch(
    `${API_LINK}/ceremonial/removeService?userID=${currUserID}&serviceID=${btn.dataset.serviceIdToDelete}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )
    .then((res) => {
      // if there's no content, avoid calling .json()
      return res.status === 204 ? {} : res.json();
    })
    .then((ceremonialResponse) => {
      console.log("Ceremonial:", ceremonialResponse);

      return fetch(`${API_LINK}/user/removeFromPlaybook`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: currUserID,
          providerID: btn.dataset.providerID,
          serviceID: btn.dataset.serviceID,
        }),
      });
    })
    .then((res) => res.json())
    .then((playbookResponse) => {
      console.log("Playbook:", playbookResponse);

      btn.textContent = "Selecteer";
      btn.style.backgroundColor = "#0e0ba6";
      btn.addEventListener("click", handleSelect);
      btn.removeEventListener("click", removeFromPlaybookWithProduct);
    })
    .catch((err) => {
      console.error("One of the DELETEs failed:", err);
    });
};

addToPlanBtn.addEventListener("click", addToPlaybookWithProduct);
