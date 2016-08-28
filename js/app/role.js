define(['jquery', 'jquery-ui', 'app/controller', 'app/phy-obj'], function ($, $ui, ctrl, phy) {
  // status
  const ST = { 
          STLL: 0,
          FWRD: 1,
          BWRD: 2,
          JUMP: 3,
          CRCH: 4,
          SBCK: 5

        },
        ACT = {
          IDLE: 0,
          PNCH: 1,
          KICK: 2,
          DFNS: 3,
          SKLL: 4
        };

  function Role (args) {
    args = args || {};
    phy.PhyObj.call(this, args);
    args.cord = args.cord || [0, 0];
    // configurations
    this.jmp_v = args.jmp_v || {x: 400, y: 600};
    this.vtc_jmp_v = args.vtc_jmp_v || {x: 0, y: 600};
    this.bck_jmp_v = args.bck_jmp_v || {x: -300, y: 600};
    this.big_jmp_v = args.big_jmp_v || {x: 500, y: 600};
    this.sbk_jmp_v = args.sbk_jmp_v || {x: -400, y: 400};
    this.fwd_v = args.fwd_v || {x: 300, y: 0};
    this.run_v = args.run_v || {x: 600, y: 0};
    this.bwd_v = args.bwd_v || {x: -250, y: 0};
    // initialize variables
    args = args || {};
    this.imgs = {still: $('<img src="img/still.png">').css({width: '75%', height: '75%'}),
                 fwrd0: $('<img src="img/fwrd0.png">').css({width: '75%', height: '75%'}),
                 fwrd1: $('<img src="img/fwrd1.png">').css({width: '75%', height: '75%'}),
                 bwrd0: $('<img src="img/bwrd0.png">').css({width: '75%', height: '75%'}),
                 bwrd1: $('<img src="img/bwrd1.png">').css({width: '75%', height: '75%'}),
                 crouch: $('<img src="img/crouch.png">').css({width: '75%', height: '75%'}),
                 jump0: $('<img src="img/jump0.png">').css({width: '75%', height: '75%'}),
                 jump1: $('<img src="img/jump1.png">').css({width: '75%', height: '75%'}),
                 jump2: $('<img src="img/jump2.png">').css({width: '75%', height: '75%'}),
                 jump3: $('<img src="img/jump3.png">').css({width: '75%', height: '75%'}),
                 punch: $('<img src="img/punch.png">').css({width: '75%', height: '75%'}),
                 kick: $('<img src="img/kick.png">').css({width: '75%', height: '75%'}),
                 crch_punch: $('<img src="img/crch_punch.png">').css({width: '75%', height: '75%'}),
                 crch_kick: $('<img src="img/crch_kick.png">').css({width: '75%', height: '75%'})};
    //this.append(this.imgs.still).resetPosition();
    this.imgs.still.one('load', $.proxy(function(e){this.append(e.target).resetPosition()}, this));
    this.st  = ST.STLL;
    this.act = ACT.IDLE;
    // event listener
    this.stick_event = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '44', '66'];
    this.button_event = ['a', 'b', 'c', 'd', 'ab', 'cd'];

    // register events
    this.on(this.stick_event.join(' '), $.proxy(this.stickEventListener, this));
    this.on(this.button_event.join(' '), $.proxy(this.buttonEventListener, this));
  };

  Role.prototype = Object.create(phy.PhyObj.prototype);
  Role.prototype.constructor = Role;

  // helper
  Role.prototype.registerEvent = function (event_list) {
    //for(let e in event_list) this.on(event_list[e], $.proxy(this.eventListener, this));
    this.on(event_list.join(' '), $.proxy(this.eventListener, this));
    //console.log(event_list.join(' '));
  }

  // event listener
  Role.prototype.stickEventListener = function (e) {
    switch(e.type) {
      case '1':
      case '2':
      case '3':
        if(this.act !== ACT.SKLL && (
            this.st === ST.STLL ||
            this.st === ST.FWRD ||
            this.st === ST.BWRD)) {
          this.stopMove();
          this.st = ST.CRCH;
          //this.css({width: 100, height: 50});
          this.empty().append(this.imgs.crouch);
          this.offset({top: this.env_border.bottom - this.height()});
          this.refinePosition();
        }
      break;
      case '5':
        if(this.st === ST.FWRD || this.st === ST.BWRD) {
          if(this.act !== ACT.SKLL) {
            this.stopMove();
            this.empty().append(this.imgs.still).refinePosition();
            this.st = ST.STLL;
          }
        }
        if(this.st === ST.CRCH && this.act !== ACT.SKLL) {
          this.empty().append(this.imgs.still).refinePosition();
          this.st = ST.STLL;
        }
      break;
      case '6':
        if(this.act !== ACT.SKLL && this.st === ST.STLL) {
          let c = 0, defrq = 32, pre = defrq,
              w = [this.imgs.fwrd0, this.imgs.fwrd1];
          this.st = ST.FWRD;
          this.linearMove(
            this.fwd_v, 
            {}, 
            {delta: $.proxy(
              function(){
                if((c & defrq) !== pre) {
                  pre = c & defrq;
                  this.empty().append(w[pre !== 0 ? 1 : 0]);
                }
                c++;
              }, 
              this
            )});
        }
      break;
      case '4':
        if(this.act !== ACT.SKLL && this.st === ST.STLL) {
          let c = 0, defrq = 32, pre = defrq,
              w = [this.imgs.bwrd0, this.imgs.bwrd1];
          this.st = ST.BWRD;
          this.linearMove(
            this.bwd_v,
            {},
            {delta: $.proxy(
              function(){
                if((c & defrq) !== pre) {
                  pre = c & defrq;
                  this.empty().append(w[pre !== 0 ? 1 : 0]).refinePosition();
                }
                c++;
              }, 
              this
            )}
          );
        }
      break;
      case '9': 
        if(this.act !== ACT.SKLL && 
            (this.st === ST.STLL || this.st === ST.FWRD)) {
          let is_rising = false, j = [this.imgs.jump1, this.imgs.jump2, this.imgs.jump3];
          this.st = ST.JUMP;
          this.stopMove();
          this.paraMove(
            this.jmp_v,
            {done: $.proxy(function(){this.empty().append(this.imgs.still).refinePosition(); this.st = ST.STLL; }, this),
             proc: $.proxy(function(v){
              if(v.y > 0 && !is_rising) {is_rising = true; this.empty().append(j[0]).refinePosition();};
              if(v.y == 0) {this.empty().append(j[1]).refinePosition();}
              if(v.y < 0 &&  is_rising) {is_rising = false; this.empty().append(j[2]).refinePosition();};
             }, this)}
          );
        }
      break;
      case '7':
        if(this.act !== ACT.SKLL && (this.st === ST.STLL || this.st === ST.BWRD)) {
          let is_rising = false, j = [this.imgs.jump3, this.imgs.jump2, this.imgs.jump1];
          this.st = ST.JUMP;
          this.stopMove();
          this.paraMove(
            this.bck_jmp_v,
            {done: $.proxy(function(){this.empty().append(this.imgs.still).refinePosition(); this.st = ST.STLL}, this),
             proc: $.proxy(function(v){
              if(v.y > 0 && !is_rising) {is_rising = true; this.empty().append(j[0]).refinePosition();};
              if(v.y == 0) {this.empty().append(j[1]).refinePosition();}
              if(v.y < 0 &&  is_rising) {is_rising = false; this.empty().append(j[2]).refinePosition();};
             }, this)}
          );
        }
      break;
      case '44':
        if(this.act !== ACT.SKLL && (this.st === ST.STLL || this.st === ST.BWRD)) {
          let c = false;
          this.st = ST.JUMP;
          this.stopMove();
          this.paraMove(
            this.sbk_jmp_v,
            {done: $.proxy(function(){this.empty().append(this.imgs.still).refinePosition(); this.st = ST.STLL}, this),
             proc: $.proxy(function(){if(!c){this.empty().append(this.imgs.bwrd0).refinePosition()}; c = true;}, this)}
          );
        }
      break;
    }
  }

  Role.prototype.buttonEventListener = function (e) {
    switch (e.type) {
      case 'a':
        if((this.st === ST.STLL || this.st === ST.FWRD || this.st === ST.BWRD) && this.act === ACT.IDLE) {
          this.act = ACT.PNCH;
          this.empty().append(this.imgs.punch).refinePosition();
          setTimeout($.proxy(
            function(){
              if(this.act === ACT.SKLL) return;
              this.empty().append(this.imgs.still).refinePosition();
              this.act = ACT.IDLE;
            }, this), 200);
        } else if(this.st === ST.CRCH && this.act === ACT.IDLE) {
          this.act = ACT.PNCH;
          this.empty().append(this.imgs.crch_punch).refinePosition();
          setTimeout($.proxy(
            function() {
              if(this.act === ACT.SKLL) return;
              this.empty().append(this.imgs.crouch).refinePosition();
              this.act = ACT.IDLE;
            }
            , this
          ), 200);
        }
      break;
      case 'b':
        if((this.st === ST.STLL || this.st === ST.FWRD || this.st === ST.BWRD) && this.act === ACT.IDLE) {
          this.act = ACT.PNCH;
          this.empty().append(this.imgs.kick).refinePosition();
          setTimeout($.proxy(
            function(){
              this.empty().append(this.imgs.still).refinePosition();
              this.act = ACT.IDLE;
            }, this), 200);
        } else if(this.st === ST.CRCH && this.act === ACT.IDLE) {
          this.act = ACT.KICK;
          this.empty().append(this.imgs.crch_kick).refinePosition();
          setTimeout($.proxy(
            function() {
              if(this.act === ACT.SKLL) return;
              this.empty().append(this.imgs.crouch).refinePosition();
              this.act = ACT.IDLE;
            }
            , this
          ), 200);
        }
      break;
    }
  }

  return {
    Role: Role,
    ST: ST,
    ACT: ACT
  };

});
