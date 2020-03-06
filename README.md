# Subsocial Blockchain Explorer by [DappForce](https://github.com/dappforce)

SubSocial is a set of Substrate runtime modules (SRML) with UI that would allow anyone to launch their own decentralized censorship-resistant social network aka community. We are planning to follow a topology of Polkadot Network where every community will be running on its own Substrate chain and all these decentralized communities will be connected to our own Polkadot relay. This social networking relay could be connected to the official Polkadot Network.

You can think of this as decentralized versions of Reddit, Stack Exchange or Medium, where subreddits or communities of Stack Exchange or blogs on Medium run on their own chain. At the same time, users of these decentralized communities should be able to transfer or share their reputation, coins and other values from one community to another via Polkadot relay.

## Overview

The repo is split into a number of packages, each representing an application. These are -

- [apps](packages/apps/) This is the main entry point. It handles the selection sidebar and routing to the specific application being displayed.
- [app-accounts](packages/app-accounts/) A basic account management app.
- [app-address-book](packages/app-address-book/) A basic address management app.
- [app-explorer](packages/app-explorer/) A simple block explorer. It only shows the most recent blocks, updating as they become available.
- [app-extrinsics](packages/app-extrinsics/) Submission of extrinsics to a node.
- [app-js](packages/app-js/) An online code editor with [@polkadot-js/api](https://github.com/polkadot-js/api/tree/master/packages/api) access to the currently connected node.
- [app-settings](packages/app-settings/) A basic settings management app, allowing choice of language, node to connect to, and theme
- [app-staking](packages/app-staking/) A basic staking management app, allowing staking and nominations.
- [app-nodeinfo](packages/app-nodeinfo/) Node information and status
- [app-storage](packages/app-storage/) A simple node storage query application. Multiple queries can be queued and updates as new values become available.
- [app-toolbox](packages/app-toolbox/) Sumission of raw data to RPC endpoints and utility hashing functions.
- [app-transfer](packages/app-transfer/) A basic account management app, allowing transfer of DOTs between accounts.

In addition the following libraries are also included in the repo. These are to be moved to the [@polkadot/ui](https://github.com/polkadot-js/ui/) repository once it reaches a base level of stability and usability. (At this point with the framework being tested on the apps above, it makes development easier having it close)

- [ui-app](packages/ui-app/) A reactive (using RxJS) application framework with a number of useful shared components.
- [ui-signer](packages/ui-signer/) Signer implementation for apps.
- [ui-react-rx](packages/ui-react-rx) Base components that use the RxJS Observable APIs

## Development

Contributions are welcome!

To start off, this repo (along with others in the [@polkadot](https://github.com/polkadot-js/) family) uses yarn workspaces to organise the code. As such, after cloning dependencies _should_ be installed via `yarn`, not via npm, the latter will result in broken dependencies.

To get started -

1. Clone the repo locally, via `git clone git@github.com:dappforce/dappforce-subsocial-ui.git`
2. Ensure that you have a recent LTS version of Node.js, for development purposes [Node >=10.13.0](https://nodejs.org/en/) is recommended.
3. Ensure that you have a recent version of Yarn, for development purposes [Yarn >=1.10.1](https://yarnpkg.com/docs/install) is required.
4. Install the dependencies by running `yarn`
5. Ready! Now you can launch the UI (assuming you have a local Polkadot Node running), via `yarn run start`
6. Access the UI via [http://localhost:3000](http://localhost:3000)
