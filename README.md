# locked.fyi

A basic notes application where notes are stored on IPFS and only visible by members of a lock.

# Definitions

* _Author_: person who creates content.
* _Visitor_: web users through a web-browser
* _Lock_: on-chain contract which keeps track of members as well as sets the terms of the membership (currency, price, duration, number of members... etc). It can be deployed from https://app.unlock-protocol.com/dashboard/
* _Member_: visitor who has purchased a membership
* _Note_: content created by the author

# User stories

## Author
* As an author I want to write notes (short or long) with the narkdown format which can be saved on a "permissionless" datastaore IPFS.
* As an author, I want to lock these notes so that only paying members to my lock can access/view them.

## Visitor
* As a visitor, I am able to load a page for an author, but the content is not available unless I become a member
* As a visitor, I can become a member by purchasing the key to a lock, from the page on which the notes would be visible if I was a member

## Member
* As a member, I am able to load the page for an author and view all of the notes that the author has published




