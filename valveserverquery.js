const Gamedig = require("gamedig");
const discord = require("discord.js");

const help = new discord.RichEmbed();
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
	!query -[option] [params] -[option] [params] ...
I.E.:
	!query -c eu -l lux sto -gm mp -m ctf_hellfire ctf_gorge
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
help.addField("In case you would like to search a server with a player whose name contains spaces, replace the spaces with underscores:", `
\`\`\`c
This will search for servers with players whose names contain "The" or "End":
	-p The End
This will search for servers with players whose names contain "The End" or "The_End":
	-p The_End
\`\`\`
`);

function buildErrorEmbed(error) {
	const invalid = new discord.RichEmbed();
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

function buildServerEmbed(state) {
	let string = "```c\nMap: " + state.map + "\nIP: " + state.connect + "\nName                           | Kills\n======================================";
	let users = state.players.concat(state.bots);
	for (let i = 0; i < users.length; i++) if (!users[i].hasOwnProperty("name")) {
		users[i].name = "Connecting...";
		users[i].score = -1;
	}
	users.sort((a, b) => b.score - a.score);
	for (let i = 0; i < users.length; i++) {
		string = string + "\n" + users[i].name;
		if (users[i].score >= 0) {
			for (let j = 0; j < 30 - users[i].name.length; j++) string += " ";
			string = string + " | " + users[i].score;
		}
	}
	string = string + "\n======================================\nTotal: " + users.length + " / " + state.maxplayers + "```";
	let embed = new discord.RichEmbed();
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
	client.channels.get("659147471825666066").bulkDelete(10);
	client.channels.get("696521177618710649").bulkDelete(10);
	console.log("Valve Server Query Bot");
});

