# Node WebSocket Server (To use with Unity multiplayer game)

This is an example of a Websocket server that uses a local database to keep all the clients updated with the information since the first player is connected.

> This WebSocket server is working with Unity clients on [multiplayer-websocket-client-unity](https://github.com/krlosflip22/multiplayer-websocket-client-unity). <br />

## Installing

```bash
npm install
```

## Message Data Structure

When player connects

```json
{
  "action": "connected",
  "data": {
    "username": "jsConnection"
  }
}
```

Sending player position and rotation in realtime

```json
{
  "action": "movement",
  "data": {
    "position": {
      "x": 1,
      "y": 2,
      "z": 3
    },
    "rotation": {
      "x": 4,
      "y": 5,
      "z": 6
    }
  }
}
```

## Run

```bash
#Install nodemon -- npm install -g nodemon --
nodemon index.js
```

## Test

You can also test with WSCat in multiple consoles

Connect to socket server

```bash
wscat -c ws://localhost:8080
```

Send message

```bash
#When wscat is connected
#Connection
> { "action": "connected", "data": { "username": "jsConnection" } }

#Sending position and rotation
> {"action":"movement","data":{"position":{"x":1,"y":2,"z":3},"rotation":{"x":4,"y":5,"z":6}}}
```
