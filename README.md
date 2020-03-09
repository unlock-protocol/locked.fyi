# locked.fyi

A basic blog application where posts (called notes!) are stored on IPFS and only visible by members of a lock.

# Example

I publish a thread, [available there](https://locked.fyi/?thread=/orbitdb/zdpuAwfVErVSxLKpLuyv4fRZDcyBRdLfFZAFpTTVeL3ooE58o/3box.thread.locked.fyi). Some of the stories are locked!

# Definitions

* _Author_: person who creates content.
* _Visitor_: web users through a web-browser
* _Lock_: on-chain contract which keeps track of members as well as sets the terms of the membership (currency, price, duration, number of members... etc). It can be deployed from https://app.unlock-protocol.com/dashboard/
* _Member_: visitor who has purchased a membership
* _Note_: content created by the author

# User stories

## Author
* As an author I want to write notes (short or long) with the markdown format which can be saved on a "permissionless" datastore IPFS.
* As an author, I want to lock some of these notes so that only paying members to my lock(s) can access/view them.

## Visitor
* As a visitor, I am able to load a page for an author, which lists all of their notes.
* As a visitor, when I click on one of the notes, and if that note has a lock, I cannot view it, unless I am a member of that lock
* As a visitor, I can become a member by purchasing the key to a lock, from the note page.

## Member
* As a member, I am able to load the page for note and view its content


# Flow

## Writing notes
1. The author creates a lock on `https://app.unlock-protocol.com/dashboard/`
2. The author goes to `https://locked.fyi/write`
3. The author writes a note using markdown
4. The author can add one or more locks to their note
4. When saved, the note is added to the author's thread

## Reading notes
1. A visitor visits `https://locked.fyi/?thread=<thread>`
2. The visitor clicks on any of the published stories.
3. If the visitor is not a member (see [handling events](https://docs.unlock-protocol.com/#handle-events)), show a button which asks the user to become a member. When clicked, the [button initiates the checkout](https://docs.unlock-protocol.com/#initiate-checkout).
4. If the visitor is a member, the note's content is shown to the user