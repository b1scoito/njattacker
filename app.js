const log = require('./log.js')
if (process.argv.length < 6 || process.argv.length > 6) {
  log.info("Can't attack please make sure to execute: node app.js ip:port count delay mode ex node app.js 192.233.122.21:1177 100 15 config, mode could be either config or random, count could be infinite string.");
  process.exit(0);
}

var net = require('net');
var fs = require('fs');
const btoa = require('btoa');

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

function formatCMD(cmd) {
  const cmdstring = `${cmd.name}|'|'|${cmd.params.join("|'|'|")}`
  const packetsize = cmdstring.length
  return Buffer.from(`${packetsize}\x00${cmdstring}`, 'utf8')
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
      log.info(`(${i}) sending fake client on ${ip}:${port}`)
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
  });
  socket.on('error', (error) => {
    log.error("Connection was Closed Unexpectedly or was closed already, closing spammer.", "njattacker", error);
    process.exit(0);
  });
  socket.on('data', data => {
    const dataString = data.toString()
    if (dataString === '0') {
      socket.write(Buffer.from('3000', 'hex'))
    }
    const msg = dataString.split('\x00')[1]
    const command = msg.split("|'|'|")[0]
    const args = msg.split("|'|'|")
    args.shift();
    if (!command || !args) return;
    log.debug(command, args, "recieved")

    // Keylogger
    if (command === 'kl') {
      setInterval(() => {
        socket.write(formatCMD({
          name: 'kl',
          params: [
            btoa(choose(rndconfig.names))
          ]
        }))
      }, 1000)
    }

    // Screen Cap (in table)
    if (command === 'CAP') {
      const images = fs.readdirSync('frames').map(name => fs.readFileSync(`frames/${name}`))
      let iimg = 0
      setInterval(() => {
        const command = Buffer.from(`CAP|'|'|`, 'utf8')
        const image = images[iimg]
        const complete = Buffer.concat([command, image])
        const start = Buffer.from(`${complete.length}\x00`, 'utf8')
        socket.write(Buffer.concat([start, complete]))
        if (iimg < images.length - 1) {
          iimg++
        } else {
          iimg = 0
        }
      }, 100)
    }
  })
}