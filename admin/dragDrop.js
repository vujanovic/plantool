const API_LINK =
  "https://planning-tool-e0efc2czdkbeeug7.westeurope-01.azurewebsites.net";

////////////////////////
////// SERVICES ////////
////////////////////////

alert(JSON.stringify(document.cookie));

// adding and removing service types
const serviceTypesList = document.querySelector("#serviceTypesList");
const serviceTypeItem = document.querySelector(".service-type-item");

const promotionSection = document.querySelector(".promotion-section");

fetch(API_LINK + "/data/getServiceTypes")
  .then((res) => res.json())
  .then((data) => {
    const serviceTypeSearch = document.querySelector("#serviceTypeSearch");
    for (const type of data) {
      let currentItem = serviceTypeItem.cloneNode(true);

      serviceTypeSearch.appendChild(new Option(type.value, type.value));

      const name = currentItem.querySelector("#typeName");
      name.textContent = type.label;

      const removeBtn = currentItem.querySelector("#removeTypeBtn");
      removeBtn.addEventListener("click", (e) => {
        alert(`Removing ${type}`);
        fetch(API_LINK + "/admin/data/deleteServiceType", {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: type.value }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status !== 200) {
              alert("Something went wrong");
              return;
            }
            currentItem.remove();
          });
      });

      currentItem.style.display = "list-item";
      serviceTypesList.appendChild(currentItem);
    }
  });

const addServiceTypeForm = document.querySelector("#addServiceTypeForm");
const addServiceTypeBtn = document.querySelector("#addServiceTypeBtn");

addServiceTypeBtn.addEventListener("click", (e) => {
  if (!addServiceTypeForm.checkValidity()) {
    addServiceTypeForm.reportValidity();
    return;
  }

  const formData = new FormData(addServiceTypeForm);
  const entries = Object.fromEntries(formData);
  entries.label = entries.value;

  fetch(API_LINK + "/admin/data/addServiceType", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entries),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status !== 200) {
        return;
      }
      let currentItem = serviceTypeItem.cloneNode(true);

      const name = currentItem.querySelector("#typeName");
      name.textContent = entries.label;

      const removeBtn = currentItem.querySelector("#removeTypeBtn");
      removeBtn.addEventListener("click", (e) => {
        alert(`Removing ${entries.label}`);
        currentItem.remove();
      });

      currentItem.style.display = "list-item";
      serviceTypesList.appendChild(currentItem);
    });
  addServiceTypeForm.reset();
});

const serviceDataCard = document.querySelector("#serviceDataCard"); // ovaj displej ide na grid
const serviceList = document.querySelector(".admin-services-list");

const extendPromotionButton = document.querySelector("#extendPromotionButton");
const addNewPromotionBtn = promotionSection.querySelector(
  "#addNewPromotionBtn"
);
const promotionForm = document.querySelector("#promotionForm");

