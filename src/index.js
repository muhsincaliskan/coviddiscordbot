require("dotenv").config()

const covid = require('novelcovid')
const { CanvasRenderService } = require('chartjs-node-canvas');
const Discord = require("discord.js")
const bot = new Discord.Client({
    presence: {
        status: "online",
        activity: {
            type: 'PLAYING',
            name: 'cov help',

        }
    }
})

import { localize, localizeCountry } from "../translations/translate.js"
var Filter = require('bad-words')
var filter = new Filter();
const fs = require("fs")
let raw = fs.readFileSync("./filter.json")
let badWordsList = JSON.parse(raw)
filter.addWords(...badWordsList)

const prefix = "cov"
const MIN_INTERVAL = 1000 * 60
const setup = (ChartJS) => {
    ChartJS.defaults.global.defaultFontColor = '#fff'
    ChartJS.defaults.global.defaultFontStyle = 'bold'
    ChartJS.defaults.global.defaultFontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
    ChartJS.plugins.register({
        beforeInit: function (chart) {
            chart.legend.afterFit = function () { this.height += 35 }
        },
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = '#2F3136';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    })
}

const lineRenderer = new CanvasRenderService(1200, 600, setup)
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    console.log("Bot is running...")
    startTimer()
    console.log("Timer Started")
})
bot.on('message',  message => {
    message.content = message.content.toLowerCase()
    if (!message.content.startsWith(prefix) || message.author.bot) return

    if (message.guild != null)
        setLocale(message.guild.id)

    const args = message.content.slice(prefix.length).split(/ +/)
    const pre = args.shift()
    var command = args.join(" ")
    console.log("---Command: " + pre + " " + `${command == "" ? "cov" : command}`)
    console.log("-----Author Tag: " + message.author.tag)
    console.log("-----Author ID: " + message.author.id)
    if (pre != "") return
    if (!args.length) getall(message)
    else {
        var isSwear = filter.isProfane(command)
        if (isSwear) {
            console.log(command + " deleted")
            // message.delete()
            return
            // 
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
                getsorted(message)
            }
            else if (["all", "global", "world"].includes(command)) {
                getall(message)
            }
            else if (command == "help") {
                message.channel.send({ embed: messageTemplate("", { help: true }) })
            }
            else if (command.indexOf("state") > -1 && args.length > 1) {
                command = args.slice(1).join(" ")
                getState(message, command)
            }
            else if (command.indexOf("graph") > -1 && args.length > 1) {
                command = args.slice(1).join(" ")
                graph(message, localizeCountry(command))
            }
            else if (command == "invite") {
                invite(message)
            }
            else {
                let country = localizeCountry(command)
                getcountry(message, country)
            }
        }
    }
})
function setLocale(id) {
    if (id == "700698867624181800" || id == "500855916296404992") {
        localize.setLocale("tr")
    }
    else
        localize.setLocale("en");
}
async function setCountryTimer() {
    var channel = bot.channels.resolve('671048646774489131')
    const data = await covid.countries({ country: "tr" })
    // var updated=new Date()
    // updated=updated.getHours()+" : "+updated.getMinutes()
    // console.log(updated)
    if (data.todayCases > 0) {
        channel.send({ embed: messageTemplate(data) });
        stopTimer()
        console.log("Message Sended")
        startTimer()
    }
    else {
        setTimeout(setCountryTimer, MIN_INTERVAL)
    }
}

function startTimer() {

    var now = new Date()
    now.setUTCHours((now.getUTCHours() + 3))
    // console.log(now.toUTCString())
    var mins = now.getUTCMinutes()
    var datestring = now.getUTCHours() + ":" + `${(mins < 10) ? "0" + mins : mins}`

    if (datestring == "18:00") {
        setTimeout(setCountryTimer, MIN_INTERVAL)
        console.log("Scheduled Script Called")
    }
    else
        setTimeout(startTimer, MIN_INTERVAL)
}
function stopTimer() {
    clearTimeout()
}
function invite(message) {
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
    message.channel.send({ embed: embedMsg })
}
async function getall(message) {
    let all = await covid.all()
    return message.channel.send({ embed: messageTemplate(all) })
}
async function getcountry(message, command) {
    let specificCountry = await covid.countries({ country: command })
    if (specificCountry.message)
        return message.channel.send(localize.translate(specificCountry.message) + "\n" + localize.translate("You can try ISO code or enter `cov help` for commands"));
    return message.channel.send({ embed: messageTemplate(specificCountry) })
}
async function getsorted(message) {
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
    return message.channel.send({ embed: messageTemplate({ top10Case, top10Deaths, top10Recovered }, { sort: true }) })
}
async function getState(message, command) {
    let states = await covid.states({ state: command })
    if (states.message)
        return message.channel.send(localize.translate(states.message) + "\n" + localize.translate("You can try ISO code or enter `cov help` for commands"))
    return message.channel.send({ embed: messageTemplate(states) })
}
async function graph(message, command) {
    let graphData
    if (["all", "global"].includes(command))
        graphData = { timeline: await covid.historical.all({ days: -1 }) }
    else
        graphData = await covid.historical.countries({ country: command, days: -1 })
    if (graphData.message)
        return message.channel.send(graphData.message + "\nYou can try ISO code.");

    const activeCases = Object.keys(graphData.timeline.cases).map(value => graphData.timeline.cases[value] - graphData.timeline.recovered[value] - graphData.timeline.deaths[value])
    const config = {
        type: "line",
        data: {
            labels: Object.keys(graphData.timeline.cases),
            datasets: [{
                label: localize.translate("Cases"),
                data: Object.values(graphData.timeline.cases),
                backgroundColor: 'rgba(255,198,151, 0.5)',
                pointBackgroundColor: 'rgba(237, 163, 101,1)',
                pointRadius: 4,
            },
            {
                label: localize.translate("Deaths"),
                data: Object.values(graphData.timeline.deaths),
                backgroundColor: 'rgba(213, 65, 65, 0.8)',
                pointBackgroundColor: 'rgba(213, 65, 65,1)',
                pointRadius: 4,
            },
            {
                label: localize.translate("Recovered"),
                data: Object.values(graphData.timeline.recovered),
                backgroundColor: 'rgba(52, 171, 52,0.5)',
                pointBackgroundColor: 'rgba(125, 211, 125,1)',
                pointRadius: 4,
            },
            {
                label: localize.translate("Active"),
                data: activeCases,
                backgroundColor: 'rgba(99, 167, 167, 0.8)',
                pointBackgroundColor: 'rgba(99, 167, 167,1)',
                pointRadius: 4,
            }
            ]
        },
        options: {
            legend: {
                labels: { usePointStyle: true, fontSize: 25 }

            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontSize: 25,


                    }
                }],
                xAxes: [{

                    ticks: {
                        fontSize: 25,
                        beginAtZero: false,

                    }
                }]
            }
        }
    }

    const image = await lineRenderer.renderToBuffer(config);
    return message.channel.send({ embed: messageTemplate(graphData.country, { graph: true, Img: image }) })

}

