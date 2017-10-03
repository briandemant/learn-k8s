# Shared files
 
 
## Demo server

|endpoint|delay|status|description|
|--------|-----|------|-----------|
|        |  X  | 418  | -initial status- |
|/sleep  |  X  | 418  | sleep for x seconds then ok  |
|/wake   |     | 418  | ok          |
|/sick   |     | 500  | sick          |
|/medicin|  X  | 399  | better for x seconds then ok |
|/kill   |  X  | 503  | dying for x seconds then gone  |
|(any)   |     | -    | report current state (and code) |

all the deplayed ones takes a query parameter `delay` which is 
the delay in seconds the default is 10 seconds

so `http://127.0.0.1:3000/sleep?delay=120` would sleep for 2 minutes.

Any state changing endpoint cancels the previous one.

NOTE: it starts in the sleepy state for 10 seconds