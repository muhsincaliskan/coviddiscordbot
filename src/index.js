require("dotenv").config()
const { NovelCovid } = require('novelcovid')
const covid = new NovelCovid()
const Discord = require("discord.js")
const bot = new Discord.Client()

var fs = require("fs")
let raw = fs.readFileSync("./filter.json")
let filter = JSON.parse(raw)

let rawReact=fs.readFileSync("./reactions.json")
let swearReaction=JSON.parse(rawReact)
var swearCounter=0

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setPresence({ game: { name: 'COVID-19' }, status: 'online' })
})
bot.on('message', message => {
    message.content = message.content.toLowerCase()
    if (message.content.startsWith("cov") && message.content.endsWith("cov")) {
        getall(message)
    }
    else if (message.content.startsWith("cov ")) {
            var arr = message.content.split(" ")
            var command = arr[1]
            console.log(arr)
            var getFilterInfo = search(filter, arr)
            var isSwear = getFilterInfo.isSwear
            var Swear = getFilterInfo.Swear
            
            if (isSwear) {
                swearCounter++;
                console.log(Swear + " deleted")
                message.delete()
                if (swearCounter>6&&swearCounter<15) {
                    var indexofReaction= Math.floor((Math.random() * swearReaction.length) + 0)
                    message.reply("\n"+swearReaction[indexofReaction])  
                }
                else if (swearCounter==15) {
                    message.channel.send("Sizle uğraşamayacam\nBulaşmam gereken insanlar var.")
                    swearCounter=0
                }    
            }
            else if (message.content == ("cov "+command) && arr.length < 3) {
                if (command=="top") {
                    getsorted(message, "cases")
                } else {
                    getcountry(message, command)
                }
            }
            else if (message.content.startsWith("cov usa ") && (arr.length > 2 && arr.length < 5)) {
                command = message.content.substring(8)
                getState(message, command)
            }
            else {
                message.channel.send("Too much arguments!\nYou can try ISO code.")
            }
    }
})
async function getall(message) {
    let all = await covid.all()
    let allYesterday = await covid.all({ yesterday: true })
    message.channel.send("Global Stats:\n\n" + messageTemplate(all, allYesterday))
    return 1
}
async function getcountry(message, command) {
    let specificCountry = await covid.countries(command)
    let yesterdayCountry = await covid.countries(command, { yesterday: true })
    if (specificCountry.message === undefined) {
        specificCountryMessage =
            "Country: **" + specificCountry.country + "**\n\n" + messageTemplate(specificCountry, yesterdayCountry)
        message.channel.send(specificCountryMessage)
    }
    else
        message.channel.send(specificCountry.message + "\nYou can try ISO code.");
    return 1
}
async function getsorted(message, sorttype) {
    let sorteddata = await covid.countries(null, { sort: sorttype })
    var top10 = []
    for (let index = 0; index < 10; index++) {
        if (sorttype == "cases")
            top10[index] = index + 1 + ". " + sorteddata[index].country + ": **" + sorteddata[index].cases + "**\n"
        else if (sorttype == "deaths")
            top10[index] = index + 1 + ". " + sorteddata[index].country + ": **" + sorteddata[index].deaths + "**\n"
        else if (sorttype == "recovered")
            top10[index] = index + 1 + ". " + sorteddata[index].country + ": **" + sorteddata[index].recovered + "**\n"
    }
    message.channel.send("Sorted by *" + sorttype + "*\n" + top10.toString().replace(/,/g, ""))
}
async function getState(message, command) {
    let states = await covid.states(command)
    let yesterdayStates=await covid.states(command,{yesterday:true})
    var stateMessage
    // for (let index = 0; index < states.length; index++) {
    //     if (states[index].state.toLowerCase() == command) {
    //         stateMessage = messageTemplate(states[index])
    //         break;
    //     }
    //     else
    //         stateMessage = "No state"
    // }
    if (states.message === undefined) {
        stateMessage =
            "State: **" + states.state + "**\n\n" + messageTemplate(states, yesterdayStates)
        message.channel.send(stateMessage)
    }
    else
        message.channel.send(stateMessage.message + "\nYou can try ISO code.");

    message.channel.send(stateMessage)
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
function messageTemplate(data, yesterdayData = "") {
    var msg
    if (yesterdayData == "") {
        msg =
            "State: **" + data.state + "**\n\n" +
            "Cases: **" + data.cases + "**\n\n" +
            "Deaths: *" + data.deaths + "**"
    }
    else {
        msg =
            "Cases: **" + yesterdayData.cases + " ➡️ " + data.cases + " 🔺" + (data.cases - yesterdayData.cases) + "**\n\n" +
            "Deaths: **" + yesterdayData.deaths + " ➡️ " + data.deaths + " 🔺" + (data.deaths - yesterdayData.deaths) + "**\n\n" +
            "Recovered: **" + yesterdayData.recovered + " ➡️ " + data.recovered + " 🔺" + (data.recovered - yesterdayData.recovered) + "**"
    }
    return msg
}

bot.login(process.env.BOT_TOKEN)