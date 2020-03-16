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

function checkPlayers (snapshot){
    if (snapshot.child('player1').exists()){
        $(".name1").text(snapshot.val().player1.name);
        $("playerBox1").show();
        $(".waiting1").hide();
    }
    else{
        game.p1Wins = 0;
        game.p1Losses = 0;
        game.p2Losses = 0;
        game.p2Wins = 0;
        session.isStart = false;
        session.isChecked = false;
        $(".name1").text("");
        $(".playerBox1").hide();
        $("waiting1").show();
        $(".choices").hide();
        $(".chosen").hide();
        updateWinLoseTag();
        $(".outcome").text("");
        if(snapshot.child('player2').child("wins").exists()){
            database.ref('room/player2').update({
                wins : null,
                loses: null
            });
        }

        if(snapshot.child('player2').child("choice").exists()){
            database.ref('room/player2').update({
                choice : null,
                lChoice: null

            });
        }
    }

    if(snapshot.child('player2').exists()){
        $(".name2").text(snapshot.val().player2.name);
        $(".playerBox2").show();
        $(".waiting2").hide();
    }
    else{
        game.p1Wins = 0;
        game.p1Losses = 0;
        game.p2Losses = 0;
        game.p2Wins = 0;
        sessionStorage.isStart = false;
        session.isChecked = false;
        $(".name2").text("");
        $("playerBox2").hide();
        $("waiting2").show();
        $("choices").hide();
        $("chosen").hide();
        updateWinLoseTag();
        $(".outcome").text("");
        clearTimeout(game.timeOut);
        if(snapshot.child('player1').child("wins").exists()){
                database.ref('room/player1').update({
                    wins : null,
                    loses: null
                });
        }
        if(snapshot.child('player1').child("choice").exists()){
            database.ref('room/player1').update({
                choice : null,
                lChoice: null
            });
        }
    }

    if(snapshot.child('player1').exists() && snapshot.child('player2').exists()){
            startGame();
            checkChoices(snapshot);
        }
    }
    function startGame(){
        if(!session.isStart){
            $("#choices" + session.playerId).show();
            session.isStart = true;
        }
    }

    $("options").on("click", ".selection", function(){
        session.choice = $(this).attr("id");
        session.choiceLonger = $(this).text();
        database.ref(game.reference+"/player"+session.playerId).update({
            choice : session.choice,
            lChoice : session.choiceLonger
        });
        var chosen = $("#chosen" + session.playerId);
        chosen.text(session.choiceLonger);
        $("#choices" + session.playerId).hide();
        chosen.show();
    });

    function checkChoices(snapshot){
        if(!session.isChecked){
            if(snapshot.val().player2.choice !== undefined && snapshot.val().player1.choice !== undefined){
                $("chosen1").text(snapshot.val().player1.lChoice);
                $("chosen2").text(snapshot.val().player2.lChoice);
                 $(".chosen").show();
                 session.isChecked = true;
                 checkResult(snapshot.val().player1.choice, snapshot.val().player2.choice);
            
                }
            }
        }

        function checkResult(choice1 , choice2){
            if(choice1 === "r" && choice2 === "s" ||
            choice1 === "p" && choice2 === "r" ||
            choice1 === "s" && choice2 === "p" )
         {
             game.p1Wins++;
             game.p2Losses++;
             resultBox("player1");
            }
            else if(choice1 === "r" && choice2 === "p" ||
            choice1 === "p" && choice2 === "s" || 
            choice1 === "s" && choice2 === "r")

            {
                game.p1Losses++;
                game.p2Wins++;
                resultBox("player2");
            }
            else if (choice1 === choice2)
            {
                resultBox("tie");
            }

            updateScores();
            updateWinLoseTag();
        }

        function resultBox(result){
            var resultMessage = $("<div>");
            if(result !== "tie"){
                database.ref(game.reference+"/"+result).once("value").then(function(snapshot){
                        resultMessage.html("<h3>Winner</h3><h2>" + snapshot.val().name + "</h2>");
                    });
                    
                }
                else if(result === "tie"){
                    resultMessage.html("<h2>It's a tie</h2>");
                }
        }
        
            






//

        












    
    
    
    
    }


}







})




  




