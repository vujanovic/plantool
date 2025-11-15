function addPartnerToList(data) {
  // const formData = new FormData(partnerForm);
  // formData.delete("cf-turnstile-response")
  // const formEntries = Object.fromEntries(formData.entries())
  const formEntries = data;

  const option = document.createElement("option");
  option.textContent = `${formEntries["firstname"]} ${formEntries["lastname"]}`;
  option.value = formEntries["_id"];

  childPartnerCombo.appendChild(option);

  const aftercareInfoObject = {};
  aftercareInfoObject[
    "name"
  ] = `${formEntries["firstname"]} ${formEntries["lastname"]}`;
  aftercareInfoObject["parenthesesText"] = formEntries["status"];
  createAftercareContactBox(
    aftercareInfoObject["name"],
    aftercareInfoObject["parenthesesText"],
    "Partner",
    formEntries["_id"]
  );

  for (const key in formEntries) {
    const infoTitle = responsiveInfoTitle.cloneNode(true);
    let titleText = "";

    if (key === "_id") {
      continue;
    }

    switch (key) {
      case "statusSince":
        formEntries[key] = formEntries[key].split("T")[0];
        titleText = "Since";
        break;
      case "firstname":
        titleText = "First Name";
        break;
      case "lastname":
        titleText = "Last Name";
        break;
      case "status":
        titleText = "Status";
        break;
    }

    infoTitle.textContent = titleText;

    const info = document.createElement("p");
    info.textContent = formEntries[key];
    info.classList.add("contact-table-info");

    partnersGrid.appendChild(infoTitle);
    partnersGrid.appendChild(info);
  }

  const newDelete = deleteBtn.cloneNode(true);
  newDelete.style.display = "block";
  newDelete.dataset.deleteType = "Partner";
  newDelete.dataset.idToDelete = formEntries["_id"];

  const newLine = line.cloneNode(true);

  partnersGrid.appendChild(newDelete);
  partnersGrid.appendChild(newLine);

  addDeleteListeners();

  stepContainer.style.height = `${
    document.querySelector(".current-step").offsetHeight
  }px`;

  window.Webflow && window.Webflow.require("ix2").init();
}
addPartnerBtn.addEventListener("click", (e) => {
  if (!partnerForm.checkValidity()) {
    partnerForm.reportValidity();
    return;
  }

  const formData = new FormData(partnerForm);
  formData.delete("cf-turnstile-response");
  const formEntries = Object.fromEntries(formData.entries());

  fetch(API_LINK + `/user/addPartner?userID=${currUserID}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formEntries),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      formEntries["_id"] = data["_id"];
      addPartnerToList(formEntries);
      partnerForm.reset();
    });
});

partnerForm.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addPartnerBtn.click();
  }
});

const childGrid = document.querySelector("#childList");
const addChildBtn = document.querySelector("#addChildBtn");
const childForm = document.querySelector("#addChildForm");

const deceasedCheckbox = childForm.querySelector("#deceasedCheckbox");
const dateOfDeath = childForm.querySelector("#dateOfDeath");

deceasedCheckbox.addEventListener("change", (e) => {
  if (deceasedCheckbox.checked) {
    dateOfDeath.setAttribute("required", "");
  } else {
    dateOfDeath.removeAttribute("required");
  }
});

function addChildToList(data) {
  const formEntries = data;
  const keys = [
    "firstname",
    "lastname",
    "dateOfBirth",
    "partnerID",
    "deceased",
    "dateOfDeath",
  ];

  const aftercareInfoObject = {};
  aftercareInfoObject[
    "name"
  ] = `${formEntries["firstname"]} ${formEntries["lastname"]}`;

  for (const key of keys) {
    const infoTitle = responsiveInfoTitle.cloneNode(true);
    let titleText = "";

    const info = document.createElement("p");
    info.textContent = formEntries[key];
    info.classList.add("contact-table-info");

    if (key === "partnerID") {
      titleText = "Partner";
      for (const option of childPartnerCombo.options) {
        if (option.value === formEntries[key]) {
          info.textContent = option.text;
          aftercare["parenthesesText"] = option.text;
        }
      }
    }

    if (key === "deceased") {
      titleText = "Deceased";
      info.textContent = `${formEntries[key]}` === "true" ? "✓" : "-";
    }

    if (key === "dateOfBirth") {
      titleText = "Birth Date";
      info.textContent = formEntries[key].split("T")[0];
    }

    if (key === "dateOfDeath") {
      titleText = "Death Date";
      if (!formEntries[key]) {
        info.textContent = "-";
      } else {
        info.textContent = formEntries[key].split("T")[0];
      }
    }

    if (key === "firstname") {
      titleText = "Name";
    }

    if (key === "lastname") {
      titleText = "Lastname";
    }

    infoTitle.textContent = titleText;

    childGrid.appendChild(infoTitle);
    childGrid.appendChild(info);
  }

  const newDelete = deleteBtn.cloneNode(true);
  newDelete.style.display = "block";
  newDelete.dataset.deleteType = "Child";
  newDelete.dataset.idToDelete = formEntries["_id"];

  const newLine = document.querySelector(".span-7").cloneNode(true);

  childGrid.appendChild(newDelete);
  childGrid.appendChild(newLine);

  createAftercareContactBox(
    aftercareInfoObject["name"],
    aftercareInfoObject["parenthesesText"],
    "Child",
    formEntries["_id"]
  );

  stepContainer.style.height = `${
    document.querySelector(".current-step").offsetHeight
  }px`;

  addDeleteListeners();

  window.Webflow && window.Webflow.require("ix2").init();
}

addChildBtn.addEventListener("click", (e) => {
  if (!childForm.checkValidity()) {
    childForm.reportValidity();
    return;
  }

  const formData = new FormData(childForm);
  formData.delete("cf-turnstile-response");
  const formEntries = Object.fromEntries(formData.entries());
  formEntries["deceased"] = `${deceasedCheckbox.checked}`;
  console.log(formEntries["deceased"]);
  console.log(formEntries);

  fetch(
    API_LINK +
      `/user/addPartnerChildren?userID=${currUserID}&partnerID=${childPartnerCombo.value}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formEntries),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      formEntries["_id"] = data["_id"];
      addChildToList(formEntries);
      childForm.reset();
    });
});

childForm.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addChildBtn.click();
  }
});
