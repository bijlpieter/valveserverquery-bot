const Gamedig = require("gamedig");
const discord = require("discord.js");

const help = new discord.MessageEmbed();
help.setTitle("Valve Server Query Bot  -  Help");
help.addField("Use \`!query ip:port\` in order to query any server directly:", `
\`\`\`c
Both of these should work:
	!query 146.66.159.74:27052
	!query bolus.fakkelbrigade.eu:27235
\`\`\`
`);
help.addField("You can also search valve servers using a few parameters:", `
\`\`\`c
Query layout:
	!query -[option] [param] -[option] [param] ...
I.E.:
	!query -c eu -l sto -gm mp -m ctf_hellfire
\`\`\`
`);
help.addField("There are 6 possible options:", `
\`\`\`c
	-c  (Continent)      -m  (Map)
	-l  (Location)       -p  (Player)
	-gm (Gamemode)       -a  (All)
\`\`\`
`);
help.addField("\`-c\`, \`-l\` and \`-gm\` have limited options as parameters:", `
\`\`\`c
	-c [na, eu, as] for North America, Europe and Asia
	-l [lux, sto, mad, vir, lax, mwh, sgp, tky, hkg, chi] for 
	    Luxembourg, Stockholm, Madrid, Virginia, Los Angeles,
	    Washington, Singapore, Tokyo, Hong Kong and Chile
	-gm [ad, ctf, koth, cp, pl, plr, misc, mp, pass, pd, mvm]
	    for each Gamemode
\`\`\`
`);
help.addField("\`-m\` and \`-p\` can be used with any parameters:", `
\`\`\`c
The bot will search all servers regardless of the parameters:
	-m pl_upward
	-p Chrysophylaxs
\`\`\`
`);
help.addField("\`-a\` doesn't need any parameters", `
\`\`\`c
The bot will post all results rather than being limited to the first 4.
\`\`\`
`);

function buildErrorEmbed(error) {
	const invalid = new discord.MessageEmbed();
	invalid.addField("Option specifier `" + error + "` is invalid! Try any one of the following:", `
\`\`\`c
	-c   (Continent)
	-l   (Location)
	-gm  (Gamemode)
	-m   (Map)
	-p   (Player)
	-a   (All)
\`\`\`
	`);
	return invalid;
}

function formatUsername(username) {
	username = username.replace("\n", " ");
	username = username.replace("\u200F", "*");
	return username.substring(0, 30);
}

function buildServerEmbed(state) {
	let string = "```c\nMap: " + state.map + "\nIP: " + state.connect + "\nName                           | Kills\n======================================";
	let users = state.players.concat(state.bots);
	for (let i = 0; i < users.length; i++) if (!users[i].hasOwnProperty("name")) {
		users[i].name = "Connecting...";
		users[i].score = -1;
	}
	users.sort((a, b) => b.score - a.score);
	for (let i = 0; i < users.length; i++) {
		string = string + "\n" + formatUsername(users[i].name);
		if (users[i].score >= 0) {
			for (let j = 0; j < 30 - users[i].name.length; j++) string += " ";
			string = string + " | " + users[i].score;
		}
	}
	string = string + "\n======================================\nTotal: " + users.length + " / " + state.maxplayers + "```";
	let embed = new discord.MessageEmbed();
	embed.setTitle(state.name);
	embed.setDescription(string);
	if (isLUX(state.connect)) embed.setColor("#ea3115");
	if (isSTO(state.connect)) embed.setColor("#ea5815");
	if (isMAD(state.connect)) embed.setColor("#eae715");
	if (isVIR(state.connect)) embed.setColor("#63ea15");
	if (isLAX(state.connect)) embed.setColor("#15ea71");
	if (isMWH(state.connect)) embed.setColor("#002800");
	if (isHKG(state.connect)) embed.setColor("#15c3ea");
	if (isSGP(state.connect)) embed.setColor("#155fea");
	if (isTKY(state.connect)) embed.setColor("#8e15ea");
	if (isCHI(state.connect)) embed.setColor("#654321");
	return embed;
}

const client = new discord.Client({disableEveryone: true});
client.login(process.env.DISCORD);

client.on("ready", function() {
	client.user.setActivity("!query | finding servers...", {type: "PLAYING"});
	client.channels.fetch("698305641424617552").then((channel) => channel.bulkDelete(10));
	console.log("Valve Server Query Bot");
});

const risktracker = new discord.Client({disableEveryone: true});
risktracker.login(process.env.RISKTRACKER);