client.on("message", (msg) => {
	if (msg.author.bot || msg.channel.type == "dm") return undefined;
	if (msg.guild.id != "529010184903983125") return undefined;
	if (!msg.content.startsWith("!query")) return undefined;
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
		let embed = new discord.RichEmbed();
		embed.setTitle("Currently monitoring " + states.length + " Servers");
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

let servers = [];
let states = [];

function getServers(args) {
	let continents = [];
	let locations = [];
	let gamemodes = [];
	let maps = [];
	let players = [];
	let flagAll = false;

	let i = 1;
	while (i < args.length) {
		if (args[i] == "-c") {
			i++;
			while (i < args.length && !args[i].startsWith("-")) {
				continents.push(args[i]);
				i++;
			}
		}
		else if (args[i] == "-l") {
			i++;
			while (i < args.length && !args[i].startsWith("-")) {
				locations.push(args[i]);
				i++;
			}
		}
		else if (args[i] == "-gm") {
			i++;
			while (i < args.length && !args[i].startsWith("-")) {
				gamemodes.push(args[i]);
				i++;
			}
		}
		else if (args[i] == "-m") {
			i++;
			while (i < args.length && !args[i].startsWith("-")) {
				maps.push(args[i]);
				i++;
			}
		}
		else if (args[i] == "-p") {
			i++;
			while (i < args.length && !args[i].startsWith("-")) {
				players.push(args[i]);
				i++;
			}
		}
		else if (args[i] == "-a") {
			i++;
			flagAll = true;
		}
		else {
			return {
				"error": args[i],
				"servers": [],
				"flagAll": flagAll
			};
		}
	}

	let retval = states.slice(0);
	if (continents.length > 0)
	for (let k = 0; k < retval.length; k++) {
		if (continents.indexOf(getContinent(retval[k].connect)) == -1) {retval.splice(k, 1); k--;}
	}
	if (locations.length > 0)
	for (let k = 0; k < retval.length; k++) {
		if (locations.indexOf(getLocation(retval[k].connect)) == -1) {retval.splice(k, 1); k--;}
	}
	if (gamemodes.length > 0)
	for (let k = 0; k < retval.length; k++) {
		if (gamemodes.indexOf(getGamemode(retval[k].map)) == -1) {retval.splice(k, 1); k--;}
	}
	if (maps.length > 0)
	for (let k = 0; k < retval.length; k++) {
		if (maps.indexOf(retval[k].map) == -1) {retval.splice(k, 1); k--;}
	}
	if (players.length > 0)
	for (let k = 0; k < retval.length; k++) {
		let plyrs = [];
		for (let j = 0; j < retval[k].players.length; j++) {
			if (retval[k].players[j].name) plyrs.push(retval[k].players[j].name.toLowerCase().replace(" ", "_"));
		}
		let found = false;
		for (let p = 0; p < players.length; p++) {
			for (let q = 0; q < plyrs.length; q++) {
				if (plyrs[q].includes(players[p])) {
					found = true;
					break;
				}
			}
		}
		if (!found) {retval.splice(k, 1); k--;}
	}
	return {
		"error": "",
		"servers": retval,
		"flagAll": flagAll
	};
}

async function sendServers(retval, flagAll, channel) {
	let embed = new discord.RichEmbed();
	let total = 0;
	for (let i = 0; i < states.length; i++) {
		total += states[i].players.length;
	}
	let string = "Found " + retval.length + " out of " + states.length + " logged Servers  |  Total players: " + total;
	embed.setTitle(string);
	embed.setColor("#42b548");
	channel.send(embed);
	for (let i = 0; (i < retval.length) && (i < 4 || flagAll); i++) {
		let str = retval[i].connect.split(":");
		queryServer(str[0], str[1], channel);
		await sleep(500);
	}
}

async function updateServers(state) {
	let index = servers.indexOf(state.connect);
	if (index == -1 && state.players.length > 0) {
		servers.push(state.connect);
		states.push(state);
	}
	else if (index != -1 && state.players.length > 0) {
		states[index] = state;
	}
	else if (index != -1) {
		servers.splice(index, 1);
		states.splice(index, 1);
	}
}

let mannpower = {};

async function updateMannpower() {
	while (true) {
		for (let connect in mannpower) {
			let str = connect.split(":");
			await Gamedig.query({
				type: "tf2",
				host: str[0],
				port: str[1],
				socketTimeout: 3000,
				maxAttempts: 3
			}).then((state) => {
				if (!isMP(state.map) || state.players.length == 0) {
					if (mannpower[connect] && mannpower[connect] != "sending") mannpower[connect].delete();
					delete mannpower[connect];
				}
				else {
					if (mannpower[connect] == undefined) {
						mannpower[connect] = "sending";
						client.channels.get("659147471825666066").send(buildServerEmbed(state)).then((msg) => {mannpower[connect] = msg}).catch((err) => {mannpower[connect] = undefined});
					}
					else if (mannpower[connect] != "sending") {
						mannpower[connect].edit(buildServerEmbed(state));
					}
				}
			}).catch(() => {});
			await sleep(2000);
		}
		await sleep(2000);
	}
}

updateMannpower();

let community = {
	"173.236.109.123:27015": undefined,
	"45.11.16.178:27015": undefined
}

async function updateCommunity() {
	while (true) {
		for (let connect in community) {
			let str = connect.split(":");
			await Gamedig.query({
				type: "tf2",
				host: str[0],
				port: str[1],
				socketTimeout: 3000,
				maxAttempts: 3
			}).then((state) => {
				if (community[connect] == undefined) {
					community[connect] = "sending";
					client.channels.get("696521177618710649").send(buildServerEmbed(state)).then((msg) => {community[connect] = msg}).catch((err) => {community[connect] = undefined});
				}
				else if (community[connect] != "sending") {
					community[connect].edit(buildServerEmbed(state));
				}
			}).catch(() => {});
			await sleep(2000);
		}
		await sleep(2000);
	}
}

updateCommunity();

async function query(input, ranges) {
	for (let [from, to] of ranges)
	for (let ip = from; ip <= to; ip++) {
		// console.log(ip);
		for (let port = 27015; port < 27075; port++) {
			Gamedig.query({
				type: "tf2",
				host: input + ip,
				port: port
			}).then((state) => {
				if (state.raw.game == "Team Fortress") {
					updateServers(state);
					if (isMP(state.map)) {
						if (!mannpower.hasOwnProperty(state.connect)) mannpower[state.connect] = undefined;
					}
					// console.log(state.map + " | " + state.connect);
				}
				// if (state.raw.game == "Team Fortress") console.log(state.connect + " " + state.name);
			}).catch((error) => {
				// console.log("Server is Offline");
			});
			await sleep(10);
		}
	}
}

async function losangeles() {
	// console.log("LOSANGELES");
	// console.log("================================");
	await query("162.254.194.", [[146, 166]]);
}

async function virginia() {
	// console.log("VIRGINIA");
	// console.log("================================");
	await query("208.78.164.", [[71, 75], [167, 170], [230, 235]]);
	await query("208.78.165.", [[71, 75], [231, 235]]);	
	// await query("208.78.166.", [[0, 255]]);
}

async function luxembourg() {
	// console.log("LUXEMBOURG");
	// console.log("================================");
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
	// console.log("STOCKHOLM");
	// console.log("================================");
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
		let index = servers.indexOf(state.connect);
		if (index != -1) {
			states[index] = state;
		}
	}).catch((error) => {
		let index = servers.indexOf(ip + ":" + port);
		if (index != -1) {
			servers.splice(index, 1);
			states.splice(index, 1);
		}
	});
	return undefined;
}