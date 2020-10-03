require("dotenv").config()
const fs = require('fs');
const Discord = require("discord.js")
const { localize,localizeCountry } = require("./translations/translate.js")
const DB = require("./db/dbHelper.js");
const bot = new Discord.Client({
    presence: {
        status: "online",
        activity: {
            type: 'PLAYING',
            name: 'cov help',

        }
    }
})
bot.commands = new Discord.Collection()
const prefix = process.env.PREFIX
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}
const MIN_INTERVAL = 1000 * 60

bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    console.log("Bot is running...")
    // const GuildNames = bot.guilds.cache.map(guild => guild.name);
    // const GuildsIDs=bot.guilds.cache.map(guild => guild.id);
    // for (let index = 0; index < bot.guilds.cache.size; index++) {
    //     DB.addGuild(GuildNames[index],GuildsIDs[index])    
    // }
  
    // startTimer()
    // console.log("Timer Started")
    try {
        await DB.sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    DB.Guilds.sync()
})
bot.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    DB.addGuild(guild.name, guild.id)
    setLocale(guild.id)
})
bot.on("channelCreate", (channel) => {
    if (channel.type == "dm") {
        DB.addGuild(channel.recipient.tag, channel.id)
        setLocale(channel.id)
    }
})
bot.on('message', message => {
    DB.Guilds.sync()
    message.content=message.content.toLowerCase()
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    let ID
    if (message.guild != null){
        ID=message.guild.id
        setLocale(ID)}    
    if (message.channel.type == "dm"){
        ID=message.channel.id
        setLocale(ID)
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = bot.commands.get(commandName)
        || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
        console.log("---Command: " + `${command!=undefined?command.name:"country"}`+" "+ `${args.length == 0 ?commandName : args.join(" ")}`)
        console.log("-----Author Tag: " + message.author.tag)
        console.log("-----Author ID: " + message.author.id)
        console.log("-----Channel Type: " + message.channel.type)    
    let countryName=[]
    if (!command){
        if (args.length>0) {
            args.unshift(commandName)
            countryName=args}  
        else countryName.push(commandName) 
        if(localizeCountry(countryName)==null) return
    }
    
    try {
        if (command) {
            if(command.name=="setlan")
                args.push(ID)
            command.execute(message, args);
        }
       else
             bot.commands.get("country").execute(message,countryName) 
    } catch (error) {
        console.error(error);
        message.reply('there was an ERROR trying to execute that command!');
    }
    // executer(message)
});
async function setLocale(id) {
    console.log("--------------")
    DB.Guilds.sync()
    return localize.setLocale(await DB.getLanguage(id))
}

async function setCountryTimer() {
    var channel = bot.channels.resolve('671048646774489131')
    const data = await covid.countries({ country: "tr" })
    // var updated=new Date()
    // updated=updated.getHours()+" : "+updated.getMinutes()
    // console.log(updated)
    if (data.todayCases > 0) {
        bot.commands.get(commandName).execute()
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
//moment ile baştan yazılabilir
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
bot.login(process.env.TOKEN)

