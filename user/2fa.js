const faSection = document.querySelector("#FASection");
const faSubmit = document.querySelector("#FASubmit");
const resendFA = document.querySelector("#resendFaCode");
const faMessage = document.querySelector("#faMessage");
const faInput = faSection.querySelector("input");

resendFA.addEventListener("click", (e) => {
  fetch(API_LINK + `/sendFACode`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: currUserID }),
  });
});

faSubmit.addEventListener("click", (e) => {
  e.preventDefault();

  fetch(API_LINK + `/2FACheck`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: currUserID, code: faInput.value }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status !== 200) {
        faMessage.textContent = "Code is incorrect.";
        faMessage.style.color = "red";
        faMessage.style.display = "block";
        return;
      }

      sessionStorage.setItem("confirmedFA", true);
      overlay.style.display = "none";
      faSection.style.display = "none";
    });
});
