const codeInput = document.querySelector("#codeField");
const verificationForm = document.querySelector(".verification-form");
const verificationSubmit = document.querySelector("#verificationSubmit");
const verificationErrMsg = document.querySelector("#verificationErrMsg");
const resendCode = document.querySelector("#resendCode");

resendCode.addEventListener("click", (e) => {
  e.preventDefault();
  fetch(API_LINK + "/generateNewVerificationCode", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: currUserID,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      verificationErrMsg.style.display = "block";

      if (data.status !== 200) {
        verificationErrMsg.textContent = "Something went wrong.";
        return;
      }

      verificationErrMsg.textContent = "Code sent.";
      verificationErrMsg.style.color = "green";
    });
});

verificationSubmit.addEventListener("click", (e) => {
  e.preventDefault();

  if (verificationForm.checkValidity()) {
    fetch(API_LINK + "/verifyAccount", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currUserID,
        code: codeInput.value,
      }),
    })
      .then((res) => {
        console.log(res.status);
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.status != 200) {
          verificationErrMsg.style.display = "block";
          return;
        }
        verificationStatus.textContent = "VERIFIED";
        verificationStatus.style.color = "green";
        verificationSection.style.display = "none";
        overlay.style.display = "none";
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        verificationErrMsg.style.display = "block";
      });
  }
});
