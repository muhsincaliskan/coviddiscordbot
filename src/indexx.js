require("dotenv").config()
const { NovelCovid } = require('novelcovid')
const covid = new NovelCovid()
// const { CanvasRenderService } = require('chartjs-node-canvas');
const Discord = require("discord.js")
const bot = new Discord.Client()

var fs = require("fs")
let raw = fs.readFileSync("./filter.json")
let filter = JSON.parse(raw)




bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setPresence({ game: { name: 'COVID-19' }, status: 'online' })
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
             else if (command.startsWith("graph")) {
            //     command=command.slice(command.length+1)
            //     graph(command)
                message.channel.send("Not implemented yet.")
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
    if (specificCountry.message) 
       return message.channel.send(specificCountry.message + "\nYou can try ISO code.");
    return message.channel.send({ embed: messageTemplate(specificCountry) })
}
async function getsorted(message, sorttype) {
    let sortedCaseData = await covid.countries(null, { sort: "cases" })
    let sortedDeathsData=await covid.countries(null, { sort: "deaths" })
    let sortedRecoveredData=await covid.countries(null, { sort: "recovered" })
 
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
        fields: [],
        footer: { text: '`cov help` for commands' }
    };
    if (help) {
        embedMsg.author.name = "Commands"          
        embedMsg.fields=
        [
            {name:"Total Data",value:"`cov` or `cov all`\nshows global COVID-19 Stats",inline:true},
            {name:"Country",value:"`cov <country country name||iso2||iso3>`\nEx: `cov Turkey`, `cov tr`, `cov tur`",inline:true},
            {name:"Leaderboard",value:"`cov top`, `cov leaderboard`\nshows Top 10 cases,death and recovered stats",inline:true},
            {name:"US State",value:"`cov usa <state name>`\n Ex: `cov usa new york`",inline:true},
            {name:"Graph",value:"`cov graph all`, `cov graph<country name||iso2||iso3>`\nNot implemented",inline:true},
            {name:"Commands",value:"`cov help`\n shows all commands",inline:true},
            {name:"Developer",value:"killerbean#8689",inline:true},
            {name:"Invite",value:"[COVID-19](https://discord.com/api/oauth2/authorize?client_id=700693230093598730&permissions=75776&scope=bot)",inline:true},
            {name:"API", value:"[NovelCOVID](https://github.com/NovelCOVID/node-api)",inline:true}]
    }
    else if (sort) {
        embedMsg.author.name = "COVID-19 Leaderboard"
        embedMsg.fields=[
            {name: "Top 10 Cases",value: data.top10Case,inline: true},
            {name: 'Top 10 Deaths',value: data.top10Deaths,inline: true,},
            {name: 'Top 10 Recovered',value: data.top10Recovered,inline: true}
        ]
    }
    else {
        embedMsg.fields = [
            {name: "Cases",value: data.cases.toLocaleString('en-US'),inline: true},
            {name: 'Active',value: data.active.toLocaleString('en-US'),inline: true},
            {name: 'Recovered',value: "",inline: true},
            {name: 'Critical',value: "",inline: true},
            {name: 'Deaths',value: data.deaths.toLocaleString('en-US'),inline: true},
            {name: 'Tests',value: data.tests.toLocaleString('en-US'),inline: true},
            {name: 'Cases Today',value: data.todayCases.toLocaleString('en-US'),inline: true},
            {name: 'Deaths Today',value: data.todayDeaths.toLocaleString('en-US'),inline: true}]
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
bot.login(process.env.BOT_TOKEN)