//https://discord.com/api/oauth2/authorize?client_id=735070020941512716&permissions=0&scope=bot
const Discord = require('discord.js');
var auth = require('./auth.json');
var conf = require('./conf.json');
var rule = require('./rules.json');
const bot = new Discord.Client();
var fs = require('fs');
var match={};
var banAmount=12;
var selection=["T","ALTTP","TT","TM","DH","SL","IR","CDG","TS","MMX","LM","MM","ITB","TF","OH","MZM","PB"];


bot.on('message', msg => {
	var args=msg.content.split(' ');
	if (args[0]=="!match"||args[0]=="!MD"){
		//TODO : verif qu'on est dans un chan autorisé
		start(msg);
	}
	if (args[0]=="!enter"||args[0]=="!entrer"||args[0]=="!join"){
		enter(msg);
	}
	if (args[0]=="!ready"){
		ready(msg);
	}
	if (args[0]=="!ban"){
		if(args[1]!=null){
		ban(msg,args[1].toUpperCase());
		if(args[2]!=null){
			ban(msg,args[2].toUpperCase());
		}
		}
	}
	if (args[0]=="!win"){
		winner(msg);
	}
	if (args[0]=="!changewin"){
		if(args[1]!=null){
		changewin(msg,args[1].toUpperCase());
		}
	}
	if (args[0]=="!égalité"||args[0]=="!draw"){
		draw(msg);
	}
	if (args[0]=="!changeégalité"||args[0]=="!changedraw"){
		if(args[1]!=null){
		changedraw(msg,args[1].toUpperCase());
		}
	}
	if (args[0]=="!forceclose"){
		forceclose(msg);
	}
	if (args[0]=="!load"){
		load(msg,args[1]);
	}
	if (args[0]=="!close"){
		close(msg);
	}
	if (args[0]=="!help"){
		//TODO : verif qu'on est dans un chan autorisé
		help(msg);
	}
	if (args[0]=="!overlay"){
		//TODO : verif qu'on est dans un chan autorisé
		overlay(msg);
	}
	if (args[0]=="!result"){
		//TODO : verif qu'on est dans un chan autorisé
		result(msg);
	}
	
});

	
function newmatch(){
	var new_match=JSON.parse(fs.readFileSync('./new_match.json'));;
	return new_match;
}

function start(msg){
	//generer le nom
	var nom = channelGenerateName();
	console.log(nom.replace("x-v",msg.author.tag.split("#")[0]+"-v"));
		msg.guild.channels.create(nom.replace("X-v",msg.author.tag.split("#")[0]+"-v"), 'text').then(function(result){
		channel_id = result.id;
		let category = msg.guild.channels.cache.find(c => c.name == "LIVE-RACES");
		if (!category) throw new Error("Category channel does not exist");
		result.setParent(category.id);
		msg.reply("Match démarré dans le salon "+result.toString()+"\nOverlay : "+informationsURL(channel_id));
		match[channel_id]=newmatch();
		currentMatch=match[channel_id];
			currentMatch.players[0].id=msg.author.id;
			currentMatch.players[0].name=msg.author.tag;
			currentMatch.players[0].ready=true;
		console.log(match);
		saveMatch(result.id);
	});
}

function overlay(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		msg.reply("Overlay du match : "+informationsURL(msg.channel.id));
	}
}

function enter(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		if(currentMatch.players[0].id==0){
			currentMatch.players[0].id=msg.author.id;
			currentMatch.players[0].name=msg.author.tag;
			msg.channel.setName(msg.channel.name.replace("x-v",msg.author.tag.split("#")[0]+"-v"));
		}
		else if(currentMatch.players[1].id==0&&currentMatch.players[0].id!=msg.author.id){
			currentMatch.players[1].id=msg.author.id;
			currentMatch.players[1].name=msg.author.tag;
			msg.channel.setName(msg.channel.name.replace("vs-y","vs-"+msg.author.tag.split("#")[0]));
			msg.reply("tu entres dans le match!");
		}
		else {
			if(currentMatch.players[0].id==msg.author.id){
			}
			else{
				msg.reply("Déjà 2 joueurs dans le match : "+currentMatch.players[1].name+" vs "+currentMatch.players[0].name);
			}
		}
		ready(msg);
	}
}

function ready(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		if(currentMatch.players[0].id==msg.author.id&&!currentMatch.players[0].ready){
			currentMatch.players[0].ready=true;
			if(currentMatch.players[1].ready){
				startMatch(msg);
			}
		}
		else if(currentMatch.players[1].id==msg.author.id&&!currentMatch.players[1].ready){
			currentMatch.players[1].ready=true;
			if(currentMatch.players[0].ready){
				startMatch(msg);
			}
		}
		
	}
}

