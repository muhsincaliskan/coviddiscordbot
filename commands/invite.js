const {localize,localizeCountry}=require("../translations/translate.js")
const embedMsg = {
    color: 0x0099ff,
    author: {
        name: 'COVID -19 by killerbean#8689',
        icon_url: 'https://cdn.discordapp.com/avatars/451506381736902656/937b1075d9942fc7d7ef599dfd604230.png?size=256',
    },
    title: `Invite`,
    url: ' https://discord.com/api/oauth2/authorize?client_id=700693230093598730&permissions=75776&scope=bot',
    footer: {
        text: `${localize.translate("$[1] for commands", "`cov help`")}
${localize.translate("$[1] to invite your server", "`cov invite`")}`
    }
};
module.exports = {
	name: 'invite',
    description: 'Invite command',
    aliases: ['davet', 'i'],
	execute(message, args) {
        if (!args.length) {
            message.channel.send({ embed: embedMsg })
        } 
		
	},
};