// ice dinamicki endpoint kad se ispravi /services?sort=default
fetch(API_LINK + "/services")
  .then((res) => res.json())
  .then((data) => {
    for (const service of [
      ...new Set([...data.services, ...data.promotedServices]),
    ]) {
      const newCard = serviceDataCard.cloneNode(true);

      newCard.setAttribute("always-hide", "false");

      const name = newCard.querySelector("#name");
      const type = newCard.querySelector("#type");
      const address = newCard.querySelector("#address");
      const editBtn = newCard.querySelector("#editServiceBtn");
      const activateDeactivate = newCard.querySelector("#activateDeactivate");

      if (service.active == false) {
        activateDeactivate.textContent = "Reactivate";
      } else {
        activateDeactivate.textContent = "Deactivate";
      }

      const removeBtn = newCard.querySelector("#removeServiceBtn");
      const seePromotionsBtn = newCard.querySelector("#seePromotionsBtn");

      const promotionsContainer = newCard.querySelector("#promotionsContainer");
      const ogPromotionCard = newCard.querySelector("#promotionCard");

      for (const ad of service.advertisement) {
        const promotionCard = ogPromotionCard.cloneNode(true);

        const city = promotionCard.querySelector("#city");
        city.textContent = `${city.textContent} ${ad.city}`;

        const range = promotionCard.querySelector("#range");
        range.textContent = `${range.textContent} ` + ad.range;

        const startingDate = promotionCard.querySelector("#startDate");
        startingDate.textContent =
          `${startingDate.textContent} ` + ad.startingDate.split("T")[0];

        const expiringDate = promotionCard.querySelector("#endDate");
        expiringDate.textContent =
          `${expiringDate.textContent} ` + ad.expiringDate.split("T")[0];

        const openExtend = promotionCard.querySelector("#openExtend");
        openExtend.addEventListener("click", (e) => {
          promotionSection.style.display = "block";

          const extendCity = promotionSection.querySelector("[name=city]");
          extendCity.previousSibling.style.display = "none";
          extendCity.style.display = "none";

          const extendZip = promotionSection.querySelector("[name=zip]");
          extendZip.previousSibling.style.display = "none";
          extendZip.style.display = "none";

          addNewPromotionBtn.style.display = "none";

          extendPromotionButton.dataset.adID = ad["_id"];
          extendPromotionButton.dataset.serviceID = service["id"];
          extendPromotionButton.dataset.providerID = service.providerID;
          extendPromotionButton.style.display = "block";
        });

        promotionCard.style.display = "grid";
        promotionsContainer.appendChild(promotionCard);
      }

      seePromotionsBtn.addEventListener("click", (e) => {
        promotionsContainer.style.display =
          openAddPromotion.dataset.open === "true" ? "flex" : "none";
        openAddPromotion.dataset.open =
          openAddPromotion.dataset.open === "true" ? "false" : "true";
      });

      const openAddPromotion = newCard.querySelector("#openAddPromotion");
      openAddPromotion.dataset.open = "true";
      openAddPromotion.addEventListener("click", (e) => {
        promotionSection.style.display = "block";
        for (const element of Array.from(promotionForm.children)) {
          element.style.display = "block";
        }
        extendPromotionButton.style.display = "none";
        addNewPromotionBtn.dataset.serviceID = service["id"];
        addNewPromotionBtn.dataset.providerID = service.providerID;
      });

      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.setItem(
          "providerID",
          JSON.stringify(service.providerID)
        );
        window.location.href = `/service?serviceID=${service["id"]}`;
      });

      activateDeactivate.addEventListener("click", (e) => {
        const url = `${API_LINK}/service/activateDeactivate?providerID=${encodeURIComponent(
          service.providerID
        )}&serviceID=${encodeURIComponent(service.id)}`;

        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // some servers require this even if body is empty
          },
        })
          .then((res) => {
            if (!res.ok) {
              alert("Bad request (400 or other)");
              return;
            }
            return res.json();
          })
          .then((data) => {
            alert(`Service is ${activateDeactivate.textContent}d`);
            if (activateDeactivate.textContent == "Deactivate") {
              activateDeactivate.textContent = "Reactivate";
            } else {
              activateDeactivate.textContent == "Deactivate";
            }
          })
          .catch((err) => {
            console.error("Network or parsing error:", err);
            alert("Greska u mreži");
          });
      });

      removeBtn.addEventListener("click", (e) => {
        fetch(`${API_LINK}/service/deleteService/${service["id"]}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            providerID: service.providerID,
            serviceID: service["id"],
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status != 200) {
              alert("greska");
              return;
            }
            alert("brisem servis");
            newCard.remove();
          });
      });

      const serviceAddress = service.address;

      name.textContent = service.name;
      type.textContent = service.type;
      address.textContent = `${serviceAddress.street}, ${serviceAddress.zip} ${serviceAddress.city}, ${serviceAddress.country}`;

      newCard.style.display = "grid";
      newCard.draggable = true;
      serviceList.appendChild(newCard);
    }

    const draggables = serviceList.querySelectorAll(".draggable");
    draggables.forEach((draggable) => {
      draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging");
      });

      draggable.addEventListener("dragend", () => {
        draggable.classList.remove("dragging");
      });
    });

    serviceList.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(serviceList, e.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        serviceList.appendChild(draggable);
      } else {
        serviceList.insertBefore(draggable, afterElement);
      }
    });
  });

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

const searchServiceForm = document.querySelector("#searchServiceForm");
const searchServiceBtn = searchServiceForm.querySelector("#searchServiceBtn");

searchServiceBtn.addEventListener("click", (e) => {
  const formData = new FormData(searchServiceForm);
  const entries = Object.fromEntries(formData);

  const cards = Array.from(serviceList.children).slice(3);

  for (const card of cards) {
    if (card.getAttribute("always-hide") === "true") {
      continue;
    }

    let match = true;
    for (const key in entries) {
      if (!card.innerHTML.toLowerCase().includes(entries[key].toLowerCase())) {
        match = false;
      }
    }
    if (!match) {
      card.style.display = "none";
      continue;
    }

    card.style.display = "grid";
  }
});

addNewPromotionBtn.addEventListener("click", (e) => {
  if (!promotionForm.checkValidity()) {
    promotionForm.reportValidity();
    return;
  }

  const formData = new FormData(promotionForm);
  const entries = Object.fromEntries(formData);

  const serviceID = addNewPromotionBtn.dataset.serviceID;
  const providerID = addNewPromotionBtn.dataset.providerID;

  fetch(
    API_LINK +
      `/admin/promoteProvider/advertisement?providerID=${providerID}&serviceID=${serviceID}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entries),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status !== 200) {
        alert("somethign went wrong");
        return;
      }
      alert("Promotion confirmed");
      location.reload();
    });
});

