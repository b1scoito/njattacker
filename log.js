const chalk = require('chalk');
module.exports = {
    debug: function (text, thread) {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return console.log(`[ ${chalk.cyan(time)} ] ${chalk.yellow("DEBUG")} [${chalk.magenta(thread)}] -> ${text}`);
    },
    info: function (text) {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return console.log(`[ ${chalk.cyan(time)} ] ${chalk.green("INFO")} -> ${text}`);
    },
    error: function (text, thread, error) {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return console.log(`[ ${chalk.cyan(time)} ] ${chalk.red("ERROR")} [${chalk.magenta(thread)}] on [${chalk.red(error)}] -> ${text}`);
    }
}