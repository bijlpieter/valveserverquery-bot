# valveserverquery-bot
## What is this?
It started out as a simple project designed to be able to query valve's source (TF2 in specific) servers using [Valve Server Query Protocol](https://developer.valvesoftware.com/wiki/Server_queries). As a long time mannpower fan, this project then got extended with other features that allow it to display and update current servers in a discord channel for the entire community.
## How to use?
In order to prevent unmonitored use of the bot, my hosted version prevents users outside the mannpower community from using the bot.  
Would you like to use it yourself? Host the (`node.js`) bot locally using `node valveserverquery`, or set it up somewhere else (Mine is hosted on [heroku](https://www.heroku.com/)).
Use `!query` in your server with the bot to view the search options. Nearly all official TF2 servers by valve will be searched. Note that due to the sheer amount of servers, the server you're searching for may not have been found yet by the bot. It takes around 100 seconds to check every server.
## How does the code work?
There are 3 separate routines:
- Server querying
- User driven search
- Updating mannpower channel
### Server querying
This routine actually queries all of valve's servers. All of the IP ranges (for TF2 specifically) were experimentally determined and may go out of date. Please send PR if you are able to get similar performance using valve's GCs or using valve's [Master Server Query Protocol](https://developer.valvesoftware.com/wiki/Master_Server_Query_Protocol). Sleeping is used in order to be able to keep up with the incoming responses.  
If a server is found with players on it, it will be added to the `servers` object. If the server doesn't have any players on it, it'll be removed. This way the bot keeps a running database of every casual servers. In case of a user search, this object is used in order to quickly find all servers that satisfy the query's conditions.  
### User driven search
When the discord bot receives a `!query` or `!stats`, it parses the options, creates a copy of the `servers` object and removes all entries that do not satisfy the users options. It then loops through the remaining entries in the `servers` objects and requeries these servers. The server's response is rechecked, and then sent to the discord channel. This ensures up to date server information.
### Updating mannpower
One thread loops through the `servers[mp]` object, continuously updating every mannpower server. Another thread is managing a webhook, and edits a message with all the servers in the object as an embed. If a server ends up being removed, the embed is removed. If a new server pops up, a new embed is added. A webhook is used because you can send up to 10 embeds in a single message, as opposed to a discord bot, which can only add 1.
## Files
```
bot.js              The class managing the discord bot, and handles incoming messages.
casualfilter.js     Used for parsing messages and filtering all servers according to the user's query parameters.
casualservers.js    All kinds of utility functions and constants that apply to TF2 casual matchmaking, such as locations and gamemodes given an IP / Map.
commands.js         All of the bot commands, !query and !stats.
config.js           Contains all config variables, such as tokens and ids that allow us to access the discord API.
embeds.js           Contains predefined embeds and functions that build all kinds of discord embeds to display the information in discord.
httpreq.js          Simple PATCH https request function that is used to update webhook messages.
querying.js         Defines a class that handles all of the tf2 casual server querying using gamedig, as well as a simple wrapper that queries a tf2 server by ip:port.
statistics.js       A class that calculates all of the statistics given an object of casual servers; used for the !stats command.
tracker.js          The class managing a webhook, specifically to update mannpower servers and edit the webhook message with the new info.
util.js             Utility sleep and error function.

valveserverquery.js The main file that runs all of the above
```
