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
  bindSubmitEntry();
  streamAllEntries();
});

function bindSubmitEntry() {
  $("#newEntryForm").submit(function (event) {
    event.preventDefault();

    const entry = event.target.entry.value;
    saveNewEntry(entry);
  });
}

// Saves a new entry to Firebase
function saveNewEntry(entry) {
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

// Livestreams all entries in Firebase
function streamAllEntries() {
    const $dbEntries = $('#dbEntries');
    db.collection("entries")
    .orderBy("dateAdded")
    .onSnapshot(function(snapshot) {
        // Clear loading text
        $dbEntries.html('');
        
        // Isolate the change between snapshots
        snapshot.docChanges().forEach(function(change) {
            const entry = change.doc.data();
            console.log(entry)
            $dbEntries.append(`${entry.text} * `);
        });
    });

}
