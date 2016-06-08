/*
Comutational Worlds: Assignment 2

The two colors (red/blue) are the players and they will chase down resources 
(the white balls) - each resource obsorbed the players radius will increase by 1
and finally once all resources are gone, two bases of their own color will form
and fire ships torwards the other base. The amount of ships that can be sent out 
is 1:1 to the amount of resources gathered. If an enemy ship hits a base 5 times 
the base is destroyed. This could lead to different players winning or even 
a draw. This assignment and code is mostly built off of the code provided by 
Professor Dr. Chris Marriott.

Author: Antonio V. Alvillar
*/

//////////////////////               PLAYERS              ////////////////////////////////////////////////////////////////////////////////
function Player(game, num) {
    this.radius = 10;
    this.visualRadius = 500;
    this.colors = ["Red", "Blue", "Green", "Gold"];
    this.color = num;
    this.it = true;
    Entity.call(this, game, this.radius + Math.random() * (500 - this.radius * 2), this.radius + Math.random() * (500 - this.radius * 2));
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 500 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 500 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var j = 0; j < this.game.players.length; j++) {
        var ent = this.game.players[j];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
        }
    } 

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (this.it && !ent.it) {
                this.radius += 1;
                ent.removeFromWorld = true;
            } 
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
    if (this.game.entities.length < 1 && this.radius > 0) {
        if (this.color === 0) {
            var base = new Base(gameEngine, 100, 100, this.colors[this.color], this.radius - 10);
            gameEngine.addBase(base);
            this.radius = 0;
        } else if (this.color === 1) {
            var base = new Base(gameEngine, 400, 400, this.colors[this.color], this.radius - 10);
            gameEngine.addBase(base);
            this.radius = 0;
        } else if (this.color === 2) {
            var base = new Base(gameEngine, 100, 400, this.colors[this.color], this.radius - 10);
            gameEngine.addBase(base);
            this.radius = 0;
        } else if (this.color === 3) {
            var base = new Base(gameEngine, 400, 100, this.colors[this.color], this.radius - 10);
            gameEngine.addBase(base);
            this.radius = 0;
        }
    }
};

Player.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

//////////           RESOURCES         /////////////////////////////////////////////////////////////////////////////
function Resource(game) {
    this.player = 1;
    this.radius = 10;
    this.visualRadius = 500;
    this.color = "white";
    this.it = false;
    Entity.call(this, game, this.radius + Math.random() * (500 - this.radius * 2), this.radius + Math.random() * (500 - this.radius * 2));
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Resource.prototype = new Entity();
Resource.prototype.constructor = Resource;

Resource.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 500 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 500 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it && !ent.it) {
                this.radius += 1;
                ent.removeFromWorld = true;
            } 
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Resource.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

/////////           BASES         ////////////////////////////////////////////////////////////
function Base(game, x, y, color, count) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.ships = count;
    this.radius = count * 2;
    this.health = 5;
    this.it = false;
    Entity.call(this, game, this.x, this.y);
};

Base.prototype = new Entity();
Base.prototype.constructor = Base;

Base.prototype.update = function () {
    Entity.prototype.update.call(this);
    if (this.ships > 0) {
        var ship = new Ship(this.game, this.x + Math.random() * 150 - 80,
                    this.y + Math.random() * 150 - 80, this.color);
        this.game.addEntity(ship);
        this.ships--;
    }
    if (this.health < 1) {
        this.removeFromWorld = true;
    }
};

Base.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), false);
    ctx.fill();
    ctx.closePath();
};

///////////////////////    SHIPS          //////////////////////////////////////////////////////////////////////
function Ship(game, x, y, color) {
    this.radius = 10;
    this.visualRadius = 500;
    this.color = color;
    this.x = x;
    this.y = y;
    this.velocity = { x: Math.random() * 10, y: Math.random() * 10 };
    this.it = true;
    Entity.call(this, game, this.x, this.y);
};

