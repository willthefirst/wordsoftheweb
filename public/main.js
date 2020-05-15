const firebaseConfig = {
  apiKey: "AIzaSyBYZTJjf_p9CQHjVgaCa_91271aIcsL86I",
  authDomain: "wordsoftheweb.firebaseapp.com",
  databaseURL: "https://wordsoftheweb.firebaseio.com",
  projectId: "wordsoftheweb",
  storageBucket: "wordsoftheweb.appspot.com",
  messagingSenderId: "963187251615",
  appId: "1:963187251615:web:0c71d6994611fe5035c5aa",
  measurementId: "G-85GDVHW14X",
};

let config = {
  FUNCTIONS_URL: `https://us-central1-wordsoftheweb.cloudfunctions.net`
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Connect to db
const db = firebase.firestore();

// Development environment
if (location.hostname === "localhost") {
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });

  config.FUNCTIONS_URL = `http://localhost:5001/wordsoftheweb/us-central1`;
}

$(document).ready(function () {
  listenToDB();
  bindNewEntryHandlers();
});

// Livestreams all entries in Firebase
function listenToDB() {
  let loading = true;
  const $dbEntries = $("#dbEntries");

  db.collection("entries")
    .where("validated", "==", true)
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
      .then((data) => {
        if (data.statusCode === 429) {
          // Too many submissions from this IP, rate limited.
          $newEntryField.val(text);
          alert(data.error)
        }
      })
      .catch((error) => {
        alert(error)
      });
  });
}

//
// Firebase methods
//

// Updates entries in db.
async function saveNewEntry(text) {
  if (text.length < 5 || text.length > 500) {
    throw new Error("Too long or short.")
  }

  const entry = {
    text: text,
    dateAdded: new Date(),
  };

  const url = `${config.FUNCTIONS_URL}/app/api/create`;

  const options = {
    method: "POST",
    body: JSON.stringify(entry),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, options)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      return data
    })
  return response;
}

//
// Helpers
//

function entryTemplate(text, id) {
  const entryId = `fbId_${id}`;
  return `<span id=${entryId}>${text}</span>
          <span class="separator"> | </span>`;
}