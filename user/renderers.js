// ========================
// Provider Rendering
// ========================

const EMPTY_MESSAGE =
  "Er zijn momenteel geen aanbieders voor dit soort diensten.";

const PAGE_SIZE = 2;

let promises = [
  fetch(API_LINK + `/normalServices`).then((res) => res.json()),
  fetch(API_LINK + `/promotedServices`).then((res) => res.json()),
];

const featuredPagPrev = document.querySelector("#featuredPagPrev");
const featuredPagNext = document.querySelector("#featuredPagNext");
const paginationFeaturedStepNum = document.querySelector(
  "#paginationFeaturedStepNum"
);

featuredPagNext.addEventListener("click", () => {
  currentFeaturedPaginationStep++;
  fetch(
    API_LINK +
      `/promotedServices?type=${globalSelectedType}&page=${currentFeaturedPaginationStep}&pageSize=${PAGE_SIZE}`
  )
    .then((res) => res.json())
    .then((data) => {
      renderFeatured({ promotedServices: data.services });
      paginationFeaturedStepNum.textContent = currentFeaturedPaginationStep;
    });
});

featuredPagPrev.addEventListener("click", () => {
  if (currentFeaturedPaginationStep === 1) return;
  currentFeaturedPaginationStep--;
  fetch(
    API_LINK +
      `/promotedServices?type=${globalSelectedType}&page=${currentFeaturedPaginationStep}&pageSize=${PAGE_SIZE}`
  )
    .then((res) => res.json())
    .then((data) => {
      renderFeatured({ promotedServices: data.services, promotedServices: [] });
      paginationFeaturedStepNum.textContent = currentFeaturedPaginationStep;
    });
});

const allPagPrev = document.querySelector("#allPagPrev");
const allPagNext = document.querySelector("#allPagNext");
const paginationAllStepNum = document.querySelector("#paginationAllStepNum");

allPagNext.addEventListener("click", () => {
  currentAllPaginationStep++;
  fetch(
    API_LINK +
      `/normalServices?type=${globalSelectedType}&page=${currentAllPaginationStep}&pageSize=${PAGE_SIZE}`
  )
    .then((res) => res.json())
    .then((data) => {
      renderAll({ services: data.services, promotedServices: [] });
      paginationAllStepNum.textContent = currentAllPaginationStep;
    });
});

allPagPrev.addEventListener("click", () => {
  if (currentAllPaginationStep === 1) return;
  currentAllPaginationStep--;
  fetch(
    API_LINK +
      `/normalServices?type=${globalSelectedType}&page=${currentAllPaginationStep}&pageSize=${PAGE_SIZE}`
  )
    .then((res) => res.json())
    .then((data) => {
      renderFeatured({ services: data.services });
      paginationAllStepNum.textContent = currentAllPaginationStep;
    });
});

function handleRender(toRender = null) {
  Promise.all(promises).then(([normal, promoted]) => {
    const merged = [...new Set([...normal, ...promoted])];
    const nearest = getNearestServices(userLat, userLng, merged);
    if (toRender === null) {
      renderFeatured({ promotedServices: promoted });
      renderNear(nearest);
      renderAllProviders({ services: normal, promotedServices: promoted });
    } else if (toRender === "featured") {
      renderFeatured({ promotedServices: promoted });
    } else if (toRender === "all") {
      renderAllProviders({ services: normal, promotedServices: promoted });
    }
  });
}

