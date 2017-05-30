function setup() {
  var openpgp = window.openpgp;
  openpgp.initWorker({
    path: 'openpgp.worker.js'
  }) // set the relative web worker path
  openpgp.config.aead_protect = true // activate fast AES-GCM mode (not yet OpenPGP standard)
}

function encrypt(options) {
  // options = {
  //   data: "text data to be encrypted",
  //   pubkey: "pubkey (str)",
  //   privkey: "privkey (str)" (optional),
  //   passphrase: "passphrase of privkey",
  // }
  // Here, the pubkey is used to encrypt (and hence is of the recipient)
  // and the privkey is used to sign (and hence is of the sender)
  //
  // Returns a promise which works with a callback of the following form:
  // function promiseResolver(cyphertext) {
  // print cyphertext.data;
  // }

  var openpgp = window.openpgp;

  var privKeyObj;
  if (options.privkey) {
    privKeyObj = openpgp.key.readArmored(options.privkey).keys[0];
    privKeyObj.decrypt(options.passphrase);
  }

  encryptOptions = {
    data: options.data, // input as String (or Uint8Array)
    publicKeys: openpgp.key.readArmored(options.pubkey).keys, // for encryption
    privateKeys: privKeyObj ? privKeyObj : undefined // for signing (optional)
  };

  return openpgp.encrypt(encryptOptions);
}

function decrypt(options) {
  // var options = {
  //   encrypted: "Your encrypted text here",
  //   pubkey: "Sender's public key (for verification, optional)",
  //   privkey: "Your private key",
  //   passphrase: "Your private key passphrase (optional)"
  // }
  // Usage:
  // decrypt(options).then(function(plaintext) {
  //   console.log(plaintext.data);
  // });

  var openpgp = window.openpgp;

  var privKeyObj;
  if (options.privkey) {
    privKeyObj = openpgp.key.readArmored(options.privkey).keys[0];
    privKeyObj.decrypt(options.passphrase);
  }
  var pubKeyObjects;
  if (options.pubkey) {
    pubKeyObjects = openpgp.key.readArmored(options.pubkey).keys;
  }

  var decryptOptions = {
    message: openpgp.message.readArmored(options.encrypted), // parse armored message
    publicKeys: pubKeyObjects, // for verification (optional)
    privateKey: privKeyObj // for decryption
  }

  return openpgp.decrypt(decryptOptions);
}

function generateKeyPair(options) {
  // var options = {
  //   userIds: [{
  //     name: 'Jon Smith',
  //     email: 'jon@example.com'
  //   }], // multiple user IDs
  //   numBits: 4096, // RSA key size
  //   passphrase: 'super long and hard to guess secret' // protects the private key
  // };
  // openpgp.generateKey(options).then(function(key) {
  //   var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
  //   var pubkey = key.publicKeyArmored; // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
  // });
  var openpgp = window.openpgp;
  return openpgp.generateKey(options);
}
