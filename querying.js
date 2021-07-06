const gamedig = require("gamedig");
const casual = require("./casualservers.js")
const {sleep, error} = require("./util.js");

class Queryer {
	constructor(servers, ready = undefined) {
		this.servers = servers;
		this.operational = false;
		this.onOperational = ready;

		for (let i = 1; i < casual.gamemodes.length; i++)
			this.servers[casual.gamemodes[i]] = {};

		this.process = (state) => {
			if (state.raw.game != "Team Fortress")
				return;

			const gm = casual.get.gamemode(state.map)
			if (state.players.length > 0)
				this.servers[gm][state.connect] = state;
			else if (this.servers[gm].hasOwnProperty(state.connect))
				delete this.servers[gm][state.connect];
		}
	}

	async query(input, ranges, end = 27075) {
		for (let [from, to] of ranges)
			for (let ip = from; ip <= to; ip++)
				for (let port = 27015; port < end; port++) {
					gamedig.query({type: "tf2", host: input + ip, port: port}).then(this.process).catch(error);
					await sleep(8);
				}
	}

	async luxembourg() {
		await this.query("146.66.152.", [[163, 166]]);
		await this.query("146.66.153.", [[72, 75], [232, 235]]);
		// await this.query("146.66.154.", [[0, 255]]);
		// await this.query("146.66.155.", [[0, 255]]);	
		await this.query("146.66.158.", [[167, 170]]);
		await this.query("146.66.159.", [[71, 74], [230, 233]]);

		// await this.query("155.133.228.", [[0, 255]]);
		// await this.query("155.133.229.", [[0, 255]]);
		await this.query("155.133.240.", [[167, 170]]);
		await this.query("155.133.241.", [[71, 74]]);
	}

	async stockholm() {
		await this.query("146.66.156.", [[167, 168]]);
		await this.query("146.66.157.", [[71, 72], [232, 233]]);

		await this.query("155.133.242.", [[167, 168]]);
		await this.query("155.133.243.", [[71, 72]]);

		await this.query("185.25.180.", [[167, 168]]);
		await this.query("185.25.181.", [[71, 72], [230, 235]]);

		await this.query("155.133.252.", [[100, 100], [103, 103], [105, 105], [108, 108], [114, 114], [117, 117], [120, 120]]);
		// await this.query("185.25.182.", [[0, 255]]);
	}

	async madrid() {
		// await this.query("155.133.246.", [[0, 255]]);
		await this.query("155.133.247.", [[142, 145]]);
		// await this.query("155.133.248.", [[0, 255]]);
	}

	async virginia() {
		// await this.query("208.78.164.", [[71, 75], [167, 170], [230, 235]]);
		await this.query("208.78.165.", [[163, 165], [231, 235]]);
		await this.query("208.78.166.", [[228, 229]]);
		await this.query("162.254.192.", [[146, 155]]);
	}

	async losangeles() {
		// await this.query("162.254.194.", [[146, 166]]);
		await this.query("162.254.195.", [[114, 118]]);
	}

	async washington() {
		// await this.query("192.69.96.", [[0, 255]]);
		await this.query("192.69.97.", [[60, 62]]);
	}

	async singapore() {
		await this.query("103.28.54.", [[163, 164]]);
		await this.query("103.28.55.", [[71, 73], [232, 233]]);
		// await this.query("103.10.124.", [[0, 255]]);
		await this.query("45.121.184.", [[163, 164]]);
		await this.query("45.121.185.", [[67, 68], [228, 229]]);
	}

	async hongkong() {
		await this.query("155.133.244.", [[76, 78], [236, 238]]);
	}

	async tokyo() {
		await this.query("45.121.186.", [[160, 162]]);
		await this.query("45.121.187.", [[60, 62]]);
	}

	async sydney() {
		// await this.query("103.10.125.", [[0, 255]]);
	}

	async peru() {
		// await query('143.137.146.', [[0, 255]]);
		await this.query("190.217.33.", [[84, 85]]);
	}

	async chile() {
		// Other SA
		// await this.query("209.197.29.", [[0, 255]]);
		// await this.query("209.197.25.", [[0, 255]]);
		// await this.query("205.185.194.", [[0, 255]]);
		await this.query("155.133.249.", [[91, 92]]);
	}

	async special() {
		await this.query("155.133.226.", [[116, 116], [124, 124]], 27271);
	}

	async queryAll() {
		while (true) {
			// await this.luxembourg();
			await this.special();
			await this.stockholm();
			await this.madrid();
			await this.virginia();
			await this.losangeles();
			await this.washington();
			await this.peru();
			await this.chile();
			await this.singapore();
			await this.hongkong();
			await this.tokyo();
			// await this.sydney();
			if (!this.operational) {
				this.operational = true;
				if (this.onOperational)
					this.onOperational();
			}
		}
	}
}

function directQuery(ip, port) {
	return gamedig.query({type: "tf2", host: ip, port: port, socketTimeout: 3000, maxAttempts: 3});
}

function refresh(servers) {
	let i = 0;
	let promises = [];
	for (let connect in servers) {
		const ipport = connect.split(':');
		promises.push(directQuery(ipport[0], ipport[1]).then(state => servers[connect] = state).catch(err => delete servers[connect]));
		if (++i == 6)
			break;
	}
	return Promise.allSettled(promises);
}

module.exports = {refresh, directQuery, Queryer};
