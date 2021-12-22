const WebSocket = require('ws');
const { WebSocketServer } = WebSocket;
const { v4: uuidv4 } = require('uuid');
var Datastore = require('nedb')
  , db = new Datastore();

const GetRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Stream a message to all the connected clients
 * @param  ws: websocket client
 * @param  data: data to send
 */
const SendMessageToClients = (ws, data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      data['localClient'] = client === ws;
      client.send(JSON.stringify(data));
    }
  });
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.id = uuidv4();
  ws.on('message', function message(data) {
    const parsedData = JSON.parse(data.toString());
    parsedData['clientId'] = ws.id;

    switch (parsedData.action) {
      case 'connected':
        const indexes = [];
        db.find({}).sort({ spawnIndex: 1 }).exec(function (err, docs) {
          docs.forEach((row) => {
            indexes.push(row.spawnIndex);
          })

          let spawnIndex = 0;
          for (let i = 0; i < indexes.length; i++) {
            if (i == 0 && indexes[0] != 0) break;
            spawnIndex = indexes[i] + 1;
            if (i > 0 && indexes[i] - indexes[i - 1] > 1) break;
          }

          const doc = {
            clientId: ws.id,
            username: parsedData.data.username,
            spawnIndex,
            color: GetRandomColor(),
            transform: {
              position: {
                x: 0,
                y: 0,
                z: 0
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0
              }
            }
          };

          db.insert(doc);

          ws.send(JSON.stringify({
            action: 'localConnection',
            data: docs,
          }));

          parsedData.data['spawnIndex'] = doc.spawnIndex;
          parsedData.data['color'] = doc.color;
          SendMessageToClients(ws, parsedData)
        });
        break;
      case 'movement':
        db.findOne({ clientId: ws.id }, function (err, doc) {
          db.update({ clientId: ws.id }, {
            $set: {
              transform: {
                position: {
                  x: parsedData.data.position.x,
                  y: parsedData.data.position.y,
                  z: parsedData.data.position.z
                },
                rotation: {
                  x: parsedData.data.rotation.x,
                  y: parsedData.data.rotation.y,
                  z: parsedData.data.rotation.z
                }
              }
            }
          }, {}, function () {
            parsedData['clientId'] = ws.id;

            SendMessageToClients(ws, parsedData);
          })
        })
        break;
    }
  });

  ws.on('close', function close() {
    console.log('player leave');
    db.remove({ clientId: ws.id });
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          action: 'userLeave',
          clientId: ws.id
        }));
      }
    });
  });
});