function startMatch(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		banPrio=Math.round(Math.random());
		currentMatch.ban.id=banPrio;
		currentMatch.ban.amount=1;
		msg.guild.members.fetch(currentMatch.players[banPrio].id)
							.then(function(user){
								msg.channel.send("Début du match ! "+currentMatch.players[0].name+" vs "+currentMatch.players[1].name+"\n"
								+user.toString()+" ban en premier 1 jeu.")
									msg.channel.send("[T] Tetris\n"+
						 "[ALTTP] A link to the past\n"+
						 "[TT] Tricky Towers \n"+
						 "[TM] Trackmania \n"+
						 "[DH] Dishonored \n"+
						 "[SL] SwarmLake \n"+
						 "[IR] Immortal Redneck \n"+
						 "[CDG] Curse of the dead gods \n"+
						 "[TS] The Swindle \n"+
						 "[MMX] Megaman X 1-3 \n"+
						 "[LM] Lonely Mountains \n"+
						 "[MM] Mini Metro \n"+
						 "[ITB] Into The Breach \n"+
						 "[TF] Thunder Force 4 \n"+
						 "[OH] Open Hexagon \n"+
						 "[MZM] Metroid: Zero Mission \n"+
						 "[PB] Power Bomberman ",{code:true});
							});
		saveMatch(msg.channel.id);
	}
}

function ban(msg,jeu){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		if(currentMatch.ban.amount==0){
			return;
		}
		if(msg.author.id==currentMatch.players[currentMatch.ban.id].id){
			toBan=currentMatch.games[jeu];
			if(toBan!=null){
				if(toBan.status=="BANNED"){
					msg.reply("Jeu déjà ban");
				}
				if(toBan.status=="AWAITING"){
					toBan.status="BANNED";
					msg.reply(currentMatch.games[jeu].name + " ban");
					toBan.banned_by=msg.author.id;
					currentMatch.ban.total+=1;
					currentMatch.ban.amount-=1;
					if(currentMatch.ban.amount==0){
						if(currentMatch.ban.total==banAmount){
							currentMatch.ban.id=0;
							//foreach et tout mettre à PICKED
							//randomiser l'ordre
							selection.forEach(function(element){
								if(currentMatch.games[element].status=="AWAITING"){
									currentMatch.games[element].status="PICKED";
									currentMatch.games[element].order=Math.random();									
									}
							});
							printOrder(msg, currentMatch.games);
						}
						else{
							currentMatch.ban.id=(currentMatch.ban.id+1)%2;
							currentMatch.ban.amount=2-Math.floor((currentMatch.ban.total)/(banAmount-1));
							msg.guild.members.fetch(currentMatch.players[currentMatch.ban.id].id)
							.then(function(user){
								msg.channel.send("A "+user.toString()+" de ban "+currentMatch.ban.amount+" jeux");
								gameList="";
								selection.forEach(function(element){
								if(currentMatch.games[element].status =="AWAITING"){
									gameList=gameList+"\n"+"["+element+"] "+currentMatch.games[element].name;
								}
								
	
							});
							msg.channel.send(gameList,{code:true});
							})
							.catch(console.error);
							saveMatch(msg.channel.id);
						}
					}
				}
			}
		}	
	}
}

function printOrder(msg,games){
	var curName="";
	var listeOrd="";
	var i=-1;
	var n=2;
	for(let j=0;j<(17-banAmount);j++){
		selection.forEach(function(element){
			if(games[element].order<n&&games[element].order>i){
				if(games[element].status=="PICKED"){
					n=games[element].order;
					curName=games[element].name;
				}
			}
		});
		listeOrd+=curName+"\n";
		i=n;
		n=2;
	}
	msg.channel.send(listeOrd,{code:true});
	nextGame(msg);
}

