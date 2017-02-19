var PlatfomerGame = PlatformerGame || {};

//title screen
PlatformerGame.Game = function(){};

PlatformerGame.Game.prototype = {
    create: function() {

        //  A simple background for our game
        this.game.add.sprite(0, 0, 'sky');

        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('cat-sprites', 'tiles');

        //this.blockedLayer = this.map.createLayer('objectLayer');
        this.backgroundLayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');
        

        this.map.setCollisionBetween(1, 10000, true, 'blockedLayer');

        // make the world boundaries fit the ones in the tiled map
        this.blockedLayer.resizeWorld();

        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player = this.game.add.sprite(result[0].x, result[0].y, 'cat');
        this.player.frame = 0; 
        this.playerStartX = result[0].x;
        this.playerStartY = result[0].y;


        //  We need to enable physics on the player
        this.game.physics.arcade.enable(this.player);
        this.player.body.setSize(8, 6, 0, 4);


        result = this.findObjectsByType('exit', this.map, 'objectLayer');
        //this.exit = this.game.add.sprite(result[0].x, result[0].y, 'tiles');
        

        //  We need to enable physics on the player
        //this.game.physics.arcade.enable(this.exit);
        //this.game.camera.setSize(this.game.world.width, this.game.world.height);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0;
        this.player.body.gravity.y = 400;
        this.player.anchor.setTo(0.5);
        this.player.body.collideWorldBounds = false;

        ///this.game.camera.follow(this.player);

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [0, 1, 2, 3], 10, true);
        this.player.animations.add('jump', [4,5,6,7,8], 10, true);

        //  Finally some stars to collect
        this.stars = this.game.add.group();

        //  We will enable physics for any star that is created in this group
        this.stars.enableBody = true;

        this.star = this.stars.create(result[0].x, result[0].y, 'kitten')
        this.star.body.gravity.y = 300;
        this.star.body.bounce.y = 0.9;
        this.star.frame = 0;
        this.star.anchor.setTo(0);
        //setSize(width, height, offsetX, offsetY)
        this.star.body.setSize(12, 5, 0, 2);
        this.star.dangerous = true;
        this.star.animations.add('move', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], 10, true);
        this.star.animations.play('move');

        this.music = this.game.add.audio('music');
        this.miaow = this.game.add.audio('miaow');
        this.music.loop = true;
        //this.miaow.play();

        //  The score
        this.scoreText = this.game.add.text(46, 56, 'You saved Kitty!\n       WOOP!', { fontSize: '32px', fill: '#000' });
        this.scoreText.visible = false;
        this.score = 0;

        //  Our controls.
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.timer = 0;

        this.clouds = this.game.add.group();
        this.clouds.enableBody = true;
        for (var i = 0; i < 10; i++)
        {
            //  Create a star inside of the 'stars' group
            var star = this.clouds.create(i * 80 +this.game.rnd.integerInRange(1, 10), 166+this.game.rnd.integerInRange(1, 6), 'cloud');
            star.body.velocity.x = 3+this.game.rnd.integerInRange(1, 3);
        }
        for (var i = 0; i < 10; i++)
        {   
            star = this.clouds.create(i * 85 +this.game.rnd.integerInRange(1, 10), 174+this.game.rnd.integerInRange(1, 9), 'cloud');

            //  Let gravity do its thing
            star.body.velocity.x = 5+i + this.game.rnd.integerInRange(1, 6);
            
            //  This just gives each star a slightly random bounce value
            
        }

        this.showDebug = false; 
    },

    update: function() {
        this.timer++;
        //  Collide the player and the stars with the platforms
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.stars, this.blockedLayer);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.game.physics.arcade.overlap(this.player, this.stars, this.collectStar, null, this);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.timer % 780 == 0 && this.game.rnd.integerInRange(1, 6) < 5) {
            this.miaow.play();
        }

        //  Allow the player to jump if they are touching the ground.
        if (this.cursors.up.isDown && this.player.body.blocked.down)
        {
            this.player.body.velocity.y = -80;
            this.player.animations.play('jump');
        }
        else {
        if (this.cursors.left.isDown)
        {
            //  Move to the left
            this.player.scale.setTo(-1, 1);
            this.player.body.velocity.x = -50;
            if (this.player.body.velocity.y == 0) {
               this.player.animations.play('left');
            }
        }
        else if (this.cursors.right.isDown)
        {
            //  Move to the right
            this.player.scale.setTo(1, 1);
            this.player.body.velocity.x = 50;
            if (this.player.body.velocity.y == 0) {
                this.player.animations.play('right');
            }
        }
        else
        {
            //  Stand still
            if (this.player.body.velocity.y == 0) {
                this.player.animations.stop();
                this.player.frame = 0;
            }
        }
        
        }
        if (this.player.y > this.game.world.height) {
            this.death();
        }
        this.clouds.forEach(function(cloud) {
            if (cloud.x > this.game.world.width) {
                cloud.x -= 420;
            }
        }, this);

    },

    death: function() {
        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player.x = this.playerStartX;
        this.player.y = this.playerStartY;
        this.player.frame = 0; 
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

    },

    collectStar : function(player, star) {
        
        // Removes the star from the screen
        this.scoreText.visible = true;


    },


    // find objects in a tiled layer that contains a property called "type" equal to a value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                // phaser uses top left - tiled bottom left so need to adjust:
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },

    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, 'objects');
        sprite.frame = parseInt(element.properties.frame);

        // copy all of the sprite's properties
        Object.keys(element.properties).forEach(function(key) {
            sprite[key] = element.properties[key];
        });
    },


    render: function() {

        if (this.showDebug) {
            this.game.debug.body(this.star);
            this.game.debug.body(this.player);
        }
    },

};