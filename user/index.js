// ========================
// INDEX
// ========================

fetch(API_LINK + "/data/getServiceTypes")
  .then((res) => res.json())
  .then((data) => {
    ogServiceCard.style.display = "none";
    for (const type of data) {
      const typeCard = ogServiceCard.cloneNode(true);

      const title = typeCard.querySelector("h4");

      title.textContent = type.value;

      typeCard.style.display = "block";

      typeCard.addEventListener("click", () => {
        const selectedType = type.value;
        arrowScroll.style.display = "flex";
        providersSection.style.display = "none";
        featuredProvidersSection.style.display = "block";
        nearProvidersSection.style.display = "block";
        firstHeading.textContent = `ALLE ${selectedType.toUpperCase()} AANBIEDERS`;
        bestMatchHeading.textContent = `AANBEVOLEN ${selectedType.toUpperCase()} AANBIEDERS`;
        nearSectionHeading.textContent = `${selectedType.toUpperCase()} AANBIEDERS BIJ U IN DE BUURT`;
        ctaLink.textContent = `Bekijk alle ${selectedType.toUpperCase()} aanbieders`;

        fetch(API_LINK + `/searchServiceType?type=${selectedType}`)
          .then((response) => response.json())
          .then((data) => {
            const merged = [
              ...new Set([...data.services, ...data.promotedServices]),
            ];
            const nearest = getNearestServices(userLat, userLng, merged);
            renderFeatured(data);
            renderNear(nearest);
            renderAllProviders(data);
            types[selectedType] = data;
            stepContainer.style.height = `${
              document.querySelector(".current-step").offsetHeight
            }px`;
          });
      });

      servicesGrid.appendChild(typeCard);
    }

    window.Webflow && window.Webflow.require("ix2").init();
  });

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.removeItem("userID");
  window.location.href = "/";
});

// ========================
// Main Interaction Logic
// ========================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        arrowScroll.style.display = "none";
      }
    });
  },
  {
    threshold: 0.7,
  }
);

observer.observe(ctaLink);

ctaLink.addEventListener("click", (e) => {
  e.preventDefault();
  providersSection.style.display = "block";
  stepContainer.style.height = `${
    document.querySelector(".current-step").offsetHeight
  }px`;
});

function goToStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= steps.length) return;

  // Remove the current step class from all steps
  steps.forEach((step, index) => {
    step.classList.remove("current-step");
    step.style.transform =
      index < stepIndex ? "translateX(-100%)" : "translateX(100%)";
    step.style.opacity = "0";
  });

  // Add class to the new step
  steps[stepIndex].classList.add("current-step");
  steps[stepIndex].style.transform = "translateX(0)";
  steps[stepIndex].style.opacity = "1";

  // Adjust the container height smoothly
  stepContainer.style.height = `${steps[stepIndex].offsetHeight}px`;
}