function nextGame(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		selection.forEach(function(element){
			currentMatch.games[element].current=false;
		});
		var curOrder=2;
		var curGame="";
		selection.forEach(function(element){
			if (currentMatch.games[element].order<curOrder){
				if(currentMatch.games[element].status=="PICKED"){
					if(currentMatch.games[element].winner==null){
						curGame=element;
						curOrder=currentMatch.games[element].order;
					}
				}
			}
		});
		if(curGame==""){
			msg.reply("Fin du match !");
			var race_results=printResult(msg,currentMatch);
			msg.channel.send(race_results,{code:true});
			//foreach game, afficher le winner
		}else{
			currentMatch.games[curGame].current=true;
			msg.channel.send("Prochain jeu : "+rule[curGame].name + " !");
			var obj = rule[curGame].rules[0][Math.floor(Math.random() * rule[curGame].rules[0].length)];
			var detail = rule[curGame].rules[1][Math.floor(Math.random() * rule[curGame].rules[1].length)];
			if(detail.endsWith(".json")){
				if(detail=="itb.json"){
					var cur_rul = require('./'+detail);
					var tab = cur_rul.rules;
					tab = shuffle(tab);
					detail = "Your pick : "+tab[0] +" & "+tab[1] + " THEN your opponent picks " + tab[Math.floor(4*Math.random())] + " for you."
				}
				if(detail=="trackmania.json"){
					var cur_rul = require('./'+detail);
					var tab = cur_rul.Tracks;
					tab = shuffle(tab);
					detail = "Track n°"+tab[0][0]+" - Time : "+timins(Number(tab[0][1])+Math.floor(10*Math.random()))+"\n"+
							 "Track n°"+tab[1][0]+" - Time : "+timins(Number(tab[1][1])+Math.floor(10*Math.random()))+"\n"+
							 "Track n°"+tab[2][0]+" - Time : "+timins(Number(tab[2][1])+Math.floor(10*Math.random()))+"\n"+
							 "Track n°"+tab[3][0]+" - Time : "+timins(Number(tab[3][1])+Math.floor(10*Math.random()))+"\n"+
							 "Track n°"+tab[4][0]+" - Time : "+timins(Number(tab[4][1])+Math.floor(10*Math.random()))+"\n"+
							 "Track n°"+tab[5][0]+" - Time : "+timins(Number(tab[5][1])+Math.floor(10*Math.random()))+"\n"+
							 "Track n°"+tab[6][0]+" - Time : "+timins(Number(tab[6][1])+Math.floor(10*Math.random()))+"\n";
				}
				if(detail=="alttp.json"){
					var cur_rul = require('./'+detail);
					var tab1 = shuffle(cur_rul.easy);
					var tab2 = shuffle(cur_rul.medium)
					var tab3 = shuffle(cur_rul.hard)
					detail = tab1[0]+"\n"+
							 tab2[0]+"\n"+
							 tab3[0];
				}
			}
			detail = detail.replace("%rand6%",Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random()));
			detail = detail.replace("%rand9%",Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random())+""+Math.floor(10*Math.random()));
			msg.channel.send(obj+"\n"+detail,{code:true});
			currentMatch.games[curGame].rules[0]=obj;
			currentMatch.games[curGame].rules[1]=detail;
			saveMatch(msg.channel.id);
		}
	}
}

function timins(s){
		if(s<60){
			return("00:"+s+".00");
		} else{
			if(s==60){
				return("00:00.00");
			}
			if((s-60)<10){
				return("01:0"+(s-60)+".00");
			}else{
				return("01:"+(s-60)+".00");
			}
		}
}

function randomizeRuleTab(n,tab){
	var toReturn="";
	var rules=shuffle(tab);
	var i=n;
	while (i>0){
		toReturn=toReturn+rules.pop()+"\n";
		i--;
	}
	return toReturn;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function amIinthematch(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		return(currentMatch.players[0].id==msg.author.id||currentMatch.players[1].id==msg.author.id);
	}
	return false;
}

function winner(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		if(!amIinthematch(msg)){
			return;
		}
		var curGame="";
		var curOrder=2;
		selection.forEach(function(element){
			if (currentMatch.games[element].order<curOrder){
				if(currentMatch.games[element].status =="PICKED"){
					if(currentMatch.games[element].winner==null){
						curGame=element;
						curOrder=currentMatch.games[element].order;
					}
				}
			}
		});
		if(currentMatch.games[curGame]==null){
			return;
		}
		currentMatch.games[curGame].winner=msg.author.id;
		if(currentMatch.players[0].id==msg.author.id){
			winnerName=currentMatch.players[0].name.split("#")[0];
		}
		else{
			winnerName=currentMatch.players[1].name.split("#")[0];
		}
		msg.channel.send(winnerName+" gagne le match de "+currentMatch.games[curGame].name);
		nextGame(msg);
		saveMatch(msg.channel.id);
	}
}

function changewin(msg,jeu){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		if(!amIinthematch(msg)){
			return;
		}
		currentMatch.games[jeu].winner=msg.author.id;
		msg.channel.send("Correction : "+msg.author.tag.split("#")[0]+" gagne le match de "+currentMatch.games[jeu].name);
		result(msg);
	}
}

function draw(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		if(!amIinthematch(msg)){
			return;
		}
		var curGame="";
		var curOrder=2;
		selection.forEach(function(element){
			if (currentMatch.games[element].order<curOrder){
				if(currentMatch.games[element].status =="PICKED"){
					if(currentMatch.games[element].winner==null){
						curGame=element;
						curOrder=currentMatch.games[element].order;
					}
				}
			}
		});
		if(currentMatch.games[curGame]==null){
			return;
		}
		currentMatch.games[curGame].winner=0;
		msg.channel.send("Egalité sur le match de "+currentMatch.games[curGame].name);
		nextGame(msg);
		saveMatch(msg.channel.id);
	}
}

