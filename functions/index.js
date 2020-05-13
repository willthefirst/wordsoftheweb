//  This file is uses code from https://github.com/firebase/functions-samples/tree/master/text-moderation.

"use strict";

const functions = require("firebase-functions");
const capitalizeSentence = require("capitalize-sentence");
const Filter = require("bad-words");
const badWordsFilter = new Filter();
const sanitizeHtml = require("sanitize-html");

// Moderates entrys by lowering all uppercase entrys and removing swearwords.
exports.checkBeforeSave = functions.firestore
  .document("entries/{entryId}")
  .onWrite((change, context) => {
    const entry = change.after.data();
    if (entry && !entry.sanitized) {
      // Run moderation checks on on the entry and moderate if needed.
      const sanitizedTest = sanitizeEntry(entry.text);
      const moderatedText = moderateText(sanitizedTest);

      if (moderatedText.length < 4) {
        console.log("Entry too short, removing it.");
        // If the entry is too short now, just delete it.
        return change.after.ref.delete();
      } else {
        // Otherwise, save it.
        console.log("Entry has been moderated. Saving to DB: ", moderatedText);
        // Update the Firebase DB with checked entry.
        return change.after.ref.update({
          text: moderatedText,
          sanitized: true,
          moderated: entry.text !== moderatedText,
        });
      }
    }
    return null;
  });

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

function sanitizeEntry(text) {
  const settings = {
    allowedTags: [],
    allowedAttributes: {},
  };

  // Sanitize and trim whitespace
  let clean = sanitizeHtml(text, settings).trim();
  return clean;
}
