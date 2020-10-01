const covid = require('novelcovid')
const { localize } = require("../translations/translate.js")
async function getSorted(message) {
    
    let sortedCaseData = await covid.countries({ sort: "cases" })
    let sortedDeathsData = await covid.countries({ sort: "deaths" })
    let sortedRecoveredData = await covid.countries({ sort: "recovered" })

    var top10Case = []
    var top10Deaths = []
    var top10Recovered = []
    for (let index = 0; index < 10; index++) {
        top10Case[index] = index + 1 + ". **" + sortedCaseData[index].country + ": **" + sortedCaseData[index].cases.toLocaleString("en-US")
        top10Deaths[index] = index + 1 + ". **" + sortedDeathsData[index].country + ": **" + sortedDeathsData[index].deaths.toLocaleString("en-US")
        top10Recovered[index] = index + 1 + ". **" + sortedRecoveredData[index].country + ": **" + sortedRecoveredData[index].recovered.toLocaleString("en-US")
    }
    top10Case = top10Case.join("\n")
    top10Deaths = top10Deaths.join("\n")
    top10Recovered = top10Recovered.join("\n")
    const embedMsg = {
        color: 0x0099ff,
        author: {
            name: "COVID-19 " + localize.translate("Leaderboard"),
            icon_url: 'https://i.imgur.com/nP4sNCes.jpg',
        },
        fields: [
            { name: localize.translate("Top 10 Cases"), value: top10Case, inline: true },
            { name: localize.translate('Top 10 Deaths'), value: top10Deaths, inline: true, },
            { name: localize.translate('Top 10 Recovered'), value: top10Recovered, inline: true }
        ],
        
        footer: {
            text: `${localize.translate("$[1] for commands", "`cov help`")} || ${localize.translate("$[1] to invite your server", "`cov invite`")}
${"Türkçe için `cov setlan tr`|| `cov setlan en` for English"}`

        }
    };
    return await message.channel.send({ embed:  embedMsg })
}
module.exports = {
	name: 'top',
    description: 'TOP 10',
    aliases:["leaderboard","l"],
	execute(message, args) {
		getSorted(message)
	},
};

//ayrı ayrı olacak şekilde argüman