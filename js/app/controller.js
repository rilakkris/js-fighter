define(['jquery'], function ($) {
  var // key
      comb_key_intv = 35,
      key_code = {'2': 83, '4': 65, '8': 87, '6': 68, 'a': 46, 'b': 35, 'c': 34, 'd': 36},
      button_flag = {'a': 8, 'b': 4, 'c': 2, 'd': 1},
      button_event = {8: 'a', 4: 'b', 2: 'c', 1: 'd', 12: 'ab', 10: 'ac', 3: 'cd'};
      code_key = {},
      catch_keyup = {},
      catch_keydown = {},
      act_key_q = [[0, 0]],
      stick = 5,
      button = 0,
      // act
      act_intv = 250,
      act_pat = ['44', '66', '26a', '626a', '24b', '426c'],
      act_tree = {},
      listener_list = [],
      // panel
      imgs = {};
  var panel;
    imgs.stick = [null,
                  $('<img src="img/stick1.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick2.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick3.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick4.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick5.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick6.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick7.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick8.png">').css({width: 150, height: 150, align: 'center'}),
                  $('<img src="img/stick9.png">').css({width: 150, height: 150, align: 'center'}),
                 ];
    imgs.button_off = {a: $('<img src="img/A_off.png">').css({width: 120, height: 80, 'vertical-align': 'bottom'}),
                       b: $('<img src="img/B_off.png">').css({width: 120, height: 80, 'vertical-align': 'bottom'}),
                       c: $('<img src="img/C_off.png">').css({width: 120, height: 80, 'vertical-align': 'bottom'}),
                       d: $('<img src="img/D_off.png">').css({width: 120, height: 80, 'vertical-align': 'bottom'}) };
    imgs.button_on  = {a: $('<img src="img/A_on.png">') .css({width: 120, height: 80, 'vertical-align': 'bottom'}),
                       b: $('<img src="img/B_on.png">') .css({width: 120, height: 80, 'vertical-align': 'bottom'}),
                       c: $('<img src="img/C_on.png">') .css({width: 120, height: 80, 'vertical-align': 'bottom'}),
                       d: $('<img src="img/D_on.png">') .css({width: 120, height: 80, 'vertical-align': 'bottom'}) };
    panel = $('<div>').css({'display': 'block', margin: '0 auto'});
    panel.stick = $('<span>').css({'display': 'inline-block', 'text-align': 'left', 'padding-top': 30}).width(400).height(100).append(imgs.stick[5]);
    panel.button = $('<span>');
    panel.append(panel.stick).append(panel.button);
    panel.button.a = $('<span>').css('display', 'inline-block').append(imgs.button_off.a).appendTo(panel.button);
    panel.button.b = $('<span>').css('display', 'inline-block').append(imgs.button_off.b).appendTo(panel.button);
    panel.button.c = $('<span>').css('display', 'inline-block').append(imgs.button_off.c).appendTo(panel.button);
    panel.button.d = $('<span>').css('display', 'inline-block').append(imgs.button_off.d).appendTo(panel.button);

  function init () {
    // init panel
    for(let k in key_code) code_key[key_code[k]] = k;

    catch_keydown [key_code['2']] = catchStickKeydown;
    catch_keydown [key_code['4']] = catchStickKeydown;
    catch_keydown [key_code['6']] = catchStickKeydown;
    catch_keydown [key_code['8']] = catchStickKeydown;
    catch_keydown [key_code['a']] = catchButton;
    catch_keydown [key_code['b']] = catchButton;
    catch_keydown [key_code['c']] = catchButton;
    catch_keydown [key_code['d']] = catchButton;
    catch_keyup   [key_code['2']] = catchStickKeyup;
    catch_keyup   [key_code['4']] = catchStickKeyup;
    catch_keyup   [key_code['6']] = catchStickKeyup;
    catch_keyup   [key_code['8']] = catchStickKeyup;

    //
    initActTree();
  }

  // key relative
  function catchKeydown (e) {
    if(!(e.which in catch_keydown)) return;
    catch_keydown[e.which](e);
  }

  function catchKeyup (e) {
    if(!(e.which in catch_keyup)) return;
    catch_keyup[e.which](e);
  }

  function catchStickKeydown (e) {
    const next_stick = [  // [stick][k]
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
            [0, 0, 1, 0, 1, 0, 6, 0, 8, 0], // 1
            [0, 0, 2, 0, 1, 0, 3, 0, 8, 0], // 2
            [0, 0, 3, 0, 4, 0, 3, 0, 8, 0], // 3
            [0, 0, 1, 0, 4, 0, 6, 0, 7, 0], // 4
            [0, 0, 2, 0, 4, 0, 6, 0, 8, 0], // 5
            [0, 0, 3, 0, 4, 0, 6, 0, 9, 0], // 6
            [0, 0, 2, 0, 7, 0, 6, 0, 7, 0], // 7
            [0, 0, 2, 0, 7, 0, 9, 0, 8, 0], // 8
            [0, 0, 2, 0, 4, 0, 9, 0, 9, 0]  // 9
          ];

    var n = next_stick[stick][code_key[e.which]];
    if(n !== stick) {
      stick = n;
      panel.stick.empty().append(imgs.stick[stick]);
      for(let l in listener_list) listener_list[l].trigger('' + stick);
      act_key_q.push([e.timeStamp, code_key[e.which] << 4]);
      catchAct();
    }
  }

  function catchStickKeyup (e) {
    const next_stick = [  // [stick][k]
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
            [0, 0, 4, 0, 2, 0, 1, 0, 1, 0], // 1
            [0, 0, 5, 0, 2, 0, 2, 0, 2, 0], // 2
            [0, 0, 6, 0, 3, 0, 2, 0, 3, 0], // 3
            [0, 0, 4, 0, 5, 0, 4, 0, 4, 0], // 4
            [0, 0, 5, 0, 5, 0, 5, 0, 5, 0], // 5
            [0, 0, 6, 0, 6, 0, 5, 0, 6, 0], // 6
            [0, 0, 7, 0, 8, 0, 7, 0, 4, 0], // 7
            [0, 0, 8, 0, 8, 0, 8, 0, 5, 0], // 8
            [0, 0, 9, 0, 9, 0, 8, 0, 6, 0]  // 9
          ];

    var n = next_stick[stick][code_key[e.which]];
    if(n !== stick) {
      stick = n;
      panel.stick.empty().append(imgs.stick[stick]);
      for(let l in listener_list) listener_list[l].trigger('' + stick);
      //act_key_q.push([e.timeStamp, stick << 4]);
      //console.log(stick);
      //catchAct();
    }
  }

  function catchButton (e) {
    var q = act_key_q,
        pressed = button,
        k = code_key[e.which];
    
    panel.button[k].empty().append(imgs.button_on[k]);
    setTimeout(function(){
      panel.button[k].empty().append(imgs.button_off[k]);
    }, 200);

    button |= button_flag[k];
    if(pressed) return;
    else {
      var time_stamp = e.timeStamp;
      setTimeout(
        function(){
          for(let l in listener_list) listener_list[l].trigger(button_event[button]);
          q.push([time_stamp, button]);
          button = 0;
          catchAct();
        }, 
        comb_key_intv
      );
    }
  }

  // act relative
  function initActTree() {
    act_tree = {};
    for(let i = 0; i < act_pat.length; i++) {
      let p = act_pat[i].match(/\d+|[abcd]+/g),
          q = [],
          cur;
      for(let j = 0; j < p.length; j++) {
        if(p[j][0].charCodeAt(0) & 0x40) { // [abcd]
          let b = 0;
          for(let k in p[j]) b |= button_flag[p[j][k]];
          q.push(b);
        }
        else { // [1-9]
          for(let k in p[j])
            q.push((p[j][k].charCodeAt(0) - 48) << 4);
        }
      }
      cur = act_tree;
      for(let j = q.length - 1; j >= 0; j--) {
        let k = q[j];
        if(!(k in cur)) cur[k] = {};
        cur = cur[k];
      }
      cur['pat'] = act_pat[i];
    }
  }

  function catchAct () {
    var l = act_key_q.length - 1,
        cur = act_tree;
    for(let i = l; i >= 0; i--) {
      // greedily catch keys, settle while no further steps available
      let k = act_key_q[i][1];
      if(!(k in cur) ||
         i != l && (act_key_q[i + 1][0] - act_key_q[i][0]) > act_intv) {
        if('pat' in cur) {
          act_key_q = [[0, 0]];
          for(let l in listener_list)
            listener_list[l].trigger(cur.pat);
          return;
        } 
        else return ;
      }
      cur = cur[k];
    }
  }

  function registerListener (r) {
    listener_list.push(r);
  }

  /////////////////////////////////////////////////////

  init();

  $('html')
  .on('keydown', catchKeydown)
  .on('keyup',   catchKeyup);

  return {
    panel: panel,
    registerListener: registerListener
  };

});
