const casual = require("./casualservers.js").get;

function hasPlayer(state, names, exact) {
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

function filterMap(servers, args, check) {
	for (let connect in servers)
		if (!args.includes(check(servers[connect].map)))
			delete servers[connect];
}

function filterPlayer(servers, args, exact = false) {
	for (let connect in servers)
		if (!hasPlayer(servers[connect], args, exact))
			delete servers[connect];
}

function serverFilter(servers, filters) {
	for (let filter in filters)
		switch(filter) {
			case "continent": filterConnect(servers, filters[filter], casual.continent); break;
			case "location": filterConnect(servers, filters[filter], casual.location); break;
			case "gamemode": filterMap(servers, filters[filter], casual.gamemode); break;
			case "map": filterMap(servers, filters[filter], (map) => {return map;}); break;
			case "player": filterPlayer(servers, filters[filter]); break;
			case "exact": filterPlayer(servers, filters[filter], true); break;
		}
}

function parse(args) {
	let specifier = "-err";
	let filter = {};
	for (let i = 0; i < args.length; i++) {
		if (args[i].startsWith('-'))
			switch(args[i]) {
				case "-c": case "-con": case "-continent": specifier = "continent"; break;
				case "-l": case "-loc": case "-location": specifier = "location"; break;
				case "-gm": case "gamemode": specifier = "gamemode"; break;
				case "-m": case "-map": specifier = "map"; break;
				case "-p": case "-player": specifier = "player"; break;
				case "-ep": case "-exactplayer": specifier = "exact"; break;
			}
		else if (!filter.hasOwnProperty(specifier))
			filter[specifier] = [args[i]];
		else
			filter[specifier].push(args[i]);
		if (specifier == "-p" || specifier == "-player" || specifier == "-ep" || specifier == "-exactplayer")
			while (i + 2 < args.length && !args[i + 2].startsWith('-') && !args[i + 1].startsWith('-')) {
				args[i + 1] += ' ' + args[i + 2];
				args.splice(i + 2, 1);
			}
	}
	return filter;
}

function Filter(args) {
	return (servers) => serverFilter(servers, parse(args));
}

module.exports = {Filter, parse};