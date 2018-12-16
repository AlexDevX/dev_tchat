var http = require('http');
var url = require('url');
var fs = require('fs');
var users = [];
var usersID = [];
console.log('\x1b[33m', 'Démarrage du serveur...');
var sockets = []; // Pour stocker les sockets des différents clients connectés.


// Gestion des chargements par le client des fichiers client.html, client.js et socket.io.js.
var server = http.createServer(function(req, res) {
    var page=url.parse(req.url).pathname;
    if (page == '/') {
        fs.readFile('./client.html', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(content);
        })
    }
    else if (page == '/client.js'){
        fs.readFile('./client.js', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(content);
        })
    }
    else if (page == '/socket.io/socket.io.js'){
        fs.readFile('./socket.io/socket.io.js', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(content);
        })
    }
    else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("Fichier non trouvé.\n");
        res.end();
    }
});

// Chargement de socket.io
var io = require('socket.io').listen(server);
io.set('log level', 1);
console.log('\x1b[35m', 'Serveur démarré !');
// Fonction qui classe un score.
// ***les console.log(...) sont inutile, ils permettent juste de voir ce que fait le serveur en temps réel.
var classer = function (message) {
        console.log("\x1b[36m", message[0] + " → " + message[1]);
        for (var i=0; i<sockets.length; i++) {
            sockets[i].emit('listen',['message', message[0], message[1], '']);
        }
    }            
// Quand on client se connecte, on le note dans la console et envoie un message au client
io.sockets.on('connection', function (socket) {
    // ajout de la socket à la liste.
    sockets.push(socket);
    // Quand le serveur reçoit un signal de type "score" du client, il le classe
    socket.on('connect', function(pseudo){
        var secure = false;
        if(usersID.length == 0) {
            secure = false;
        }else{
            for(var p=0; p<usersID.length; p++){
                if (pseudo.toString() == usersID[p].username){
                    secure = true;
                }
            }
        }
        if(secure == false){
            console.log("\x1b[32m", pseudo + " s'est connecté");
            usersID.push({id:socket.id,username:pseudo});
            users.push(pseudo);
            for (var i=0; i<sockets.length; i++) {
                sockets[i].emit('listen',['connect', '', '', users]);
            }
        }else{
            socket.emit('listen',['nickname', '', '', '']);
        }
    })
    socket.on('ping', function(pseudo){
        users.push(pseudo);
        for (var i=0; i<sockets.length; i++) {
            sockets[i].emit('pong',users);
        }
    })
    socket.on('disconnect', function(){
        users = [];
        for(var a=0; a<usersID.length; a++){
            if(usersID[a].id == socket.id){
                console.log("\x1b[31m", usersID[a].username + " s'est déconnecté");
                for (var b=0; b<sockets.length; b++) {
                    sockets[b].emit('listen',['disconnect', '', '', usersID[a].username]);
                }
                if(a > -1){
                    usersID.splice(a, 1);
                }
            }
        }
        for (var i=0; i<sockets.length; i++) {
            sockets[i].emit('refresh');
        }
    })
    socket.on('message', classer);
});

// Lancement du serveur
server.listen(8080);