extendPromotionButton.addEventListener("click", (e) => {
  const formData = new FormData(promotionForm);
  const entries = Object.fromEntries(formData);
  const providerID = extendPromotionButton.dataset.providerID;
  const serviceID = extendPromotionButton.dataset.serviceID;
  const adID = extendPromotionButton.dataset.adID;
  fetch(
    API_LINK +
      `/admin/promoteProvider/prolongAD?providerID=${providerID}&serviceID=${serviceID}&adID=${adID}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entries),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status !== 200) {
        alert("somethign went wrong");
        return;
      }
      alert("Promotion confirmed");
      location.reload();
    });
});

// OVDE SAD IDU FAQS

const addQuestionForm = document.querySelector("#addQuestionForm");
const addNewQuestionBtn = document.querySelector("#addNewQuestionBtn");

addNewQuestionBtn.addEventListener("click", (e) => {
  if (!addQuestionForm.checkValidity()) {
    addQuestionForm.reportValidity();
    return;
  }

  const formData = new FormData(addQuestionForm);
  const entries = Object.fromEntries(formData);

  fetch(API_LINK + "/admin/faqs/addQuestion", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entries),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status !== 200) {
        alert("something went wrong");
        return;
      }
      alert("New question added");
      location.reload();
    });
});

const questionsContainer = document.querySelector("#questionsContainer");
const questionWrapper = document.querySelector(".question-wrapper");

fetch(API_LINK + "/faqs/getAllFaqs")
  .then((res) => res.json())
  .then((data) => {
    for (const faq of data.faqs) {
      const faqCard = questionWrapper.cloneNode(true);
      const editQuestionForm = faqCard.querySelector("#editQuestionForm");
      faqCard.querySelector("h4").textContent = faq.question;
      faqCard.querySelector("[name=question]").value = faq.question;
      faqCard.querySelector("[name=answer]").value = faq.answer;

      const openEditQuestion = faqCard.querySelector("#openEditQuestion");
      openEditQuestion.dataset.show = "true";
      const removeQuestion = faqCard.querySelector("#removeQuestion");
      const confirmEditQuestionBtn = faqCard.querySelector(
        "#confirmEditQuestionBtn"
      );

      openEditQuestion.addEventListener("click", (e) => {
        editQuestionForm.style.display =
          openEditQuestion.dataset.show === "true" ? "block" : "none";
        openEditQuestion.dataset.show =
          openEditQuestion.dataset.show === "true" ? "false" : "true";
      });

      removeQuestion.addEventListener("click", (e) => {
        fetch(API_LINK + `/admin/faqs/removeQuestion/${faq["_id"]}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status !== 200) {
              alert("something went wrong");
              return;
            }
            alert("Question removed");
            location.reload();
          });
      });

      confirmEditQuestionBtn.addEventListener("click", (e) => {
        if (!editQuestionForm.checkValidity()) {
          editQuestionForm.reportValidity();
          return;
        }

        const formData = new FormData(editQuestionForm);
        const entries = Object.fromEntries(formData);

        fetch(API_LINK + `/admin/faqs/editQuestion/${faq["_id"]}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entries),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status !== 200) {
              alert("something went wrong");
              return;
            }
            alert("FAQ changed sucessfully");
          });
      });

      faqCard.style.display = "block";
      questionsContainer.appendChild(faqCard);
    }
  });

// sad ide za provajdere

const providersList = document.querySelector("#providersList");
const searchProviderForm = document.querySelector("#searchProviderForm");
const searchProviderBtn = document.querySelector("#searchProviderBtn");
const providerOriginalCard = document.querySelector("#adminDataCard");

fetch(API_LINK + "/admin/showAllProviders", {
  method: "GET",
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => {
    for (const provider of data.data) {
      const newCard = providerOriginalCard.cloneNode(true);

      const name = newCard.querySelector("#name");
      name.textContent = `${provider.firstname} ${provider.lastname}`;

      const email = newCard.querySelector("#email");
      email.textContent = provider.email;

      const type = newCard.querySelector("#type");
      type.value = provider.subscription.type;

      const checkbox = newCard.querySelector("#checkbox");
      checkbox.checked = provider.verified;

      const providerSubscriptionForm = newCard.querySelector(
        "#providerSubscriptionForm"
      );

      const submitBtn = newCard.querySelector("#providerSubscriptionSubmit");

      submitBtn.addEventListener("click", (e) => {
        if (!providerSubscriptionForm.checkValidity()) {
          providerSubscriptionForm.reportValidity();
          return;
        }
        const formData = new FormData(providerSubscriptionForm);
        const entries = Object.fromEntries(formData);

        fetch(
          API_LINK +
            `/admin/promoteProvider/providerSubscription?providerID=${provider["_id"]}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entries),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.status !== 200) {
              alert("Something went wrong.");
              return;
            }
            alert("Subscription updated.");
          });
      });

      const resetPwd = newCard.querySelector("#resetPwd");
      resetPwd.addEventListener("click", (e) => {
        fetch(API_LINK + "/forgotPassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: provider.email,
            type: "provider",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status !== 200) {
              alert("there was an error");
              return;
            }
            alert("Reset password link is sent");
          });
      });
      const changeAccStatusBtn = newCard.querySelector("#changeAccStatusBtn");
      let isInactive = provider.services.every(
        (service) => service.active !== true
      );

      if (isInactive) {
        changeAccStatusBtn.textContent = "Activate";
      } else {
        changeAccStatusBtn.textContent = "Deactivate";
      }

      changeAccStatusBtn.addEventListener("click", (e) => {
        if (!isInactive) {
          fetch(
            API_LINK +
              `/service/deactivateProvider?providerID=${provider["_id"]}`,
            {
              method: "POST",
              credentials: "include",
            }
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.status !== 200) {
                alert("Something is wrong. Try again later.");
                return;
              }
              alert("Provider account is deactivated.");
              window.location.reload();
            });
        } else {
          fetch(
            API_LINK +
              `/service/activateProvider?providerID=${provider["_id"]}`,
            {
              method: "POST",
              credentials: "include",
            }
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.status !== 200) {
                alert("Something is wrong. Try again later.");
                return;
              }
              alert("Provider account is activated.");
              window.location.reload();
            });
        }
      });
      const deleteAccBtn = newCard.querySelector("#deleteAccBtn");
      deleteAccBtn.addEventListener("click", (e) => {
        alert("Account is deleted");
      });

      newCard.style.display = "grid";
      providersList.appendChild(newCard);
    }
  });

