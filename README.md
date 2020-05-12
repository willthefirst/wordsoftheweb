## Deploy

firebase deploy

## Dev

[Console](https://console.firebase.google.com/project/walloftext-78632/database/firestore/data~2Fentries~2F0vbSSAntimHktpUwMct7Ï)

## Todo

- Protect API

// Perhaps for protecting that people can only modify THEIR thing.
// Need to first see if auth will allow for this

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access, but only content owners can write
    match /some_collection/{document} {
      allow read: if true
      allow create: if request.auth.uid == request.resource.data.author_uid;
      allow update, delete: if request.auth.uid == resource.data.author_uid;
    }
  }
}

// Would also be good to limit number of submission a single user can throw per day



- Add big/normal/small toggle
- Set up Firebase emulator for faster dev?
