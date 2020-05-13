## Deploy

firebase deploy

## Dev

[Console](https://console.firebase.google.com/project/walloftext-78632/database/firestore/data~2Fentries~2F0vbSSAntimHktpUwMct7Ï)

Enabling Chrome Debugging

In shell:

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222



## Todo

- Protect API
    - Sanitize submissions https://github.com/firebase/functions-samples/tree/master/text-moderation
    - Protect saved posts
    - Prevent empty posts
    - Prevent too many single user submissions per day
- nicer loading while submission waits?
- Add big/normal/small toggle
- Learn about VS Code remote debugging? 
https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome#cannot-connect-to-the-target%3a-connect-ECONNREFUSED-127.0.0.1%3a9222