searchProviderBtn.addEventListener("click", (e) => {
  const formData = new FormData(searchProviderForm);
  const entries = Object.fromEntries(formData);

  for (const card of Array.from(providersList.children)) {
    if (card.getAttribute("always-hide") !== "true") {
      continue;
    }
    if (
      !card.innerHTML.toLowerCase().includes(entries["email"].toLowerCase()) ||
      !card.innerHTML.toLowerCase().includes(entries["name"].toLowerCase())
    ) {
      card.style.display = "none";
    } else {
      card.style.display = "grid";
    }
  }
});

// USERS

const usersList = document.querySelector("#usersList");
const originalUserCard = document.querySelector("#userCard");
originalUserCard.style.display = "none";

fetch(API_LINK + "/admin/data/userList", {
  method: "GET",
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => {
    for (const user of data.data) {
      if (!user.firstname) {
        continue;
      }
      const newCard = originalUserCard.cloneNode(true);
      const name = newCard.querySelector("h5");
      name.textContent = `${user.firstname} ${user.lastname}`;

      const email = newCard.querySelector("#email");
      email.textContent = user.email;

      const resetPwd = newCard.querySelector("#resetPwd");
      resetPwd.addEventListener("click", (e) => {
        fetch(API_LINK + "/forgotPassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            type: "user",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status !== 200) {
              alert("there was an error");
              return;
            }
            alert("Reset password link is sent");
          });
      });

      const seePlanBtn = newCard.querySelector("#checkUserPlan");
      seePlanBtn.addEventListener("click", (e) => {
        sessionStorage.setItem("userID", user["_id"]);
        window.location.href = "/user-plan";
      });

      const deleteAccBtn = newCard.querySelector("#deleteAccBtn");
      deleteAccBtn.addEventListener("click", (e) => {
        alert("Account is deleted");
      });

      newCard.style.display = "grid";
      originalUserCard.style.display = "none";
      usersList.appendChild(newCard);
    }
  });
