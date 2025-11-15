const API_LINK =
  "https://planning-tool-e0efc2czdkbeeug7.westeurope-01.azurewebsites.net";

const currUserID = JSON.parse(sessionStorage.getItem("userID"));
const fullName = sessionStorage.getItem("name");

// for service list preview
const servicesList = document.querySelector("#servicesList");
const info = servicesList.querySelector(".contact-table-info");
const addToFavStar = servicesList.querySelector("#addToFavStar");
const deleteBtn = servicesList.querySelector(".delete-btn");
const addReviewLink = servicesList.querySelector("#addReviewLink");
const gridLine = servicesList.querySelector(".grid-line");
const checkbox = servicesList.querySelector(".checkbox");
const playbookCheckField = servicesList.querySelector(".playbook-check-field");
const productCombo = servicesList.querySelector("#productCombo");

const previewPlaybookBtn = document.querySelector("#previewPlaybookBtn");

// for reviews
const reviewSection = document.querySelector(".review-section");
const submitReview = document.querySelector("#submitReview");
const closeBtn = document.querySelector("#closeBtn");
const blackOverlay = document.querySelector(".black-overlay");
const submitMessage = document.querySelector("#reviewMsg");
const comment = reviewSection.querySelector("#comment");

const starWrappers = document.querySelectorAll(".star-wrapper");

starWrappers.forEach((star) => {
  star.addEventListener("mouseenter", (e) => {
    star.style.opacity = "1";
    let prevStar = star.previousSibling;
    while (prevStar) {
      prevStar.style.opacity = "1";
      prevStar = prevStar.previousSibling;
    }
  });

  star.addEventListener("mouseleave", (e) => {
    if (star.dataset.clicked !== "true") {
      star.style.opacity = "0.3";
    }
    let prevStar = star.previousSibling;
    while (prevStar) {
      if (prevStar.dataset.clicked !== "true") {
        prevStar.style.opacity = "0.3";
      }
      prevStar = prevStar.previousSibling;
    }
  });

  star.addEventListener("click", (e) => {
    star.dataset.clicked = "true";
    star.style.opacity = "1";
    let starsGiven = 1;
    let prevStar = star.previousSibling;
    while (prevStar) {
      prevStar.dataset.clicked = "true";
      prevStar.style.opacity = "1";
      prevStar = prevStar.previousSibling;
      starsGiven++;
    }
    let nextStar = star.nextSibling;
    while (nextStar) {
      nextStar.style.opacity = "0.3";
      nextStar.dataset.clicked = "false";
      nextStar = nextStar.nextSibling;
    }

    alert(starsGiven);
    submitReview.dataset.starsGiven = starsGiven;
  });
});

closeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  blackOverlay.style.display = "none";
  reviewSection.style.display = "none";
  comment.value = "";
  submitMessage.style.display = "none";
  starWrappers.forEach((star) => {
    star.style.opacity = "0.3";
    star.dataset.clicked = "false";
  });
});

submitReview.addEventListener("click", (e) => {
  if (!submitReview.dataset.starsGiven) {
    submitMessage.textContent = "Please specify both grade and comment.";
    submitMessage.style.color = "red";
    submitMessage.style.display = "block";
    return;
  }

  fetch(API_LINK + "/user/addReview", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: currUserID,
      providerID: submitReview.dataset.providerID,
      serviceID: submitReview.dataset.serviceID,
      comment: comment.value,
      grade: parseInt(submitReview.dataset.starsGiven),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status !== 200) {
        submitMessage.textContent = "Please specify both grade and comment.";
        submitMessage.style.color = "red";
      } else {
        submitMessage.textContent = "Review submitted.";
        submitMessage.style.color = "green";
      }
      submitMessage.style.display = "block";
    });
});

const promises = [
  fetch(API_LINK + `/user/allData?id=${currUserID}`, {
    method: "GET",
    credentials: "include",
  }).then((res) => res.json()),
];

