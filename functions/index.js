"use strict";

// Express
const express = require("express");
const cors = require("cors");

// Firebase
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const FieldValue = admin.firestore.FieldValue;

// Services
const capitalizeSentence = require("capitalize-sentence");
const Filter = require("bad-words");
const badWordsFilter = new Filter();
const sanitizeHtml = require("sanitize-html");

// Initialize Express
const app = express();
app.use(cors({ origin: true }));

// Initialize Firestore DB
admin.initializeApp();
const db = admin.firestore();

const config = {
  blockPeriodInMinutes: 10,
  entryLimitPeriodInMinutes: 60,
  entryLimit: 200
};

/*
 * Routes
 */

app.post("/api/create", async (req, res) => {
  let entry = req.body;

  if (!entry) {
    console.error("Bad request body.");
    return res.status(500).send({
      error: "Bad request body.",
    });
  }

  // const clientIP = getIPAddress(req);
  // checkIP(clientIP)
  //   .then(() => {
  //     checkEntryLimit();
  //     return;
  //   })
  checkEntryCount()
    .then(() => {
      addtoDB(entry);
      return;
    })
    .then(() => {
      return res.status(200).send({
        statusCode: 200,
        error: false,
      });
    })
    .catch((err) => {
      console.error(err);
      // #todo: respond with different status codes w depending on the error
      return res.status(429).json({
        statusCode: 429,
        error: err.toString(),
      });
    });

  return null;
});

exports.checkEntryBeforeSave = functions.firestore
  .document("entries/{entryId}")
  .onCreate((snapshot, context) => {
    // #todo maybe use snapshot.create time instaed of sending time from client
    const entry = snapshot.data();

    if (entry && isGoodEntry(entry)) {
      checkForSpam(entry);

      // Run moderation checks on on the entry and moderate if needed.
      const sanitizedText = sanitizeText(entry.text);
      const moderatedText = moderateText(sanitizedText);

      if (moderatedText.length < 4) {
        console.log("Entry too short, removing it.");
        return snapshot.ref.delete();
      } else {
        // Otherwise, save it.
        console.log("Entry has been validated. Saving to DB: ", moderatedText);
        // Update the Firebase DB with checked entry.
        return snapshot.ref.update({
          text: moderatedText,
          validated: true,
          moderated: entry.text !== moderatedText,
        });
      }
    } else {
      console.error(`Entry rejected.`);
      return snapshot.ref.delete();
    }
  });

exports.app = functions.https.onRequest(app);

/*
 * DB stuff
 */

 // Checks and sets IP blocks
function checkIP (ipAddress) {
  let ipRef = db.collection("ipBlocks").doc(ipAddress);
  
  return ipRef.get().then((doc) => {
    if (!doc.exists) {
      // If there are no matches, add this IP to the db
      console.log(`Created new IP block for ${ipAddress}`);
      ipRef.set({
        expires: minutesFromNow(config.blockPeriodInMinutes),
      });
    } else {
      // This is a familiar IP.
      // If block period is over, reset it. Otherwise, reject the entry.
      const expirationTime = doc.data().expires.toDate();
      const now = new Date();

      if (expirationTime < now) {
        console.log(`Reset block time for ${ipAddress}`);
        ipRef.set({
          expires: minutesFromNow(config.blockPeriodInMinutes),
        });
      } else {
        console.error(`${ipAddress} is blocked until ${expirationTime}.`);
        throw new Error(
          "Since this is but a humble art project, we can't handle too many submissions all at once. You'll have to wait about 10 minutes before submitting again."
        );
      }
    }
    return;
  });
}

