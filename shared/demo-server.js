// content of index.js
const http = require('http')
const URL = require('url')
const os = require('os')
const port = 3000

const started = now()

const healthchecks = {
	latest: {},
	liveness: 0,
	readyness: 0,
	log: [],
}

let state = "init"

const codes = {
	"init": 404,
	"sleepy": 418,
	"ok": 200,
	"better": 399,
	"sick": 500,
	"dying": 503,
}

function delayedState(url, stateNow, stateLater) {
	let time = Math.max(url.query.delay | 0, 0)
	if (time == 0) {
		time = 15
	}
	clearTimeout(delayedState.intervalId)
	delayedState.intervalId = setTimeout(() => {
		console.log(`setting state to ${stateLater}`)
		state = stateLater
		if (state == "dead") {
			process.exit(1)
		}
	}, 1000 * time)

	console.log(`setting state from ${state} to ${stateNow}\n .. waiting ${time}s for ${stateLater}`)
	state = stateNow
	return time
}

function setState(newState) {
	clearTimeout(delayedState.intervalId)
	state = newState
}

function now() {
	return (new Date()).toISOString()
}

const requestHandler = (request, response) => {
	let url = URL.parse(request.url, true)

	let msg = `I'm feeling CONFUSED!`

	const data = {
		"meta": {
			"hostname": os.hostname(),
			"msg": null,
			"status": 200,
			"started": started,
		},
		"data": {},
		"debug": {
			"started": started,
			"env": process.env,

			"host": {
				"hostname": os.hostname(),
				"uptime": os.uptime(),
				"totalmem": os.totalmem(),
				"loadavg": os.loadavg(),
				"freemem": os.freemem(),
				"arch": os.arch(),
				"release": os.release(),
				"userInfo": os.userInfo(),
				"type": os.type(),
				"platform": os.platform(),
				"cpus": os.cpus(),
				"networkInterfaces": os.networkInterfaces(),
			},
		},
	}


	if (url.pathname == "/sleep") {
		let time = delayedState(url, "sleepy", "ok")
		msg = `I'm feeling ${state}! sleeping for ${time} seconds`
	} else if (url.pathname == "/wake") {
		setState("ok")
		msg = `I'm feeling ${state}!`
	} else if (url.pathname == "/sick") {
		let time = delayedState(url, "sick", "better")
		msg = `I'm feeling ${state}!`
	} else if (url.pathname == "/medicin") {
		let time = delayedState(url, "better", "ok")
		msg = `I'm feeling ${state}! wait ${time} seconds`
	} else if (url.pathname == "/kill") {
		let time = delayedState(url, "dying", "dead")
		msg = `I'm dying! expected termination in ${time} seconds`
	} else if (url.pathname == "/healthz") {
		const checkType = request.headers['x-check-header']
		if (checkType == "Liveness") {
			healthchecks.liveness++

			healthchecks.latest = {
				type: "live", time: now(), state,
			}
			console.log(healthchecks.latest)

			healthchecks.log.push(healthchecks.latest)
		} else if (checkType == "Readyness") {
			healthchecks.readyness++
			healthchecks.latest = {
				type: "ready", time: now(), state,
			}
			console.log(healthchecks.latest)
			healthchecks.log.push(healthchecks.latest)
		}
		data.data = healthchecks
		msg = `I'm feeling ${state}!`

	} else {
		msg = `I'm feeling ${state}!`
	}

	data.meta.msg = msg
	data.meta.status = codes[state]

	response.statusCode = data.meta.status
	response.end(JSON.stringify(data))
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}

	console.log(`Server is listening on ${port}`)
	delayedState({query: {delay: 10}}, "sleepy", "ok")
})