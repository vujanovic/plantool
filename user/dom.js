const logoutBtn = document.querySelector("#logoutBtn");
const servicesGrid = document.querySelector(".services-grid");
const ogServiceCard = document.querySelector("#ogThisCard");
const arrowScroll = document.querySelector(".arrow-scroll");

const overlay = document.querySelector(".black-overlay");

const providersSection = document.querySelector(".all-providers");
const featuredProvidersSection = document.querySelector(
  ".featured-providers-section"
);
const nearProvidersSection = document.querySelector(".near-section");
const originalCard = document.querySelector(".provider-card");
const firstHeading = providersSection.querySelector(".secondary-heading");
const cardsGrid = document.querySelector(".all-providers-grid");

const bestMatchHeading = document.querySelector(".best-match-section h2");
const nearSectionHeading = document.querySelector(".near-section h2");
const ctaLink = document.querySelector(".cta-link");

const steps = document.querySelectorAll(".step");
const stepContainer = document.querySelector(".steps");
const step2 = document.querySelector("#step2");
let selectBtns = step2.querySelectorAll(".card-btn");

const verificationSection = document.querySelector(".verification-section");
const verificationStatus = document.querySelector(".verification-status");

// ========================
// STEP 1
// ========================
const submitInfo = document.querySelector("#updateBasicInfoBtn");
const nameField = document.querySelector("#nameField");
const lastnameField = document.querySelector("#lastnameField");
const dateField = document.querySelector("#dateField");
const cityField = document.querySelector("#cityField");
const emailField = document.querySelector("#emailField");
const phoneField = document.querySelector("#phoneField");

const updateInfoForm = document.querySelector("#updateInfoForm");

const nameHeading = document.querySelector("#nameHeading");

// ========================
// STEP 2
// ========================
const productSection = document.querySelector(".pick-product-section");
const productMask = document.querySelector(".pick-product-mask");
const placeholderProductSlide = document.querySelector(".pick-product-slide");
const originalProductSlide = placeholderProductSlide.cloneNode(true);
originalProductSlide.style.display = "none";
placeholderProductSlide.remove();

const originalProductImage = document.querySelector(
  ".variant-link-image-wrapper"
);

const serviceDescription = productSection.querySelector("#serviceDescription");
const serviceAddress = productSection.querySelector("#serviceAddress");
const serviceMail = productSection.querySelector("#serviceMail");
const servicePhone = productSection.querySelector("#servicePhone");
const serviceWebsite = productSection.querySelector("#serviceWebsite");

const productSelection = productSection.querySelector(".product-selection");
const productCombo = productSection.querySelector("#productCombo");
const productDescription = productSection.querySelector("#productDescription");
const productPrice = productSection.querySelector("#productPrice");
const reviewsContainer = document.querySelector(".service-reviews");
const reviewDiv = reviewsContainer.querySelector(".review");
const closeBtn = productSection.querySelector("#closeBtn");
const addToPlanBtn = productSection.querySelector("#addToPlanBtn");

const productImageGrid = productSection.querySelector(".variant-images-grid");
const variantImageWrapper = productSection.querySelector(
  ".variant-link-image-wrapper"
);

// ========================
// STEP 3
// ========================
const responsiveInfoTitle = document.querySelector(".responsive-info-title");

const partnersGrid = document.querySelector("#partnersList");
const addPartnerBtn = document.querySelector("#addPartnerBtn");
const partnerForm = document.querySelector("#addPartnerForm");
const deleteBtn = document.querySelector(".delete-btn");
const line = document.querySelector(".grid-line");

const childPartnerCombo = document.querySelector("#childPartnerCombo");

const burialCremationForm = document.querySelector("#burialCremationForm");
const ceremonyPlanForm = document.querySelector("#ceremonyPlanForm");
const funeralHomeForm = document.querySelector("#funeralHomeForm");
