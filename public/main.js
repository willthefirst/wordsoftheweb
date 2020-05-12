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
  listenToDB();
  bindNewEntryHandlers();
});

// Livestreams all entries in Firebase
function listenToDB() {
  let loading = true;
  const $dbEntries = $("#dbEntries");

  db.collection("entries")
    .orderBy("dateAdded")
    .onSnapshot(function (snapshot) {
      if (loading) {
        $dbEntries.html("");
        loading = false;
      }

      snapshot.docChanges().forEach(function (change) {
        const entryId = change.doc.id;
        const entryData = change.doc.data();
        $dbEntries.append(entryTemplate(entryData.text, entryId));
      });
    });
}

function bindNewEntryHandlers() {
  const $newEntryForm = $(".newEntryForm");
  const $newEntryField = $(".newEntryField");

  // Prevent pasting into input
  $newEntryForm.on("paste", function (event) {
    event.preventDefault();
  });

  // On submit, add new entry to db
  $newEntryForm.on("submit", function (event) {
    event.preventDefault();
    const text = event.target.entry.value;
    $newEntryField.val("").focus();

    saveNewEntry(text)
      .then(function () {})
      .catch(function (obj) {
        $newEntryField.val(obj.text);
        alert(obj.error);
      });
  });
}

//
// Firebase methods
//

// Updates entries in db.
function saveNewEntry(text) {
  return new Promise(function (resolve, reject) {
    if (text.length < 5 || text.length > 500) {
      reject({
        text: text,
        error: "Too long or short.",
      });
      return;
    }

    const entry = {
      text: text,
      dateAdded: new Date(),
    };

    db.collection("entries")
      .add(entry)
      .then(function () {
        resolve();
      })
      .catch(function (error) {
        reject({
          text: text,
          error: error,
        });
      });
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