function changedraw(msg,jeu){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		if(!amIinthematch(msg)){
			return;
		}
		currentMatch.games[jeu].winner=0;
		msg.channel.send("Correction : égalité sur le match de "+currentMatch.games[jeu].name);
		result(msg);
	}
}

function channelGenerateName(){
	yourNumber=Math.random()*1000000000;
	hexString = yourNumber.toString(16);
	return "X-vs-Y-"+hexString.substring(0,4);
}

function informationsURL(id){
	return "http://stream.ultimedecathlon.com:8080/show/match?id="+id;
}

function close(msg){
	//vérif de l'état du match
	var toReturn=true;
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		var curGame="";
		selection.forEach(function(element){
			if(currentMatch.games[element].status=="AWAITING"&&toReturn){
				toReturn=false;
			}
			if(currentMatch.games[element].status=="PICKED"&&toReturn){
				if(currentMatch.games[element].winner==null){
					toReturn=false;
				}
			}
		});
		if(toReturn){
			//résumé dans race_result
			var race_results=printResult(msg,currentMatch);
			msg.guild.channels.cache.find(channel => channel.name === 'race_results').send(race_results,{code:true})
			//cloture du channel
			msg.channel.delete();
			//suppression du match de la liste de matchs
			delete match[msg.channel.id];
			return true;
		}
		else{
			return toReturn;
		}
	}
}

function result(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		var curGame="";
		var race_results=printResult(msg,currentMatch);
		if(race_results!=null&&race_results!=""){
			msg.channel.send(race_results,{code:true});
		}
	}
}


function printResult(msg,match){
	var games=match.games;
	var curName="";
	var player1=0;
	var player2=0;
	var curWinner="";
	var listeOrd="";
	var i=-1;
	var n=2;
	var update=true;
	var selectionOrd=[];
	for(let j=0;j<(17-banAmount);j++){
		selection.forEach(function(element){
			if(games[element].order<n&&games[element].order>i){
				if(games[element].status=="PICKED"){
					n=games[element].order;
					curName=element;
				}
			}
		});
		if (curName==""){
			return;
		}
		selectionOrd.push(curName);
		i=n;
		n=2;
	}
		selectionOrd.forEach(function(element){

				if(games[element].status=="PICKED"){
					curName=games[element].name;
					if(games[element].winner==0){
						curWinner="Egalité"
					} else if(games[element].winner==match.players[0].id){
						player1++;
						curWinner="Winner : "+match.players[0].name.split("#")[0];
					} else if(games[element].winner==match.players[1].id){
						player2++;
						curWinner="Winner : "+match.players[1].name.split("#")[0];
					}
					else{
						update=false;
						curWinner="Pas encore joué";
					}
				}
				listeOrd+=curName+" - "+curWinner+"\n";
		});
	listeOrd = match.players[0].name.split("#")[0] +"  "+player1+" - "+player2+ "  "+match.players[1].name.split("#")[0]+"\n"+listeOrd; 
	if(player1>player2&&update){
		match.players[0].status="WINNER";
		match.players[1].status="LOSER";
	}else if(player2>player1&&update){
		match.players[0].status="LOSER";
		match.players[1].status="WINNER";
	}else if(update){
		match.players[0].status="DRAW";
		match.players[1].status="DRAW";
	}
	saveMatch(msg.channel.id);
	return listeOrd;
}

function load(msg,id){
	loadMatch(id);
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		//recréer un chan
		//redire où on en est : ban ? sinon NextGame
	}
}

function loadMatch(id){
	let currentMatch = JSON.parse(fs.readFileSync('./'+id+'.json'));
	return match[id]=currentMatch;
}

function saveMatch(id){
	var currentMatch = match[id];
	if (currentMatch!=null){
	fs.writeFile('./'+id+'.json', JSON.stringify(currentMatch), function (err) {
		if (err) return console.log(err);
	});
	}
}

function forceclose(msg){
	if(!close(msg)){
		if(msg.channel.name.includes("-vs-")){
			msg.channel.delete();
			delete match[msg.channel.id];
		}
	}
}

function help(msg){
	msg.reply("!MD : starts a match - démarrer un match\n"+
			  "!enter : Join the match (the creator auto joins) - rejoindre un match, le créateur est déjà dedans\n"+
			  "!ban <game> : Ban the game - ban le jeu\n"+
			  "!win : You won - Vous avez gagné le jeu\n"+
			  "!draw : The match is a draw - égalité sur le jeu\n"+
			  "!result : affiche les résultats du match\n"+
			  "!close : when the 5 games are played, closes the match - Quand les 5 jeux ont été joués, ferme le match"
	,{code:true});
}



bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
bot.on("debug", (e) => console.info(e));
  
bot.login(auth.token);

