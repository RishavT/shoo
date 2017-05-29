// requires encrypt.js to be loaded
var readFiles = [];
var fileCounter = 0;

function generateDownloadEl(options) {
  // var options = {
  //   name: "filename",
  //   type: "text/plain",
  //   data: "Hello World, this is the data inside the file",
  //   downloadLinkText: "Download this File",
  // };
  if (!options.type) {
    options.type = "text/plain";
  }
  var element = document.createElement('a');
  element.setAttribute('href', 'data:' + options.type + ';charset=utf-8,' + encodeURIComponent(options.data));
  element.setAttribute('download', options.name);
  element.innerHTML = options.downloadLinkText;
  return element;
}

function download(options) {
  // var options = {
  //   name: "filename",
  //   type: "text/plain",
  //   data: "Hello World, this is the data inside the file",
  //   downloadLinkText: "Download this File",
  // };
  element = generateDownloadEl(options);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function handleFileSelect(evt) {
    // Clear old data first
    readFiles = [];
    var fileList = document.getElementById('file-list');
    while (fileList.firstChild) {
      fileList.removeChild(fileList.firstChild);
    }

    var files = evt.files;
    for (var i = 0, f; f = files[i]; i++) {
      var reader = new FileReader();
      var li = document.createElement('li');
      li.id = 'file_' + fileCounter;
      fileCounter ++;
      li.innerHTML = '<strong>' + escape(f.name) + '</strong>'
      fileList.appendChild(li);
      fileData = {
        name: f.name,
        type: f.type
      }
      readFiles.push(fileData);
      // Closure to capture the file information.
      reader.onload = (function() {
        return function(e) {
          fileData.data = e.target.result;
        };
      })();

      // Read in the image file as a data URL.
      reader.readAsBinaryString(f);
    }
  }

  function displayDecryptedData(data) {
    // data = {
    //   text: "Text Here",
    //   files: [
    //     {
    //       name: "fileName",
    //       data: "File Data",
    //       type: "text/plain"
    //     },
    //   ]
    // }

    document.getElementById("decrypted-data-div").style.display = "block";
    document.getElementById("text-data").value = data.text;

    var fileList = document.getElementById('file-list');
    while (fileList.firstChild) {
      fileList.removeChild(fileList.firstChild);
    }

    for (var i = 0, f; f = data.files[i]; i++) {
      var li = document.createElement('li');
      li.id = 'file_' + fileCounter;
      fileCounter ++;
      li.innerHTML = '<strong>' + escape(f.name) + '</strong> ';
      f.downloadLinkText = "Download";
      li.appendChild(generateDownloadEl(f));
      fileList.appendChild(li);
    }
  }

  function onGenerateKeysButtonClick(event) {
    event.preventDefault();
    var submitButton = document.getElementById("generate-keys-submit-button");
    submitButton.disabled = true;
    submitButton.value = "Generating Keys... This may take a while.";
    var name = document.getElementsByName("name")[0].value;
    var email = document.getElementsByName("email")[0].value;
    var numBits = document.getElementsByName("numBits")[0].value;
    var passphrase = document.getElementsByName("passphrase")[0].value;
    var options = {
      userIds: [{
        name: name,
        email: email
      }],
      numBits: parseInt(numBits),
      passphrase: passphrase?passphrase:undefined
    };
    generateKeyPair(options).then(function(key) {
      var privkey = key.privateKeyArmored;
      var pubkey = key.publicKeyArmored;
      document.getElementById("generated-keys-div").style.display = "block";
      document.getElementById("generated-private-key-textarea").value = privkey;
      document.getElementById("generated-public-key-textarea").value = pubkey;
      submitButton.value = "Generate Fresh Keys";
      submitButton.disabled = false;
    });
  }

function onEncryptButtonClick() {
  var data = {
    text: document.getElementById("text-data").value,
    files: readFiles
  }

  var pubkey = document.getElementById("public-key-textarea").value;
  var privkey = document.getElementById("private-key-textarea").value;
  var passphrase = document.getElementById("private-key-passphrase").value;
  var encryptButton = document.getElementById("encrypt-button");

  if (!data || !pubkey) {
    alert("Please fill up the public key and some data to encrypt.");
    return;
  }

  encryptButton.innerHTML = "Encrypting.. This may take a while.";
  encryptButton.disabled = true;

  var options = {
    data: JSON.stringify(data),
    pubkey: pubkey,
    privkey: privkey?privkey:undefined,
    passphrase: passphrase?passphrase:undefined
  }

  encrypt(options).then(function(cyphertext) {
    download({name: 'EncryptedFile', data: cyphertext.data});
    encryptButton.innerHTML = "Encrypt and Download";
    encryptButton.disabled = false;
  });
}

function onDecryptButtonClick() {
  var pubkey = document.getElementById("public-key-textarea").value;
  var privkey = document.getElementById("private-key-textarea").value;
  var passphrase = document.getElementById("private-key-passphrase").value;
  var files = document.getElementById('encrypted-file').files;
  var decryptButton = document.getElementById("decrypt-button");

  if (!files || !privkey) {
    alert("Please fill up the private key and select a file to decrypt.");
  }

  decryptButton.innerHTML = "Decrypting.. This may take a while.";
  decryptButton.disabled = true;

  var reader = new FileReader();
  reader.onload = (function() {
    return function(e) {
      var options = {
        encrypted: e.target.result,
        pubkey: pubkey?pubkey:undefined,
        privkey: privkey,
        passphrase: passphrase?passphrase:undefined
      };
      decrypt(options).then(function(plaintext) {
        var data = JSON.parse(plaintext.data);
        displayDecryptedData(data);
        decryptButton.innerHTML = "Decrypt";
        decryptButton.disabled = false;
      });
    }
  })();

  reader.readAsText(files[0]);
}
