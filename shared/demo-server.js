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
	"lost": 404,
	"sleepy": 406,
	"ok": 200,
	"distracted": 504,
	"better": 399, // kubernetes liveness accepts this
	"sick": 418,
	"stopping": 410,
	"dying": 503,
}

function getDelay(url) {
	let time = Math.max(url.query.delay | 0, 0)
	if (time == 0) {
		time = 10
	}
	return 1000 * time
}

function delayedState(url, stateNow, stateLater) {
	let delay = getDelay(url)
	clearTimeout(delayedState.intervalId)

	if (typeof stateLater == 'string') {
		delayedState.intervalId = setTimeout(() => {
			console.log(`setting state to ${stateLater}`)
			state = stateLater
			if (state == "dead") {
				process.exit(1)
			}
		}, delay)
	} else {
		delayedState.intervalId = setTimeout(stateLater, delay)
	}

	console.log(`setting state from ${state} to ${stateNow}\n .. waiting ${delay}s for ${stateLater}`)
	state = stateNow
	return delay
}

function setState(newState) {
	clearTimeout(delayedState.intervalId)
	state = newState
}

function now() {
	return (new Date()).toISOString()
}

const requestHandler = (request, response) => {
	function respond(state, msg, end = true) {
		response.statusCode = data.meta.status

		let output = `${msg}\n`

		if (typeof url.query.q == 'undefined') {
			data.meta.msg = msg
			data.meta.status = codes[state]

			output = JSON.stringify(data)
		}

		if (end) {
			response.end(output)
		} else {
			response.write(output)
		}
	}

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
			"request": {
				"url": request.url,
				"httpVersion": request.httpVersion,
				"method": request.method,
				"headers": request.headers,
			},
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
	} else if (url.pathname == "/distract") {
		msg = `I was distracted .. please wait ... like, 2 min :)`
		delayedState(url, "distracted", state)
		return respond("distracted", msg, false)
	} else if (url.pathname == "/slow") {
		return setTimeout(() => {
			respond("ok", `I am slow :)`)
		}, getDelay(url))
	} else if (url.pathname == "/kill") {
		let time = delayedState(url, "dying", "dead")
		msg = `I'm dying! expected termination in ${time} seconds`
	} else if (url.pathname == "/stop") {
		return delayedState(url, "stopping", () => {
			console.log("The server will be stopped")
			respond("stopping", `I'm am now stopping`)
			server.close(() => {
				console.log("The server has been stopped")
			})
		})
	} else if (url.pathname == "/healthz" || url.pathname == "/") {
		const checkType = request.headers['x-check-header']
		data.data = healthchecks
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

		if (healthchecks.log.length == 0) {
			data.data = {}
		}

		msg = `I'm feeling ${state}!`

	} else {
		return respond("lost", `I'm feeling CONFUSED!`)
	}

	respond(state, msg)
}

const server = http.createServer(requestHandler)

// server.setTimeout(120 * 1000, (socket) => {
// 	console.log("timeout triggered")
// 	console.log(socket.end())
//
//
// })
server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}

	console.log(`Server is listening on ${port}`)
	delayedState({query: {delay: 10}}, "sleepy", "ok")
})