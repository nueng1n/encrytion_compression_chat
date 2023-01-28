const net = require('net');
const crypto = require('crypto');
const zlib = require('zlib');
const fs = require("fs");



const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);



// function decryptANdDecompress(input){
//     let encryptedText = Buffer.from(input);
//     let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     let inflated = zlib.inflateSync(Buffer.from(decrypted.toString(), 'base64')).toString();
//     console.log(inflated);
// }

function encryptedAndCompression(input) {
    var deflated = zlib.deflateSync(input).toString('base64');
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(deflated);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted
}


function isObject(input) {
    try {

        let json_data = JSON.parse(input)
        return true
    } catch {
        return false
    }
}

const server = net.createServer((client) => {



    
    console.log('Client connected');
    client.write(JSON.stringify({ key: key, iv: iv }))


    clients.push(client);

    client.on('data', (data) => {

        if (isObject(data)) {


            let json_data = JSON.parse(data)

            if (json_data['type'] == 'cmd') {

                let data_ = json_data['message']

                if (data_.toString().trim().toUpperCase() === 'RCKIV') {
                    let message = encryptedAndCompression('Welcome to the chat group! Type "HELP" to see options.\n')
                    client.write(message);

                }


            } else {

                let data_ = json_data['message']


                clients.forEach((c) => {
                    if (c !== client) {
                        c.write(Buffer.from(data_));
                    }
                });


            }
        } else {

            

        }



    });

    client.on('end', () => {
        console.log('Client disconnected');
        clients = clients.filter((c) => c !== client);
    });
});

let clients = [];
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
