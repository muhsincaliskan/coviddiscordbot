const {localize}=require("../translations/translate.js")
  const embedMsg = {
    color: 0x0099ff,
    author: {
        name: localize.translate("Commands"),
        icon_url: 'https://i.imgur.com/nP4sNCes.jpg',
    },
    // description: '',
    // thumbnail: {
    //     url: "",
    // },
    fields:  [
        { name: localize.translate("Total Data"), value: "`cov\n{all|global|world}`\n" + localize.translate("shows global COVID-19 Stats"), inline: true },
        { name: localize.translate("Country"), value: "`cov {country|iso2|iso3}`\nEx: `cov Turkey`, `cov tr`, `cov tur`", inline: true },
        { name: localize.translate("Leaderboard"), value: "`cov top`\n`cov leaderboard`\n" + localize.translate("shows Top 10 cases,death and recovered stats"), inline: true },
        { name: localize.translate("US State"), value: "`cov state {state name}`\n" + localize.translate("shows COVID-19 stats for specific US State") + "\nEx: `cov state new york`", inline: true },
        { name: localize.translate("Graph"), value: "`cov graph {all|global|world}`\n`cov graph {country|iso2|iso3}`\nEx: " + "`cov graph all`,`cov graph tr`" + "\n", inline: true },
        { name: localize.translate("Language"), value: "`cov setlan en`\n`cov setlan tr`\n" + localize.translate("change language TR/EN. Default language is English"), inline: true },
        { name: localize.translate("Commands"), value: "`cov help`\n" + localize.translate("shows all commands"), inline: true },
        { name: localize.translate("System"), value: "`cov sys`\n" + localize.translate("shows system info such as Ping,Ram,Memory etc."), inline: true },
        { name: localize.translate("Developer"), value: "killerbean#8689", inline: true },
        { name: localize.translate("Invite"), value: "`cov invite`\n[COVID-19](https://discord.com/api/oauth2/authorize?client_id=700693230093598730&permissions=75776&scope=bot)", inline: true },
        { name: "API", value: "To learn more info about API\n[NovelCOVID](https://github.com/NovelCOVID/node-api)", inline: true }],
    footer: {
        text: `${localize.translate("$[1] for commands", "`cov help`")} || ${localize.translate("$[1] to invite your server", "`cov invite`")}
${"Türkçe için `cov setlan tr`|| `cov setlan en` for English"}`

    }
};
//dinamik yapılcak
module.exports = {
	name: 'help',
    description: 'Help',
    aliases:["yardım","komutlar","commands","h"],
	execute(message, args) {
         message.channel.send({ embed: embedMsg })
	},
};