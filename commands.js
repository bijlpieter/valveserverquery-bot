const embeds = require("./embeds.js");
const {refresh, directQuery} = require("./querying.js");
const {error, sleep} = require("./util.js");
const {Filter, parse} = require("./casualfilter.js");
const Stats = require("./statistics.js");

function sendHelp(msg, servers) {
	return msg.channel.send(embeds.help);
}

function queryServer(msg, connect) {
	const ipport = connect.split(':');
	if (ipport.length != 2)
		return msg.channel.send(embeds.help);

	directQuery(ipport[0], ipport[1]).then(state => msg.channel.send(embeds.server(state))).catch(err => msg.channel.send(embeds.notresponding(connect)));
	return undefined;
}

function allServers(servers) {
	let ret = {};
	for (let gamemode in servers)
		for (let connect in servers[gamemode])
			ret[connect] = servers[gamemode][connect];
	return ret;
}

async function searchCasual(msg, args, servers) {
	const filter = Filter(args);
	const all = allServers(servers);
	filter(all);
	await refresh(all);
	filter(all);

	msg.channel.send(embeds.results(all));

	let i = 0;
	for (let connect in all) {
		msg.channel.send(embeds.server(all[connect]));
		if (++i == 4) // Don't send more than 4 servers to avoid cluttering the channel with an infinite list of servers
			break;
		await sleep(500);
	}
	return undefined;
}

function query(msg, args, servers) {
	if (args.length == 0)
		return sendHelp(msg, servers);
	if (args.length == 1)
		return queryServer(msg, args[0]);
	return searchCasual(msg, args, servers);
}

async function stats(msg, args, servers) {
	const filters = parse(args);
	const filter = Filter(args);
	const all = allServers(servers);
	filter(all);
	let stats = new Stats(all);

	if (filters.hasOwnProperty("gamemode")) {
		for (let gm of filters["gamemode"])
			if (stats.gamemodes.hasOwnProperty(gm)) {
				msg.channel.send(embeds.stats(stats.gamemodes[gm], "maps", "continents", ` \` ${gm} \` `));
				await sleep(500);
			}
		return undefined;
	}

	if (filters.hasOwnProperty("continent")) {
		for (let con of filters["continent"])
			if (stats.continents.hasOwnProperty(con)) {
				msg.channel.send(embeds.stats(stats.continents[con], "gamemodes", "locations", ` \` ${con} \` `));
				await sleep(500);
			}
		return undefined;
	}
	
	return msg.channel.send(embeds.stats(stats, "gamemodes", "continents"));
}

module.exports = {query, stats};