// Checks and sets periodic entry limit
function checkEntryCount() {
  // #todo refactor: this is p similar to IP period blocks, yet another timed block
  // Also might want to only increase counter AFTER saving a doc, not before, triggered by save method
  let entryCountRef = db.collection('entryLimit').doc('entryCount');
  
  return entryCountRef.get().then((doc) => {
    if (!doc.exists) {
      console.log("No entry limit doc found. Creating one.");
      entryCountRef.set({
        count: 1,
        expires: minutesFromNow(config.entryLimitPeriodInMinutes),
      });
    } else {
      const expirationTime = doc.data().expires.toDate();
      const now = new Date();
      const currEntryCount = doc.data().count;

      if (expirationTime < now) {
        // If we've passed the entry limit expiration time, reset the counter and expiration
        console.log(`Resetting entry count and expiration time.`);
        entryCountRef.set({
          count: 1,
          expires: minutesFromNow(config.entryLimitPeriodInMinutes),
        });
      } else if (currEntryCount < config.entryLimit) {
        // If we're not past the expiration time and under the limit, increment the counter
        console.log(
          `Still accepting entries. ${currEntryCount} of ${config.entryLimit} entries used; limit expires at ${expirationTime}.`
        );
        entryCountRef.update({
          count: FieldValue.increment(1)
        });
      } else {
        // If we're past our limit, increase the count just to know how far over, but return false.
        entryCountRef.update({
          count: FieldValue.increment(1),
        });
        console.error(`Entry limit surpassed. ${currEntryCount}/${config.entryLimit} entries attempted. Allow entries again at ${expirationTime}.`)
        throw new Error(
          `Sorry, we're getting flooded with messages right now. Try again later.`
        );
      }
    }
    return true;
  });
}

const addtoDB = function addToDB(entry) {
  return db.collection("entries").add(entry);
};

function minutesFromNow(diff) {
  const now = new Date();
  return new Date(now.getTime() + diff * 60000);
}

/*
 * Helpers
 */

function getIPAddress(req) {
  return (
    req.headers["x-forwarded-for"] ||
    "No IP, probably because we are in development mode"
  );
}

function getUserAgent(req) {
  return req.headers["user-agent"];
}

// Checks that the entry fits a format that we like
function isGoodEntry(entry) {
  if (!entry.text) { throw new Error (`Entry is missing prop: text. ${entry}`); }
  else if (!entry.dateAdded) { throw new Error (`Entry is missing prop: dateAdded. ${entry}`) }
  else if (entry.length > 500) { throw new Error (`Entry is too long.. ${entry}`) }
  else if (entry.validated) { throw new Error (`Entry was submitted with as already validated, probably a malicious submission.. ${entry}`) }
  else {
    console.log(`This is a nice looking entry.`);
    return true;
  }
}

// Checks if entry is spammy using Akismet
async function checkForSpam(entry) {}

//  Some functions below are from https://github.com/firebase/functions-samples/tree/master/text-moderation.

// Moderates the given entry if appropriate.
function moderateText(text) {
  // Re-capitalize if the user is Shouting.
  if (isShouting(text)) {
    console.log("User is shouting. Fixing sentence case...");
    text = stopShouting(text);
  }

  // Moderate if the user uses SwearWords.
  if (containsSwearwords(text)) {
    console.log("User is swearing. moderating...");
    text = moderateSwearwords(text);
  }

  return text;
}

// Returns true if the string contains swearwords.
function containsSwearwords(text) {
  return text !== badWordsFilter.clean(text);
}

// Hide all swearwords. e.g: Crap => ****.
function moderateSwearwords(text) {
  return badWordsFilter.clean(text);
}

// Detect if the current text is shouting. i.e. there are too many Uppercase
// characters or exclamation points.
function isShouting(text) {
  return (
    text.replace(/[^A-Z]/g, "").length > text.length / 2 ||
    text.replace(/[^!]/g, "").length >= 3
  );
}

// Correctly capitalize the string as a sentence (e.g. uppercase after dots)
// and remove exclamation points.
function stopShouting(text) {
  return capitalizeSentence(text.toLowerCase()).replace(/!+/g, ".");
}

function sanitizeText(text) {
  const settings = {
    allowedTags: [],
    allowedAttributes: {},
  };

  // Sanitize and trim whitespace
  let clean = sanitizeHtml(text, settings).trim();
  return clean;
}
