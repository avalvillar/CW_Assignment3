
// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;
var gameEngine;
var player1;
var player2;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    gameEngine = new GameEngine();

    player = new Player(gameEngine, 0);
    gameEngine.addPlayer(player);
    player2 = new Player(gameEngine, 2);
    gameEngine.addPlayer(player2);
    /*
    var circle = new Circle(gameEngine);
    circle.setIt(0);
    gameEngine.addEntity(circle);
    var circle2 = new Circle(gameEngine);
    circle2.setIt(2);
    gameEngine.addEntity(circle2); */
    for (var i = 0; i < 20; i++) {
        resource = new Resource(gameEngine);
        gameEngine.addEntity(resource);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});