Promise.all(promises)
  .then(async ([data]) => {
    const services = data.ceremonial?.services || [];
    const favourites = data.favourites || [];
    const playbook = data.playbook || { services: [] };

    console.log("Services:", services);
    for (const service of services) {
      let serviceID = service.serviceID;
      let providerID = service.providerID;

      let res = await fetch(
        API_LINK +
          `/commerce/getProducts?providerID=${providerID}&serviceID=${serviceID}`
      );
      let products = await res.json();
      products = products.products || [];
      console.log(products);

      console.log(serviceID);
      console.log(providerID);

      // name
      const name = info.cloneNode(true);
      name.textContent = service.serviceName;
      name.style.display = "block";

      // type
      const type = info.cloneNode(true);
      type.textContent = service.type;
      type.style.display = "block";

      // add/remove from favorites
      const favStar = addToFavStar.cloneNode(true);
      favStar.style.display = "block";

      const serviceInFavorites = favourites.some(
        (item) => item.serviceID === serviceID
      );

      if (serviceInFavorites) {
        favStar.style.opacity = "1";
        favStar.dataset.isFavorite = "true";
      } else {
        favStar.style.opacity = "0.3";
        favStar.dataset.isFavorite = "false";
      }

      favStar.addEventListener("click", (e) => {
        const isFavorite = favStar.dataset.isFavorite;

        if (isFavorite === "true") {
          favStar.style.opacity = "0.3";
          fetch(API_LINK + "/user/removeFavourite", {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: currUserID,
              serviceID: serviceID,
              providerID: providerID,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              favStar.dataset.isFavorite = "false";
              console.log(data);
            });
        } else {
          favStar.style.opacity = "1";
          fetch(API_LINK + "/user/addFavourite", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: currUserID,
              serviceID: serviceID,
              providerID: providerID,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              favStar.dataset.isFavorite = "true";
              console.log(data);
            });
        }
      });

      servicesList.appendChild(name);
      servicesList.appendChild(type);
      servicesList.appendChild(favStar);

      // add to playbook

      const serviceInPlaybook = playbook.services.some(
        (item) => item.serviceID === serviceID
      );

      const label = document.createElement("label");
      label.className = "custom-checkbox";

      const playbookCheck = document.createElement("input");
      playbookCheck.type = "checkbox";

      const span = document.createElement("span");
      span.className = "checkmark";

      label.appendChild(playbookCheck);
      label.appendChild(span);

      servicesList.appendChild(label);

      if (serviceInPlaybook) {
        playbookCheck.click();
        playbookCheck.checked = true;
      }

      playbookCheck.addEventListener("click", (e) => {
        if (playbookCheck.checked) {
          fetch(API_LINK + "/user/addToPlaybook", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: currUserID,
              serviceID: serviceID,
              providerID: providerID,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
            });
        } else {
          console.log({
            userID: currUserID,
            serviceID: serviceID,
            providerID: providerID,
          });
          fetch(API_LINK + "/user/removeFromPlaybook", {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: currUserID,
              serviceID: serviceID,
              providerID: providerID,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
            });
        }
      });

      const productCombo = servicesList
        .querySelector("#productCombo")
        .cloneNode(true);
      productCombo.style.display = "block";

      if (products.length === 0) {
        productCombo.disabled = true;
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No products available";
        productCombo.appendChild(option);
      }

      products.forEach((product) => {
        const option = document.createElement("option");
        option.value = product._id;
        option.textContent = `${product.name} (${product.price || "N/A"} EUR)`;
        productCombo.appendChild(option);
      });

      productCombo.value = service.product || "";

      // TODO: set selected product on change

      servicesList.appendChild(productCombo);

      // review link
      const reviewLink = addReviewLink.cloneNode(true);
      reviewLink.style.display = "block";

      reviewLink.addEventListener("click", (e) => {
        e.preventDefault();

        reviewSection.style.display = "flex";
        blackOverlay.style.display = "block";
        submitReview.dataset.providerID = providerID;
        submitReview.dataset.serviceID = serviceID;
      });

      // reviewSection
      // submitReview
      // closeBtn
      // blackOverlay

      // remove button
      const removeBtn = deleteBtn.cloneNode(true);
      removeBtn.style.display = "block";

      removeBtn.addEventListener("click", (e) => {
        Promise.all([
          fetch(API_LINK + "/user/removeFavourite", {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: currUserID,
              serviceID: serviceID,
              providerID: providerID,
            }),
          }).then((res) => res.json()),
          fetch(API_LINK + "/user/removeFromPlaybook", {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: currUserID,
              serviceID: serviceID,
              providerID: providerID,
            }),
          }).then((res) => res.json()),
          fetch(
            API_LINK +
              `/ceremonial/removeService?userID=${currUserID}&serviceID=${service["_id"]}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          ).then((res) => res.json()),
        ]).then(([data1, data2]) => {
          if (data1.status === 200 && data2.status === 200) {
            for (let i = 0; i < 5; i++) {
              removeBtn.previousSibling.remove();
            }
            removeBtn.nextSibling.remove();
            removeBtn.remove();
          }
          console.log(data1, data2);
        });
      });

      const line = gridLine.cloneNode(true);
      line.style.display = "block";

      servicesList.appendChild(reviewLink);
      servicesList.appendChild(removeBtn);
      servicesList.appendChild(line);
    }

    console.log("Favourites:", favourites);
    console.log("Playbook:", playbook);

    // You can use services, favourites, and playbook here
  })
  .catch((err) => {
    console.error("Error in one of the fetches:", err);
  });

const playbookSection = document.querySelector(".playbook-section");
const playbookCard = document.querySelector(".playbook-card");
const playbookContainer = document.querySelector(".playbook");
const title = playbookContainer.querySelector("h2");

const createPlaybookForm = document.querySelector(".create-playbook-form");
const dateInput = createPlaybookForm.querySelector("#date");
const sendToContacts = createPlaybookForm.querySelector("#sendToContacts");
const confirmPlaybook = createPlaybookForm.querySelector("#confirmPlaybook");
const confirmMessage = createPlaybookForm.querySelector("#confirmMessage");

if (!dateInput.value) {
  dateInput.setAttribute("type", "text");
  dateInput.setAttribute(
    "placeholder",
    dateInput.getAttribute("data-placeholder")
  );
}

dateInput.addEventListener("focus", function () {
  this.type =
    this.getAttribute("name") !== "ceremonyHour" ? "date" : "datetime-local";
});

dateInput.addEventListener("blur", function () {
  if (!this.value) {
    this.type = "text";
    this.setAttribute("placeholder", this.getAttribute("data-placeholder"));
  }
});

function inlineAllStyles(element) {
  const allElements = element.querySelectorAll("*");
  const computed = window.getComputedStyle(element);

  Object.assign(
    element.style,
    Object.fromEntries(
      [...computed].map((key) => [key, computed.getPropertyValue(key)])
    )
  );

  allElements.forEach((el) => {
    const styles = window.getComputedStyle(el);
    Object.assign(
      el.style,
      Object.fromEntries(
        [...styles].map((key) => [key, styles.getPropertyValue(key)])
      )
    );
  });

  return element;
}

previewPlaybookBtn.addEventListener("click", (e) => {
  fetch(API_LINK + `/user/getPlaybook?userID=${currUserID}`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      playbookSection.style.display = "block";
      playbookContainer.innerHTML = "";

      title.textContent = `PLAYBOOK FOR ${fullName.toUpperCase()}`;
      playbookContainer.appendChild(title);

      data.services.forEach((service) => {
        const currCard = playbookCard.cloneNode(true);

        const name = currCard.querySelector("#name");
        name.textContent = service.name;

        const address = currCard.querySelector("#address");
        const serviceAddress = service.address;
        address.textContent = `${serviceAddress.street}, ${serviceAddress.zip} ${serviceAddress.city}, ${serviceAddress.country}`;

        const type = currCard.querySelector("#type");
        type.textContent = service.type;

        currCard.style.display = "block";
        playbookContainer.appendChild(currCard);
      });

      document
        .getElementById("downloadPlaybookBtn")
        .addEventListener("click", async () => {
          const clone = playbookContainer.cloneNode(true);
          inlineAllStyles(clone);

          clone.style.position = "fixed";
          clone.style.top = "0";
          clone.style.left = "0";
          clone.style.zIndex = "9999";
          clone.style.opacity = "1";
          clone.style.background = "#fff";

          document.body.appendChild(clone);

          await new Promise((res) => setTimeout(res, 300)); // let layout settle

          html2canvas(clone, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/jpeg", 1.0);

            const pdf = new jspdf.jsPDF({
              orientation: "landscape",
              unit: "mm",
              format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth(); // ~297mm
            const pageHeight = pdf.internal.pageSize.getHeight(); // ~210mm

            const pxPerMm = canvas.width / pageWidth; // Pixels per mm in the canvas

            // Calculate image size in mm
            const imgWidth = canvas.width / pxPerMm;
            const imgHeight = canvas.height / pxPerMm;

            // Scale image down to fit page while preserving aspect ratio
            const scale = Math.min(
              pageWidth / imgWidth,
              pageHeight / imgHeight
            );
            const finalWidth = imgWidth * scale;
            const finalHeight = imgHeight * scale;

            const x = (pageWidth - finalWidth) / 2;
            const y = (pageHeight - finalHeight) / 2;

            pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);
            pdf.save("playbook.pdf");

            document.body.removeChild(clone); // Clean up
          });
        });
    });
});

confirmPlaybook.addEventListener("click", (e) => {
  if (!createPlaybookForm.checkValidity()) {
    createPlaybookForm.reportValidity();
    return;
  }

  fetch(API_LINK + `/user/createPlaybook`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: currUserID,
      date: dateInput.value,
      sendToContacts: sendToContacts.checked,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.status !== 200) {
        confirmMessage.textContent =
          "Something is wrong. Please check your input fields.";
        confirmMessage.style.color = "red";
      }
      confirmMessage.style.display = "block";
    });
});