Ship.prototype = new Entity();
Ship.prototype.constructor = Ship;

Ship.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft(this) || this.collideRight(this)) { 
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft(this)) this.x = this.radius;
        if (this.collideRight(this)) this.x = 500 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
    if (this.collideTop(this) || this.collideBottom(this)) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop(this)) this.y = this.radius;
        if (this.collideBottom(this)) this.y = 500 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent) && this.color === ent.color) {

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

        } else if (ent !== this && this.collide(ent) && this.color !== ent.color) {
            this.removeFromWorld = true;
            ent.removeFromWorld = true;
        }

        if (ent.color != this.color && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }

    for (var i = 0; i < this.game.bases.length; i++) {
        var ent = this.game.bases[i];
        if (this.collide(ent) && this.color === ent.color) {
            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta;
            this.y += difY * delta;

            if (ent.color != this.color && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
                var dist = distance(this, ent);
                if (dist > this.radius + ent.radius + 10) {
                    var difX = (ent.x - this.x) / dist;
                    var difY = (ent.y - this.y) / dist;
                    this.velocity.x += (difX * acceleration / (dist * dist) * 5);
                    this.velocity.y += (difY * acceleration / (dist * dist) * 5);
                    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                    if (speed > maxSpeed) {
                        var ratio = maxSpeed / speed;
                        this.velocity.x *= ratio;
                        this.velocity.y *= ratio;
                    }
                }
            }

        } else if (this.collide(ent) && this.color !== ent.color) {
            ent.health--;
            this.removeFromWorld = true;
        }
    }

}

Ship.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}



///////////////       MAIN CODE           //////////////////////////////////////////
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;
var gameEngine;

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
};

Entity.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Entity.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Entity.prototype.collideRight = function () {
    return (this.x + this.radius) > 500;
};

Entity.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Entity.prototype.collideBottom = function () {
    return (this.y + this.radius) > 500;
};

