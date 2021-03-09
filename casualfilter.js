const casual = require("./casualservers.js").get;

function hasPlayers(state, names, exact) {
	for (let player of state.players) {
		if (!player.hasOwnProperty("name"))
			continue;

		for (let name of names)
			if (player.name == name)
				return true;

		if (!exact)
			for (let name of names)
				if (player.name.includes(name))
					return true;
	}
	return false;
}

function filterConnect(servers, args, check) {
	for (let connect in servers)
		if (!args.includes(check(connect)))
			delete servers[connect];
}

function filterMaps(servers, args, check) {
	for (let connect in servers)
		if (!args.includes(check(servers[connect].map)))
			delete servers[connect];
}

function filterPlayers(servers, names, exact = false) {
	for (let connect in servers)
		if (!hasPlayers(servers[connect], names, exact))
			delete servers[connect];
}

function serverFilter(servers, filters) {
	for (let filter in filters)
		switch(filter) {
			case "continent": filterConnect(servers, filters[filter], casual.continent); break;
			case "location": filterConnect(servers, filters[filter], casual.location); break;
			case "gamemode": filterMaps(servers, filters[filter], casual.gamemode); break;
			case "map": filterMaps(servers, filters[filter], (map) => {return map;}); break;
			case "player": filterPlayers(servers, filters[filter]); break;
			case "exact": filterPlayers(servers, filters[filter], true); break;
		}
}

function getSpecifier(opt) {
	switch(opt) {
		case "-c": case "-con": case "-continent":
			return "continent";
		case "-l": case "-loc": case "-location":
			return "location";
		case "-gm": case "-gamemode":
			return "gamemode";
		case "-m": case "-map":
			return "map";
		case "-p": case "-player":
			return "player";
		case "-ep": case "-exactplayer": case "-exact":
			return "exact";
		default:
			return "error";
	}
}

function parse(args) {
	let specifier = "error";
	let filter = {};
	for (let i = 0; i < args.length; i++) {
		if (args[i].startsWith('-')) {
			specifier = getSpecifier(args[i]);
			continue;
		}

		if (specifier == "player" || specifier == "exact")
			while (i + 1 < args.length && !args[i + 1].startsWith('-') && !args[i].startsWith('-'))
				args[i] += ' ' + args.splice(i + 1, 1)[0];

		if (!filter.hasOwnProperty(specifier))
			filter[specifier] = [args[i]];
		else
			filter[specifier].push(args[i]);
	}
	return filter;
}

function Filter(args) {
	return (servers) => serverFilter(servers, parse(args));
}

module.exports = {Filter, parse};