risktracker.on("ready", function() {
	risktracker.user.setActivity("Mannpower Detective", {type: "PLAYING"});
	risktracker.channels.fetch("802628228165402715").then((channel) => channel.bulkDelete(10));
	console.log("Risk Mannpower Tracker Bot");
});

let servers = {};

client.on("message", (msg) => {
	if (!msg.content.startsWith("!query")) return undefined;
	if ((msg.author.bot || msg.channel.type == "dm" || msg.guild.id != "529010184903983125") && !whitelisted(msg.author.id)) {
		msg.channel.send("This bot is reserved for members of The Mannpower Cult!");
		return undefined;
	}
	let content = msg.content.toLowerCase();
	let args = content.split(" ");
	if (args.length == 2) {
		let str = args[1].split(":");
		if (str.length != 2) return msg.channel.send(help);
		queryServer(str[0], str[1], msg.channel);
	}
	else if (args.length > 2) {
		let retval = getServers(args);
		if (retval.error) msg.channel.send(buildErrorEmbed(retval.error));
		else sendServers(retval.servers, retval.flagAll, msg.channel);
	}
	else {
		let embed = new discord.MessageEmbed();
		let totalPlayers = 0;
		let totalServers = 0;
		for (let i in servers) {
			totalPlayers += servers[i].players.length;
			totalServers++;
		}
		let string = "Currently monitoring " + totalServers + " Servers  |  Total players: " + totalPlayers;
		embed.setTitle(string);
		embed.setColor("#42b548");
		msg.channel.send(embed);
		msg.channel.send(help);
	}
	return undefined;
});

function sleep(ms) {
	return new Promise(r => setTimeout(r, ms));
}

function isAD(map) {return map == "cp_dustbowl" || map == "cp_egypt_final" || map.startsWith("cp_gorge") || map == "cp_gravelpit" || map == "cp_junction_final" || map == "cp_manor_event" || map == "cp_mercenarypark" || map == "cp_mossrock" || map == "cp_mountainlab" || map == "cp_steel";}
function isCTF(map) {return map.startsWith("ctf_") && !isMP(map);}
function isCP(map) {return map.startsWith("cp_") && !isAD(map) && !isMISC(map);}
function isKOTH(map) {return map.startsWith("koth_");}
function isPL(map) {return map.startsWith("pl_");}
function isPLR(map) {return map.startsWith("plr_");}
function isMISC(map) {return map == "tc_hydro" || map == "cp_degrootkeep" || map == "cp_snowplow" || map == "sd_doomsday";}
function isPD(map) {return map.startsWith("pd_");}
function isMP(map) {return map == "ctf_thundermountain" || map == "ctf_hellfire" || map == "ctf_foundry" || map == "ctf_gorge";}
function isPASS(map) {return map.startsWith("pass_");}
function isMVM(map) {return map.startsWith("mvm_");}

function isVIR(ip) {return ip.startsWith("208.78.164.") || ip.startsWith("208.78.165.");}
function isLAX(ip) {return ip.startsWith("162.254.194.");}
function isMWH(ip) {return ip.startsWith("192.69.97.");}
function isLUX(ip) {return ip.startsWith("146.66.152.") || ip.startsWith("146.66.153.") || ip.startsWith("146.66.158.") || ip.startsWith("146.66.159.") || ip.startsWith("155.133.240.") || ip.startsWith("155.133.241.");}
function isSTO(ip) {return ip.startsWith("146.66.156.") || ip.startsWith("146.66.157.") || ip.startsWith("155.133.242.") || ip.startsWith("155.133.243.") || ip.startsWith("185.25.180.") || ip.startsWith("185.25.181.");}
function isMAD(ip) {return ip.startsWith("155.133.247.");}
function isSGP(ip) {return ip.startsWith("103.28.54.") || ip.startsWith("103.28.55.") || ip.startsWith("45.121.184.") || ip.startsWith("45.121.185.");}
function isTKY(ip) {return ip.startsWith("45.121.186.") || ip.startsWith("45.121.187.");}
function isHKG(ip) {return ip.startsWith("155.133.244.");}
function isCHI(ip) {return ip.startsWith("155.133.249.");}

function isNA(ip) {return isVIR(ip) || isLAX(ip) || isMWH(ip);}
function isEU(ip) {return isLUX(ip) || isSTO(ip) || isMAD(ip);}
function isAS(ip) {return isSGP(ip) || isTKY(ip) || isHKG(ip);}

function getContinent(ip) {
	if (isNA(ip)) return "na";
	if (isEU(ip)) return "eu";
	if (isAS(ip)) return "as";
	return "??";
}

