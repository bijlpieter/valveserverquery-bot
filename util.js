error = (err) => {};
sleep = (ms) => { return new Promise(r => setTimeout(r, ms)); };

module.exports = {error, sleep};