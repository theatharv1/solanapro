//dependencies
import {
  Connection,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import { config } from "dotenv";
import * as borsh from 'borsh';
import { error } from "console";
import { createToken } from "./token";
import { makeid, underscoreGenerator, stringConcat, parseIntellectualProperty } from "./utils"
//
// function refineData(data:string){
//   class IntellectualProperty {
//     property_owner = makeid(90)
//     hash = makeid(64)
//     amount = makeid(5)
//     uri = makeid(100)
//     constructor(fields: { property_owner: string, hash: string, amount: string, uri: string } | undefined = undefined) {
//       if (fields) {
//         this.property_owner = fields.property_owner;
//         this.hash = fields.hash;
//         this.amount = fields.amount;
//         this.uri = fields.uri
//       }
//     }
//   }
//   let data2=data.split("@")
//   let owner=data2[0].substr(1)
//   let hex=data2[1].substr(0,64)
//   console.log(data)
//   if(data2[1].length>64){
//     let url = data2[1].substr(65)
//     var a= new IntellectualProperty()
//     a.property_owner=owner
//     a.hash=hex
//     a.uri=url
//     return a
//   }
//   var a= new IntellectualProperty()
//   a.property_owner=owner
//   a.hash=hex
//   return a
// }

export class IntellectualProperty {
  property_owner = makeid(44)
  hash = makeid(64)
  value = makeid(5)
  uri = makeid(100)
  is_public = makeid(1)
  for_sale = makeid(1)
  constructor(fields: { property_owner: string, hash: string, value: string, uri: string, is_public: string, for_sale: string } | undefined = undefined) {
    if (fields) {
      this.property_owner = fields.property_owner;
      this.hash = fields.hash;
      this.value = fields.value;
      this.uri = fields.uri;
      this.is_public = fields.is_public;
      this.for_sale = fields.for_sale;
    }
  }
}


const IntellectualPropertySchema = new Map([
  [IntellectualProperty, { kind: 'struct', fields: [['property_owner', 'string'], ['hash', 'string'], ['value', 'string'], ['uri', 'string'], ['is_public', 'string'], ['for_sale', 'string']] }],
]);

const IntellectualProperty_Size = borsh.serialize(
  IntellectualPropertySchema,
  new IntellectualProperty(),
).length;

const program_id = new PublicKey("DcTedCXg4LH7LGLkgXNBNjmy7jGNxxMwj7JH8YLSpvVQ");
async function establishConnection() {
  const rpcUrl = "http://localhost:8899";
  return new Connection(rpcUrl, "confirmed");
}

async function createKeypairFromInput(key: string): Promise<Keypair> {
  const secretKey = Uint8Array.from(JSON.parse(key));
  return Keypair.fromSecretKey(secretKey);
}

export async function createAccount(privateKeyByteArray: string, seed: string, hash: string) {
  if (hash.length != 64) {
    throw "Error: Invalid Hash(must be exact 64 characters)"
  }
  const initializerAccount = await createKeypairFromInput(privateKeyByteArray);
  //const address= await createToken(initializerAccount)
  const rpcUrl = "http://localhost:8899";
  const connection = new Connection(rpcUrl, "confirmed");

  const newAccountPubkey = await PublicKey.createWithSeed(
    initializerAccount.publicKey,
    seed,
    program_id
  );
  const lamports = await connection.getMinimumBalanceForRentExemption(
    IntellectualProperty_Size
  );
  const instruction = SystemProgram.createAccountWithSeed({
    fromPubkey: initializerAccount.publicKey,
    basePubkey: initializerAccount.publicKey,
    seed: seed,
    newAccountPubkey: newAccountPubkey,
    lamports: lamports,
    space: IntellectualProperty_Size,
    programId: program_id,
  });

  const transaction = new Transaction().add(instruction);
  await sendAndConfirmTransaction(connection, transaction, [
    initializerAccount,
  ]);

  const initAccount = new TransactionInstruction({
    programId: program_id,
    keys: [
      { pubkey: newAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
    ],
    data: Buffer.from(
      Uint8Array.of(0, ...Array.from(new TextEncoder().encode(hash + underscoreGenerator(100))))
    ),
  });

  const transaction2 = new Transaction().add(initAccount);

  console.log(`The address of account is : ${newAccountPubkey.toBase58()}`);

  await sendAndConfirmTransaction(connection, transaction2, [
    initializerAccount,
  ]);
  console.log(newAccountPubkey)
  return newAccountPubkey.toBase58()

}

export async function goPublic(privateKeyByteArray: string, seed: string, uri: string) {
  const initializerAccount = await createKeypairFromInput(privateKeyByteArray);

  const rpcUrl = "http://localhost:8899";
  const connection = new Connection(rpcUrl, "confirmed");

  const newAccountPubkey = await PublicKey.createWithSeed(
    initializerAccount.publicKey,
    seed,
    program_id
  );

  const accountInfo = await connection.getAccountInfo(newAccountPubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the account';
  }
  else {
    const initAccount = new TransactionInstruction({
      programId: program_id,
      keys: [
        { pubkey: newAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(
        Uint8Array.of(1, ...Array.from(new TextEncoder().encode(stringConcat(uri, 100))))
      ),
    });

    const transaction2 = new Transaction().add(initAccount);

    console.log(`The address of account is : ${newAccountPubkey.toBase58()}`);

    await sendAndConfirmTransaction(connection, transaction2, [
      initializerAccount,
    ]);

    return newAccountPubkey.toBase58()

  }
}

export async function forSale(key: string, privateKeyByteArray: string, amount: string) {
  const initializerAccount = await createKeypairFromInput(privateKeyByteArray);
  var connection = await establishConnection()
  const nft = await fetch(key)
  if (nft.property_owner != initializerAccount.publicKey.toBase58()) {
    throw "Error: Invalid Owner"
  }
  else {
    console.log(new PublicKey(key))
    const initAccount = new TransactionInstruction({
      programId: program_id,
      keys: [
        { pubkey: new PublicKey(key), isSigner: false, isWritable: true },
        { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(
        Uint8Array.of(2, ...Array.from(new TextEncoder().encode(stringConcat(amount, 5))))
      )
    })
    const transaction = new Transaction().add(initAccount);


    await sendAndConfirmTransaction(connection, transaction, [
      initializerAccount,
    ]);
  }
}
  //fetch account
  export async function fetch(key: string) {
    const rpcUrl = "http://localhost:8899";
    const connection = new Connection(rpcUrl, "singleGossip");
    var greetedPubkey = new PublicKey(key)
    const accountInfo = await connection.getAccountInfo(greetedPubkey);
    if (accountInfo === null) {
      throw Error
    }
    const property = borsh.deserialize(
      IntellectualPropertySchema,
      IntellectualProperty,
      accountInfo.data
    );
    return parseIntellectualProperty(property)
  }