// content of index.js
const http = require('http');
const URL = require('url');
const os = require('os');
const port = 3000;

let state = "init";
const codes = {
	"init": 418,
	"sleepy": 418,
	"ok": 200,
	"better": 399,
	"sick": 500,
	"dying": 503,
};

function delayedState(url, stateNow, stateLater) {
	let time = Math.max(url.query.for | 0, 0);
	if (time == 0) {
		time = 10
	}
	clearTimeout(delayedState.intervalId);
	delayedState.intervalId = setTimeout(() => {
		console.log(`setting state to ${stateLater}`);
		state = stateLater
		if (state == "dead") {
			process.exit(1)
		}
	}, 1000 * time);

	console.log(`setting state from ${state} to ${stateNow}\n .. waiting ${time}s for ${stateLater}`);
	state = stateNow;
	return time;
}

const requestHandler = (request, response) => {
	let url = URL.parse(request.url, true);

	let msg = `I'm feeling CONFUSED!`;

	if (url.pathname == "/sleep") {
		let time = delayedState(url, "sleepy", "ok");
		msg = `I'm feeling ${state}! sleeping for ${time} seconds`
	} else if (url.pathname == "/kill") {
		clearTimeout(delayedState.intervalId);
		let time = delayedState(url, "dying", "dead");
		msg = `I'm dying! expected termination in ${time} seconds`
	}  else if (url.pathname == "/sick") {
		clearTimeout(delayedState.intervalId);
		state = "sick"
		msg = `I'm not feeling ${state}!`;
	} else if (url.pathname == "/wake") {
		clearTimeout(delayedState.intervalId);
		state = "ok"
		msg = `I'm feeling ${state}!`;
	} else if (url.pathname == "/medicin") {
		let time = delayedState(url, "better", "ok");
		msg = `I'm feeling ${state}! wait ${time} seconds`
	} else {
		msg = `I'm feeling ${state}!`;
	}

	response.statusCode = codes[state];
	response.end(JSON.stringify({
		"msg": msg,
		"status": codes[state],
		"host": {
			"hostname": os.hostname(),
			"arch": os.arch(),
			"release": os.release(),
			"userInfo": os.userInfo(),
			"type": os.type(),
			"platform": os.platform(),
			"totalmem": os.totalmem(),
			"cpus": os.cpus().length,
			"networkInterfaces": Object.keys(os.networkInterfaces()).length,
		},
		"env": process.env,
		"debug": {
			"uptime": os.uptime(),
			"freemem": os.freemem(),
			"loadavg": os.loadavg(),
			"cpus": os.cpus(),
			"networkInterfaces": os.networkInterfaces(),
		},
	}))
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}

	console.log(`server is listening on ${port}`);
	delayedState({query: {}}, "sleepy", "ok");
});