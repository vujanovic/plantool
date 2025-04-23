// ========================
// Constants and Globals
// ========================
const API_LINK = "https://planning-tool-e0efc2czdkbeeug7.westeurope-01.azurewebsites.net";
const currUserID = JSON.parse(sessionStorage.getItem("userID"));
const types = {};
let currStep = 0;
let servicePickedBtn = null;
let providerID = null;
let serviceID = null;
let productID = null;

// u ceremonialIDs kao kljuc ide _id
//  od adrese servisa a u vrednost id servisa za brisanje
const ceremonialIDs = {}

console.log("UCITANNA SKRIPTA")

// ========================
// DOM Elements
// ========================
const logoutBtn = document.querySelector("#logoutBtn");
const servicesGrid = document.querySelector(".services-grid");
const serviceBtns = servicesGrid.querySelectorAll(".service-card");

const providersSection = document.querySelector(".all-providers");
const originalCard = document.querySelector(".provider-card");
const firstHeading = providersSection.querySelector(".secondary-heading");
const cardsGrid = document.querySelector(".all-providers-grid");

const bestMatchHeading = document.querySelector(".best-match-section h2");
const nearSectionHeading = document.querySelector(".near-section h2");
const ctaLink = document.querySelector(".cta-link");

const steps = document.querySelectorAll('.step');
const stepContainer = document.querySelector('.steps');
const step2 = document.querySelector("#step2")
let selectBtns = step2.querySelectorAll(".card-btn")

const productSection = document.querySelector(".pick-product-section")
const productMask = document.querySelector(".pick-product-mask")
const placeholderProductSlide = document.querySelector(".pick-product-slide")
const originalProductSlide = placeholderProductSlide.cloneNode(true)
originalProductSlide.style.display = "none"
placeholderProductSlide.remove()

const originalProductImage = document.querySelector(".variant-link-image-wrapper")

const serviceDescription = productSection.querySelector('#serviceDescription');
const serviceAddress = productSection.querySelector('#serviceAddress');
const serviceMail = productSection.querySelector('#serviceMail');
const servicePhone = productSection.querySelector('#servicePhone');
const serviceWebsite = productSection.querySelector('#serviceWebsite');

const productSelection = productSection.querySelector(".product-selection")
const productCombo = productSection.querySelector('#productCombo');
const productDescription = productSection.querySelector('#productDescription');
const productPrice = productSection.querySelector('#productPrice');
const reviewsContainer = document.querySelector(".service-reviews")
const reviewDiv = reviewsContainer.querySelector(".review")
const closeBtn = productSection.querySelector('#closeBtn');
const addToPlanBtn = productSection.querySelector('#addToPlanBtn');

const productImageGrid = productSection.querySelector(".variant-images-grid")
const variantImageWrapper = productSection.querySelector('.variant-link-image-wrapper');


const burialCremationForm = document.querySelector("#burialCremationForm")
const ceremonyPlanForm = document.querySelector("#ceremonyPlanForm")
const funeralHomeForm = document.querySelector("#funeralHomeForm")

// ========================
// Event Listeners
// ========================
logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    sessionStorage.removeItem("userID");
    window.location.href = "/";
});

// More event listeners and utility functions continue below...
// (Note: Due to response limits, the full refactor will be saved to a file instead.)

// ========================
// Product Modal Logic
// ========================
closeBtn.addEventListener("click", e => {
    e.preventDefault()
    productSelection.style.display = "none"
    Array.from(productCombo.options).forEach(option => {
        if (option.value !== '') {
            productCombo.removeChild(option);
        }
    });
    productCombo.value = ""
    productSection.style.display = "none"
    productImageGrid.innerHTML = ""
    productMask.innerHTML = ""
    Webflow.require('ix2').init();
});

productCombo.addEventListener("change", e => {
    const selectedOption = productCombo.options[productCombo.selectedIndex];
    if (selectedOption.value === "") {
        document.querySelectorAll(".variant-link-image-wrapper").forEach(btn => {
            btn.classList.remove("selected-product-image")
        });
        return;
    }
    const productInfo = {
        price: selectedOption.dataset.price,
        description: selectedOption.dataset.description
    };
    document.querySelectorAll(".variant-link-image-wrapper").forEach(btn => {
        btn.classList.toggle("selected-product-image", btn.dataset.productID === selectedOption.value);
    });
    setProductInfo(productInfo);
});

function setProductInfo(product) {
    productDescription.textContent = product.description;
    productPrice.textContent = "$" + product.price;
}

// ========================
// Provider Rendering
// ========================
function renderAllProviders(data) {
    cardsGrid.innerHTML = "";
    data.services.forEach(item => {
        const card = originalCard.cloneNode(true);
        const nameHeading = card.querySelector('.fourth-heading');
        const addressParagraph = card.querySelector("#address");
        const phoneParagraph = card.querySelector("#phone");
        const websiteParagraph = card.querySelector("#website");
        const cardBtn = card.querySelector(".card-btn");

        if (ceremonialIDs[item.address["_id"]]) {

            cardBtn.textContent = "Remove from Plan";
            cardBtn.style.backgroundColor = "red";
            cardBtn.dataset.serviceIdToDelete = ceremonialIDs[item.address["_id"]]
            cardBtn.addEventListener("click", removeFromPlaybookWithProduct);

        }

        else {
            cardBtn.addEventListener("click", handleSelect);
        }

        cardBtn.dataset.serviceID = item["_id"];
        cardBtn.dataset.providerID = item["providerID"];
        cardBtn.dataset.name = item["name"];
        cardBtn.dataset.serviceImages = item["images"];
        cardBtn.dataset.serviceDescription = item["description"] || "-";
        cardBtn.dataset.address = JSON.stringify(item["address"]);
        cardBtn.dataset.addressID = item.address["_id"]
        cardBtn.dataset.contactInfo = JSON.stringify(item["contactInfo"] || { email: "-", phoneNumber: "-" });
        cardBtn.dataset.website = item["website"] || "-";
        cardBtn.dataset.reviews = JSON.stringify(item.reviews)

        nameHeading.textContent = item.name;
        addressParagraph.textContent = `${item.address.street}, ${item.address.zip} ${item.address.city}, ${item.address.country}`;
        phoneParagraph.textContent = item.contactInfo?.phoneNumber || "Not provided";
        websiteParagraph.textContent = item.contactInfo?.email || "Not provided";

        card.style.display = "flex";
        cardsGrid.appendChild(card);
    });
}