window.onload = (function () {
    ///////////////       Socket CODE     /////////////////////
    var socket = io.connect("http://76.28.150.193:8888");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    gameEngine = new GameEngine();
    for (var i = 0; i < 2; i++) {   /// (i < 2) up to the number 4 in order to have max 4 players. 
        var player = new Player(gameEngine, i);
        gameEngine.addPlayer(player);
    }
    for (var i = 0; i < 60; i++) {  /// The white balls, more players should have more resources change (i < 60)
        var resource = new Resource(gameEngine);
        gameEngine.addEntity(resource);
    }
    //// socket console fuctions
    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });
    ///////////////       DataBase CODE     /////////////////////
    var saveButton = document.getElementById("save");
    saveButton.onclick = (function () {
        console.log("saving stuff");
        var savedState = {resources: [], players: [], bases: []};
        if (gameEngine.entities.length > 0) {
            for (var i = 0; i < gameEngine.entities.length; i++) {
                var info = { Radius: null, VisiualRadius: null, Color: null, It: null, Velocity: {X: null, Y: null}, X: null, Y: null };
                info.Radius = gameEngine.entities[i].radius;
                info.VisiualRadius = gameEngine.entities[i].visualRadius;
                info.Color = gameEngine.entities[i].color;
                info.It = gameEngine.entities[i].it;
                info.Velocity.X = gameEngine.entities[i].velocity.X;
                info.Velocity.Y = gameEngine.entities[i].velocity.Y;
                info.X = gameEngine.entities[i].x;
                info.Y = gameEngine.entities[i].y;
                savedState.resources.push(info);
            }
        }
        if (gameEngine.players.length > 0) {
            for (var i = 0; i < gameEngine.players.length; i++) {
                var info = { Radius: null, VisiualRadius: null, Color: null, Velocity: {X: null, Y: null}, X: null, Y: null };
                info.Radius = gameEngine.players[i].radius;
                info.VisiualRadius = gameEngine.players[i].visualRadius;
                info.Color = gameEngine.players[i].color;
                info.Velocity.X = gameEngine.players[i].velocity.X;
                info.Velocity.Y = gameEngine.players[i].velocity.Y;
                info.X = gameEngine.players[i].x;
                info.Y = gameEngine.players[i].y;
                savedState.players.push(info);
            }
        }
        if (gameEngine.bases.length > 0) {
            for (var i = 0; i < gameEngine.bases.length; i++) {
                var info = { Color: null, Count: null, X: null, Y: null };
                info.Color = gameEngine.bases[i].color;
                info.Count = gameEngine.bases[i].count;
                info.X = gameEngine.bases[i].x;
                info.Y = gameEngine.bases[i].y;
                savedState.bases.push(info);
            }
        }
        console.log(savedState);
        socket.emit("save", { studentname: "Antonio V. Alvillar", statename: "theSavedState", data: savedState });
    });
    var loadButton = document.getElementById("load");
    loadButton.onclick = (function () {
        console.log("loading stuff");
        socket.emit("load", { studentname: "Antonio V. Alvillar", statename: "theSavedState" });
    });

    socket.on("load", function (data) {
        /*
        There is an error I am unable to correct still when loading the entities back. It just isnt quite righ. 
        The players do not chase the resources upon load and if the bases are present with no players then load
        only spawns the ships but doesnt show a base. Then the ships move slowly.
        */
        console.log(data);
        gameEngine.entities = [];
        gameEngine.bases = [];
        gameEngine.players = [];
        if (data.data.bases.length > 0) {
            for (var i = 0; i < data.data.bases.length; i++) {
                var base = new Base(gameEngine, data.data.bases[i].X, data.data.bases[i].Y, data.data.bases[i].Color, data.data.bases[i].Count);
                gameEngine.addBase(base);
            }
        }
        if (data.data.resources.length > 0 && gameEngine.bases.length > 0) {
            for (var i = 0; i < data.data.resources.length; i++) {
                var ship = new Ship(gameEngine, data.data.resources[i].X, data.data.resources[i].Y, data.data.resources[i].Color);
                ship.radius = data.data.resources[i].Radius;
                ship.visualRadius = data.data.resources[i].VisualRadius;
                //ship.color = data.data.resources[i].Color;
                ship.it = data.data.resources[i].it;
                ship.velocity.X = data.data.resources[i].Velocity.X;
                ship.velocity.Y = data.data.resources[i].Velocity.Y;
                //ship.x = data.data.resources[i].X;
                //ship.y = data.data.resources[i].Y;
                gameEngine.addEntity(ship);
            }
        } else {
            for (var i = 0; i < data.data.resources.length; i++) {
                var resource = new Resource(gameEngine);
                resource.radius = data.data.resources[i].Radius;
                resource.visualRadius = data.data.resources[i].VisualRadius;
                resource.color = data.data.resources[i].Color;
                resource.it = data.data.resources[i].it;
                resource.velocity.X = data.data.resources[i].Velocity.X;
                resource.velocity.Y = data.data.resources[i].Velocity.Y;
                resource.x = data.data.resources[i].X;
                resource.y = data.data.resources[i].Y;
                gameEngine.addEntity(resource);
            }
        }
        if (data.data.players.length > 0) {
            for (var i = 0; i < data.data.players.length; i++) {
                var player = new Player(gameEngine, data.data.players[i].Color);
                player.radius = data.data.players[i].Radius;
                player.visualRadius = data.data.players[i].VisualRadius;
                player.it = true;
                player.velocity.X = data.data.players[i].Velocity.X;
                player.velocity.Y = data.data.players[i].Velocity.Y;
                player.x = data.data.players[i].X;
                player.y = data.data.players[i].Y;
                gameEngine.addPlayer(player);
            }
        }
    });
    gameEngine.init(ctx);
    gameEngine.start();

});