function getLocation(ip) {
	if (isVIR(ip)) return "vir";
	if (isLAX(ip)) return "lax";
	if (isMWH(ip)) return "mwh";
	if (isLUX(ip)) return "lux";
	if (isSTO(ip)) return "sto";
	if (isMAD(ip)) return "mad";
	if (isSGP(ip)) return "sgp";
	if (isTKY(ip)) return "tky";
	if (isHKG(ip)) return "hkg";
	if (isCHI(ip)) return "chi";
	return "???";
}

function getGamemode(map) {
	if (isAD(map)) return "ad";
	if (isCTF(map)) return "ctf";
	if (isCP(map)) return "cp";
	if (isKOTH(map)) return "koth";
	if (isPL(map)) return "pl";
	if (isPLR(map)) return "plr";
	if (isMISC(map)) return "misc";
	if (isPD(map)) return "pd";
	if (isMP(map)) return "mp";
	if (isPASS(map)) return "pass";
	if (isMVM(map)) return "mvm";
	return "???";
}

function getServers(args) {
	let i = 1;
	let serversFound = JSON.parse(JSON.stringify(servers));
	let flagAll = false;
	while (i < args.length - 1) {
		if (!args[i].startsWith('-') && !args[i + 1].startsWith('-')) {
			args[i] += (" " + args[i + 1]);
			args.splice(i + 1, 1);
		}
		else i++;
	}
	for (let j = 1; j < args.length; j += 2) {
		if (args[j] == "-c") {
			for (let k in serversFound) if (getContinent(serversFound[k].connect) != args[j + 1]) delete serversFound[k];
		}
		else if (args[j] == "-l") {
			for (let k in serversFound) if (getLocation(serversFound[k].connect) != args[j + 1]) delete serversFound[k];
		}
		else if (args[j] == "-gm") {
			for (let k in serversFound) if (getGamemode(serversFound[k].map) != args[j + 1]) delete serversFound[k];
		}
		else if (args[j] == "-m") {
			for (let k in serversFound) if (serversFound[k].map != args[j + 1]) delete serversFound[k];
		}
		else if (args[j] == "-p") {
			for (let k in serversFound) {
				let found = false;
				for (let p = 0; p < serversFound[k].players.length; p++) {
					if (serversFound[k].players[p].hasOwnProperty("name") && serversFound[k].players[p].name.toLowerCase().includes(args[j + 1])) {
						found = true;
						break;
					}
				}
				if (!found) delete serversFound[k];
			}
		}
		else if (args[j] == "-a") {
			j--;
			flagAll = true;
		}
		else return {
			"error": args[j],
			"servers": {},
			"flagAll": flagAll
		}
	}
	return {
		"error": "",
		"servers": serversFound,
		"flagAll": flagAll
	};
}

async function sendServers(retval, flagAll, channel) {
	let embed = new discord.MessageEmbed();
	let totalPlayers = 0;
	let totalServers = 0;
	let totalFound = 0;
	for (let i in servers) {
		totalPlayers += servers[i].players.length;
		totalServers++;
	}
	for (let i in retval) {
		totalFound++;
	}
	let string = "Found " + totalFound + " out of " + totalServers + " logged Servers  |  Total players: " + totalPlayers;
	embed.setTitle(string);
	embed.setColor("#42b548");
	channel.send(embed);
	let j = 0;
	for (let k in retval) {
		let str = k.split(":");
		queryServer(str[0], str[1], channel);
		j++;
		if (j == 4 && !flagAll) break;
		await sleep(500);
	}
}

const whitelist = ["267910288622223364", "290199958718775307"];
function whitelisted(id) {return whitelist.includes(id)}

let mannpower = {};
let riskmp = {};

async function updateMannpower(bot, obj, channelID) {
	while (true) {
		for (let connect in obj) {
			let str = connect.split(":");
			await Gamedig.query({
				type: "tf2",
				host: str[0],
				port: str[1],
				socketTimeout: 3000,
				maxAttempts: 3
			}).then((state) => {
				if (!isMP(state.map) || state.players.length == 0) {
					if (obj[connect] && obj[connect] != "sending") obj[connect].delete();
					delete obj[connect];
				}
				else {
					if (obj[connect] == undefined) {
						obj[connect] = "sending";
						bot.channels.fetch(channelID).then((channel) => channel.send(buildServerEmbed(state)).then((msg) => {obj[connect] = msg}).catch((err) => {obj[connect] = undefined}));
					}
					else if (obj[connect] != "sending") {
						obj[connect].edit(buildServerEmbed(state));
					}
				}
			}).catch(() => {});
			await sleep(2000);
		}
		await sleep(2000);
	}
}