function renderAllProviders(data) {
  cardsGrid.innerHTML = "";
  const emptyProvidersError = document.querySelector("#emptyProvidersError");
  const merged = [...new Set([...data.services, ...data.promotedServices])];
  if (merged.length === 0) {
    emptyProvidersError.style.display = "block";
    return;
  } else {
    emptyProvidersError.style.display = "none";
  }
  merged.forEach((item) => {
    const card = originalCard.cloneNode(true);
    const nameHeading = card.querySelector(".fourth-heading");
    const addressParagraph = card.querySelector("#address");
    const phoneParagraph = card.querySelector("#phone");
    const websiteParagraph = card.querySelector("#website");
    const cardBtn = card.querySelector(".card-btn");

    if (ceremonialIDs[item["_id"]]) {
      // znaci da je vec dodatu ceremonial
      cardBtn.textContent = "Verwijderen uit plan";
      cardBtn.style.backgroundColor = "red";
      cardBtn.dataset.serviceIdToDelete = ceremonialIDs[item["_id"]];
      cardBtn.addEventListener("click", removeFromPlaybookWithProduct);
    } else {
      cardBtn.addEventListener("click", handleSelect);
    }

    cardBtn.dataset.serviceID = item["_id"];
    cardBtn.dataset.providerID = item["providerID"];
    cardBtn.dataset.name = item["name"];
    cardBtn.dataset.serviceImages = item["images"];
    cardBtn.dataset.serviceDescription = item["description"] || "-";
    cardBtn.dataset.address = JSON.stringify(item["address"]);
    cardBtn.dataset.addressID = item.address["_id"];
    cardBtn.dataset.contactInfo = JSON.stringify(
      item["contactInfo"] || { email: "-", phoneNumber: "-" }
    );
    cardBtn.dataset.website = item["website"] || "-";
    cardBtn.dataset.reviews = JSON.stringify(item.reviews);

    nameHeading.textContent = item.name;
    addressParagraph.textContent = `${item.address.street}, ${item.address.zip} ${item.address.city}, ${item.address.country}`;
    phoneParagraph.textContent =
      item.contactInfo?.phoneNumber || "Not provided";
    websiteParagraph.textContent = item.contactInfo?.email || "Not provided";

    card.style.display = "flex";
    cardsGrid.appendChild(card);
  });
}

// ========================
// Render Featured Services
// ========================
const featuredGrid = document.querySelector(".featured-grid");
const ogFeatureCard = document.querySelector(".featured-card");

function renderFeatured(data) {
  const services = data.promotedServices;
  featuredGrid.innerHTML = "";

  if (services.length === 0) {
    featuredProvidersSection.style.display = "none";
    return;
  } else {
    featuredProvidersSection.style.display = "block";
  }

  for (const service of services) {
    const currCard = ogFeatureCard.cloneNode(true);
    const nameHeading = currCard.querySelector("h4");
    const image = currCard.querySelector("img");
    const description = currCard.querySelector("#featuredDescription");
    const addressInfo = currCard.querySelector("#featuredAddress");
    const email = currCard.querySelector("#featuredEmail");
    const phone = currCard.querySelector("#featuredPhone");
    const website = currCard.querySelector("#featuredWebsite");
    const stars = currCard.querySelector("#featuredStars");
    const cardBtn = currCard.querySelector(".card-btn");

    nameHeading.textContent = service.name;
    image.src = "https://placehold.co/700x300?text=No\nImage";

    if (service.images.length > 0) {
      fetch(
        API_LINK +
          `/getServiceImages?providerID=${service["providerID"]}&serviceID=${service["_id"]}`,
        {
          method: "GET",
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          image.src = data.images[0].fileURL;
        });
    }

    description.textContent = service.description?.slice(0, 200) || "-";

    if (description.textContent.length === 200) {
      const text = description.textContent;
      const lastSplitIndex = Math.max(
        text.lastIndexOf(" "),
        text.lastIndexOf(".")
      );

      if (lastSplitIndex !== -1) {
        description.textContent = text.slice(0, lastSplitIndex) + "...";
      }
    }

    addressInfo.textContent = `${service.address.street}, ${service.address.zip} ${service.address.city}, ${service.address.country}`;
    email.textContent = service.contactInfo?.email || "-";
    phone.textContent = service.contactInfo?.phoneNumber || "-";
    website.textContent = service.website || "-";

    const whole = Math.floor(service.rating);
    const decimal = service.rating - whole;
    for (let i = 0; i < whole; i++) {
      stars.children[i].querySelector("div").style.width = "30px";
    }
    if (whole < 5) {
      stars.children[whole].querySelector("div").style.width = `${
        decimal * 30
      }px`;
    }

    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    if (ceremonialIDs[service["_id"]]) {
      cardBtn.textContent = "Verwijderen uit plan";
      cardBtn.style.backgroundColor = "red";
      cardBtn.dataset.serviceIdToDelete = ceremonialIDs[service["_id"]];
      cardBtn.addEventListener("click", removeFromPlaybookWithProduct);
    } else {
      cardBtn.addEventListener("click", handleSelect);
    }

    cardBtn.dataset.serviceID = service["_id"];
    cardBtn.dataset.providerID = service["providerID"];
    cardBtn.dataset.serviceImages = service["images"];
    cardBtn.dataset.serviceDescription = service["description"] || "-";
    cardBtn.dataset.address = JSON.stringify(service["address"]);
    cardBtn.dataset.contactInfo = JSON.stringify(
      service["contactInfo"] || { email: "-", phoneNumber: "-" }
    );
    cardBtn.dataset.website = service["website"] || "-";
    cardBtn.dataset.name = service["name"];
    cardBtn.dataset.addressID = service.address["_id"];
    cardBtn.dataset.reviews = JSON.stringify(service.reviews);

    featuredGrid.appendChild(currCard);
  }
}

