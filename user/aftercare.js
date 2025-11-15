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
  newBox.style.display = "block";
  const contactName = newBox.querySelector(".contact-name-status");
  contactName.textContent = `${name} (${parenthesesText || ""})`;
  newBox.dataset.id = id || "";
  if (type === "Partner") {
    aftercarePartnersContainer.appendChild(newBox);
  } else if (type === "Child") {
    aftercareChildrenContainer.appendChild(newBox);
  } else if (type === "Friend") {
    aftercareFriendsContainer.appendChild(newBox);
  }
}
