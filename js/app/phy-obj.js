define(['jquery', 'jquery-ui'], function($) {

  function PhyObj(args) {
    args = args || {};
    $.extend(this, args.inst || $('<div>'));
    this.env = args.env || $('body');
    this.env_border = this.env.offset();
    this.env_border.right = this.env_border.left + this.env.width();
    this.env_border.bottom = this.env_border.top + this.env.height();

    // 
    this.appendTo(this.env);
    this.css({
           //width: 30,
           //height: 30,
           //margin: '0px 0px 0px 0px',
           position: 'absolute',
           display: 'inline-block',
           //'border-style': 'solid',
           //'background-color': 'red'
         });
    this.resetPosition();
  }

  PhyObj.prototype.refinePosition = function () {
    let p = this.offset(), b = this.env_border;
    p.right = p.left + this.width();
    p.bottom = p.top + this.height();
    if(p.left   < b.left )  {p.left = b.left  ;}
    if(p.right  > b.right)  {p.left = b.right - this.width();}
    if(p.top    < b.top  )  {p.top  = b.top   ;} 
    if(p.bottom > b.bottom) {p.top  = b.bottom - this.height();}
    this.offset(p);
  }

  PhyObj.prototype.resetPosition = function (xy) {
    //this.position({
    //      my: 'left bottom',
    //      at: 'left bottom',
    //      of: this.env
    //    });
    xy = xy || {x: 0, y: 0};
    this.offset({
      left: this.env_border.left + xy.x, 
      top: this.env_border.bottom - xy.y - this.height()
    });
    this.refinePosition();
  }

  PhyObj.prototype.paraMove = function (v, cbs) {
    // cbs: callback for difference purpose
    // cbs.proc: with v as parameter
    // cbs.done

    cbs = cbs || {};
    cbs.proc = cbs.proc || function(){return undefined}; 
    v = {x: v.x, y: v.y}; 
    var b, f, p;
    b = this.env_border;
    p = this.offset();
    f = $.proxy(
            function () {
              p.left +=  v.x * this.env.delta;
              p.top  += -v.y * this.env.delta 
                        + 0.5 * this.env.gravity * this.env.delta * this.env.delta;
              if(p.left < b.left)                  p.left = b.left;
              if(p.left + this.width() > b.right)  p.left = b.right - this.width();
              if(p.top  < b.top)                   p.top  = b.top;
              if(p.top + this.height() > b.bottom){p.top  = b.bottom - this.height(); this.is_moving = false;}
              v.y -= this.env.gravity * this.env.delta;
              this.offset(p); cbs.proc(v);
              if(!this.is_moving) this.queue(cbs.done).dequeue();
              else             this.delay(this.env.delta).queue(f).dequeue();
            },
            this
          );
    this.is_moving = true;
    f();
  }

  PhyObj.prototype.linearMove = function (v, args, cbs) {
    args          = args || {};
    args.brd_stop = args.brd_stop === undefined ? true : args.brd_stop;
    args.dist     = args.dist     || {x: 99999, y: 99999};
    cbs           = cbs           || {};
    cbs.delta     = cbs.delta     || function(){return undefined};
    cbs.onBorder  = cbs.onBorder  || function(){return undefined};
    cbs.offBorder = cbs.offBorder || function(){return undefined};
    cbs.done      = cbs.done      || function(){return undefined};
    
    var b, f, p, cnt, on_border, off_border;
    on_border = false; off_border = false;
    b = this.env_border;
    
    cnt = 0;

    f = $.proxy(
          function() {
            var lb = false, rb = false, tb = false, bb = false;
            var dx = v.x * this.env.delta,
                dy = v.y * this.env.delta;
            cbs.delta();
            let p = this.offset();
            p.left +=  dx;
            p.top  += -dy;
            p.right = p.left + this.width();
            p.bottom = p.top + this.height();
            args.dist.x -= dx; args.dist.y -= dy;
            this.offset(p);
            if(args.brd_stop) this.refinePosition();
            if(!on_border){
              if(v.x < 0 && p.left   < b.left )  {lb = true; };//if(args.brd_stop) p.left = b.left  ;}
              if(v.x > 0 && p.right  > b.right)  {rb = true; };//if(args.brd_stop) p.left = b.right - this.width();}
              if(v.y > 0 && p.top    < b.top  )  {tb = true; };//if(args.brd_stop) p.top  = b.top   ;} 
              if(v.y < 0 && p.bottom > b.bottom) {bb = true; };//if(args.brd_stop) p.top  = b.bottom - this.height();}
              if(lb || rb || tb || bb) {
                if(args.brd_stop) {
                  this.is_moving = false;
                }
                on_border = true;
                cbs.onBorder();
              }
            }
            else if(on_border && 
                   (p.left   > b.right  ||
                    p.right  < b.left   ||
                    p.top    > b.bottom ||
                    p.bottom < b.top    )) {
              off_border = true;
              cbs.offBorder();
            }

            if(this.is_moving == true && !off_border && (args.dist.x > 0 || args.dist.y > 0)) 
              this.delay(this.env.delta).queue(f).dequeue();
            else {
              cbs.done();
            }
          },
          this
        );

    this.is_moving = true;
    f();
  }

  PhyObj.prototype.stopMove = function () {
    this.is_moving = false;
    this.clearQueue();
  }

  return {
    PhyObj: PhyObj
  };
});
