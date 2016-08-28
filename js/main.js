require.config({
  paths: {
    'jquery': 'lib/jquery-3.1.0',
    'jquery-ui': 'lib/jquery-ui-1.12.0/jquery-ui'
  }
});

require(['jquery', 'app/controller', 'app/env', 'app/chris', 'app/phy-obj'], function($, ctrl, env, chris, phy) {
  $('body').css('text-align', 'center');
  
  var e0 = new env.Env({ctrl: ctrl, width: 1000, height: 300});
      r0 = new chris.Chris({ctrl: ctrl, env: e0});
  ctrl.panel.appendTo('body');
  ctrl.registerListener(r0);

});
