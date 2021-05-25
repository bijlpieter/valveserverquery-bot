const https = require("https");
const url = require("url");

exports.patch = (uri, data, headers = {}) => {
	let q = url.parse(uri);
	let options = {
		hostname: q.hostname,
		port: 443,
		path: q.path,
		search: q.search,
		method: "PATCH",
		headers: headers
	};
	return new Promise((resolve, reject) => {
		const req = https.request(options, res => {
			let fullData = "";
			res.on("data", (data) => {fullData += data});
			res.on("end", () => resolve(fullData));
		})

		req.on("error", (error) => reject(error));

		req.write(JSON.stringify(data));
		req.end();
	});
}