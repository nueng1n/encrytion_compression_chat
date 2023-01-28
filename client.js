const net = require('net');
const client = new net.Socket();
const readline = require('readline');
const crypto = require('crypto');
const zlib = require('zlib');
const fs = require('fs');


let key = null
let iv = null


function encryptedAndCompression(input) {
    var deflated = zlib.deflateSync(input).toString('base64');
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(deflated);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted
}

function decryptANdDecompress(input) {
    let encryptedText = Buffer.from(input);
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    let inflated = zlib.inflateSync(Buffer.from(decrypted.toString(), 'base64')).toString();
    // console.log(inflated);
    return inflated
}


client.connect(3000, '127.0.0.1', async () => {

    console.log('Connected to server');
    process.stdin.setEncoding('utf8');

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var waitForUserInput = function () {
        rl.question("", function (cmd) {

            if (cmd == "CLOSE") {
                client.end()
                rl.close();
            } else if (cmd == "HELP") {
                console.log('HELP options:\n TYPE CLOSE to disconnect server\n ');
                waitForUserInput()
            }  else {

                let message = encryptedAndCompression(`client: ${cmd}`)

                client.write(JSON.stringify({
                    type: "msg",
                    message: message

                }));
                waitForUserInput()
            }
        });
    }

    waitForUserInput()

});

client.on('data', (data) => {

    if (!key && !iv) {
        key = Buffer.from(JSON.parse(data)['key'])
        iv = Buffer.from(JSON.parse(data)['iv'])



        client.write(JSON.stringify({
            type: "cmd",
            message: "RCKIV"

        }));
    } else {
        console.log("\n", decryptANdDecompress(data));
    }


});

client.on('close', () => {
    console.log('Connection closed');
    process.exit(0)
});
