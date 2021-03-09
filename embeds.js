const {MessageEmbed} = require("discord.js");
const loc = require("./casualservers.js").loc;

function error(error) {
	const invalid = new MessageEmbed();
	invalid.addField(`Option specifier \`"${error}"\` is invalid! Try any one of the following:`, `
\`\`\`
	-continent           -c
	-location            -l
	-gamemode            -gm
	-map                 -m
	-player              -p
	-exactplayer         -ep
\`\`\`
	`);
	return invalid;
}

function results(servers) {
	let total = 0
	for (let i in servers)
		total++;

	const embed = new MessageEmbed();
	embed.setTitle(`Found ${total} server${total == 1 ? "" : "s"}!`);
	embed.setColor("#42b548");
	return embed;
}

function formatUsername(username) {
	username = username.replace("\n", " ");
	username = username.replace("\u200F", "*");
	return username.substring(0, 30);
}

function server(state) {
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

	const embed = new MessageEmbed();
	embed.setTitle(state.name);
	embed.setDescription(string);
	if (loc.isLUX(state.connect)) embed.setColor("#ea3115");
	if (loc.isSTO(state.connect)) embed.setColor("#ea5815");
	if (loc.isMAD(state.connect)) embed.setColor("#eae715");
	if (loc.isVIR(state.connect)) embed.setColor("#63ea15");
	if (loc.isLAX(state.connect)) embed.setColor("#15ea71");
	if (loc.isMWH(state.connect)) embed.setColor("#002800");
	if (loc.isHKG(state.connect)) embed.setColor("#15c3ea");
	if (loc.isSGP(state.connect)) embed.setColor("#155fea");
	if (loc.isTKY(state.connect)) embed.setColor("#8e15ea");
	if (loc.isCHI(state.connect)) embed.setColor("#654321");
	return embed;
}

function notresponding(connect) {
	const embed = new MessageEmbed();
	embed.setTitle(`\`${connect}\``);
	embed.setDescription("Server not responding after 3 retries");
	return embed;
}

const nomp = new MessageEmbed();
nomp.setTitle("There are currently no known mannpower servers! :(");
nomp.setColor("#ea3115");

const help = new MessageEmbed();
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
help.addField("There are 6 possible options and their shorthands:", `
\`\`\`
	-continent           -c
	-location            -l
	-gamemode            -gm
	-map                 -m
	-player              -p
	-exactplayer         -ep
\`\`\`
`);
help.addField("\`-c\`, \`-l\` and \`-gm\` have limited options as parameters:", `
\`\`\`c
	-c [eu, na, sa, as, af, oc]
	-l [lux, sto, mad, vir, lax, mwh, sgp, tky, hkg, chi, sny]
	-gm [ad, ctf, koth, cp, pl, plr, misc, mp, pass, pd, mvm]
\`\`\`
`);
help.addField("\`-m\` and \`-p\` can be used with any parameters:", `
\`\`\`c
	-m pl_upward
	-p Chrysophylaxs
\`\`\`
`);
help.addField("If you use multiple different options, the bot will search for servers where all options are true", `
\`\`\`c
	!query -c eu -m ctf_hellfire
		will find servers running hellfire in eu
\`\`\`
`);
help.addField("If you use one option with multiple parameters, the bot will search for servers where at least 1 of the option parameters is true", `
\`\`\`c
	!query -gm mp pass
		will find servers running mannpower OR passtime
	!query -c eu -m pl_upward -c na
		will find servers in eu OR na that run pl_upward
\`\`\`
`);
help.addField("Similarly, you can use \`!stats\` in order to get current statistics about all casual servers, or a particular continent or gamemode", `
\`\`\`c
	!stats
	!stats -gm cp
	!stats -c eu
\`\`\`
`);

function serverPlayerString(obj, tservers, tplayers) {
	let str = "```c\n";
	for (let k in obj) {
		if (obj[k].servers == 0)
			continue;
		str += k;
		for (let i = k.length; i < 14; i++)
			str += " ";
		
		str += `| ${obj[k].servers} `;
		for (let i = obj[k].servers.toString().length; i < 3; i++)
			str += " ";
		let percent = (obj[k].servers / tservers * 100).toFixed(1);
		str += `(${percent} %)`;
		for (let i = percent.toString().length; i < 5; i++)
			str += " ";
		str += `| ${obj[k].players} `;
		for (let i = obj[k].players.toString().length; i < 5; i++)
			str += " ";
		percent = (obj[k].players / tplayers * 100).toFixed(1);
		str += `(${percent} %)\n`;
	}
	str += "```";
	return str;
}

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

function stats(stats, attr1, attr2, title = "Casual") {
	const embed = new MessageEmbed();
	embed.setTitle(`Current ${title} Statistics`);
	embed.setColor("#42b548");
	embed.addField("Total Servers:", `\`\`\`c\n${stats.servers}\`\`\``, true);
	embed.addField("Total Players:", `\`\`\`c\n${stats.players}\`\`\``, true);
	if (stats.servers == 0)
		return embed;

	embed.addField("============================================", "```c\nCategory:     | Servers:     | Players:     ```")
	embed.addField(`${capitalize(attr1)}:`, serverPlayerString(stats[attr1], stats.servers, stats.players));
	embed.addField(`${capitalize(attr2)}:`, serverPlayerString(stats[attr2], stats.servers, stats.players));

	return embed;
}

module.exports = {help, server, error, notresponding, nomp, results, stats};