// Continue refactoring in same style...


// ========================
// Selection Logic
// ========================
const handleSelect = (ev) => {
    const btn = ev.target;
    servicePickedBtn = btn;
    productSection.style.display = "flex";
    productSection.querySelector("h3").textContent = btn.dataset.name;

    providerID = btn.dataset.providerID;
    serviceID = btn.dataset.serviceID;
    const description = btn.dataset.serviceDescription;
    const address = JSON.parse(btn.dataset.address);
    const contactInfo = JSON.parse(btn.dataset.contactInfo);
    const website = btn.dataset.website;

    // handling reviews
    const reviews = JSON.parse(btn.dataset.reviews)
    reviewsContainer.innerHTML = ""

    for (const review of reviews) {
        const newReviewCard = reviewDiv.cloneNode(true)
        const name = newReviewCard.querySelector("#name")
        const comment = newReviewCard.querySelector("#comment")

        name.textContent = review.name
        comment.textContent = review.comment || "-"

        const stars = newReviewCard.querySelector("#ratingStars");

        for (let i = 0; i < review.grade; i++) {
            stars.children[i].querySelector("div").style.width = "30px";
        }

        newReviewCard.style.display = "flex"

        reviewsContainer.appendChild(newReviewCard)
    }

    

    serviceDescription.textContent = description || "-";
    serviceAddress.textContent = `${address.street}, ${address.zip} ${address.city}, ${address.country}`;
    serviceMail.textContent = contactInfo.email || "-";
    servicePhone.textContent = contactInfo.phoneNumber || "-";
    serviceWebsite.textContent = website || "-";

    fetch(API_LINK + `/service/getImages?providerID=${providerID}&serviceID=${serviceID}`)
        .then(res => res.json())
        .then(data => {
            for (const img of data.images) {
                const slide = originalProductSlide.cloneNode(true);
                const image = slide.querySelector("img");
                image.src = img.fileURL;
                slide.style.display = "inline-block";
                productMask.appendChild(slide);
            }
            Webflow.destroy();
            Webflow.ready();
            Webflow.require('slider').redraw();
        });

    fetch(API_LINK + `/commerce/getProducts?providerID=${providerID}&serviceID=${serviceID}`)
        .then(res => res.json())
        .then(data => {
            if (!data.products?.length) return;

            productSelection.style.display = "flex";
            for (const product of data.products) {
                const option = document.createElement("option");
                option.value = product["_id"];
                option.dataset.price = product.price;
                option.dataset.description = product.description;
                option.textContent = product.name;
                productCombo.appendChild(option);

                const productImageContainer = variantImageWrapper.cloneNode(true);
                const productImg = productImageContainer.querySelector("img");
                productImageContainer.dataset.productID = product["_id"];

                if (product.images.length > 0) {
                    fetch(API_LINK + `/commerce/getImages?providerID=${providerID}&productID=${product["_id"]}`)
                        .then(res => res.json())
                        .then(data => {
                            productImg.src = data.images[0].fileURL;
                            productImageContainer.style.display = "block";

                            productImageContainer.addEventListener("click", () => {
                                document.querySelectorAll(".variant-link-image-wrapper").forEach(btn => {
                                    btn.classList.remove("selected-product-image");
                                });
                                productImageContainer.classList.add("selected-product-image");
                                productCombo.value = productImageContainer.dataset.productID;
                                productCombo.dispatchEvent(new Event('change', { bubbles: true }));
                            });

                            productImageGrid.appendChild(productImageContainer);
                        });
                }
            }
            productCombo.value = data.products[0]["_id"];
            setProductInfo(data.products[0]);
        });

    Webflow.require('ix2').init();
};

