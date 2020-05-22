// require("dotenv").config()

const covid = require('novelcovid')
// const { CanvasRenderService } = require('chartjs-node-canvas');
const Discord = require("discord.js")
const bot = new Discord.Client()

import {localize,localizeCountry} from "../translations/translate.js"
var fs = require("fs")
let raw = fs.readFileSync("./filter.json")
let filter = JSON.parse(raw)
const prefix="cov"
// const setup = (ChartJS) => {
//     ChartJS.defaults.global.defaultFontColor='#fff'
//     ChartJS.defaults.global.defaultFontStyle='bold'
//     ChartJS.defaults.global.defaultFontFamily='Helvetica Neue, Helvetica, Arial, sans-serif'
//     ChartJS.plugins.register({
//       beforeInit: function(chart){
//         chart.legend.afterFit = function() { this.height += 35 }
//       },
//       beforeDraw: (chart) => {
//         const ctx = chart.ctx;
//         ctx.save();
//         ctx.fillStyle = '#2F3136';
//         ctx.fillRect(0, 0, chart.width, chart.height);
//         ctx.restore();
//       }
//     })
//   }
    
// const lineRenderer = new CanvasRenderService(1200, 600, setup)
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setPresence({ game: { name: 'COVID-19' }, status: 'online' })
    bot.user.setActivity('cov help',{type:'CUSTOM_STATUS'})
})
bot.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return

    setLocale(message.guild.id)
    message.content = message.content.toLowerCase()
    
    const args = message.content.slice(prefix.length).split(/ +/)
    args.shift()
    console.log("Command: "+args.join(" "))
    if (!args.length) getall(message)
    else {
        
        var getFilterInfo = search(filter, args)
        var isSwear = getFilterInfo.isSwear
        var Swear = getFilterInfo.Swear
        var command=args[0]
        if (isSwear) {
            swearCounter++;
            console.log(Swear + " deleted")
            return
            // message.delete()
            //this is for trolling :D--------------------------------
            // if (swearCounter > 6 && swearCounter < 15) {
            //     var indexofReaction = Math.floor((Math.random() * swearReaction.length) + 0)
            //     message.reply("\n" + swearReaction[indexofReaction])
            // }
            // else if (swearCounter == 15) {
            //     message.channel.send("Sizle uğraşamayacam\nBulaşmam gereken insanlar var.")
            //     swearCounter = 0
            // }//---------------------------------------------------------
        }
        else {
            if (command == "top" || command == "leaderboard") {
                getsorted(message, "cases")
            }
            else if (command == "all") {
                getall(message)
            }
            else if (command == "help") {
                message.channel.send({ embed: messageTemplate("",true) })
            }
            else if (command=="state"&&args.length>1) {
                command=args.slice(1).join(" ")
                getState(message, command)
            }
            else if (command=="graph"&&args.length>1) {
                command=args.slice(1).join(" ")
                // graph(message,command)
                message.channel.send("Not implemented yet.")
             }
            else {
                command=args.join(" ")
                let country=localizeCountry(command)
                getcountry(message, country)
            }
        }
    }
})
function setLocale(id){
    if (id=="700698867624181800"||id=="500855916296404992") {
        localize.setLocale("tr")
    }
    else
        localize.setLocale("en");
}
async function getall(message) {
    let all = await covid.all()
    message.channel.send({ embed: messageTemplate(all) })
}
async function getcountry(message, command) {
    let specificCountry = await covid.countries({country:command})
    if (specificCountry.message) 
       return message.channel.send(specificCountry.message + "\nYou can try ISO code.");
    return message.channel.send({ embed: messageTemplate(specificCountry) })
}
async function getsorted(message, sorttype) {
    let sortedCaseData = await covid.countries( { sort: "cases" })
    let sortedDeathsData=await covid.countries( { sort: "deaths" })
    let sortedRecoveredData=await covid.countries( { sort: "recovered" })
 
    var top10Case = []
    var top10Deaths=[]
    var top10Recovered=[]
    for (let index = 0; index < 10; index++) {
             top10Case[index] = index + 1 + ". **" + sortedCaseData[index].country + ": **" + sortedCaseData[index].cases.toLocaleString("en-US")
             top10Deaths[index] = index + 1 + ". **" + sortedDeathsData[index].country + ": **" + sortedDeathsData[index].deaths.toLocaleString("en-US")
             top10Recovered[index] = index + 1 + ". **" + sortedRecoveredData[index].country + ": **" + sortedRecoveredData[index].recovered.toLocaleString("en-US")
    }
    top10Case=top10Case.join("\n")
    top10Deaths=top10Deaths.join("\n")
    top10Recovered=top10Recovered.join("\n")
    message.channel.send({ embed: messageTemplate({top10Case,top10Deaths,top10Recovered},false,true) })
}
async function getState(message, command) {
    let states = await covid.states({state:command}) 
    if (states.message) 
        return message.channel.send(states.message + "\nYou can try ISO code.");
    return message.channel.send({ embed: messageTemplate(states) })
}
// async function graph(){
//     let graphData = ['global', 'all'].includes(args[0].toLowerCase()) ? {timeline: await api.historical.all({days: -1})} : await api.historical.countries({ country: args[0], days: -1 })

    
    