function messageTemplate(data = "", options = { help: false, sort: false, graph: false }) {
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
        files: "",
        image: { url: "" },
        footer: {
            text: `${localize.translate("$[1] for commands", "`cov help`")}
${localize.translate("$[1] to invite your server", "`cov invite`")}`
        }
    };
    if (options.help) {
        embedMsg.author.name = localize.translate("Commands")
        embedMsg.fields =
            [
                { name: localize.translate("Total Data"), value: "`cov\n{all|global|world}`\n" + localize.translate("shows global COVID-19 Stats"), inline: true },
                { name: localize.translate("Country"), value: "`cov country`\n`{country|iso2|iso3}`\nEx: `cov Turkey`, `cov tr`, `cov tur`", inline: true },
                { name: localize.translate("Leaderboard"), value: "`cov top`\n`cov leaderboard`\n" + localize.translate("shows Top 10 cases,death and recovered stats"), inline: true },
                { name: localize.translate("US State"), value: "`cov state {state name}`\n"+localize.translate( "shows COVID-19 stats for specific US State")+"\nEx: `cov state new york`", inline: true },
                { name: localize.translate("Graph"), value: "`cov graph {all|global|world}`\n`cov graph {country|iso2|iso3}`\nEx: " + "`cov graph all`,`cov graph tr`" + "\n", inline: true },
                { name: localize.translate("Commands"), value: "`cov help`\n" + localize.translate("shows all commands"), inline: true },
                { name: localize.translate("Developer"), value: "killerbean#8689", inline: true },
                { name: localize.translate("Invite"), value: "`cov invite`\n[COVID-19](https://discord.com/api/oauth2/authorize?client_id=700693230093598730&permissions=75776&scope=bot)", inline: true },
                { name: "API", value: "[NovelCOVID](https://github.com/NovelCOVID/node-api)", inline: true }]
    }
    else if (options.sort) {
        embedMsg.author.name = "COVID-19 " + localize.translate("Leaderboard")
        embedMsg.fields = [
            { name: localize.translate("Top 10 Cases"), value: data.top10Case, inline: true },
            { name: localize.translate('Top 10 Deaths'), value: data.top10Deaths, inline: true, },
            { name: localize.translate('Top 10 Recovered'), value: data.top10Recovered, inline: true }
        ]
    }
    else if (options.graph == true) {
        embedMsg.author.name = `COVID-19 ${(data == "") ? "Global" : data} Timeline`
        if (options.Img) {
            embedMsg.files = [new Discord.MessageAttachment(options.Img, 'graph.png')]
            embedMsg.image.url = "attachment://graph.png"
        }

    }
    else {
        embedMsg.fields = [
            { name: localize.translate("Cases"), value: data.cases.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Active'), value: data.active.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Deaths'), value: data.deaths.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Recovered'), value: "no_data", inline: true },
            { name: localize.translate('Critical'), value: "no_data", inline: true },
            { name: localize.translate('Tests'), value: data.tests.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Cases Today'), value: data.todayCases.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Deaths Today'), value: data.todayDeaths.toLocaleString('en-US'), inline: true },
            { name: localize.translate('Recovered Today'), value: "no_data", inline: true }
        ]
        if (data.country != undefined) {
            embedMsg.thumbnail.url = data.countryInfo.flag
            embedMsg.author.name = "COVID-19 " + localize.translate("Statistics for $[1]($[2])", data.country, data.countryInfo.iso2)
            embedMsg.fields[3].value = data.recovered.toLocaleString('en-US')
            embedMsg.fields[4].value = data.critical.toLocaleString('en-US')
            embedMsg.fields[8].value = data.todayRecovered.toLocaleString('en-US')
        }
        else if (data.country == undefined && data.state == undefined) {
            embedMsg.author.name = "COVID-19 " + localize.translate("Total Data for $[1] countries", data.affectedCountries)
            embedMsg.fields[3].value = data.recovered.toLocaleString('en-US')
            embedMsg.fields[4].value = data.critical.toLocaleString('en-US')
            embedMsg.fields[8].value = data.todayRecovered.toLocaleString('en-US')
        }
        else if (data.state != undefined) {
            embedMsg.author.name = "COVID-19 " + localize.translate("Statistics for $[1]", data.state)
            embedMsg.fields.splice(3, 2)
            embedMsg.fields.pop()
        }
    }
    return embedMsg
}

bot.login(process.env.TOKEN)