// ========================
// Playbook Add/Remove
// ========================
function addToPlaybookWithProduct() {
    fetch(API_LINK + "/user/addToPlaybook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: currUserID, providerID, serviceID })
    })
        .then(res => res.json())
        .then(data => {
            alert("dodat u plejbuk");
            servicePickedBtn.textContent = "Remove from Plan";
            servicePickedBtn.style.backgroundColor = "red";
            servicePickedBtn.dataset.productID = productCombo.value;

            servicePickedBtn.removeEventListener("click", handleSelect);
            servicePickedBtn.addEventListener("click", removeFromPlaybookWithProduct);

        });

    Webflow.require('slider').redraw();

    const bodyData = {
        name: "",
        type: "",
        phoneNumber: "",
        email: "",
        country: "",
        city: "",
        street: "",
        number: "",
        zip: "",
        specific: ""
    };

    if (productCombo.value !== "") {
        bodyData.productID = productCombo.value
    }

    console.log(bodyData)


    fetch(API_LINK + `/ceremonial/setNewService?userID=${currUserID}&providerID=${providerID}&serviceID=${serviceID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
    })
        .then(res => res.json())
        .then(data => {
            alert("dodat u proizvode");
            console.log(bodyData)
            closeBtn.click();
            console.log(data);
            return fetch(API_LINK + `/ceremonial/getServices?userID=${currUserID}`)
        })
        .then(res => res.json())
        .then(services => {
            for (const service of services.data) {
                if (service.address["_id"] === servicePickedBtn.dataset.addressID) {
                    ceremonialIDs[service.address["_id"]] = service["_id"]
                    servicePickedBtn.dataset.serviceIdToDelete = service["_id"]
                    return
                }
            }
        })
}

const removeFromPlaybookWithProduct = (e) => {
    const btn = e.target;

    console.log("clicked")

    fetch(`${API_LINK}/ceremonial/removeService?userID=${currUserID}&serviceID=${btn.dataset.serviceIdToDelete}`, {
        method: "DELETE"
    })
        .then(res => {
            // if there's no content, avoid calling .json()
            return res.status === 204 ? {} : res.json();
        })
        .then(ceremonialResponse => {
            console.log("Ceremonial:", ceremonialResponse);

            return fetch(`${API_LINK}/user/removeFromPlaybook`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userID: currUserID,
                    providerID: btn.dataset.providerID,
                    serviceID: btn.dataset.serviceID
                })
            });
        })
        .then(res => res.json())
        .then(playbookResponse => {
            console.log("Playbook:", playbookResponse);

            btn.textContent = "Select Service";
            btn.style.backgroundColor = "#15a60b";
            btn.addEventListener("click", handleSelect);
            btn.removeEventListener("click", removeFromPlaybookWithProduct);
        })
        .catch(err => {
            console.error("One of the DELETEs failed:", err);
        });


};

addToPlanBtn.addEventListener("click", addToPlaybookWithProduct);

// ========================
// Render Featured Services
// ========================
const featuredGrid = document.querySelector(".featured-grid");
const ogFeatureCard = document.querySelector(".featured-card");

function renderFeatured(data) {
    const services = data.services;
    featuredGrid.innerHTML = "";

    for (const service of services) {
        const currCard = ogFeatureCard.cloneNode(true);
        const nameHeading = currCard.querySelector("h4");
        const image = currCard.querySelector("img");
        const description = currCard.querySelector("#featuredDescription");
        const addressInfo = currCard.querySelector("#featuredAddress");
        const email = currCard.querySelector("#featuredEmail");
        const phone = currCard.querySelector("#featuredPhone");
        const website = currCard.querySelector("#featuredWebsite");
        const stars = currCard.querySelector("#featuredStars");
        const cardBtn = currCard.querySelector(".card-btn");

        nameHeading.textContent = service.name;
        image.src = "https://placehold.co/700x300?text=No\nImage";

        if (service.images.length > 0) {
            fetch(API_LINK + `/service/getImages?providerID=${service["providerID"]}&serviceID=${service["_id"]}`)
                .then(res => res.json())
                .then(data => { image.src = data.images[0].fileURL });
        }

        description.textContent = service.description?.slice(0, 200) || "-";

        if (description.textContent.length === 200) {
            const text = description.textContent;
            const lastSplitIndex = Math.max(text.lastIndexOf(" "), text.lastIndexOf("."));

            if (lastSplitIndex !== -1) {
                description.textContent = text.slice(0, lastSplitIndex) + "...";
            }
        }


        addressInfo.textContent = `${service.address.street}, ${service.address.zip} ${service.address.city}, ${service.address.country}`;
        email.textContent = service.contactInfo?.email || "-";
        phone.textContent = service.contactInfo?.phoneNumber || "-";
        website.textContent = service.website || "-";

        const whole = Math.floor(service.rating);
        const decimal = service.rating - whole;
        for (let i = 0; i < whole; i++) {
            stars.children[i].querySelector("div").style.width = "30px";
        }
        if (whole < 5) {
            stars.children[whole].querySelector("div").style.width = `${decimal * 30}px`;
        }

        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        
        if (ceremonialIDs[service.address["_id"]]) {

            cardBtn.textContent = "Remove from Plan";
            cardBtn.style.backgroundColor = "red";
            cardBtn.dataset.serviceIdToDelete = ceremonialIDs[service.address["_id"]]
            cardBtn.addEventListener("click", removeFromPlaybookWithProduct);

        }

        else {
            cardBtn.addEventListener("click", handleSelect);
        }

        cardBtn.dataset.serviceID = service["_id"];
        cardBtn.dataset.providerID = service["providerID"];
        cardBtn.dataset.serviceImages = service["images"];
        cardBtn.dataset.serviceDescription = service["description"] || "-";
        cardBtn.dataset.address = JSON.stringify(service["address"]);
        cardBtn.dataset.contactInfo = JSON.stringify(service["contactInfo"] || { email: "-", phoneNumber: "-" });
        cardBtn.dataset.website = service["website"] || "-";
        cardBtn.dataset.name = service["name"];
        cardBtn.dataset.addressID = service.address["_id"]
        cardBtn.dataset.reviews = JSON.stringify(service.reviews)


        featuredGrid.appendChild(currCard);
    }
}

// ========================
// Render Nearby Services
// ========================
const nearGrid = document.querySelector("#nearGrid");
const nearCard = document.querySelector(".near-me-card");

function renderNear(data) {
    const services = data;
    nearGrid.innerHTML = "";

    for (const service of services) {
        const currCard = nearCard.cloneNode(true);
        const nameHeading = currCard.querySelector("h4");
        const image = currCard.querySelector("img");
        const description = currCard.querySelector("#featuredDescription");
        const addressInfo = currCard.querySelector("#featuredAddress");
        const stars = currCard.querySelector("#featuredStars");
        const cardBtn = currCard.querySelector(".card-btn");

        nameHeading.textContent = service.name;
        image.src = "https://placehold.co/400x200?text=No\nImage";

        if (service.images.length > 0) {
            fetch(API_LINK + `/service/getImages?providerID=${service["providerID"]}&serviceID=${service["_id"]}`)
                .then(res => res.json())
                .then(data => { image.src = data.images[0].fileURL });
        }

        description.textContent = service.description?.slice(0, 20) || "-";
        if (description.textContent.length > 1) description.textContent += "...";

        addressInfo.textContent = `${service.address.street}, ${service.address.zip} ${service.address.city}, ${service.address.country}`;

        const whole = Math.floor(service.rating);
        const decimal = service.rating - whole;
        for (let i = 0; i < whole; i++) {
            stars.children[i].querySelector("div").style.width = "30px";
        }
        if (whole < 5) {
            stars.children[whole].querySelector("div").style.width = `${decimal * 30}px`;
        }

        if (ceremonialIDs[service.address["_id"]]) {

            cardBtn.textContent = "Remove from Plan";
            cardBtn.style.backgroundColor = "red";
            cardBtn.dataset.serviceIdToDelete = ceremonialIDs[service.address["_id"]]
            cardBtn.addEventListener("click", removeFromPlaybookWithProduct);

        }

        else {
            cardBtn.addEventListener("click", handleSelect);
        }

        cardBtn.dataset.serviceID = service["_id"];
        cardBtn.dataset.providerID = service["providerID"];
        cardBtn.dataset.serviceImages = service["images"];
        cardBtn.dataset.serviceDescription = service["description"] || "-";
        cardBtn.dataset.address = JSON.stringify(service["address"]);
        cardBtn.dataset.contactInfo = JSON.stringify(service["contactInfo"] || { email: "-", phoneNumber: "-" });
        cardBtn.dataset.website = service["website"] || "-";
        cardBtn.dataset.name = service["name"];
        cardBtn.dataset.addressID = service.address["_id"]
        cardBtn.dataset.reviews = JSON.stringify(service.reviews)

        nearGrid.appendChild(currCard);
    }
}

// ========================
// Main Interaction Logic
// ========================
serviceBtns.forEach(button => {
    button.addEventListener("click", () => {
        const selectedType = button.querySelector(".service-grid-heading").textContent;
        providersSection.style.display = "none";
        firstHeading.textContent = `ALL ${selectedType.toUpperCase()} PROVIDERS`;
        bestMatchHeading.textContent = `FEATURED ${selectedType.toUpperCase()} PROVIDERS`;
        nearSectionHeading.textContent = `${selectedType.toUpperCase()} PROVIDERS NEAR YOU`;
        ctaLink.textContent = `See all the ${selectedType.toUpperCase()} providers`;

        if (types[selectedType]) {
            const nearest = getNearestServices(userLat, userLng, types[selectedType].services);
            renderFeatured(types[selectedType]);
            renderNear(nearest);
            renderAllProviders(types[selectedType]);
            stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;
            return;
        }

        fetch(API_LINK + `/searchServiceType?type=${selectedType}`)
            .then(response => response.json())
            .then(data => {
                const nearest = getNearestServices(userLat, userLng, data.services);
                renderFeatured(data);
                renderNear(nearest);
                renderAllProviders(data);
                types[selectedType] = data;
                stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;
            });
    });
});

ctaLink.addEventListener("click", e => {
    e.preventDefault();
    providersSection.style.display = "block";
    stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;
});




const COUNTRIES_STRING = `Afghanistan
Albania
Algeria
Andorra
Angola
Antigua & Deps
Argentina
Armenia
Australia
Austria
Azerbaijan
Bahamas
Bahrain
Bangladesh
Barbados
Belarus
Belgium
Belize
Benin
Bhutan
Bolivia
Bosnia Herzegovina
Botswana
Brazil
Brunei
Bulgaria
Burkina
Burundi
Cambodia
Cameroon
Canada
Cape Verde
Central African Rep
Chad
Chile
China
Colombia
Comoros
Congo
Congo {Democratic Rep}
Costa Rica
Croatia
Cuba
Cyprus
Czech Republic
Denmark
Djibouti
Dominica
Dominican Republic
East Timor
Ecuador
Egypt
El Salvador
Equatorial Guinea
Eritrea
Estonia
Ethiopia
Fiji
Finland
France
Gabon
Gambia
Georgia
Germany
Ghana
Greece
Grenada
Guatemala
Guinea
Guinea-Bissau
Guyana
Haiti
Honduras
Hungary
Iceland
India
Indonesia
Iran
Iraq
Ireland {Republic}
Israel
Italy
Ivory Coast
Jamaica
Japan
Jordan
Kazakhstan
Kenya
Kiribati
Korea North
Korea South
Kuwait
Kyrgyzstan
Laos
Latvia
Lebanon
Lesotho
Liberia
Libya
Liechtenstein
Lithuania
Luxembourg
Macedonia
Madagascar
Malawi
Malaysia
Maldives
Mali
Malta
Marshall Islands
Mauritania
Mauritius
Mexico
Micronesia
Moldova
Monaco
Mongolia
Montenegro
Morocco
Mozambique
Myanmar, {Burma}
Namibia
Nauru
Nepal
Netherlands
New Zealand
Nicaragua
Niger
Nigeria
Norway
Oman
Pakistan
Palau
Panama
Papua New Guinea
Paraguay
Peru
Philippines
Poland
Portugal
Qatar
Romania
Russian Federation
Rwanda
St Kitts & Nevis
St Lucia
Saint Vincent & the Grenadines
Samoa
San Marino
Sao Tome & Principe
Saudi Arabia
Senegal
Serbia
Seychelles
Sierra Leone
Singapore
Slovakia
Slovenia
Solomon Islands
Somalia
South Africa
South Sudan
Spain
Sri Lanka
Sudan
Suriname
Swaziland
Sweden
Switzerland
Syria
Taiwan
Tajikistan
Tanzania
Thailand
Togo
Tonga
Trinidad & Tobago
Tunisia
Turkey
Turkmenistan
Tuvalu
Uganda
Ukraine
United Arab Emirates
United Kingdom
United States
Uruguay
Uzbekistan
Vanuatu
Vatican City
Venezuela
Vietnam
Yemen
Zambia
Zimbabwe`

const countryField = document.querySelector("#countryField")
const anotherCountryField = document.querySelector("#currentCountry")

COUNTRIES_STRING.split("\n").forEach(country => {

    country = country.trim();
    if (!country) {
        return;
    }
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countryField.appendChild(option);
    anotherCountryField.appendChild(option.cloneNode(true))
})



let allUserData = null;

const submitInfo = document.querySelector("#updateBasicInfoBtn")
const nameField = document.querySelector("#nameField")
const lastnameField = document.querySelector("#lastnameField")
const dateField = document.querySelector("#dateField")
// countryField is selected already in prev script
const cityField = document.querySelector("#cityField")
const emailField = document.querySelector("#emailField")
const phoneField = document.querySelector("#phoneField")

const updateInfoForm = document.querySelector("#updateInfoForm")

const nameHeading = document.querySelector("#nameHeading");

const verificationSection = document.querySelector(".verification-section")
const verificationStatus = document.querySelector(".verification-status")
const overlay = document.querySelector(".black-overlay")

const faSection = document.querySelector("#FASection")
const faSubmit = document.querySelector("#FASubmit")
const resendFA = document.querySelector("#resendFaCode")
const faMessage = document.querySelector("#faMessage")
const faInput = faSection.querySelector("input")

resendFA.addEventListener("click", e => {
    fetch(API_LINK + `/sendFACode`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: currUserID })
    })
})

faSubmit.addEventListener("click", e => {

    e.preventDefault()

    fetch(API_LINK + `/2FACheck`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: currUserID, code: faInput.value })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status !== 200) {
                faMessage.textContent = "Code is incorrect."
                faMessage.style.color = "red"
                faMessage.style.display = "block"
                return
            }

            overlay.style.display = "none"
            faSection.style.display = "none"

        })
})

function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    // Remove the current step class from all steps
    steps.forEach((step, index) => {
        step.classList.remove('current-step');
        step.style.transform = index < stepIndex ? 'translateX(-100%)' : 'translateX(100%)';
        step.style.opacity = '0';
    });

    // Add class to the new step
    steps[stepIndex].classList.add('current-step');
    steps[stepIndex].style.transform = 'translateX(0)';
    steps[stepIndex].style.opacity = '1';

    // Adjust the container height smoothly
    stepContainer.style.height = `${steps[stepIndex].offsetHeight}px`;
}


async function urlToFile(url, filename) {
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const res = await fetch(corsProxy + url);
    const blob = await res.blob();
    const contentType = res.headers.get("content-type") || blob.type || "application/octet-stream";
    return new File([blob], filename, { type: contentType });
  }
  

fetch(API_LINK + `/user/allData?id=${currUserID}`)
    .then(response => response.json())
    .then(data => {

        nameHeading.textContent = nameHeading.textContent.replace("$name", data["firstname"]);

        sessionStorage.setItem("name", `${data.firstname} ${data.lastname}`)

        for (const key in data) {
            if (key === "address") {
                for (const detail in data[key]) {
                    const input = document.querySelector(`[name="${detail}"]`)
                    if (input) {
                        input.value = data[key][detail] || ""
                    }
                }
                continue
            }
            const input = document.querySelector(`input[name="${key}"]`)
            if (input) {
                input.value = data[key] ? data[key] : ""
            }
        }


        if (data.ceremonial) {

            for (const service of data.ceremonial?.services) {
                ceremonialIDs[service.address["_id"]] = service["_id"]
            }

            // first ceremonial step

            if (data.ceremonial.typeBurial) {
                for (const key in data.ceremonial.typeBurial) {
                    const element = burialCremationForm.querySelector(`#${key}`)
                    if (element) {
                        if (element.name === "file") {
                            fetch(API_LINK + `/ceremonial/getPermit?userID=${currUserID}`)
                            .then(response => response.json())
                            .then(rawData => {
                                permitData = rawData.data.permit
                                permitName.textContent = permitData.fileName
                                permitInfo.style.display = 'block'
                                element.dataset.existingFileName = permitData.fileName
                                element.dataset.existingFileUrl = permitData.fileURL
                            })
                            
                            continue
                        }
                        element.value = data.ceremonial.typeBurial[key]
                        if (key === "type") {
                            element.value = data.ceremonial.typeBurial[key].toLowerCase()
                        }
                    }
                }
            }

            // second and third ceremonial step

            for (const key in data.ceremonial) {

                if (key === "services") {
                    continue
                }

                if (key === "ceremonyPlace") {

                    for (const detailKey in data.ceremonial["ceremonyPlace"]) {
                        const element = ceremonyPlanForm.querySelector(`input[name=${detailKey}]`)
                        if (!element) {
                            continue
                        }
                        element.value = data.ceremonial["ceremonyPlace"][detailKey]
                    }

                    for (const detailKey in data.ceremonial["ceremonyPlace"]["address"]) {
                        const element = ceremonyPlanForm.querySelector(`input[name=${detailKey}]`)
                        if (!element) {
                            continue
                        }
                        element.value = data.ceremonial["ceremonyPlace"]["address"][detailKey]
                    }


                    continue
                }

                if (key === "funeralHome") {
                    const homeName = funeralHomeForm.querySelector("input[name=name]")
                    homeName.value = data.ceremonial[key]["name"]
                    for (const detailKey in data.ceremonial[key]["address"]) {
                        const element = funeralHomeForm.querySelector(`input[name=${detailKey}]`)
                        if (!element) {
                            continue
                        }
                        element.value = data.ceremonial[key]["address"][detailKey]
                    }
                    continue
                }

                const element = ceremonyPlanForm.querySelector(`#${key}`)

                if (!element) {
                    continue
                }

                if (element.name === "wake") {
                    element.type = "date";
                    element.value = data.ceremonial[key].split("T")[0];
                }
                else if (element.name === "ceremonyHour") {
                    element.type = "datetime-local";
                    element.value = data.ceremonial[key].slice(0, 16);
                }
                else {
                    element.value = data.ceremonial[key]
                }

            }



        }


        cityField.value = data?.placeOfBirth?.city ?? ""
        countryField.value = data?.placeOfBirth?.country ?? ""
        dateField.value = data.dateOfBirth?.split("T")[0] ?? ""

        for (const partner of data["marriages"]) {
            addPartnerToList(partner)
        }

        for (const child of data["children"]) {
            addChildToList(child)
        }

        for (const friend of data["contacts"]) {
            addFriendToList(friend)
        }

        addDeleteListeners()
        stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;

        if (data["verified"]) {
            verificationStatus.style.color = "green"
            verificationStatus.textContent = "VERIFIED"
            verificationSection.style.display = "none"
            overlay.style.display = "none"
        }

        if (data["enabledFA"] && data["verified"]) {
            fetch(API_LINK + `/sendFACode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: currUserID })
            })
            faSection.style.display = "flex"
            overlay.style.display = "block"
        }

        console.log(data)

    })
    .catch(err => {
        console.log(err);
    })

submitInfo.addEventListener("click", function (e) {
    if (!updateInfoForm.checkValidity()) {
        updateInfoForm.reportValidity()
        return
    }
    updateInfoForm.submit()
});

updateInfoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (updateInfoForm.checkValidity()) {

        const formData = new FormData(updateInfoForm)
        const dataObject = Object.fromEntries(formData.entries())
        delete dataObject["cf-turnstile-response"]

        fetch(API_LINK + `/user/updateBasicData?userID=${currUserID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataObject)
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)

            })
            .catch(err => alert("greska"))

        fetch(`${API_LINK}/user/changeAddress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataObject)
        }).then(res => res.json())
            .then(data => console.log(data))

    }


});

const stepBtns = document.querySelectorAll(".step-btn")

stepBtns.forEach(btn => {

    btn.addEventListener("click", e => {
        for (const button of stepBtns) {
            button.classList.remove("active-step-btn")
        }
        btn.classList.add("active-step-btn")
        goToStep(btn.textContent - 1)
    })

})




const codeInput = document.querySelector("#codeField")
const verificationForm = document.querySelector(".verification-form")
const verificationSubmit = document.querySelector("#verificationSubmit")
const verificationErrMsg = document.querySelector("#verificationErrMsg")
const resendCode = document.querySelector("#resendCode")

resendCode.addEventListener("click", e => {

    e.preventDefault()
    fetch(API_LINK + "/generateNewVerificationCode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: currUserID
        })
    })
        .then(res => res.json())
        .then(data => {

            verificationErrMsg.style.display = "block"

            if (data.status !== 200) {
                verificationErrMsg.textContent = "Something went wrong."
                return
            }

            verificationErrMsg.textContent = "Code sent."
            verificationErrMsg.style.color = "green"

        })

})

verificationSubmit.addEventListener("click", e => {

    e.preventDefault()

    if (verificationForm.checkValidity()) {
        fetch(API_LINK + "/verifyAccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: currUserID,
                code: codeInput.value
            })
        })
            .then(res => {
                console.log(res.status)
                return res.json()
            })
            .then(data => {
                console.log(data)
                if (data.status != 200) {
                    verificationErrMsg.style.display = "block"
                    return;
                }
                verificationStatus.textContent = "VERIFIED"
                verificationStatus.style.color = "green"
                verificationSection.style.display = "none"
                overlay.style.display = "none"
            })
            .catch(err => {
                console.error("Fetch error:", err)
                verificationErrMsg.style.display = "block"
            });


    }

})




const dateInputs = document.querySelectorAll('input[data-placeholder]');

dateInputs.forEach(input => {
    if (!input.value) {
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", input.getAttribute("data-placeholder"));
    }

    input.addEventListener("focus", function () {
        this.type = this.getAttribute("name") !== "ceremonyHour" ? "date" : "datetime-local";
    });

    input.addEventListener("blur", function () {
        if (!this.value) {
            this.type = "text";
            this.setAttribute("placeholder", this.getAttribute("data-placeholder"));
        }
    });
});




const responsiveInfoTitle = document.querySelector(".responsive-info-title")

const partnersGrid = document.querySelector("#partnersList")
const addPartnerBtn = document.querySelector("#addPartnerBtn")
const partnerForm = document.querySelector("#addPartnerForm")
const deleteBtn = document.querySelector(".delete-btn")
const line = document.querySelector(".grid-line")

const childPartnerCombo = document.querySelector("#childPartnerCombo")

function addPartnerToList(data) {
    // const formData = new FormData(partnerForm);
    // formData.delete("cf-turnstile-response")
    // const formEntries = Object.fromEntries(formData.entries())
    const formEntries = data

    const option = document.createElement("option")
    option.textContent = `${formEntries["firstname"]} ${formEntries["lastname"]}`
    option.value = formEntries["_id"]

    childPartnerCombo.appendChild(option)

    for (const key in formEntries) {

        const infoTitle = responsiveInfoTitle.cloneNode(true)
        let titleText = ""

        if (key === "_id") {
            continue
        }

        switch (key) {
            case "statusSince":
                formEntries[key] = formEntries[key].split("T")[0]
                titleText = "Since"
                break
            case "firstname":
                titleText = "First Name"
                break
            case "lastname":
                titleText = "Last Name"
                break
            case "status":
                titleText = "Status"
                break
        }

        infoTitle.textContent = titleText

        const info = document.createElement("p")
        info.textContent = formEntries[key]
        info.classList.add("contact-table-info")

        partnersGrid.appendChild(infoTitle)
        partnersGrid.appendChild(info)
    }

    const newDelete = deleteBtn.cloneNode(true)
    newDelete.style.display = "block"
    newDelete.dataset.deleteType = "Partner"
    newDelete.dataset.idToDelete = formEntries["_id"]

    const newLine = line.cloneNode(true)

    partnersGrid.appendChild(newDelete)
    partnersGrid.appendChild(newLine)

    addDeleteListeners()

    stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;


    window.Webflow && window.Webflow.require('ix2').init();

}
addPartnerBtn.addEventListener("click", e => {

    if (!partnerForm.checkValidity()) {
        partnerForm.reportValidity();
        return;
    }

    const formData = new FormData(partnerForm);
    formData.delete("cf-turnstile-response")
    const formEntries = Object.fromEntries(formData.entries())

    fetch(API_LINK + `/user/addPartner?userID=${currUserID}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formEntries)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            formEntries["_id"] = data["_id"]
            addPartnerToList(formEntries);
            partnerForm.reset();

        })


})

