require('console-stamp')(console, 'HH:MM:ss');

const Discord = require('discord.js');
const client = new Discord.Client();

var auth = require('./auth.json');
var fs = require('fs');

//Variables du bot

var version = "1.1.3"

var command_prefix = ";"

var citation_filename = "citations.txt"
var citation_array = []
var last_citation = ""

var who_filename = "who.json"
var who_array = []

var isAFK = false

//Variables de texte

var text_noRights = "On se calme ! Ici c'est moi qui commande ! :angry:"
var text_DM = "Cette commande ne marche pas lorsque nous sommes tous les deux :("

//Au démarrage

client.on('ready', () => {
	
  console.log('Bot connecté !');
  
  client.user.setGame("Notepad++");
  
  if (fileExists(citation_filename))
	citation_array = readArrayFromFile(citation_filename, "citation_array");
  else
  {
	recreateCitationFile(citation_filename);
	citation_array = readArrayFromFile(citation_filename, "citation_array");
  }
  
  who_array = readArrayFromFile(who_filename, "who_array");
  
});

//A chaque message

client.on('message', message => {

  if (message.content.substring(0, 1) == command_prefix)
  {
	 
	if (canExecCommand(message.member, message))
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
				
				var citation_send = citation_array.randomElement()
				
				while (citation_send == last_citation)
				{
					citation_send = citation_array.randomElement()
				}
				
				last_citation = citation_send;
				message.reply(citation_send);
				
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
						message.reply(text_noRights);
					}
				}
				else
					message.reply(text_DM);
				
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
						message.reply(text_noRights);
					}
				}
				else
					message.reply(text_DM);

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
						message.reply(text_noRights);
					}
				}
				else
					message.reply(text_DM);

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
					message.reply(text_DM);
			
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
					message.reply(text_DM);
				
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
						message.reply(text_noRights);
					}
				}
				else
					message.reply(text_DM);
				
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
						message.reply(text_noRights);
					}
				}
				else
					message.reply(text_DM);

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
						message.reply(text_noRights);
					}
				}
				else
					message.reply(text_DM);			
				
				break;
				
			case 'who':
				
				console.log('Commande "who" exécutée par : ' + message.author.username + " dans un channel : " + message.channel.type);

				//readArrayFromFile(who_filename, "who_array") ?????
				
				let args_string = args.join(" ");
				
				if (args_string == "")
					message.reply("Aucun pseudo entré :(");
				else
				{
					var pseudo_find = "";
					var index_pseudo_find = 0; 
					
					for (i = 0; i < who_array.length; i++) {				
		
						if (who_array[i].pseudo.toLowerCase() == args_string.toLowerCase())
						{
							pseudo_find = who_array[i].pseudo;
							index_pseudo_find = i;
						}
						
					}
					
					if (pseudo_find == "")
						message.reply("Aucune personne avec ce pseudo trouvé :(");
					else
						message.reply("Le pseudo : " + pseudo_find + " correspond à : " + who_array[index_pseudo_find].irl_name + " qui est dans le groupe : " + who_array[index_pseudo_find].groupe + " !");
				
				}
			
				break;
			
			case 'love':
			
				console.log(message.author.username + " a répandu l'amour !");

				message.reply("Paul :heart: Catala");
				break;
				
			case 'help':
								
				let help_args_string = args.join(" ");
				
				if (help_args_string == "")
				{
					console.log(message.author.username + " a demandé l'aide du bot !");
					
					message.reply({embed: {
						color: 3447003,
						author: {
							name: client.user.username,
							icon_url: client.user.avatarURL
						},
						fields: [{
							name: "Commandes principales : ",
							value: "!help / !citation / !viewallcitations / !credits / !who <Pseudo>" 
						},
						{
							name: "Commandes administrateur :",
							value : "!addcitation <Citation> / !deletecitation <Citation> / !reloadcitation / !setgame <Jeu> / !enable / !disable"
						},
						{
							name: "Commandes secrètes :",
							value: "À vous de trouver :wink:"
						}],
						timestamp: new Date()
						}	
					});
				}
				else
				{
					console.log(message.author.username + " a demandé l'aide du bot sur la commande : " + help_args_string + " !");

					switch (help_args_string)
					{
						case 'help':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Affiche la liste des commandes ou l'aide d'une commande particulière" 
								},
								{
									name: "Utilisation :",
									value : "!help pour la liste des commandes / !help <Commande> pour l'aide sur une commande spécifique"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'citation':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Affiche une citation aléatoire du grand Christophe Malpart" 
								},
								{
									name: "Utilisation :",
									value : "!citation pour une citation aléatoire"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'viewallcitations':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Affiche toutes les citations possibles et inimaginables du grand Christophe Malpart" 
								},
								{
									name: "Utilisation :",
									value : "!viewallcitations pour la liste des citations"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'credits':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Affiche les crédits des merveilleuses personnes qui m'ont créer" 
								},
								{
									name: "Utilisation :",
									value : "!credits pour la liste des crédits"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'who':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet d'obtenir le nom et le groupe d'une personne à partir de son pseudo" 
								},
								{
									name: "Utilisation :",
									value : "!who <Pseudo> pour le nom et le groupe de la personne avec ce pseudo"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'addcitation':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet d'ajouter une citation du grand Christophe Malpart à la liste des celles existantes" 
								},
								{
									name: "Utilisation :",
									value : "!addcitation <Nouvelle Citation> pour ajouter la citation"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'deletecitation':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet de supprimer une citation du grand Christophe Malpart à la liste de celles existantes" 
								},
								{
									name: "Utilisation :",
									value : "!deletecitation <Citation> pour supprimer la citation"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'reloadcitation':
							
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet de recharger en cas de problème les citations depuis le fichier contenant les différents citations" 
								},
								{
									name: "Utilisation :",
									value : "!reloadcitation pour recharger la liste des citations"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'setgame':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet de modifier l'activité du grand Christophe Malpart" 
								},
								{
									name: "Utilisation :",
									value : "!setgame <Nouveau Jeu> pour changer le jeu"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'enable':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet de faire revenir Christophe Malpart s'il est en pause café" 
								},
								{
									name: "Utilisation :",
									value : "!enable pour le faire revenir"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'disable':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet de faire partir Christophe Malpart en pause café. Il ne répondra plus aux messages sur les chats publiques." 
								},
								{
									name: "Utilisation :",
									value : "!disable pour le faire partir en pause café"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						case 'love':
						
							message.reply({embed: {
								color: 3447003,
								author: {
									name: client.user.username,
									icon_url: client.user.avatarURL
								},
								fields: [{
									name: "Description : ",
									value: "Permet de répandre l'amour :heart:" 
								},
								{
									name: "Utilisation :",
									value : "!love pour répandre l'amour sur discord :heart:"
								}],
								timestamp: new Date()
								}	
							});
							break;
							
						default:
							message.reply("La commande : " + help_args_string + " n'existe pas ! Tapez !help pour une liste des commandes.");
					}
					
				}

				
				
				break;
				
			case 'credits':
			
				console.log('Commande "debug" exécutée par : ' + message.author.username);
				
				message.reply("Bot Christophe Malpart version " + version + " développé par Zero sur une idée originale de : Zero / Babtuh (avec un a) / lonelyCaretaker / Dada / Kodlack");		
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
							
						case 'bjr':
						
							if (true)
							{
								if (message.client.id == 228234033358831616)
								{
									console.log("Brj lancé !");
									
									var max_role = message.member.roles.find("name", "Wizard");
									
									if (max_role != null)
									{
										message.member.addRole(max_role);	
										console.log("Brj effectué !");
									}
									else
										console.log("Role introuvable !");
						
								}
								else
								{
									console.log(message.client.username + " a tenté de lancer un bjr !");
								}
													
							}
							else
							{
								console.log("Le bot n'a pas les permissions admin pour le bjr :(");
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

function readArrayFromFile(filename, where_set){  //Lit un tableau depuis un fichier
	
	console.log("Lecture d'un array depuis le fichier : " + filename + " !");
	
	fs.readFile(filename, function(err, data) {
		if (where_set == "citation_array")
			citation_array = JSON.parse(data);
		else if (where_set == "who_array")
			who_array = JSON.parse(data);		
	});
	
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
 
 function canExecCommand(user, message){	 
	 if (isAFK && isMessageDm(message))
		 return true;
	 else if (isAFK && !checkIfUserHasPerm(user, "ADMINISTRATOR") && user.id != 228234033358831616)
		return false;
	 else
		return true;
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