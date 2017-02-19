var PlatformerGame = PlatformerGame || {};

//title screen
PlatformerGame.Logo = function(){};

PlatformerGame.Logo.prototype = {
  init: function(colour, timeout) { 
    this.colour = colour;
    this.timeout = timeout;
  },
  create: function() {

    //Change the background colour
    this.game.stage.backgroundColor = this.colour;
    this.startTime = this.game.time.now; 
  
    this.game.input.keyboard.addCallbacks(this, this.skip, null, null);
    this.pressed = false;
    var yam = this.game.add.sprite(this.game.width/2, this.game.height/2, 'dollar');
    yam.anchor.setTo(0.5);
    this.colour = "e99";
    this.theme = this.game.add.audio('dollarone');
    
    this.theme.play();

  },

  skip : function() {
    if (!this.pressed) {
        this.pressed = true;
        this.state.start('GameJam', true, false, this.colour, this.timeout);
    }
  },

  update: function() {

    if (this.startTime < this.game.time.now - (this.timeout*1000) && !this.pressed) {
        this.pressed = true;
        
        var timeout = 2;
        this.state.start('GameJam', true, false, this.colour, this.timeout);
    }
  },

};
