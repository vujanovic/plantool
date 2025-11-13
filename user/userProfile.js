// The following block performs the same user/allData fetch and profile
// population as in user.js. Copied verbatim.
fetch(API_LINK + `/user/allData?id=${currUserID}`, {
  method: "GET",
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    const localNameHeading = document.querySelector("#nameHeading");
    if (localNameHeading) {
      localNameHeading.textContent = localNameHeading.textContent.replace(
        "$name",
        data["firstname"]
      );
    }

    sessionStorage.setItem("name", `${data.firstname} ${data.lastname}`);

    for (const key in data) {
      if (key === "address") {
        for (const detail in data[key]) {
          if (detail === "number") {
            const input = document.querySelector(`[name="streetNumber"]`);
            input.value = data[key][detail] || "";
            continue;
          }
          const input = document.querySelector(`[name="${detail}"]`);
          if (input) {
            input.value = data[key][detail] || "";
          }
        }
        continue;
      }
      const input = document.querySelector(`input[name="${key}"]`);
      if (input) {
        input.value = data[key] ? data[key] : "";
      }
    }

    if (data.ceremonial) {
      for (const service of data.ceremonial?.services) {
        ceremonialIDs[service.serviceID] = service["_id"];
      }

      // first ceremonial step

      if (data.ceremonial.typeBurial) {
        for (const key in data.ceremonial.typeBurial) {
          const element = burialCremationForm.querySelector(`#${key}`);
          if (element) {
            if (element.name === "file") {
              fetch(API_LINK + `/ceremonial/getPermit?userID=${currUserID}`, {
                method: "GET",
                credentials: "include",
              })
                .then((response) => response.json())
                .then((rawData) => {
                  permitData = rawData.data.permit;
                  permitName.textContent = permitData.fileName;
                  permitInfo.style.display = "block";
                  element.dataset.existingFileName = permitData.fileName;
                  element.dataset.existingFileUrl = permitData.fileURL;
                });

              continue;
            }
            element.value = data.ceremonial.typeBurial[key];
            if (key === "type") {
              element.value = data.ceremonial.typeBurial[key].toLowerCase();
            }
          }
        }
      }

      // second and third ceremonial step

      for (const key in data.ceremonial) {
        if (key === "services") {
          continue;
        }

        if (key === "ceremonyPlace") {
          for (const detailKey in data.ceremonial["ceremonyPlace"]) {
            const element = ceremonyPlanForm.querySelector(
              `[name=${detailKey}]`
            );
            if (!element) {
              continue;
            }
            element.value = data.ceremonial["ceremonyPlace"][detailKey];
          }

          for (const detailKey in data.ceremonial["ceremonyPlace"]["address"]) {
            const element = ceremonyPlanForm.querySelector(
              `[name=${detailKey}]`
            );
            if (!element) {
              continue;
            }
            element.value =
              data.ceremonial["ceremonyPlace"]["address"][detailKey];
          }

          continue;
        }

        if (key === "funeralHome") {
          const homeName = funeralHomeForm.querySelector("input[name=name]");
          homeName.value = data.ceremonial[key]["name"];
          for (const detailKey in data.ceremonial[key]["address"]) {
            const element = funeralHomeForm.querySelector(
              `[name=${detailKey}]`
            );
            if (!element) {
              continue;
            }
            element.value = data.ceremonial[key]["address"][detailKey];
          }
          continue;
        }

        const element = ceremonyPlanForm.querySelector(`#${key}`);

        if (!element) {
          continue;
        }

        if (element.name === "wake") {
          element.type = "date";
          element.value = data.ceremonial[key].split("T")[0];
        } else if (element.name === "ceremonyHour") {
          element.type = "datetime-local";
          element.value = data.ceremonial[key].slice(0, 16);
        } else {
          element.value = data.ceremonial[key];
        }
      }
    }

    const localCityField = document.querySelector("[name=placeOfBirthCity]");
    const localCountryField = document.querySelector(
      "[name=placeOfBirthCountry]"
    );
    const localDateField = document.querySelector("#dateField");
    if (localCityField) localCityField.value = data?.placeOfBirth?.city ?? "";
    if (localCountryField)
      localCountryField.value = data?.placeOfBirth?.country ?? "";
    if (localDateField)
      localDateField.value = data.dateOfBirth?.split("T")[0] ?? "";

    // The original user.js continues with partner/child/friend rendering and many
    // helper functions which are DOM heavy. To keep behavior identical we keep
    // those functions in user.js (unchanged) and only provide the user data
    // fetch here as a modular copy.

    stepContainer.style.height = `${
      document.querySelector(".current-step").offsetHeight
    }px`;

    if (data["verified"]) {
      verificationStatus.style.color = "green";
      verificationStatus.textContent = "VERIFIED";
      verificationSection.style.display = "none";
      overlay.style.display = "none";
    } else {
      verificationSection.style.display = "flex";
      overlay.style.display = "block";
    }

    if (
      data["enabledFA"] &&
      data["verified"] &&
      !sessionStorage.getItem("confirmedFA")
    ) {
      fetch(API_LINK + `/sendFACode`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: currUserID }),
      });
      faSection.style.display = "flex";
      overlay.style.display = "block";
    }

    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
