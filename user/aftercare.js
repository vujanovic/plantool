const originalAftercareContactBox = document.querySelector(
  ".aftercare-contact-box"
);
const boxForCopy = originalAftercareContactBox.cloneNode(true);
originalAftercareContactBox.style.display = "none";

const aftercarePartnersContainer = document.querySelector(
  "#aftercarePartnersContainer"
);

const aftercareChildrenContainer = document.querySelector(
  "#aftercareChildrenContainer"
);

const aftercareFriendsContainer = document.querySelector(
  "#aftercareFriendsContainer"
);

function createAftercareContactBox(name, parenthesesText, type, id) {
  const newBox = boxForCopy.cloneNode(true);
  newBox.style.display = "flex";
  const contactName = newBox.querySelector(".contact-name-status");
  contactName.textContent = `${name} (${parenthesesText || ""})`;
  newBox.dataset.id = id || "";
  const wishFile = newBox.getElementById("wishFile");
  const wishInfo = newBox.getElementById("wishInfo");
  const wishName = newBox.getElementById("wishName");
  const removeWish = newBox.getElementById("removeWish");

  wishFile.addEventListener("change", () => {
    if (wishFile.files.length > 0) {
      wishName.textContent = wishFile.files[0].name;
      wishInfo.style.display = "block";
    }
  });

  removeWish.addEventListener("click", () => {
    wishFile.value = "";
    wishName.textContent = "";
    wishInfo.style.display = "none";
  });

  if (type === "Partner") {
    aftercarePartnersContainer.appendChild(newBox);
  } else if (type === "Child") {
    aftercareChildrenContainer.appendChild(newBox);
  } else if (type === "Friend") {
    aftercareFriendsContainer.appendChild(newBox);
  }
}
