# Words Of The Web

[Website](https://wordsoftheweb.web.app)

## Deploy

`firebase deploy`

## Dev

To run the emulators: `firebase emulators:start`

Enabling Chrome Debugging

In shell:

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

## Todo
- Protect API
    - Prevent too many submissions per hour
    https://firebase.google.com/docs/auth/web/anonymous-auth
        > you got this to work. next: examine speed issues, and code organization, and how you want to sign out users depending on submissions.
    - Do this too: https://stackoverflow.com/questions/35418143/how-to-restrict-firebase-data-modification
    - https://firebase.google.com/support/guides/launch-checklist

### Bugs
- refactor js to be more private/secure
- https://www.youtube.com/watch?v=Lb-Pnytoi-8

### Features
- update html metadata for search engines
- how can i make this thing searchable?
- nicer loading while submission waits?
- prettier errors
- Load page at the bottom
- Show number of uses currently on the site?
- Add big/normal/small toggle

### Other
- Learn about VS Code remote debugging? 
https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome#cannot-connect-to-the-target%3a-connect-ECONNREFUSED-127.0.0.1%3a9222