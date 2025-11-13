// ========================
// DOM Elements (copied from user.js)
// ========================
const logoutBtn = document.querySelector("#logoutBtn");
const servicesGrid = document.querySelector(".services-grid");
const ogServiceCard = document.querySelector("#ogThisCard");
const arrowScroll = document.querySelector(".arrow-scroll");

const providersSection = document.querySelector(".all-providers");
const originalCard = document.querySelector(".provider-card");
const firstHeading = providersSection.querySelector(".secondary-heading");
const cardsGrid = document.querySelector(".all-providers-grid");

const bestMatchHeading = document.querySelector(".best-match-section h2");
const nearSectionHeading = document.querySelector(".near-section h2");
const ctaLink = document.querySelector(".cta-link");

const steps = document.querySelectorAll(".step");
const stepContainer = document.querySelector(".steps");
const step2 = document.querySelector("#step2");
let selectBtns = step2 ? step2.querySelectorAll(".card-btn") : [];

const productSection = document.querySelector(".pick-product-section");
const productMask = document.querySelector(".pick-product-mask");
const placeholderProductSlide = document.querySelector(".pick-product-slide");
const originalProductSlide = placeholderProductSlide
  ? placeholderProductSlide.cloneNode(true)
  : null;
if (originalProductSlide) {
  originalProductSlide.style.display = "none";
  placeholderProductSlide.remove();
}

const originalProductImage = document.querySelector(
  ".variant-link-image-wrapper"
);

const serviceDescription = productSection
  ? productSection.querySelector("#serviceDescription")
  : null;
const serviceAddress = productSection
  ? productSection.querySelector("#serviceAddress")
  : null;
const serviceMail = productSection
  ? productSection.querySelector("#serviceMail")
  : null;
const servicePhone = productSection
  ? productSection.querySelector("#servicePhone")
  : null;
const serviceWebsite = productSection
  ? productSection.querySelector("#serviceWebsite")
  : null;

const productSelection = productSection
  ? productSection.querySelector(".product-selection")
  : null;
const productCombo = productSection
  ? productSection.querySelector("#productCombo")
  : null;
const productDescription = productSection
  ? productSection.querySelector("#productDescription")
  : null;
const productPrice = productSection
  ? productSection.querySelector("#productPrice")
  : null;
const reviewsContainer = document.querySelector(".service-reviews");
const reviewDiv = reviewsContainer
  ? reviewsContainer.querySelector(".review")
  : null;
const closeBtn = productSection
  ? productSection.querySelector("#closeBtn")
  : null;
const addToPlanBtn = productSection
  ? productSection.querySelector("#addToPlanBtn")
  : null;

const productImageGrid = productSection
  ? productSection.querySelector(".variant-images-grid")
  : null;
const variantImageWrapper = productSection
  ? productSection.querySelector(".variant-link-image-wrapper")
  : null;

const burialCremationForm = document.querySelector("#burialCremationForm");
const ceremonyPlanForm = document.querySelector("#ceremonyPlanForm");
const funeralHomeForm = document.querySelector("#funeralHomeForm");

// Featured / Near selectors
const featuredGrid = document.querySelector(".featured-grid");
const ogFeatureCard = document.querySelector(".featured-card");
const nearGrid = document.querySelector("#nearGrid");
const nearCard = document.querySelector(".near-me-card");

// Profile related selectors (some may be null on pages without profile)
const submitInfo = document.querySelector("#updateBasicInfoBtn");
const nameField = document.querySelector("#nameField");
const lastnameField = document.querySelector("#lastnameField");
const dateField = document.querySelector("#dateField");
const cityField = document.querySelector("#cityField");
const emailField = document.querySelector("#emailField");
const phoneField = document.querySelector("#phoneField");
const updateInfoForm = document.querySelector("#updateInfoForm");
const nameHeading = document.querySelector("#nameHeading");

const verificationSection = document.querySelector(".verification-section");
const verificationStatus = document.querySelector(".verification-status");
const overlay = document.querySelector(".black-overlay");

const faSection = document.querySelector("#FASection");
const faSubmit = document.querySelector("#FASubmit");
const resendFA = document.querySelector("#resendFaCode");
const faMessage = document.querySelector("#faMessage");
const faInput = faSection ? faSection.querySelector("input") : null;
