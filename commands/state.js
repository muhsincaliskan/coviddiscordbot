const covid = require('novelcovid')
const { localize } = require("../translations/translate.js")

async function getState(message, command) {
    let states = await covid.states({ state: command })
    if (states.message)
        return message.channel.send("("+command+") "+localize.translate(states.message) + "\n" + localize.translate("You can try ISO code or enter `cov help` for commands"))


    const embedMsg = {
            color: 0x0099ff,
            author: {
                name: "COVID-19 " + localize.translate("Statistics for $[1]", states.state),
                icon_url: 'https://i.imgur.com/nP4sNCes.jpg',
            },
          
            fields: [
            
            { name: localize.translate("Cases"), value: states.cases.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Active'), value: states.active.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Deaths'), value: states.deaths.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Recovered'), value: states.recovered.toLocaleString('en-US'), inline: true },
            { name: localize.translate("Population"), value: states.population.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Tests'), value: states.tests.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Cases Today'), value: states.todayCases.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Deaths Today'), value: states.todayDeaths.toLocaleString('en-US'), inline: true },
            ],
           
            footer: {
                text: `${localize.translate("$[1] for commands", "`cov help`")} || ${localize.translate("$[1] to invite your server", "`cov invite`")}
${"Türkçe için `cov setlan tr`|| `cov setlan en` for English"}`
    
            }
        };

    return await message.channel.send({ embed: embedMsg })
}

module.exports = {
    name: 'state',
    description: 'State command',
    aliases: ['s', "eyalet"],
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(localize.translate("You didn't provide any state name")+`, ${message.author}!`);
        } else {
            const state = args.join(" ")
            getState(message, state)
        }
    },
};