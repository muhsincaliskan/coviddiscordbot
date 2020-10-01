//pupeeter in feature development

module.exports = {
	name: 'vaccine',
    description: 'Help',
    aliases:["aşı","v"],
	execute(message, args) {
        const url="https://biorender.com/covid-vaccine-tracker"
        message.channel.send(url)
	},
};