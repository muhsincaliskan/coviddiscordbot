const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

/*
 * equivalent to: CREATE TABLE tags(
 * name VARCHAR(255),
 * description TEXT,
 * username VARCHAR(255),
 * usage INT
 * );
 */
const Guilds = sequelize.define('guilds', {
    guild_name: {
        type: Sequelize.STRING,
        // unique:true
    },
    guild_id: {
        type: Sequelize.TEXT,
        unique: true
    },
    language: {
        type: Sequelize.STRING,
        defaultValue: "en",
        // unique: true
    }
});

async function addGuild(guildName, guildId, lang) {
    try {
        // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
        const guild = await Guilds.create({
            guild_name: guildName,
            guild_id: guildId,
            language: lang,
        });
        
        return console.log(`Guild ${guild.guild_id} added.`)
    }
    catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return console.log('That guild already exists.');
        }
       return console.log('Something went wrong with adding a tag.');
    }
}
async function getLanguage(guildId) {
// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
const guild = await Guilds.findOne({ where: { guild_id: guildId } });
if (guild) {
	// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
	// guild.increment('usage_count');
    // console.log(guild.get('language'))
    console.log(guild.get('guild_id')+" "+ guild.get('guild_name')+" "+guild.get('language'));
    if (guild.get('language')==="en") return "en"
    else return "tr"
}
return "en"
    
}
async function setLanguage(guildId,newLang) {

    // equivalent to: UPDATE tags (descrption) values (?) WHERE name='?';
    const affectedRows = await Guilds.update({ language: newLang }, { where: { guild_id: guildId } });
    if (affectedRows > 0) {
       return console.log(`New Language is ${newLang}`)
    }
   return console.log(`Could not find a with name ${newLang}.`);

}

export {sequelize,Guilds,addGuild,setLanguage,getLanguage}