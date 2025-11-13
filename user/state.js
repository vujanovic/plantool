// ========================
// Constants and Globals
// ========================
const API_LINK =
  "https://planning-tool-e0efc2czdkbeeug7.westeurope-01.azurewebsites.net";
const currUserID = JSON.parse(sessionStorage.getItem("userID"));
const types = {};
let currStep = 0;
let servicePickedBtn = null;
let providerID = null;
let serviceID = null;
let productID = null;

// u ceremonialIDs kao kljuc ide _id
//  od adrese servisa a u vrednost id servisa za brisanje
const ceremonialIDs = {};
console.log("state.js");

let allUserData = null;