partnerForm.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        addPartnerBtn.click();
    }

})



const childGrid = document.querySelector("#childList")
const addChildBtn = document.querySelector("#addChildBtn")
const childForm = document.querySelector("#addChildForm")

const deceasedCheckbox = childForm.querySelector("#deceasedCheckbox")
const dateOfDeath = childForm.querySelector("#dateOfDeath")

deceasedCheckbox.addEventListener("change", e => {

    if (deceasedCheckbox.checked) {
        dateOfDeath.setAttribute("required", "")
    }
    else {
        dateOfDeath.removeAttribute("required")
    }

})

function addChildToList(data) {

    const formEntries = data
    const keys = ["firstname", "lastname", "dateOfBirth", "partnerID", "deceased", "dateOfDeath"]

    for (const key of keys) {

        const infoTitle = responsiveInfoTitle.cloneNode(true)
        let titleText = ""

        const info = document.createElement("p")
        info.textContent = formEntries[key]
        info.classList.add("contact-table-info")

        if (key === "partnerID") {
            titleText = "Partner"
            for (const option of childPartnerCombo.options) {
                if (option.value === formEntries[key]) {
                    info.textContent = option.text
                }
            }
        }



        if (key === "deceased") {
            titleText = "Deceased"
            info.textContent = `${formEntries[key]}` === "true" ? "✓" : "-"
        }

        if (key === "dateOfBirth") {
            titleText = "Birth Date"
            info.textContent = formEntries[key].split("T")[0]
        }

        if (key === "dateOfDeath") {
            titleText = "Death Date"
            if (!formEntries[key]) {
                info.textContent = "-"
            }
            else {
                info.textContent = formEntries[key].split("T")[0]
            }
        }

        if (key === "firstname") {
            titleText = "Name"
        }

        if (key === "lastname") {
            titleText = "Lastname"
        }

        infoTitle.textContent = titleText

        childGrid.appendChild(infoTitle)
        childGrid.appendChild(info)
    }


    const newDelete = deleteBtn.cloneNode(true)
    newDelete.style.display = "block"
    newDelete.dataset.deleteType = "Child"
    newDelete.dataset.idToDelete = formEntries["_id"]

    const newLine = document.querySelector(".span-7").cloneNode(true)

    childGrid.appendChild(newDelete)
    childGrid.appendChild(newLine)

    stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;

    addDeleteListeners()

    window.Webflow && window.Webflow.require('ix2').init();

}

