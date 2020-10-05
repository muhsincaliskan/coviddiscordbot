const {Guilds,setLanguage} = require("../db/dbHelper.js")
module.exports = {
	name: 'setlan',
    description: 'Language',
    
	execute(message, args) {
        if (!args.length) {
            return message.channel.send(`You didn't provide any new language, ${message.author}!`);
        }
        if(args[0]=="en"||args[0]=="tr"){
            
            setLanguage(args[1], args[0])
            Guilds.sync()
            message.channel.send("Language=> " + args[0])
        }
	},
};