// ========================
// Render Nearby Services
// ========================
const nearGrid = document.querySelector("#nearGrid");
const nearCard = document.querySelector(".near-me-card");

function renderNear(data) {
  const services = data;
  nearGrid.innerHTML = "";
  if (services.length === 0) {
    nearProvidersSection.style.display = "none";
    return;
  } else {
    nearProvidersSection.style.display = "block";
  }

  for (const service of services) {
    const currCard = nearCard.cloneNode(true);
    const nameHeading = currCard.querySelector("h4");
    const image = currCard.querySelector("img");
    const description = currCard.querySelector("#featuredDescription");
    const addressInfo = currCard.querySelector("#featuredAddress");
    const stars = currCard.querySelector("#featuredStars");
    const cardBtn = currCard.querySelector(".card-btn");

    nameHeading.textContent = service.name;
    image.src = "https://placehold.co/400x200?text=No\nImage";

    if (service.images.length > 0) {
      fetch(
        API_LINK +
          `/getServiceImages?providerID=${service["providerID"]}&serviceID=${service["_id"]}`,
        {
          method: "GET",
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          image.src = data.images[0].fileURL;
        });
    }

    description.textContent = service.description?.slice(0, 20) || "-";
    if (description.textContent.length > 1) description.textContent += "...";

    addressInfo.textContent = `${service.address.street}, ${service.address.zip} ${service.address.city}, ${service.address.country}`;

    const whole = Math.floor(service.rating);
    const decimal = service.rating - whole;
    for (let i = 0; i < whole; i++) {
      stars.children[i].querySelector("div").style.width = "30px";
    }
    if (whole < 5) {
      stars.children[whole].querySelector("div").style.width = `${
        decimal * 30
      }px`;
    }

    if (ceremonialIDs[service["_id"]]) {
      cardBtn.textContent = "Verwijderen uit plan";
      cardBtn.style.backgroundColor = "red";
      cardBtn.dataset.serviceIdToDelete = ceremonialIDs[service["_id"]];
      cardBtn.addEventListener("click", removeFromPlaybookWithProduct);
    } else {
      cardBtn.addEventListener("click", handleSelect);
    }

    cardBtn.dataset.serviceID = service["_id"];
    cardBtn.dataset.providerID = service["providerID"];
    cardBtn.dataset.serviceImages = service["images"];
    cardBtn.dataset.serviceDescription = service["description"] || "-";
    cardBtn.dataset.address = JSON.stringify(service["address"]);
    cardBtn.dataset.contactInfo = JSON.stringify(
      service["contactInfo"] || { email: "-", phoneNumber: "-" }
    );
    cardBtn.dataset.website = service["website"] || "-";
    cardBtn.dataset.name = service["name"];
    cardBtn.dataset.addressID = service.address["_id"];
    cardBtn.dataset.reviews = JSON.stringify(service.reviews);

    nearGrid.appendChild(currCard);
  }
}
