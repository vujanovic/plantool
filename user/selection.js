// ========================
// Selection Logic and Playbook Add/Remove (copied from user.js)
// ========================
const handleSelect = (ev) => {
  const btn = ev.target;
  // preserve original name
  servicePickedBtn = btn;
  productSection.style.display = "flex";
  productSection.querySelector("h3").textContent = btn.dataset.name;

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
// Playbook Add/Remove (copied from user.js)
// ========================
function addToPlaybookWithProduct() {
  fetch(API_LINK + "/user/addToPlaybook", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userID: currUserID, providerID, serviceID }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert("dodat u plejbuk");
      servicePickedBtn.textContent = "Remove from Plan";
      servicePickedBtn.style.backgroundColor = "red";
      servicePickedBtn.dataset.productID = productCombo.value;

      servicePickedBtn.removeEventListener("click", handleSelect);
      servicePickedBtn.addEventListener("click", removeFromPlaybookWithProduct);
    });

  Webflow.require("slider").redraw();

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

  if (productCombo.value !== "") {
    bodyData.productID = productCombo.value;
    fetch(API_LINK + `/commerce/addProductCeremonial?userID=${currUserID}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productID: productCombo.value,
        specific: "",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        closeBtn.click();
        return fetch(
          API_LINK + `/ceremonial/getServices?userID=${currUserID}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
      })
      .then((res) => res.json())
      .then((services) => {
        console.log(services);
        for (const service of services.data) {
          if (service.providerID === servicePickedBtn.dataset.providerID) {
            ceremonialIDs[service.serviceID] = service["_id"];
            servicePickedBtn.dataset.serviceIdToDelete = service["_id"];
            return;
          }
        }
      });
  } else {
    fetch(
      API_LINK +
        `/ceremonial/setNewService?userID=${currUserID}&providerID=${providerID}&serviceID=${serviceID}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        alert("dodat u servise najceremonijalnije");
        closeBtn.click();
        console.log(data);
        return fetch(
          API_LINK + `/ceremonial/getServices?userID=${currUserID}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
      })
      .then((res) => res.json())
      .then((services) => {
        console.log(services);
        for (const service of services.data) {
          if (service.providerID === servicePickedBtn.dataset.providerID) {
            ceremonialIDs[service.serviceID] = service["_id"];
            servicePickedBtn.dataset.serviceIdToDelete = service["_id"];
            return;
          }
        }
      });
  }
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

      btn.textContent = "Select Service";
      btn.style.backgroundColor = "#15a60b";
      btn.addEventListener("click", handleSelect);
      btn.removeEventListener("click", removeFromPlaybookWithProduct);
    })
    .catch((err) => {
      console.error("One of the DELETEs failed:", err);
    });
};

// attach addToPlanBtn if present
if (typeof addToPlanBtn !== "undefined" && addToPlanBtn) {
  addToPlanBtn.addEventListener("click", addToPlaybookWithProduct);
}
