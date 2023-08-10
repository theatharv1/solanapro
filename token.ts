import { Keypair, Connection, clusterApiUrl,sendAndConfirmTransaction,Transaction} from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import { Token } from '@solana/spl-token';
import { sign } from 'crypto';

export async function createToken(fromWallet:Keypair) :Promise<string> {

    // const connection = new Connection(
    //     clusterApiUrl('devnet'),
    //     'confirmed',
    // );
    const rpcUrl = "http://localhost:8899";
    const connection = new Connection(rpcUrl, "confirmed");

// async function createKeypairFromFile(){
//     const secretKeyString = await fs.readFile("/home/mayank/.config/solana/id.json", {encoding:'utf8'});
//     const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
//     return web3.Keypair.fromSecretKey(secretKey);
// }

//var fromWallet = await createKeypairFromFile();

// console.log(fromWallet.publicKey);

// var fromAirdropSignature = await connection.requestAirdrop(
//     fromWallet.publicKey,
//     web3.LAMPORTS_PER_SOL,
// );

//await connection.confirmTransaction(fromAirdropSignature);

let mint = await Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    0,
    splToken.TOKEN_PROGRAM_ID,
);

let fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey,
);

var toWallet = Keypair.generate();

var toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey,
);

await mint.mintTo(
    fromTokenAccount.address,
    fromWallet.publicKey,
    [],
    1000000000,
);

await mint.setAuthority(
    mint.publicKey,
    null,
    "MintTokens",
    fromWallet.publicKey,
    []
)

var transaction = new Transaction().add(
    Token.createTransferInstruction(
        splToken.TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        [],
        1,
    ),
);

var signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet],
    {commitment: 'confirmed'},
);

console.log('SIGNATURE', signature);
return signature
}