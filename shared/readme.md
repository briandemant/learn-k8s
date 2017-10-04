# Shared files
 
## Demo server

A nodejs server which can be used to demonstrate various states and failures.

### http endpoints

|Endpoint     |Delay|Status|Description
|-------------|:-----:|:------:|-----------
|             |  X  | 404  | -initial status- 
|/sleep       |  X  | 406  | sleep for x seconds then ok  |
|/wake        |     | 200  | ok          |
|/sick        |     | 418  | sick          |
|/medicin     |  X  | 399  | better for x seconds then ok |
|/distract    |     | 504  | never `ends` but times out after 2 min  |
|/slow        |  X  | 200  | waits `delay` before responding  |
|/kill        |  X  | 503  | kill server (cutting any open connections)  |
|/stop        |  X  | 200  | stops the server gracefully  |
|/healthz or /|     | -    | report current state (and status code) |
|(any)        |     | 404  | not found |

all the deplayed ones takes a query parameter `delay` which is 
the delay in seconds the default is 10 seconds, minimum is 1

all endponts takes a query parameter `q` which will make it respond 
with only the msg part of the json

so `http://127.0.0.1:3000/sleep?delay=120` would sleep for 2 minutes.

Any state changing endpoint cancels the previous one.

NOTE: it starts in the sleepy state for 10 seconds

### signals

Listen for all common signals. Those ment to stop it will make it stop 
.. the rest will just output a message