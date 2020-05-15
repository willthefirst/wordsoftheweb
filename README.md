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
- Launch the bwebsite
    - Loosen the hold against IPs a little, let a little bit more through

### Security
- Extra layer of security (clientside, so hackable) 
        https://firebase.google.com/docs/auth/web/anonymous-auth

### Bugs
- Refactor server db
- Refactor Client js to be more private/secure

### Refactor
- use server time instead of `new Date`
    - https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp
- Find ways to cut down doc reads of DB
    - one idea, which also might solve the SEO thing, is to to progressively generate static html pages of older/unmodifiable entries. If you can write a program that does this...then you could actually have a website for the ages AND you could do fancier live loading BS with the freed up bandwidth.
- Set up unit tests

### Features
- fancier analytics
- word conversions
    > hitler
    > nazi
- Add ID's (links?) to everything so that they are searchable
- update html metadata for search engines
- Add metadata
- how can i make this thing searchable?
- nicer loading while submission waits?
- prettier errors
- Show number of users currently on the site?
- Add big/normal/small toggle
- small about page with the rules
    -you could even explain why you needed to implement the measures re:meatspin

### Other
- Learn about VS Code remote debugging? 
https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome#cannot-connect-to-the-target%3a-connect-ECONNREFUSED-127.0.0.1%3a9222