addChildBtn.addEventListener("click", e => {

    if (!childForm.checkValidity()) {
        childForm.reportValidity();
        return;
    }

    const formData = new FormData(childForm);
    formData.delete("cf-turnstile-response")
    const formEntries = Object.fromEntries(formData.entries())
    formEntries["deceased"] = `${deceasedCheckbox.checked}`
    console.log(formEntries["deceased"])
    console.log(formEntries)

    fetch(API_LINK + `/user/addPartnerChildren?userID=${currUserID}&partnerID=${childPartnerCombo.value}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formEntries)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            formEntries["_id"] = data["_id"]
            addChildToList(formEntries);
            childForm.reset();

        })


})


childForm.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        addChildBtn.click();
    }

})



const friendsGrid = document.querySelector("#friendList")
const addFriendBtn = document.querySelector("#addFriendBtn")
const friendForm = document.querySelector("#addFriendForm")

const friendsListInput = document.getElementById('friendsListInput');
const friendsListInfo = document.getElementById('friendsListInfo');
const friendsListName = document.getElementById('friendsListName');
const removeBtn = document.getElementById('removeFriendsListBtn');
const confirmFriendsBtn = document.querySelector("#confirmFriendsBtn")

friendsListInput.addEventListener('change', () => {
    if (friendsListInput.files.length > 0) {
        friendsListName.textContent = friendsListInput.files[0].name;
        friendsListInfo.style.display = 'block';
        confirmFriendsBtn.style.display = "block"
    }
});

removeBtn.addEventListener('click', () => {
    friendsListInput.value = '';
    friendsListName.textContent = '';
    friendsListInfo.style.display = 'none';
    confirmFriendsBtn.style.display = "none"
});

confirmFriendsBtn.addEventListener("click", async () => {
    const file = friendsListInput.files[0];
    if (!file) return;

    const data = await file.arrayBuffer(); // Read file contents
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }); // default value = empty string


    const requiredColumns = ['Name', 'Country', 'City', "Street", "Zip", "Email", "Phone Number"]; // all lowercase

    const missingRows = [];

    const normalizedData = json.map(row => {
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
            if (!requiredColumns.includes(key)) {
                return;
            }
            normalizedRow[key] = row[key];
        });
        return normalizedRow;
    });


    normalizedData.forEach((row, index) => {
        requiredColumns.forEach(col => {
            if (!row[col] || String(row[col]).trim() === '') {
                missingRows.push({ row: index + 2, column: col });
            }
        });
    });

    if (missingRows.length > 0) {
        let message = "Missing values detected:\n";
        missingRows.forEach(entry => {
            message += `- Row ${entry.row}: Missing "${entry.column}"\n`;
        });
        alert(message);
        return;
    }

    console.log(normalizedData)

    const formData = new FormData();
    formData.append('data', file)

    fetch(API_LINK + `/user/addContactsTableImport?userID=${currUserID}`, {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {

            console.log(data)

        })

    const renderingRows = ["name", "country", "city", "street", "zip", "email", "phone Number"]

    for (const contact of normalizedData) {
        const orderedContact = {};

        renderingRows.forEach(key => {
            orderedContact[key] = contact[key.charAt(0).toUpperCase() + key.slice(1)];
        });

        console.log(orderedContact)
        addFriendToList(orderedContact)
    }




});

function addFriendToList(data) {
    // const formData = new FormData(partnerForm);
    // formData.delete("cf-turnstile-response")
    // const formEntries = Object.fromEntries(formData.entries())
    const formEntries = data



    for (const key in formEntries) {
        if (key === "userID") {
            continue
        }

        if (key === "_id") {
            continue
        }

        const infoTitle = responsiveInfoTitle.cloneNode(true)
        let titleText = key.charAt(0).toUpperCase() + key.slice(1)

        const info = document.createElement("p")
        info.textContent = formEntries[key]
        info.classList.add("contact-table-info")

        if (key === "address") {
            titleText = "Address"
            let address = formEntries[key]
            info.textContent = `${address["street"]}, ${address["zip"] || ""} ${address["city"]}, ${address["country"]}`
        }

        if (key === "country") {
            titleText = "Address"
            info.textContent = `${formEntries["street"]}, ${formEntries["zip"] || ""} ${formEntries["city"]}, ${formEntries["country"]}`
        }

        if (key === "city" || key === "street" || key === "zip") {
            continue
        }

        if (key === "phoneNumber") {
            titleText = "Phone"
        }

        infoTitle.textContent = titleText

        friendsGrid.appendChild(infoTitle)
        friendsGrid.appendChild(info)
    }

    const newDelete = deleteBtn.cloneNode(true)
    newDelete.style.display = "block"
    newDelete.dataset.deleteType = "Friend"
    newDelete.dataset.idToDelete = formEntries["_id"]

    const newLine = line.cloneNode(true)

    friendsGrid.appendChild(newDelete)
    friendsGrid.appendChild(newLine)

    stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;


    addDeleteListeners()

    window.Webflow && window.Webflow.require('ix2').init();

}

addFriendBtn.addEventListener("click", e => {

    if (!friendForm.checkValidity()) {
        friendForm.reportValidity();
        return;
    }

    const formData = new FormData(friendForm);
    formData.delete("cf-turnstile-response")
    const formEntries = Object.fromEntries(formData.entries())
    formEntries["userID"] = currUserID

    fetch(API_LINK + `/user/addContacts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formEntries)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            formEntries["_id"] = data["_id"]
            addFriendToList(formEntries);
            friendForm.reset();

        })


})

