$(function(){
    var config={
        apiKey:"AIzaSyA1TSswtqpHYS4fZ7LvuIMP25AMw_vLcw0",
        authDomain:"rockpaper-5739d.firebaseapp.com",
        databaseURL:"https://rockpaper-5739d.firebaseio.com",
        projectId:"rockpaper-5739d",
        storageBucket: "rockpaper-5739d.appspot.com",
        messagingSenderId: "398505545514",

    };
    firebase.initializeApp(config);
    var database =firebase.database();
    
    var game= {
        reference : "room",
        maxPlayers : 2,
        currentPlayers: 0,
        p1Wins : 0,
        p2Wins : 0,
        p1Losses : 0,
        p2Losses : 0,
        timeOut : ""
     };
     var session = {
         playerId : 0,
         playerName: "",
         choice : "",
         choiceLonger : "",
         isStart : false,
         isChecked : false
     };
     var chatBox ={
        reference : "chat",
        height: 0
    }

    function hideAll(){
        $("#choices1").hide();
        $("#choices2").hide();
        $("#chosen1").hide();
        $("#chosen2").hide();
        $(".inputName").hide();
        $(".playerBox").hide();
     }
     function loadGame(){
        hideAll();
        $(".inputName").show();
        $(".waiting").show();
}

loadGame();
$(".gameStatus").on("click", "#joinBtn", function(){

    var player = $(".nameBar").val().trim();
database.ref(game.reference).once('value').then(function(snapshot){
if(!snapshot.child('player1').exists()){

    session.playerName = player;
    session.playerId = 1;
    database.ref(game.reference+"/player1").update({
        name : player
    });
        $("inputName").hide();
}
else if (!snapshot.child('player2').exists()){
    session.playerName = player;
    session.playerId = 2;
    //console.log(session.playerId)
    console.log(session.playerId);
    database.ref(game.reference+"/player2").update({
            name : player
        });
        $(".inputName").hide();
    }
    else if (snapshot.child('player2').exists() && snapshot.child('player1').exists()){
         //session.playerName = player;
        //session.playerId = 3;

        var message = "Room currently full, try again soon.";
        
        var mssgView = $(".texts");
        mssgView.append("<div class='sentMessage'>" + player + ": " + message + "</div>");
        }
    });
});

database.ref(game.reference).on("value", function(snapshot){
    checkPlayers(snapshot);
    checkDisconnect(snapshot);

});








})




  