updateMannpower(client, mannpower, "698305641424617552");
updateMannpower(risktracker, riskmp, "802628228165402715");

async function query(input, ranges) {
	for (let [from, to] of ranges)
	for (let ip = from; ip <= to; ip++) {
		for (let port = 27015; port < 27075; port++) {
			Gamedig.query({
				type: "tf2",
				host: input + ip,
				port: port
			}).then((state) => {
				if (state.raw.game == "Team Fortress") {
					if (state.players.length > 0) servers[state.connect] = state;
					else if (servers.hasOwnProperty(state.connect)) delete servers[state.connect];
					if (isMP(state.map) && !mannpower.hasOwnProperty(state.connect)) mannpower[state.connect] = undefined;
					if (isMP(state.map) && !riskmp.hasOwnProperty(state.connect)) riskmp[state.connect] = undefined;
				}
				// if (state.raw.game == "Team Fortress") console.log(state.connect + " " + state.name);
			}).catch((error) => {});
			await sleep(10);
		}
	}
}

async function losangeles() {
	await query("162.254.194.", [[146, 166]]);
}

async function virginia() {
	await query("208.78.164.", [[71, 75], [167, 170], [230, 235]]);
	await query("208.78.165.", [[71, 75], [231, 235]]);	
	// await query("208.78.166.", [[0, 255]]);
}

async function luxembourg() {
	await query("146.66.152.", [[163, 166]]);
	await query("146.66.153.", [[72, 75], [232, 235]]);
	// await query("146.66.154.", [[0, 255]]);
	// await query("146.66.155.", [[0, 255]]);	
	await query("146.66.158.", [[167, 170]]);
	await query("146.66.159.", [[71, 74], [230, 233]]);

	// await query("155.133.228.", [[0, 255]]);
	// await query("155.133.229.", [[0, 255]]);
	await query("155.133.240.", [[167, 170]]);
	await query("155.133.241.", [[71, 74]]);
}

async function stockholm() {
	await query("146.66.156.", [[167, 168]]);
	await query("146.66.157.", [[71, 72], [232, 233]]);

	await query("155.133.242.", [[167, 168]]);
	await query("155.133.243.", [[71, 72]]);

	await query("185.25.180.", [[167, 168]]);
	await query("185.25.181.", [[71, 72], [230, 235]]);
	// await query("185.25.182.", [[0, 255]]);
}

async function madrid() {
	// await query("155.133.246.", [[0, 255]]);
	await query("155.133.247.", [[142, 145]]);
	// await query("155.133.248.", [[0, 255]]);
}

async function singapore() {
	await query("103.28.54.", [[163, 164]]);
	await query("103.28.55.", [[71, 73], [232, 233]]);
	// await query("103.10.124.", [[0, 255]]);
	await query("45.121.184.", [[163, 164]]);
	await query("45.121.185.", [[67, 68], [228, 229]]);
}

async function tokyo() {
	await query("45.121.186.", [[160, 162]]);
	await query("45.121.187.", [[60, 62]]);
}

async function sydney() {
	// await query("103.10.125.", [[0, 255]]);
}

async function hongkong() {
	await query("155.133.244.", [[76, 78], [236, 238]]);
}

async function chile() {
	// Other SA
	// await query('209.197.29.', [[0, 255]]);
	// await query('209.197.25.', [[0, 255]]);
	// await query('205.185.194.', [[0, 255]]);
	// await query('143.137.146.', [[0, 255]]);
	await query('155.133.249.', [[91, 92]]);
}

async function washington() {
	// await query('192.69.96.', [[0, 255]]);
	await query('192.69.97.', [[60, 62]]);
}

async function queryAll() {
	while (true) {
		await luxembourg();
		await stockholm();
		await madrid();
		await virginia();
		await losangeles();
		await washington();
		await singapore();
		await tokyo();
		// await sydney();
		await chile();
	}
}

queryAll();

async function queryServer(ip, port, channel) {
	Gamedig.query({
		type: "tf2",
		host: ip,
		port: port,
		socketTimeout: 3000,
		maxAttempts: 3
	}).then((state) => {
		channel.send(buildServerEmbed(state));
		servers[ip + ':' + port] = state;
	}).catch((error) => {
		if (servers.hasOwnProperty(ip + ':' + port)) delete servers[ip + ':' + port];
	});
}