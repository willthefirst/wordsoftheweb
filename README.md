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
    - Prevent too many submissions overall per hour

### Security
- Extra layer of security (clientside, so hackable) 
        https://firebase.google.com/docs/auth/web/anonymous-auth

### Bugs
- https://www.youtube.com/watch?v=Lb-Pnytoi-8

### Refactor
- use server time instead of `new Date`
    - https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp
- refactor Client js to be more private/secure
- Find ways to cut down doc reads of DB
    - one idea, which also might solve the SEO thing, is to to progressively generate static html pages of older/unmodifiable entries. If you can write a program that does this...then you could actually have a website for the ages AND you could do fancier live loading BS with the freed up bandwidth.
- Refactor server db
- Set up unit tests

### Features
- word conversions
    > hitler
    > nazi
- loosen the hold against IPs a little, let a little bit more through
- Get some basic analytics going
- Add ID's (links?) to everything so that they are searchable
- update html metadata for search engines
- Add metadata
- how can i make this thing searchable?
- nicer loading while submission waits?
- prettier errors
- Load page at the bottom
- Show number of uses currently on the site?
- Add big/normal/small toggle

### Other
- Learn about VS Code remote debugging? 
https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome#cannot-connect-to-the-target%3a-connect-ECONNREFUSED-127.0.0.1%3a9222