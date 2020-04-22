# locked.fyi

Locked.fyi is a new kind of platform, completely decentralized! Its code is open source and you can run it locally (no backend needed), or deploy your own versions of it, but, more importantly all of the data is stored on IPFS, a decentralized file storage protocol.

# What are locks?

We believe the **web needs a better business model**. We also know that "free" too often means that great ideas eventually suffer from the tragedy of the commons, or that the user's privacy and attention get abused.

For this reason, locked.fyi comes with a business model, built-in. Each application and each piece of content can be monetized with [Unlock](https://unlock-protocol.com/), a decentralized protocol for memberships.

Creators using the platform can of course decide of the terms of their own memberships (including duration, currencies, prices... etc). But they can also use the **community lock** which is a lock whose membership costs a little more than \$1 per year (actually less than that right now...) and whose proceeds will get shared between all creators.

We will soon write more about how this works!

## Running locally

This code is Open Source and available for anyone to fork, and improve (please send your changes). More importantly, you are free to run this code on your computer as well, so that you do not even have to trust _us_ to run it forever. You need a node + yarn environment!

1. Check out the code using git: `git clone git@github.com:unlock-protocol/locked.fyi.git`
2. Install dependencies: `yarn`
3. Run it: `yarn start`

✅ Follow instructions given in the terminal and open your web browser!

You can also deploy this code if you want to access it from an endpoint you control. We are currently deploying it using Cloudflare's worker infrastructure, but since it's a stati HTML application it can run anywhere!

### Fission

To deploy using [Fission](https://fission.codes/), make sure you
