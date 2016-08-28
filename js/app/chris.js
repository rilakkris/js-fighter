define(['jquery', 'lib/jQueryRotateCompressed', 'app/role', 'app/phy-obj'], function ($, jsRot, role, phy) {
  const ST  = role.ST,
        ACT = role.ACT;

  function Chris(args) {
    args = args || {};
    args.init_cord = args.init_cord || {x: 100, y: 0};

    role.Role.call(this, args);
    this.resetPosition(args.init_cord);

    // init act listener
    this.imgs.hadoken = $('<img src="img/hadoken.png">').css({width: '75%', height: '75%'});
    this.imgs.pokeball = $('<img src="img/pokeball.png">').css({width: 100, height: 100});
    this.imgs.hurricane = $('<img src="img/hurricane.png">').css({width: '75%', height: '75%'});
    this.imgs.shoryuken0 = $('<img src="img/shoryuken0.png">').css({width: '75%', height: '75%'});
    this.imgs.shoryuken1 = $('<img src="img/shoryuken1.png">').css({width: '75%', height: '75%'});

    // register skil events
    this.skill_event = ['26a', '626a', '24b'];
    this.on(this.skill_event.join(' '), $.proxy(this.skillEventListener, this));
  }

  Chris.prototype = Object.create(role.Role.prototype);
  Chris.prototype.constructor = Chris;

  Chris.prototype.skillEventListener = function (e) {
    switch(e.type) {
      case '26a':
        if(this.st !== ST.JUMP) {
          this.act = ACT.SKLL;
          this.hadoken();
        }
      break;
      case '626a':
        if(this.st !== ST.JUMP) {
          this.act = ACT.SKLL;
          this.shoryuken();
        }
      break;
      case '24b':
        if(this.st !== ST.JUMP) {
          this.act = ACT.SKLL;
          this.hurricane();
        }
      break;
    }
  }

  Chris.prototype.hadoken = function () {
    this.empty().append(this.imgs.hadoken).offset({top: this.env_border.bottom - this.height()});
    var h = new phy.PhyObj({ env: this.env }),
        defrq = 32, cnt = 0, angle = 0;
    h.empty().append(this.imgs.pokeball);
    h.position({
      my: 'center center',
      at: 'right center',
      of: this,
      collision: 'none'
    });
    h.linearMove({x: 400, y: 0}, {brd_stop: false}, 
                 {offBorder: $.proxy(function(){this.remove()}, h),
                  delta: $.proxy(function(){angle -= 1; h.rotate(angle);}, this),
                  done: $.proxy(
                    function(){
                      this.empty().append(this.imgs.still).refinePosition();
                      this.act = ACT.IDLE; 
                      this.trigger('5')
                    }, this)});
  }

  Chris.prototype.shoryuken = function () {
    this.empty().append(this.imgs.shoryuken0);
    this.linearMove(
      {x: 400, y: 300},
      {dist: {y: 300}},
      {done: $.proxy(
        function(){
          this.empty().append(this.imgs.shoryuken1);
          this.paraMove(
            {x: 0, y: 0}, 
            {done: $.proxy(function(){
              this.empty().append(this.imgs.still).refinePosition();
              this.act = ACT.IDLE;
              this.trigger('5');
            }, this)}
          );
        }, 
        this)});
  }

  Chris.prototype.hurricane = function () {
    this.empty().append(this.imgs.hurricane);
    this.linearMove(
      {x: 700, y: 0},
      {dist: {x: 500, y: 0}},
      {done: $.proxy(
        function(){
          this.empty().append(this.imgs.still).refinePosition();
          this.act = ACT.IDLE;
          this.trigger('5');
        }, 
        this)});
  }

  return {
    Chris: Chris
  };
});
