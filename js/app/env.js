define(['jquery'], function($){
  const width = 1000,
        height = 400,
        gravity = height * 3.5,
        delta = 0.010;

  function Env(args) {
    $.extend(this, $('<div>'));

    args = args || {};
    this.target = args.target || $('body');
    this.width(args.width || width);
    this.height(args.height || height);
    this.gravity = args.gravity || gravity;
    this.delta = args.delta || delta;
    this.appendTo('body');
    this.css({
           width: this.width,
           height: this.height,
           margin: '0 auto',
           'border-style': 'solid',
           'border-color': 'black'
         });
    //this.position({
    //  my: 'center top',
    //  at: 'center top',
    //  of: this.target,
    //  collision: 'none'
    //});
  }

  return {
    Env: Env
  };
});
