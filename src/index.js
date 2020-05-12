// require("dotenv").config()
const { NovelCovid } = require('novelcovid')
const covid = new NovelCovid()
const Discord = require("discord.js")
const bot = new Discord.Client()

var fs = require("fs")
let raw = fs.readFileSync("./filter.json")
let filter = JSON.parse(raw)

let rawReact = fs.readFileSync("./reactions.json")
let swearReaction = JSON.parse(rawReact)
var swearCounter = 0

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setPresence({ game: { name: 'COVID-19' }, status: 'invisible' })
})
bot.on('message', message => {
    message.content = message.content.toLowerCase()
    
    if (message.content.startsWith("cov") && message.content.length==3) {
        getall(message)
    }
    else if (message.content.startsWith("cov ")) {
        var arr = message.content.split(" ")
        arr = arr.slice(1)
        console.log(arr)
        var getFilterInfo = search(filter, arr)
        var isSwear = getFilterInfo.isSwear
        var Swear = getFilterInfo.Swear
        var command=""
        for (let index = 0; index < arr.length; index++) {
                command = command+" "+ arr[index];   
        }
        command=command.trimStart()
        command=command.trimEnd()
        console.log(command)
        if (isSwear) {
            swearCounter++;
            console.log(Swear + " deleted")
            message.delete()
            //this place for trolling :D--------------------------------
            if (swearCounter > 6 && swearCounter < 15) {
                var indexofReaction = Math.floor((Math.random() * swearReaction.length) + 0)
                message.reply("\n" + swearReaction[indexofReaction])
            }
            else if (swearCounter == 15) {
                message.channel.send("Sizle uğraşamayacam\nBulaşmam gereken insanlar var.")
                swearCounter = 0
            }//---------------------------------------------------------
        }
        else if (message.content == ("cov " + command)) {
            if (command == "top" || command == "leaderboard") {
                getsorted(message, "cases")
            }
            else if (command == "all") {
                getall(message)
            }
            else if (command == "help") {
                message.channel.send({ embed: messageTemplate("", true) })

            }
            else if (command.startsWith("usa ")) {
                command = command.slice(4)
                getState(message, command)
            }
            else {
                getcountry(message, command)
            }
        }
        else {
            message.channel.send("Too much arguments!\nYou can try ISO code.")
        }
    }
})
async function getall(message) {
    let all = await covid.all()
    message.channel.send({ embed: messageTemplate(all) })
}
async function getcountry(message, command) {
    let specificCountry = await covid.countries(command)
    if (specificCountry.message === undefined) {
        message.channel.send({ embed: messageTemplate(specificCountry) })
    }
    else
        message.channel.send(specificCountry.message + "\nYou can try ISO code.");
}
async function getsorted(message, sorttype) {
    let sortedCaseData = await covid.countries(null, { sort: "cases" })
    let sortedDeathsData=await covid.countries(null, { sort: "deaths" })
    let sortedRecoveredData=await covid.countries(null, { sort: "recovered" })
    // var top10Case=new JSONObject()
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
    let states = await covid.states(command)
    if (states.message === undefined) {
        message.channel.send({ embed: messageTemplate(states) })
    }
    else
        message.channel.send(states.message + "\nYou can try ISO code.");
}
function search(data, word) {
    let Swear = ""
    for (let index = 0; index < data.length; index++) {
        for (let index2 = 0; index2 < word.length; index2++) {
            if (word[index2].startsWith(data[index])) {
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
        fields: [

        ],
        footer: { text: '`cov help` for commands' }
    };
    if (help) {
        embedMsg.author.name = "Commands"
        embedMsg.description =
            "GET TOTAL DATA: `cov` or `cov all`\n\n" +
            "GET SPECIFIC COUNTRY DATA: `cov country name`,\n `cov country iso2` or `iso3` code\n" +
            "Example: `cov Turkey`, `cov tr`, `cov tur`\n\n" +
            "GET TOP 10 CASE: `cov top`, `cov leaderboard`\n" +
            "Get Commands: `cov help`\n\n" 
           
        embedMsg.fields=[{
            name:"Developer",
            value:"killerbean#8689",
            inline:true
        },{name:"API", value:"[NovelCOVID](https://github.com/NovelCOVID/node-api)",inline:true}]
    }
    else if (sort) {
        embedMsg.author.name = "COVID-19 Leaderboard"
        embedMsg.fields=[
            {
                name: "Top 10 Cases",
                value: data.top10Case,
                inline: true
            },
          
            {
                name: 'Top 10 Deaths',
                value: data.top10Deaths,
                inline: true,
            },
           
            {
                name: 'Top 10 Recovered',
                value: data.top10Recovered,
                inline: true,
            }
        ]
    }
    else {
        embedMsg.fields = [{
            name: "Cases",
            value: data.cases.toLocaleString('en-US'),
            inline: true
        },
        {
            name: 'Active',
            value: data.active.toLocaleString('en-US'),
            inline: true,
        },
        {
            name: 'Recovered',
            value: "",
            inline: true,
        },
        {
            name: 'Critical',
            value: "",
            inline: true,
        },
        {
            name: 'Deaths',
            value: data.deaths.toLocaleString('en-US'),
            inline: true,
        },
        {
            name: 'Tests',
            value: data.tests.toLocaleString('en-US'),
            inline: true,
        },
        {
            name: 'Cases Today',
            value: data.todayCases.toLocaleString('en-US'),
            inline: true,
        },
        {
            name: 'Deaths Today',
            value: data.todayDeaths.toLocaleString('en-US'),
            inline: true,
        }]
        if (data.country != undefined) {
            embedMsg.thumbnail.url = data.countryInfo.flag
            embedMsg.author.name = "COVID-19 Statistics for " + data.country + " (" + data.countryInfo.iso2 + ")"
            embedMsg.fields[2].value=data.recovered.toLocaleString('en-US')
            embedMsg.fields[3].value=data.critical.toLocaleString('en-US')
        }
        else if (data.country == undefined && data.state == undefined) {
            embedMsg.author.name = "COVID-19 Total Data for " + data.affectedCountries + " countries"
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