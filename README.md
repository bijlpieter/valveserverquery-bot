# valveserverquery-bot
## What is this?
It started out as a simple project designed to be able to query valve's source (TF2 in specific) servers using [Valve Server Query Protocol](https://developer.valvesoftware.com/wiki/Server_queries). As a long time mannpower fan, this project then got extended with other features that allow it to display and update current servers in a discord channel for the entire community.
## How to use?
In order to prevent unmonitored use of the bot, my hosted version prevents users outside the mannpower community from using the bot.  
Would you like to use it yourself? Host the (`node.js`) bot locally using `node valveserverquery`, or set it up somewhere else (Mine is hosted on [heroku](https://www.heroku.com/)).
Use `!query` in your server with the bot to view the search options. Nearly all official TF2 servers by valve will be searched. Note that due to the sheer amount of servers, the returned information may be outdated by ~1 minute.
## How does the code work?
There are 3 separate routines:
- Server querying
- User driven search
- Updating mannpower channel
### Server querying
This routine actually queries all of valve's servers. All of the IP ranges (for TF2 specifically) were experimentally determined and may go out of date. Please send PR if you are able to get similar performance using valve's GCs or using [Master Server Query Protocol](https://developer.valvesoftware.com/wiki/Master_Server_Query_Protocol). Sleeping is used in order to be able to keep up with the incoming responses.  
If a server is found with/without players on it, it will be added/removed to the `servers` object. In case of a user search, this object is used in order to quickly find all servers that satisfy the query's conditions.  
If a server is running mannpower, it is added to the `mannpower` object.
### User driven search
When the discord bot receives a `!query`, it parses the options, creates a copy of the `servers` object and removes all entries that do not satisfy the users options. It then loops through the remaining entries in the `servers` objects and requeries these servers. The server's response is then sent to the discord channel. This ensures up to date server information, but may very occasionally cause the bot to output a server that does not satisfy the user's options anymore.
### Updating mannpower
One thread loops through the `mannpower` object, which is considerably shorter than the `servers` object due to there being only a few concurrent servers running the gamemode. Each server is mapped to a discord message in the specified discord channel. The thread queries every entry and then edits the discord message with the updated server information. The message is deleted if the server changes to non-mannpower or every player leaves the server. If the server querying routine adds a fresh server to the object, it will not have a message mapped to it yet. In this case, the bot will send a new message to the discord channel.
Note: The editing process is heavily slowed down using sleeps in order to not exceed discord's rate limits and what not.
