import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import fs from 'fs';

async function main() {
    try {
        const privateKeyHex = "9af8e9a0dc88c34f05dd66f7f297695e01f2706c34fee699a9b24a6627ed77e9";
        const privateKey = new Ed25519PrivateKey(privateKeyHex);
        const account = Account.fromPrivateKey({ privateKey });
        const address = account.accountAddress.toString();
        fs.writeFileSync('address.txt', address);
    } catch (e) {
        console.error(e);
    }
}

main();
