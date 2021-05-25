const casual = require("./casualservers.js");

function mapName(map) {
	if (map == "mvm_ghost_town")
		return "ghosttown";
	return map.split('_')[1].substring(0, 13);
}

class Stats {
	constructor(servers) {
		this.servers = 0;
		this.players = 0;
		this.gamemodes = {};
		this.continents = {};

		for (let i = 1; i < casual.gamemodes.length; i++)
			this.gamemodes[casual.gamemodes[i]] = {servers: 0, players: 0, maps: {}, continents: {}};
		for (let i = 1; i < casual.continents.length; i++)
			this.continents[casual.continents[i]] = {servers: 0, players: 0, locations: {}, gamemodes: {}};

		for (let connect in servers) {
			const map = mapName(servers[connect].map);
			const gm = casual.get.gamemode(servers[connect].map);
			const loc = casual.get.location(connect);
			const con = casual.get.continent(connect);
			const players = servers[connect].players.length;

			this.servers++;
			this.players += players;
			this.gamemodes[gm].servers++;
			this.gamemodes[gm].players += players;
			this.continents[con].servers++;
			this.continents[con].players += players;

			if (!this.gamemodes[gm].maps.hasOwnProperty(map))
				this.gamemodes[gm].maps[map] = {servers: 1, players: players};
			else {
				this.gamemodes[gm].maps[map].servers++;
				this.gamemodes[gm].maps[map].players += players;
			}
			if (!this.gamemodes[gm].continents.hasOwnProperty(con))
				this.gamemodes[gm].continents[con] = {servers: 1, players: players};
			else {
				this.gamemodes[gm].continents[con].servers++;
				this.gamemodes[gm].continents[con].players += players;
			}

			if (!this.continents[con].locations.hasOwnProperty(loc))
				this.continents[con].locations[loc] = {servers: 1, players: players};
			else {
				this.continents[con].locations[loc].servers++;
				this.continents[con].locations[loc].players += players;
			}
			if (!this.continents[con].gamemodes.hasOwnProperty(gm))
				this.continents[con].gamemodes[gm] = {servers: 1, players: players};
			else {
				this.continents[con].gamemodes[gm].servers++;
				this.continents[con].gamemodes[gm].players += players;
			}
		}
	}
}

module.exports = Stats;