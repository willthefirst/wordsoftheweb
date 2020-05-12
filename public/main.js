// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADcwKzmElrr-XQAzyfHl8PukYRMaWfCcE",
  authDomain: "walloftext-78632.firebaseapp.com",
  databaseURL: "https://walloftext-78632.firebaseio.com",
  projectId: "walloftext-78632",
  storageBucket: "walloftext-78632.appspot.com",
  messagingSenderId: "609649100590",
  appId: "1:609649100590:web:1db85680c7ff14cc241cbf",
  measurementId: "G-7KYF8P2111",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const db = firebase.firestore();

$(document).ready(function () {
  initializeWall();
});

// Livestreams all entries in Firebase
function initializeWall() {
  let loading = true;
  const $dbEntries = $("#dbEntries");

  db.collection("entries")
    .orderBy("dateAdded")
    .onSnapshot(function (snapshot) {
      // Initial load: load saved data and initialize new entry form
      if (loading) {
        $dbEntries.html("");
        loading = false;
        snapshot.docs.forEach(function (doc) {
          const entryId = doc.id;
          const entryData = doc.data();
          $dbEntries.append(entryTemplate(entryData.text, entryId));
        });
        bindNewEntryHandlers();
      }

      //  After initial load: Listen for live updates
      snapshot.docChanges().forEach(function (change) {
        const entryId = change.doc.id;
        const entryData = change.doc.data();
        const $entryToUpdate = $(`#fbId_${entryId}`);

        if ($entryToUpdate.length) {
          // If entry exists in DOM, update it
          $entryToUpdate.html(entryData.text);
        } else {
          // It it doesn't yet exist, create it
          $dbEntries.append(entryTemplate(entryData.text, entryId));
        }
      });
    });
}

function bindNewEntryHandlers() {
  const $newEntryForm = $(".newEntryForm");
  const $newEntryField = $(".newEntryField");

  // Create a new document with in db.
  const newEntryRef = createNewEntryRef();

  // Update db when form value changes
  $newEntryField.on("keyup", function (event) {
    event.preventDefault();
    updateNewEntry(newEntryRef, $(this).val());
  });

  // Prevent pasting into input
  $newEntryForm.on("paste", function (event) {
    event.preventDefault();
  });

  $newEntryForm.on("submit", function (event) {
    event.preventDefault();

    // Unbind all handlers
    $newEntryForm.off();
    $newEntryField.off();

    // Clear the input
    $newEntryField.val("").focus();

    // Reinitialize
    bindNewEntryHandlers();
  });
}

//
// Firebase methods
//

// Creates a new entry in db.
function createNewEntryRef() {
  let initialValue = {
    text: "",
    dateAdded: new Date(),
  };
  const newEntryRef = db.collection("entries").doc();
  newEntryRef.set(initialValue);
  return newEntryRef;
}

// Updates entries in db.
function updateNewEntry(ref, value) {
  ref
    .update({
      text: value,
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });
}

//
// Helpers
//

function entryTemplate(text, id) {
  const entryId = `fbId_${id}`;

  return `<span id=${entryId}>${text}</span>
          <span class="separator"> * </span>`;
}
