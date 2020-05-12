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

var db = firebase.firestore();

$(document).ready(function () {
  initialize();
});

// Livestreams all entries in Firebase
function initialize() {
  let loading = true;
  const $dbEntries = $("#dbEntries");
  
  db.collection("entries")
    .orderBy("dateAdded")
    .onSnapshot(function (snapshot) {

      // Initial load: load saved data and initialize new entry form
      if (loading) {
        $dbEntries.html("");
        loading = false;
        snapshot.docs.forEach(function(doc) {
          const entryId = doc.id;
          const entryData = doc.data();
          $dbEntries.append(entryTemplate(entryData.text, entryId));
        })
        bindSubmitEntry();
      }

      // Listen for live updates after initial load
      snapshot.docChanges().forEach(function(change) {
        const entryId = change.doc.id;
        const entryData = change.doc.data();
        const $entryToUpdate = $(`#fbId_${entryId}`);
        
        // If entry exists in DOM, update it
        if ($entryToUpdate.length) {
          $entryToUpdate.html(entryData.text);
        } else {
          $dbEntries.append(entryTemplate(entryData.text, entryId));
        }
      });
    });
}

function bindSubmitEntry() {
  const $newEntryForm = $(".newEntryForm");
  const $newEntryField = $(".newEntryField");
  let entryText = "";
  let initialValue = {
    text: entryText,
    dateAdded: new Date(),
  };

  // Create a new document with a generated id in db.
  const newEntryRef = db.collection("entries").doc();
  newEntryRef.set(initialValue);
  console.log(newEntryRef.id);

  // Updates entry
  $newEntryField.on("keyup", function (event) {
    event.preventDefault();
    entryText = $(this).val();
    updateNewEntry(newEntryRef, entryText);
  });

  $newEntryForm.on("submit", function (event) {
    event.preventDefault();

    // Clear the input
    $newEntryField.val("").focus();
  });

  // Prevent pasting into input
  $newEntryForm.on("paste", function (event) {
    event.preventDefault();
  });
}

function updateNewEntry(ref, value) {
  ref
    .update({
      text: value,
    })
    .then(function () {
      console.log("Document successfully updated!");
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });
}

// Saves a new entry to Firebase
function saveNewEntry(entry) {
  return;
  db.collection("entries")
    .add({
      text: entry,
      dateAdded: new Date(),
    })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
}


function entryTemplate(text, id) {
  const entryId = `fbId_${id}`;

  return `<span id=${entryId}>${text}</span>
          <span class="separator"> * </span>`;
}
