const args = process.argv
import { createAccount, fetch, goPublic,forSale } from "./index";

const usage = function () {
  const usageText = `
      Create and fetch your Intellectual property
  
      create: create <metadata(hex code of SHA256 of your property)> <seed> <PrivateKeyByteArray> 
      fetch: fetch <account address> existing
      `;
  console.log(usageText);
};
const commands = ["create", "fetch", "goPublic","forSale"];
if (commands.indexOf(args[2]) == -1) {
  console.log("invalid command passed");
  usage();
}
else if (commands.indexOf(args[2]) == 0) {
  if (args.length == 6) {
    var PrivteKeyByteArray = args[5];
    var metadata = args[3];
    var seed = args[4];
    createAccount(PrivteKeyByteArray, seed, metadata);
  }
}
else if (commands.indexOf(args[2]) == 1) {
  if (args.length == 4) {
    var account = args[3];
    fetchAccount(account)
  }
}
else if (commands.indexOf(args[2]) == 3) {
  if (args.length == 6) {
    console.log("yes")
    var key = args[3];
    var privateKeyByteArray=args[4]
    var amount = args[5]
    forSale(key,privateKeyByteArray,amount)
  }
}
else if (commands.indexOf(args[2]) == 2) {
  if (args.length == 5) {
    var seed = args[3];
    var privateKeyByteArray=args[4]
    goPublic(privateKeyByteArray,seed,"egyrft")
  }
}
else {
  console.log("Invalid Arguments")
  usage()
}

async function fetchAccount(account: string) {
  const data = await fetch(account)
  console.log(data)
}