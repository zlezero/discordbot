
var fs = require('fs');

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

//Variables du bot

var citation_filename = "citations.txt"

// Configure logger settings

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connecté');
    logger.info('Connecté en tant que : ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
	
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
	
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
			
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
				
				break;
				
			// !citation
			
			case 'citation':
				bot.sendMessage({
					to: channelID,
					message: getRandomLine(citation_filename)
				});
				
				
				break;
			
			// !addcitation <new citation>
			
			case 'addcitation':
				
				break;
				
			// !viewcitation
			
			case 'viewcitation':
				bot.sendMessage({
					to: channelID,
					message: getAllLines(citation_filename)
				});
				
            break;
            // Just add any case commands if you want to..
         }
		 
     }
	 
});


function getRandomLine(filename){
		let randomNumber = fs.readFileSync(filename).toString().split("\n");
		let item = randomNumber[Math.floor(Math.random() * randomNumber.length)];
		return item;
 }
 
 function getAllLines(filename){
	 	let lines = fs.readFileSync(filename).toString().split("\n");
		return lines
 }
 
function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