fetch(API_LINK + `/user/allData?id=${currUserID}`, {
  method: "GET",
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    nameHeading.textContent = nameHeading.textContent.replace(
      "$name",
      data["firstname"]
    );

    sessionStorage.setItem("name", `${data.firstname} ${data.lastname}`);

    for (const key in data) {
      if (key === "address") {
        for (const detail in data[key]) {
          if (detail === "number") {
            const input = document.querySelector(`[name="streetNumber"]`);
            input.value = data[key][detail] || "";
            continue;
          }
          const input = document.querySelector(`[name="${detail}"]`);
          if (input) {
            input.value = data[key][detail] || "";
          }
        }
        continue;
      }
      const input = document.querySelector(`input[name="${key}"]`);
      if (input) {
        input.value = data[key] ? data[key] : "";
      }
    }

    if (data.ceremonial) {
      for (const service of data.ceremonial?.services) {
        ceremonialIDs[service.serviceID] = service["_id"];
      }

      // first ceremonial step

      if (data.ceremonial.typeBurial) {
        for (const key in data.ceremonial.typeBurial) {
          const element = burialCremationForm.querySelector(`#${key}`);
          if (element) {
            if (element.name === "file") {
              fetch(API_LINK + `/ceremonial/getPermit?userID=${currUserID}`, {
                method: "GET",
                credentials: "include",
              })
                .then((response) => response.json())
                .then((rawData) => {
                  permitData = rawData.data.permit;
                  permitName.textContent = permitData.fileName;
                  permitInfo.style.display = "block";
                  element.dataset.existingFileName = permitData.fileName;
                  element.dataset.existingFileUrl = permitData.fileURL;
                });

              continue;
            }
            element.value = data.ceremonial.typeBurial[key];
            if (key === "type") {
              element.value = data.ceremonial.typeBurial[key].toLowerCase();
            }
          }
        }
      }

      // second and third ceremonial step

      for (const key in data.ceremonial) {
        if (key === "services") {
          continue;
        }

        if (key === "ceremonyPlace") {
          for (const detailKey in data.ceremonial["ceremonyPlace"]) {
            const element = ceremonyPlanForm.querySelector(
              `[name=${detailKey}]`
            );
            if (!element) {
              continue;
            }
            element.value = data.ceremonial["ceremonyPlace"][detailKey];
          }

          for (const detailKey in data.ceremonial["ceremonyPlace"]["address"]) {
            const element = ceremonyPlanForm.querySelector(
              `[name=${detailKey}]`
            );
            if (!element) {
              continue;
            }
            element.value =
              data.ceremonial["ceremonyPlace"]["address"][detailKey];
          }

          continue;
        }

        if (key === "funeralHome") {
          const homeName = funeralHomeForm.querySelector("input[name=name]");
          homeName.value = data.ceremonial[key]["name"];
          for (const detailKey in data.ceremonial[key]["address"]) {
            const element = funeralHomeForm.querySelector(
              `[name=${detailKey}]`
            );
            if (!element) {
              continue;
            }
            element.value = data.ceremonial[key]["address"][detailKey];
          }
          continue;
        }

        const element = ceremonyPlanForm.querySelector(`#${key}`);

        if (!element) {
          continue;
        }

        if (element.name === "wake") {
          element.type = "date";
          element.value = data.ceremonial[key].split("T")[0];
        } else if (element.name === "ceremonyHour") {
          element.type = "datetime-local";
          element.value = data.ceremonial[key].slice(0, 16);
        } else {
          element.value = data.ceremonial[key];
        }
      }
    }

    cityField.value = data?.placeOfBirth?.city ?? "";
    countryField.value = data?.placeOfBirth?.country ?? "";
    dateField.value = data.dateOfBirth?.split("T")[0] ?? "";

    for (const partner of data["marriages"]) {
      addPartnerToList(partner);
    }

    for (const child of data["children"]) {
      addChildToList(child);
    }

    for (const friend of data["contacts"]) {
      addFriendToList(friend);
    }

    addDeleteListeners();
    stepContainer.style.height = `${
      document.querySelector(".current-step").offsetHeight
    }px`;

    if (data["verified"]) {
      verificationStatus.style.color = "green";
      verificationStatus.textContent = "VERIFIED";
      verificationSection.style.display = "none";
      overlay.style.display = "none";
    } else {
      verificationSection.style.display = "none"; // for testing purposes none - should be flex
      overlay.style.display = "none"; // for testing purposes none - should be block
    }

    if (
      data["enabledFA"] &&
      data["verified"] &&
      !sessionStorage.getItem("confirmedFA") &&
      false
    ) {
      fetch(API_LINK + `/sendFACode`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: currUserID }),
      });
      faSection.style.display = "none"; // for testing purposes none - should be flex
      overlay.style.display = "none"; // for testing purposes none - should be block
    }

    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

submitInfo.addEventListener("click", (e) => {
  e.preventDefault();

  if (!updateInfoForm.checkValidity()) {
    updateInfoForm.reportValidity();
    return;
  }

  const formData = new FormData(updateInfoForm);
  const dataObject = Object.fromEntries(formData.entries());
  delete dataObject["cf-turnstile-response"];

  const req1 = fetch(`${API_LINK}/user/updateBasicData?userID=${currUserID}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataObject),
  }).then((res) => res.json());

  const req2 = fetch(`${API_LINK}/user/changeAddress?userID=${currUserID}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataObject),
  }).then((res) => res.json());

  Promise.all([req1, req2])
    .then(([data1, data2]) => {
      console.log("updateBasicData response:", data1);
      console.log("changeAddress response:", data2);

      for (const button of stepBtns) {
        button.classList.remove("active-step-btn");
        if (button.textContent == "2") {
          button.classList.add("active-step-btn");
        }
      }
    })
    .catch((err) => {
      console.error(err);
      alert("error");
    });
});

updateInfoForm.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitInfo.click();
  }
});

const stepBtns = document.querySelectorAll(".step-btn");

stepBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    for (const button of stepBtns) {
      button.classList.remove("active-step-btn");
    }
    btn.classList.add("active-step-btn");
    goToStep(btn.textContent - 1);
  });
});
