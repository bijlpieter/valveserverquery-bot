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

	async query(input, ranges, end) {
		for (let ip of ranges)
			for (let port = 27015; port <= end; port++) {
				gamedig.query({type: "tf2", host: input + ip, port: port}).then(this.process).catch(error);
				await sleep(8);
			}
	}

	async stockholm() {
		await this.query('155.133.252.', [100, 103, 108, 114, 117, 120], 27074);
	}

	async madrid() {
		await this.query('155.133.246.', [84], 27074);
	}

	async washington() {
		await this.query('155.133.254.', [116], 27114);
	}

	async singapore() {
		await this.query('103.10.124.', [50, 54, 58], 27074);
	}

	async sydney() {
		await this.query('103.10.125.', [36, 42], 27086);
	}

	async hongkong() {
		await this.query('153.254.86.', [212, 217], 27074);
	}

	async chile() {
		await this.query('155.133.249.', [23, 24], 27074);
	}

	async frankfurt() {
		await this.query('155.133.226.', [116, 117, 124, 125], 27270);
	}

	async chennai() {
		await this.query('155.133.232.', [22], 27086);
	}

	async mumbai() {
		await this.query('155.133.233.', [20, 21, 22], 27054);
	}

	async johannesburg() {
		await this.query('155.133.238.', [41, 42, 80, 82], 27086);
	}

	async tokyo() {
		await this.query('155.133.239.', [68, 71], 27074);
	}

	async peru() {
		await this.query('190.217.33.', [84], 27074);
	}

	async brazil() {
		await this.query('205.185.194.', [82, 83, 84, 85], 27062);
	}


	async queryAll() {
		while (true) {
			await this.stockholm();
			await this.frankfurt();
			await this.madrid();
			await this.washington();
			await this.sydney();
			await this.peru();
			await this.tokyo();
			await this.singapore();
			await this.johannesburg();
			await this.brazil();
			await this.mumbai();
			await this.chennai();
			await this.chile();
			await this.hongkong();
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
