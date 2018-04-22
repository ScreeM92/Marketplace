## Setup

1. Install node.js

2. To install `truffle`, `web3` and `http-server`, run:

```bash
npm install -g truffle web3@0.20.4 http-server
```

3. Navigate to the repository folder and run:

```
npm install
```

## Running a local blockchain

You need to **navigate to the truffle folder** of the project and run:

```bash
truffle develop
```

## Running project

1. Get BYTECODE and ABI after compiling the code located in the **marketplace folder** of the project `Project.sol` file

2. Navigate to the `marketplace/web/publish` folder in the project and add the BYTECODE and ABI then run:

```bash
node publish-contract.js
```

3. Edit the `marketplace/web/public/scripts/utils/init-contract.js` file with the new contract address

4. To host the website and install packages, while inside the `marketplace/web/public` folder, run:

```bash
npm start
```

5. Install MetaMask extention in chrome


## Testing project

You need to **navigate to the marketplace folder** of the project and run:

```bash
truffle test
```

All tests are located in the `marketplace/test/Marketplace.js` file

## And Have Fun...
