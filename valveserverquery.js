const Bot = require("./bot.js");
const Tracker = require("./tracker.js");
const {Queryer} = require("./querying.js");
const config = require("./config.js");

class ValveServerQuery {
	constructor() {
		this.servers = {};

		this.bot = new Bot(this.servers);
		this.queryer = new Queryer(this.servers, () => this.track());
		
		this.trackers = [];
		this.trackers.push(new Tracker(this.servers, config.tmc_hook));
	}

	track() {
		for (let tracker of this.trackers)
			tracker.track();
	}

	run() {
		this.queryer.queryAll();
		this.bot.login(config.bot_token);
	}
};

const vsq = new ValveServerQuery();
vsq.run();
