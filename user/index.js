// Entry script: run the initial getServiceTypes block (copied from original user.js)
// Note: this file assumes other user/*.js scripts are loaded before it so
// that globals like ogServiceCard, servicesGrid, renderFeatured, etc exist.

// Recreate initial fetch from original user.js that depends on other scripts
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
        firstHeading.textContent = `ALL ${selectedType.toUpperCase()} PROVIDERS`;
        bestMatchHeading.textContent = `FEATURED ${selectedType.toUpperCase()} PROVIDERS`;
        nearSectionHeading.textContent = `${selectedType.toUpperCase()} PROVIDERS NEAR YOU`;
        ctaLink.textContent = `See all the ${selectedType.toUpperCase()} providers`;

        fetch(API_LINK + `/searchServiceType?type=${selectedType}`)
          .then((response) => response.json())
          .then((data) => {
            const merged = [
              ...new Set([...data.services, ...data.promotedServices]),
            ];
            // best-effort: try to call getNearestServices if defined
            let nearest = merged;
            try {
              nearest = getNearestServices(
                window.userLat,
                window.userLng,
                merged
              );
            } catch (e) {}
            // call renderer functions (expected to be global)
            if (typeof renderFeatured === "function") renderFeatured(data);
            if (typeof renderNear === "function") renderNear(nearest);
            if (typeof renderAllProviders === "function")
              renderAllProviders(data);
            stepContainer.style.height = `${
              document.querySelector(".current-step").offsetHeight
            }px`;
          });
      });

      servicesGrid.appendChild(typeCard);
    }

    window.Webflow && window.Webflow.require("ix2").init();
  });