// }
function search(data, word) {
    let Swear = ""
    for (let index = 0; index < data.length; index++) {
        for (let index2 = 0; index2 < word.length; index2++) {
            if (data[index].includes(word[index2])) {
                Swear = word[index2]
                return { isSwear: true, Swear: Swear }
            }
        }
    }
    return { isSwear: false, Swear: Swear }
}
function messageTemplate(data = "", help = false,sort=false) {
    const embedMsg = {
        color: 0x0099ff,
        author: {
            name: '',
            icon_url: 'https://i.imgur.com/nP4sNCes.jpg',
        },
        description: '',
        thumbnail: {
            url: "",
        },
        fields: [],
        footer: { text: localize.translate("$[1] for commands","`cov help`") }
    };
    if (help) {
        embedMsg.author.name = localize.translate("Commands")          
        embedMsg.fields=
        [
            {name:localize.translate("Total Data"),value:"`cov` or `cov all`\n"+localize.translate("shows global COVID-19 Stats"),inline:true},
            {name:localize.translate("Country"),value:"`cov country name||iso2||iso3>`\nEx: `cov Turkey`, `cov tr`, `cov tur`",inline:true},
            {name:localize.translate("Leaderboard"),value:"`cov top`, `cov leaderboard`\n"+localize.translate("shows Top 10 cases,death and recovered stats"),inline:true},
            {name:localize.translate("US State"),value:"`cov state <state name>`\n Ex: `cov state new york`",inline:true},
            {name:localize.translate("Graph"),value:"`cov graph all`, `cov graph<country name||iso2||iso3>`\n"+localize.translate("Not implemented yet."),inline:true},
            {name:localize.translate("Commands"),value:"`cov help`\n"+localize.translate("shows all commands"),inline:true},
            {name:localize.translate("Developer"),value:"killerbean#8689",inline:true},
            {name:localize.translate("Invite"),value:"[COVID-19](https://discord.com/api/oauth2/authorize?client_id=700693230093598730&permissions=75776&scope=bot)",inline:true},
            {name:"API", value:"[NovelCOVID](https://github.com/NovelCOVID/node-api)",inline:true}]
    }
    else if (sort) {
        embedMsg.author.name = "COVID-19 "+localize.translate("Leaderboard")
        embedMsg.fields=[
            {name: localize.translate("Top 10 Cases"),value: data.top10Case,inline: true},
            {name: localize.translate('Top 10 Deaths'),value: data.top10Deaths,inline: true,},
            {name: localize.translate('Top 10 Recovered'),value: data.top10Recovered,inline: true}
        ]
    }
    else {
        embedMsg.fields =[
            {name: localize.translate("Cases"),value: data.cases.toLocaleString('en-US'),inline: true},
            {name: localize.translate('Active'),value: data.active.toLocaleString('en-US'),inline: true},
            {name: localize.translate('Recovered'),value: "",inline: true},
            {name: localize.translate('Critical'),value: "",inline: true},
            {name: localize.translate('Deaths'),value: data.deaths.toLocaleString('en-US'),inline: true},
            {name: localize.translate('Tests'),value: data.tests.toLocaleString('en-US'),inline: true},
            {name: localize.translate('Cases Today'),value: data.todayCases.toLocaleString('en-US'),inline: true},
            {name: localize.translate('Deaths Today'),value: data.todayDeaths.toLocaleString('en-US'),inline: true}
        ]
        if (data.country != undefined) {
            embedMsg.thumbnail.url = data.countryInfo.flag
            embedMsg.author.name = "COVID-19 "+localize.translate("Statistics for $[1]($[2])",data.country,data.countryInfo.iso2) 
            embedMsg.fields[2].value=data.recovered.toLocaleString('en-US')
            embedMsg.fields[3].value=data.critical.toLocaleString('en-US')
        }
        else if (data.country == undefined && data.state == undefined) {
            embedMsg.author.name ="COVID-19 "+localize.translate("Total Data for $[1] countries",data.affectedCountries)
            embedMsg.fields[2].value=data.recovered.toLocaleString('en-US')
            embedMsg.fields[3].value=data.critical.toLocaleString('en-US')
        }
        else if (data.state != undefined) {
            embedMsg.author.name = "COVID-19 Statistics for " + data.state
            embedMsg.fields.splice(2, 2)
        }
    }
    return embedMsg
}
bot.login("NzAwNjkzMjMwMDkzNTk4NzMw.Xpmrmg.iMWsVpOY20H31yfhLE0o4nXJV2k")
