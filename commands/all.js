const covid = require('novelcovid')
const {localize}=require("../translations/translate.js")
async function getAll(message) {
    let all = await covid.all()
    const embedMsg = {
        color: 0x0099ff,
        author: {
            name: "COVID-19 " + localize.translate("Total Data for $[1] countries", all.affectedCountries),
            icon_url: 'https://i.imgur.com/nP4sNCes.jpg',
        },
        fields: [
            { name: localize.translate("Cases"), value: all.cases.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Active'), value: all.active.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Deaths'), value: all.deaths.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Recovered'), value:  all.recovered.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Critical'), value: all.critical.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Tests'), value: all.tests.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Cases Today'), value: all.todayCases.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Deaths Today'), value: all.todayDeaths.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Recovered Today'), value: all.todayRecovered.toLocaleString('en-US'), inline: true }
        ],
        footer: {
            text: `${localize.translate("$[1] for commands", "`cov help`")} || ${localize.translate("$[1] to invite your server", "`cov invite`")}
${"Türkçe için `cov setlan tr`|| `cov setlan en` for English"}`
    
        }
    }
    return message.channel.send({ embed: embedMsg })
}
module.exports = {
	name: 'all',
    description: 'Global data command',
    aliases: ['world', '',"global"],
	execute(message, args) {
		getAll(message)
	},
};