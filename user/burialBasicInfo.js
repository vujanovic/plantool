const funeralType = burialCremationForm.querySelector("#type");
const ashDestination = burialCremationForm.querySelector("#ashDestination");
const cemetery = burialCremationForm.querySelector("#cemetery");
const interment = burialCremationForm.querySelector("#interment");
const permit = burialCremationForm.querySelector("#permit");
const permitBlock = burialCremationForm.querySelector("#permitBlock");

const wake = ceremonyPlanForm.querySelector("#wake");
const ceremonyHour = ceremonyPlanForm.querySelector("#ceremonyHour");
const enlargementPhoto = ceremonyPlanForm.querySelector("#enlargementPhoto");

const nextBtn = document.querySelector("#nextBtn");
const prevBtn = document.querySelector("#prevBtn");
prevBtn.style.display = "none";

const slider = document.querySelector(".w-slider");
const sliderAPI = Webflow.require("slider");
const sliderMask = document.querySelector(".w-slider-mask");

const doneSection = document.querySelector(".done-section");

let slides = {
  slide1: sliderMask.children[0],
  slide2: sliderMask.children[1],
  slide3: sliderMask.children[2],
  slide4: sliderMask.children[3],
  slide5: sliderMask.children[4],
  slide6: sliderMask.children[5],
};

let activeSlide = slides.slide1;
let activeSlideNumber = 1;

funeralType.addEventListener("change", (e) => {
  const type = funeralType.value;

  if (!type) return;

  const show = (el) => {
    if (el.previousElementSibling) {
      el.previousElementSibling.style.display = "block";
    }
    el.style.display = "block";
  };

  const hide = (el) => {
    if (el.previousElementSibling) {
      el.previousElementSibling.style.display = "none";
    }
    el.style.display = "none";
  };

  if (type === "burial") {
    show(cemetery);
    show(interment);
    hide(permitBlock);
    hide(ashDestination);
  } else {
    hide(cemetery);
    hide(interment);
    show(permitBlock);
    show(ashDestination);
  }
});

nextBtn.addEventListener("click", async (e) => {
  if (activeSlideNumber === 6) {
    activeSlideNumber = 1;
    goToStep(1);
    return;
  }
  if (activeSlideNumber === 1) {
    console.log("basic info");
    submitInfo.click();
  } else if (activeSlideNumber === 2) {
    console.log("burial cremation");
    const formData = new FormData(burialCremationForm);

    if (permitInput.files.length === 0) {
      const existingFileUrl = permitInput.dataset.existingFileUrl;
      const existingFileName = permitInput.dataset.existingFileName;
      // const file = await urlToFile(existingFileUrl, existingFileName)
      // formData.append("file", file)
    }

    fetch(API_LINK + `/ceremonial/setBurialCremation?userID=${currUserID}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  } else if (activeSlideNumber === 3) {
    console.log("ceremonial detials");
    const formData = new FormData(ceremonyPlanForm);
    const formEntries = Object.fromEntries(formData);
    const endpoints = [
      "setCeremonyPlace",
      "setCeremonyPrayer",
      "setCeremonyMoralCounselor",
      "setCeremonySpecific",
    ];

    const body = JSON.stringify(formEntries);

    // wake
    // ceremonyHour
    // enlargementPhoto

    fetch(API_LINK + `/ceremonial/addWake?userID=${currUserID}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: wake.value }),
    });

    fetch(API_LINK + `/ceremonial/setCeremonyHour?userID=${currUserID}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: ceremonyHour.value }),
    });

    // /uploadEnlargementPhoto

    const enlargementPhotoFormData = new FormData();
    enlargementPhotoFormData.append("images", enlargementPhoto.files[0]);

    fetch(
      API_LINK + `/ceremonial/uploadEnlargementPhoto?userID=${currUserID}`,
      {
        method: "POST",
        credentials: "include",
        body: enlargementPhotoFormData,
      }
    );

    endpoints.forEach((endpoint) => {
      fetch(`${API_LINK}/ceremonial/${endpoint}?userID=${currUserID}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(`[${endpoint}] Success:`, data);
        })
        .catch((err) => {
          console.error(`[${endpoint}] Error:`, err);
        });
    });
  } else if (activeSlideNumber === 4) {
    console.log("ceremonial detials");
    if (funeralHomeForm.checkValidity()) {
      const formData = new FormData(funeralHomeForm);
      const formEntries = Object.fromEntries(formData);
      fetch(API_LINK + `/ceremonial/addFuneralHome?userID=${currUserID}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formEntries),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        });
    } else {
      funeralHomeForm.reportValidity();
    }
  }

  activeSlideNumber++;
  activeSlide = slides[`slide${activeSlideNumber}`];

  if (activeSlide === slides.slide1) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "inline-block";
  }
});

prevBtn.addEventListener("click", (e) => {
  if (activeSlideNumber === 1) {
    console.log("radim api za 1");
  } else if (activeSlideNumber === 2) {
    console.log("radim api za 2");
  } else {
    console.log("radim api za 3");
  }

  activeSlideNumber = activeSlideNumber !== 1 ? activeSlideNumber - 1 : 1;
  activeSlide = slides[`slide${activeSlideNumber}`];

  if (activeSlide === slides.slide1) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "inline-block";
  }
});
