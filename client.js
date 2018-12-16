// Déclaration des variables globales.
var boutonTranmettre;
var list_message;
var champMsg;
var socket;
var timer;
var promptresult;
var users;
var regexPseudo = /^[a-zA-Z0-9_-]{3,16}$/;

//Initialisation
var setupEvents = function() {
    // Affectation des variables globales désignant des éléments de la page html.
    boutonTransmettre = document.getElementById("send");
    list_message = document.getElementById("messages");
    champMsg = document.getElementById("new_msg");
    users = document.getElementById("users");
    // Assignation de l'événement du bouton
    boutonTransmettre.addEventListener("click",transmettre);
    champMsg.addEventListener("keyup",function(key){
        if(key.keyCode == "13"){
            transmettre();
        }
    })
    
    do{
        promptresult = prompt('Entre ton pseudo :')
    }while(!regexPseudo.test(promptresult) || promptresult == "" || promptresult == NaN || promptresult == undefined || promptresult == null);

    // Initialisation de la connexion avec le serveur.
    // ***remplacer localhost par l'adresse ip du serveur. (ici seul un client local fonctionne)
	socket = io.connect('http://192.168.5.58:8080/');
    // mise en place de l'écoute de l'envoie du highscore par le serveur.
    socket.emit('connect', promptresult);
    socket.on('listen', sendMessage);
    socket.on('refresh', function(){
        users.innerHTML = "";
        socket.emit('ping', promptresult);
    })
    socket.on('pong', function(pseudo){
        users.innerHTML = "";
        for(var i=0; i<pseudo.length ;i++){
            var newUser = document.createElement("li");
            newUser.innerText = pseudo[i];
            users.appendChild(newUser);
        }
    })
    socket.on('connected', function(pseudo){
        sendMessage(['connect', '', '', pseudo]);
    })
    champMsg.focus();
}

window.addEventListener("load", setupEvents);


//+-------------------------------+
//| Fonction de gestion de scores |
//+-------------------------------+

var transmettre = function() {
    if(champMsg.value != "" && !champMsg.value.startsWith(" ") && champMsg.value.length > 0){
        socket.emit('message',[promptresult, champMsg.value]);
        champMsg.value="";
    }
}

function sendMessage(tk){
    var type = tk[0];
    var id = tk[1];
    var msg = tk[2];
    var tabl = tk[3];
    var date = new Date();
    var h,m;
    if(date.getHours() < 10){
        h = "0" + date.getHours();
    }else{
        h = date.getHours();
    }
    if(date.getMinutes() < 10){
        m = "0" + date.getMinutes();
    }else{
        m = date.getMinutes();
    }
    var messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    var heure = document.createElement('i');
    heure.innerHTML = h + ":" + m + " ";
    var pseudoHTML = document.createElement('u');
    if(type == "connect" || type == "disconnect"){
        if(type == "connect"){
            pseudoHTML.innerText = tabl.slice(tabl.length-1, tabl.length);
            var text = document.createTextNode(" s'est connecté !");
            messageDiv.style.color = "green";
        }else if(type == "disconnect"){
            pseudoHTML.innerText = tabl;
            var text = document.createTextNode(" s'est déconnecté !");
            messageDiv.style.color = "red";
        }
    }else if(type == "message"){
        pseudoHTML.innerText = id;
        var text = document.createTextNode(" : ");
        var messageHTML = document.createElement('b');
        messageHTML.innerText = msg.replace(":)", "🙂");
        messageHTML.innerText = messageHTML.innerText.replace(":D","😀");
        messageHTML.innerText = messageHTML.innerText.replace(";)","😉");
        messageHTML.innerText = messageHTML.innerText.replace(":o","😮");
        messageHTML.innerText = messageHTML.innerText.replace(":p","😋");
        messageHTML.innerText = messageHTML.innerText.replace(":(","😟");
        messageHTML.innerText = messageHTML.innerText.replace(":'(","😭");
        messageHTML.innerText = messageHTML.innerText.replace(":')","😂");
        messageHTML.innerText = messageHTML.innerText.replace("<3","💖");
        messageHTML.innerText = messageHTML.innerText.replace("*-*","😍");
        messageHTML.innerText = messageHTML.innerText.replace(":*","😘");
    }
    if(type != "nickname"){
        messageDiv.appendChild(heure);
        messageDiv.appendChild(pseudoHTML);
        messageDiv.appendChild(text);
        if(type == "message"){
            messageDiv.appendChild(messageHTML);
        }
        list_message.appendChild(messageDiv);
        list_message.scrollTop = list_message.scrollHeight;
        if(type == "connect"){
            users.innerHTML = "";
            for(var i=0; i<tabl.length ;i++){
                var newUser = document.createElement("li");
                newUser.innerText = tabl[i];
                users.appendChild(newUser);
            }
        }
    }else{
        alert("Nom d'utilisateur déjà utilisé");
        location.reload();
    }
}