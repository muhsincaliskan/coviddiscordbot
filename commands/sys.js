const {localize}=require("../translations/translate.js")
const Discord = require("discord.js")
async function sys(message){

const { client } = message

const used = process.memoryUsage().rss / 1024 / 1024;
    const embedMsg = {
        color: 0x0099ff,
        author: {
            name: 'COVID -19 by killerbean#8689',
            icon_url: 'https://cdn.discordapp.com/avatars/451506381736902656/937b1075d9942fc7d7ef599dfd604230.png?size=256',
        },
        title: `System and Stats`,
        fields: [
            { name: "Ping", value: Math.round(client.ws.ping) + " ms", inline: true },
            { name: "Guilds", value:client.guilds.cache.size , inline: true },
            { name: "Discord.js", value: "v" + Discord.version, inline: true },
            { name: "Node.js", value: process.version, inline: true },
            // { name: "CPU", value: process.cpuUsage().system, inline: true },
            { name: "Memory", value: Math.round(used * 100) / 100 + " MB", inline: true },
             { name: "Uptime", value: client.uptime, inline: true },
        ],
        footer: {
            text: `${localize.translate("$[1] for commands", "`cov help`")}
${localize.translate("$[1] to invite your server", "`cov invite`")}`
        }
    };
    return await  message.channel.send({ embed: embedMsg })
}
module.exports = {
	name: 'sys',
    description: 'System Info',
    aliases:["system","s","sistem"],
	execute(message, args) {
		sys(message)
	},
};