const {patch} = require("./httpreq.js");
const embeds = require("./embeds.js");
const {directQuery} = require("./querying.js");
const {gm} = require("./casualservers.js");
const {error, sleep} = require("./util.js");

let tracking = false;

class Tracker {
	constructor(servers, hook) {
		this.servers = servers;
		this.url = `https://discord.com/api/webhooks/${hook.id}/${hook.token}/messages/${hook.message}`;
	}

	async updateMP() {
		if (tracking)
			return;
		tracking = true;
		console.log("Tracking mp...");
		while (true) {
			await sleep(1900);
			for (let connect in this.servers["mp"]) {
				const ipport = connect.split(':');
				const state = await directQuery(ipport[0], ipport[1]).catch(error);
				if (!state)
					continue;
				if (!gm.isMP(state.map) || state.players.length == 0)
					delete this.servers["mp"][connect];
				else
					this.servers["mp"][connect] = state;
			}
		}
	}

	async track() {
		this.updateMP();
		while (true) {
			const data = {"embeds": []};
			for (let connect in this.servers["mp"])
				data["embeds"].push(embeds.server(this.servers["mp"][connect]));

			// const risk_server = await directQuery("66.242.13.188", 27015).catch(error);
			// if (risk_server)
			//	data["embeds"].push(embeds.server(risk_server).setColor("#409EFF"));

			if (data["embeds"].length > 10)
				data["embeds"].splice(10);
			if (data["embeds"].length == 0)
				data["embeds"].push(embeds.nomp);
			patch(this.url, data, {"Content-Type": "application/json"}).then(msg => {}).catch(error);
			await sleep(2000);
		}
	}
}

module.exports = Tracker;
