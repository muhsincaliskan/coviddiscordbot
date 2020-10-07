const covid = require('novelcovid');
const { localize, localizeCountry } = require("../translations/translate.js")
async function getCountry(message = "", countries) {
    let countryData = await covid.countries({ country: countries })
    let yesterday=await covid.yesterday.countries({country:countries})
    if (countryData[0]==undefined || countryData[1]==undefined)
        return message.channel.send("(" + countries + ") " + localize.translate("Country not found or doesn't have any cases") +
            "\n" + localize.translate("You can try ISO code or enter `cov help` for commands"));

    countryData=countryData.map((country,i)=>({
        ...country,
        todayActives:country.active-yesterday[i].active,
        todayCriticals:country.critical-yesterday[i].critical,
        todayTests:country.tests-yesterday[i].tests,
    }) )       
    const embedMsg = {
        color: 0x0099ff,
        author: {
            name: 'COVID -19 by killerbean#8689',
            icon_url: 'https://i.imgur.com/nP4sNCes.jpg',
        },
        title: "COVID-19 " + localize.translate("Comparasion between $[1] & $[2]", countryData[0].country, countryData[1].country),
        fields: [
            {
                name: localize.translate("Cases"),
                value: "**" + countryData[0].country + ":** " + countryData[0].cases.toLocaleString('en-US') + " ("+(countryData[0].todayCases>=0?"+":"-")  +String(countryData[0].todayCases.toLocaleString('en-US')).replace(/-/gi,"")  + ")\n" +
                    "**" + countryData[1].country + ":** " + countryData[1].cases.toLocaleString('en-US') + " ("+(countryData[1].todayCases>=0?"+":"-" ) + String(countryData[1].todayCases.toLocaleString('en-US')).replace(/-/gi,"")+ ")", inline: true
            },
            {
                name: localize.translate('Active'), 
                value: "**" + countryData[0].country + ":** " + countryData[0].active.toLocaleString('en-US') + " ("+(countryData[0].todayActives>=0?"+":"-")  + String(countryData[0].todayActives.toLocaleString('en-US')).replace(/-/gi,"")+ ")\n" +
                    "**" + countryData[1].country + ":** " + countryData[1].active.toLocaleString('en-US') + " (" +(countryData[1].todayActives>=0?"+":"-") +String(countryData[1].todayActives.toLocaleString('en-US')).replace(/-/gi,"") + ")", inline: true
            },
            {
                name: localize.translate('Deaths'), 
                value: "**" + countryData[0].country + ":** " + countryData[0].deaths.toLocaleString('en-US') + " ("+(countryData[0].todayDeaths>=0?"+":"-")  + String(countryData[0].todayDeaths.toLocaleString('en-US')).replace(/-/gi,"")  + ")\n" +
                    "**" + countryData[1].country + ":** " + countryData[1].deaths.toLocaleString('en-US') + " (" +(countryData[1].todayDeaths>=0?"+":"-") +String(countryData[1].todayDeaths.toLocaleString('en-US')).replace(/-/gi,"")+ ")", inline: true
            },
            {
                name: localize.translate('Recovered'), 
                value: "**" + countryData[0].country + ":** " + countryData[0].recovered.toLocaleString('en-US')+ " (" +(countryData[0].todayRecovered>=0?"+":"-")+ String( countryData[0].todayRecovered.toLocaleString('en-US')).replace(/-/gi,"")  + ")\n" +
                    "**" + countryData[1].country + ":** " + countryData[1].recovered.toLocaleString('en-US') + "  (" +(countryData[1].todayRecovered>=0?"+":"-")+ String(countryData[1].todayRecovered.toLocaleString('en-US')).replace(/-/gi,"")+ ")", inline: true
            },
            {
                name: localize.translate('Critical'), 
                value: "**" + countryData[0].country + ":** " + countryData[0].critical.toLocaleString('en-US') + " (" +(countryData[0].todayCriticals>=0?"+":"-")+ String(countryData[0].todayCriticals.toLocaleString('en-US')).replace(/-/gi,"")  + ")\n" +
                    "**" + countryData[1].country + ":** " + countryData[1].critical.toLocaleString('en-US') + " ("+(countryData[1].todayCriticals>=0?"+":"-" )+ String(countryData[1].todayCriticals.toLocaleString('en-US')).replace(/-/gi,"")+ ")", inline: true
            },
            {
                name: localize.translate('Tests'), 
                value: "**" + countryData[0].country + ":** " + countryData[0].tests.toLocaleString('en-US') + " ("+(countryData[0].todayTests>=0?"+":"-") + countryData[0].todayTests.toLocaleString('en-US') + ")\n" +
                    "**" + countryData[1].country + ":** " + countryData[1].tests.toLocaleString('en-US') + " (" +(countryData[1].todayTests>=0?"+":"-")+ countryData[1].todayTests.toLocaleString('en-US')+")", inline: true
            },
            {
                name: localize.translate('Population'), 
                value: "**" + countryData[0].country + ":** " + countryData[0].population.toLocaleString('en-US') + " \n" +
                    "**" + countryData[1].country + ":** " + countryData[1].population.toLocaleString('en-US'), inline: true
            },
            {
                name: localize.translate('Infection Rate'),
                 value: "**" + countryData[0].country + ":** " + (countryData[0].casesPerOneMillion/10000).toFixed(4).toLocaleString('en-US') + "%\n" +
                    "**" + countryData[1].country + ":** " + (countryData[1].casesPerOneMillion/10000).toFixed(4).toLocaleString('en-US') + "%" , inline: true
            },
            {
                name: localize.translate('Fatality Rate'), 
                value: "**" + countryData[0].country + ":** " + (countryData[0].deaths/countryData[0].cases*100).toFixed(4).toLocaleString('en-US') + "%\n" +
                    "**" + countryData[1].country + ":** " + (countryData[0].deaths/countryData[0].cases*100).toFixed(4).toLocaleString('en-US') + "%" , inline: true
            },
            {
                name: localize.translate('Critical Rate'), 
                value: "**" + countryData[0].country + ":** " + (countryData[0].critical/countryData[0].active*100).toFixed(4).toLocaleString('en-US') + "%\n" +
                    "**" + countryData[1].country + ":** " + (countryData[1].critical/countryData[1].active*100).toLocaleString('en-US') + "%", inline: true
            },
            {
                name: localize.translate('Recovery Rate'), 
                value: "**" + countryData[0].country + ":** " + (countryData[0].recovered/countryData[0].cases*100).toFixed(4).toLocaleString('en-US') + "%\n" +
                    "**" + countryData[1].country + ":** " +(countryData[1].recovered/countryData[1].cases*100).toFixed(4).toLocaleString('en-US') + "%", inline: true
            },
            {
                name: localize.translate('Test Rate'), 
                value: "**" + countryData[0].country + ":** " + (countryData[0].testsPerOneMillion/10000).toFixed(4).toLocaleString('en-US') + "%\n" +
                    "**" + countryData[1].country + ":** " +( countryData[1].testsPerOneMillion/10000).toFixed(4).toLocaleString('en-US') + "%", inline: true
            },
        ],
        footer: {
            text: `${localize.translate("$[1] for commands", "`cov help`")} || ${localize.translate("$[1] to invite your server", "`cov invite`")}
${"Türkçe için `cov setlan tr`|| `cov setlan en` for English"}`

        }
    }
    return await message.channel.send({ embed: embedMsg })
}


module.exports = {
    name: 'compare',
    description: 'Compare two country',
    aliases: ['cmp','diff'],
    execute(message, args) {
        if (args.length < 2) {
            return message.channel.send(localize.translate("You didn't provide any country name") + `, ${message.author}!`);
        }
        else {
            let country_1 = localizeCountry(args[0])
            let country_2 = localizeCountry(args[1])
            getCountry(message, [country_1, country_2])
        }
    },
};