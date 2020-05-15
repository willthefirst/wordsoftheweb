"use strict";

// Express
const express = require("express");
const cors = require("cors");

// Firebase
const admin = require("firebase-admin");
const functions = require("firebase-functions");

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
};

/*
 * Routes
 */

app.post("/api/create", async (req, res) => {
  let entry = req.body;

  if (!entry) {
    console.error('Bad request body.')
    return res.status(500).send({
      error: 'Bad request body.',
    });
  }

  const clientIP = getIPAddress(req);
  let ipRef = db.collection("ipBlocks").doc(clientIP);

  const checkIP = function() {
    return ipRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          // If there are no matches, add this IP to the db
          console.log(`Created new IP block for ${clientIP}`);
          ipRef.set({
            expires: minutesFromNow(config.blockPeriodInMinutes),
          });
        } else {
          // This is a familiar IP.
          // If block period is over, reset it. Otherwise, reject the entry.
          const expirationTime = doc.data().expires.toDate();
          const now = new Date();

          if (expirationTime < now) {
            console.log(`Reset block time for ${clientIP}`);
            ipRef.set({
              expires: minutesFromNow(config.blockPeriodInMinutes),
            });
          } else {
            console.error(`${clientIP} is blocked until ${expirationTime}.`);
            throw new Error("Since this is but a humble art project, we can't handle too many submissions all at once. You'll have to wait about 10 minutes before submitting again.");
          }
        }
        return;
      })
  }

  const addtoDB = function () {
    return db
      .collection("entries")
      .add(entry)
  };

  checkIP()
    .then(() => {
      addtoDB();
      return;
    })
    .then(() => {
      return res.status(200).send({
        statusCode: 200,
        error: false
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(429).json({
        statusCode: 429,
        error: err.toString()
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
 * Models
 */

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
  if (!entry.text) {
    console.error("Entry is missing prop: text");
    return false;
  } else if (!entry.dateAdded) {
    console.error("Entry is missing prop: dateAdded");
    return false;
  } else if (entry.length > 500) {
    console.error("Entry is too long.");
    return false;
  } else if (entry.validated) {
    console.error(
      "Entry was submitted with as already validated, probably a malicious submission."
    );
    return false;
  } else {
    console.log("This is a nice looking entry.");
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
