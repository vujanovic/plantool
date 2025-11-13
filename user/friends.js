const friendsGrid = document.querySelector("#friendList");
const addFriendBtn = document.querySelector("#addFriendBtn");
const friendForm = document.querySelector("#addFriendForm");

const friendsListInput = document.getElementById("friendsListInput");
const friendsListInfo = document.getElementById("friendsListInfo");
const friendsListName = document.getElementById("friendsListName");
const removeBtn = document.getElementById("removeFriendsListBtn");
const confirmFriendsBtn = document.querySelector("#confirmFriendsBtn");

friendsListInput.addEventListener("change", () => {
  if (friendsListInput.files.length > 0) {
    friendsListName.textContent = friendsListInput.files[0].name;
    friendsListInfo.style.display = "block";
    confirmFriendsBtn.style.display = "block";
  }
});

removeBtn.addEventListener("click", () => {
  friendsListInput.value = "";
  friendsListName.textContent = "";
  friendsListInfo.style.display = "none";
  confirmFriendsBtn.style.display = "none";
});

confirmFriendsBtn.addEventListener("click", async () => {
  const file = friendsListInput.files[0];
  if (!file) return;

  const data = await file.arrayBuffer(); // Read file contents
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // default value = empty string

  const requiredColumns = [
    "Name",
    "Country",
    "City",
    "Street",
    "Zip",
    "Email",
    "Phone Number",
  ]; // all lowercase

  const missingRows = [];

  const normalizedData = json.map((row) => {
    const normalizedRow = {};
    Object.keys(row).forEach((key) => {
      if (!requiredColumns.includes(key)) {
        return;
      }
      normalizedRow[key] = row[key];
    });
    return normalizedRow;
  });

  normalizedData.forEach((row, index) => {
    requiredColumns.forEach((col) => {
      if (!row[col] || String(row[col]).trim() === "") {
        missingRows.push({ row: index + 2, column: col });
      }
    });
  });

  if (missingRows.length > 0) {
    let message = "Missing values detected:\n";
    missingRows.forEach((entry) => {
      message += `- Row ${entry.row}: Missing "${entry.column}"\n`;
    });
    alert(message);
    return;
  }

  console.log(normalizedData);

  const formData = new FormData();
  formData.append("data", file);

  fetch(API_LINK + `/user/addContactsTableImport?userID=${currUserID}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });

  const renderingRows = [
    "name",
    "country",
    "city",
    "street",
    "zip",
    "email",
    "phone Number",
  ];

  for (const contact of normalizedData) {
    const orderedContact = {};

    renderingRows.forEach((key) => {
      orderedContact[key] = contact[key.charAt(0).toUpperCase() + key.slice(1)];
    });

    console.log(orderedContact);
    addFriendToList(orderedContact);
  }
});

function addFriendToList(data) {
  // const formData = new FormData(partnerForm);
  // formData.delete("cf-turnstile-response")
  // const formEntries = Object.fromEntries(formData.entries())
  const formEntries = data;

  for (const key in formEntries) {
    if (key === "userID") {
      continue;
    }

    if (key === "_id") {
      continue;
    }

    const infoTitle = responsiveInfoTitle.cloneNode(true);
    let titleText = key.charAt(0).toUpperCase() + key.slice(1);

    const info = document.createElement("p");
    info.textContent = formEntries[key];
    info.classList.add("contact-table-info");

    if (key === "address") {
      titleText = "Address";
      let address = formEntries[key];
      info.textContent = `${address["street"]}, ${address["zip"] || ""} ${
        address["city"]
      }, ${address["country"]}`;
    }

    if (key === "country") {
      titleText = "Address";
      info.textContent = `${formEntries["street"]}, ${
        formEntries["zip"] || ""
      } ${formEntries["city"]}, ${formEntries["country"]}`;
    }

    if (key === "city" || key === "street" || key === "zip") {
      continue;
    }

    if (key === "phoneNumber") {
      titleText = "Phone";
    }

    infoTitle.textContent = titleText;

    friendsGrid.appendChild(infoTitle);
    friendsGrid.appendChild(info);
  }

  const newDelete = deleteBtn.cloneNode(true);
  newDelete.style.display = "block";
  newDelete.dataset.deleteType = "Friend";
  newDelete.dataset.idToDelete = formEntries["_id"];

  const newLine = line.cloneNode(true);

  friendsGrid.appendChild(newDelete);
  friendsGrid.appendChild(newLine);

  stepContainer.style.height = `${
    document.querySelector(".current-step").offsetHeight
  }px`;

  addDeleteListeners();

  window.Webflow && window.Webflow.require("ix2").init();
}

addFriendBtn.addEventListener("click", (e) => {
  if (!friendForm.checkValidity()) {
    friendForm.reportValidity();
    return;
  }

  const formData = new FormData(friendForm);
  formData.delete("cf-turnstile-response");
  const formEntries = Object.fromEntries(formData.entries());
  formEntries["userID"] = currUserID;

  fetch(API_LINK + `/user/addContacts`, {
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
      addFriendToList(formEntries);
      friendForm.reset();
    });
});

friendForm.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addFriendBtn.click();
  }
});

function addDeleteListeners() {
  const deleteBtns = document.querySelectorAll(".delete-btn");
  for (const btn of deleteBtns) {
    btn.addEventListener("click", (e) => deleteContact(btn), { once: true });
  }
}

function deleteContact(btn) {
  let prevToDelete;

  const type = btn.dataset.deleteType;

  if (type === "Partner" || type === "Friend") {
    prevToDelete = 4 * 2; // for the responsive info titles
  } else if (type === "Child") {
    prevToDelete = 6 * 2; // for the responsive info titles
  }

  fetch(
    API_LINK +
      `/user/delete${type}?userID=${currUserID}&${type.toLowerCase()}ID=${
        btn.dataset.idToDelete
      }`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < prevToDelete; i++) {
        let lastSibling = btn.previousSibling;
        if (lastSibling) {
          if (lastSibling.classList.contains("responsive-info-title")) {
            lastSibling = lastSibling.previousSibling;
          }
          lastSibling.remove();
        } else {
          break;
        }
      }

      if (btn.nextSibling) {
        btn.nextSibling.remove();
      }

      btn.remove();
    });

  stepContainer.style.height = `${
    document.querySelector(".current-step").offsetHeight
  }px`;
}
