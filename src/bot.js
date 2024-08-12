const {Client} = require("discord.js");
const {query, stats} = require("./commands.js");

const whitelist = ["267910288622223364"];
function whitelisted(id) { return whitelist.includes(id); }
function allowed(msg) { return !msg.author.bot && msg.channel.type != "dm" && msg.guild.id == "529010184903983125"; }

class Bot {
	constructor(servers) {
		this.client = new Client({disableEveryone: true});
		this.servers = servers;

		this.client.on("ready", () => {
			this.client.user.setActivity("!query | finding servers...", {type: "PLAYING"});
			console.log("Ready!");
		});

		this.client.on("message", (msg) => {
			if (!msg.content.startsWith("!query") && !msg.content.startsWith("!stats"))
				return undefined;

			if (!allowed(msg) && !whitelisted(msg.author.id))
				return msg.channel.send("This bot is reserved for members of The Mannpower Cult!");

			const args = msg.content.split(' ');
			if (args[0] == "!query")
				return query(msg, args.slice(1), this.servers);
			if (args[0] == "!stats")
				return stats(msg, args.slice(1), this.servers);
			return undefined;
		});
	}

	login(token) {this.client.login(token);}
}

module.exports = Bot;