friendForm.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        addFriendBtn.click();
    }

})



function addDeleteListeners() {
    const deleteBtns = document.querySelectorAll(".delete-btn")
    for (const btn of deleteBtns) {
        btn.addEventListener("click", e => deleteContact(btn), { once: true })
    }
}


function deleteContact(btn) {

    let prevToDelete;

    const type = btn.dataset.deleteType

    if (type === "Partner" || type === "Friend") {
        prevToDelete = 4 * 2 // for the responsive info titles
    }

    else if (type === "Child") {
        prevToDelete = 6 * 2 // for the responsive info titles
    }

    fetch(API_LINK + `/user/delete${type}?userID=${currUserID}&${type.toLowerCase()}ID=${btn.dataset.idToDelete}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < prevToDelete; i++) {
                let lastSibling = btn.previousSibling
                if (lastSibling) {
                    if (lastSibling.classList.contains("responsive-info-title")) {
                        lastSibling = lastSibling.previousSibling
                    }
                    lastSibling.remove()
                }
                else {
                    break
                }
            }

            if (btn.nextSibling) {
                btn.nextSibling.remove();
            }

            btn.remove()
        })

    stepContainer.style.height = `${document.querySelector(".current-step").offsetHeight}px`;


}


////////////////////////////////////
// =================================
// STEP 4 FUNCTIONALITY
// =================================
////////////////////////////////////


/////////////////////////////
// BURIAL/CREMATION (SLIDE 1)
/////////////////////////////


// forms defined in the beginning of the script
const funeralType = burialCremationForm.querySelector("#type")
const ashDestination = burialCremationForm.querySelector("#ashDestination")
const cemetery = burialCremationForm.querySelector("#cemetery")
const interment = burialCremationForm.querySelector("#interment")
const permit = burialCremationForm.querySelector("#permit")
const permitBlock = burialCremationForm.querySelector("#permitBlock")

const wake = ceremonyPlanForm.querySelector("#wake")
const ceremonyHour = ceremonyPlanForm.querySelector("#ceremonyHour")
const enlargementPhoto = ceremonyPlanForm.querySelector("#enlargementPhoto")

const nextBtn = document.querySelector("#nextBtn")
const prevBtn = document.querySelector("#prevBtn")
prevBtn.style.display = "none"

const slider = document.querySelector(".w-slider");
const sliderAPI = Webflow.require("slider");
const sliderMask = document.querySelector(".w-slider-mask");

const doneSection = document.querySelector(".done-section")

let slides = {
    slide1: sliderMask.children[0],
    slide2: sliderMask.children[1],
    slide3: sliderMask.children[2]
}


let activeSlide = slides.slide1
let activeSlideNumber = 1

funeralType.addEventListener("change", e => {

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
        hide(ashDestination)
    }
    else {
        hide(cemetery);
        hide(interment);
        show(permitBlock);
        show(ashDestination)
    }

})

nextBtn.addEventListener("click", async e => {

    if (activeSlideNumber === 1) {
        console.log("radim api za 1")
        const formData = new FormData(burialCremationForm)
        
        if (permitInput.files.length === 0) {
            const existingFileUrl = permitInput.dataset.existingFileUrl
            const existingFileName = permitInput.dataset.existingFileName
            const file = await urlToFile(existingFileUrl, existingFileName)
            formData.append("file", file)
        }

        fetch(API_LINK + `/ceremonial/setBurialCremation?userID=${currUserID}`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => console.log(data))
    }
    else if (activeSlideNumber === 2) {

        console.log("radim api za 2")

        const formData = new FormData(ceremonyPlanForm)
        const formEntries = Object.fromEntries(formData)
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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ date: wake.value })
        })

        fetch(API_LINK + `/ceremonial/setCeremonyHour?userID=${currUserID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ date: ceremonyHour.value })
        })

        // /uploadEnlargementPhoto

        const enlargementPhotoFormData = new FormData()
        enlargementPhotoFormData.append("images", enlargementPhoto.files[0])

        fetch(API_LINK + `/ceremonial/uploadEnlargementPhoto?userID=${currUserID}`, {
            method: "POST",
            body: enlargementPhotoFormData
        })

        endpoints.forEach(endpoint => {
            fetch(`${API_LINK}/ceremonial/${endpoint}?userID=${currUserID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body
            })
                .then(res => res.json())
                .then(data => {
                    console.log(`[${endpoint}] Success:`, data);
                })
                .catch(err => {
                    console.error(`[${endpoint}] Error:`, err);
                });
        });

    }
    else {
        console.log("radim api za 3")

        if (funeralHomeForm.checkValidity()) {
            const formData = new FormData(funeralHomeForm)
            const formEntries = Object.fromEntries(formData)
            fetch(API_LINK + `/ceremonial/addFuneralHome?userID=${currUserID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formEntries)
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    alert("GOTOVO CEKAJ SAD")
                    slider.style.display = "none"
                    doneSection.style.display = "flex"
                })
        }

        else {
            funeralHomeForm.reportValidity()
        }


    }

    activeSlideNumber = activeSlideNumber !== 3 ? activeSlideNumber + 1 : 1
    activeSlide = slides[`slide${activeSlideNumber}`]

    if (activeSlide === slides.slide1) {
        prevBtn.style.display = "none"
    }
    else {
        prevBtn.style.display = "inline-block"
    }

});

prevBtn.addEventListener("click", e => {

    if (activeSlideNumber === 1) {
        console.log("radim api za 1")
    }
    else if (activeSlideNumber === 2) {
        console.log("radim api za 2")
    }
    else {
        console.log("radim api za 3")
    }

    activeSlideNumber = activeSlideNumber !== 1 ? activeSlideNumber - 1 : 1
    activeSlide = slides[`slide${activeSlideNumber}`]

    if (activeSlide === slides.slide1) {
        prevBtn.style.display = "none"
    }
    else {
        prevBtn.style.display = "inline-block"
    }

});
