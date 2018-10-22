// main game scene
Crafty.defineScene('Game', function() {
  p1_game_board.prepare_board();

  // check if we are reloading a game setting
  if (p1.ships.length > 0) {
    p1.ships.forEach(function(item, index) {
      item.redraw_ship_pieces();
    });
  } else {
    p1.place_L_ship("Red L", "red");
    p1.place_block_ship("Green Block", "green");
    p1.place_line_ship("Blue Line", "blue");
    p1.place_line_ship("Yellow Line", "yellow");
  }

  p1_game_board.hide_board();

  p2_game_board.prepare_board();

  if (p2.ships.length > 0) {
    p2.ships.forEach(function(item, index) {
      item.redraw_ship_pieces();
    });
  } else {
    p2.place_L_ship("Red L", "red");
    p2.place_block_ship("Green Block", "green");
    p2.place_line_ship("Blue Line", "blue");
    p2.place_line_ship("Yellow Line", "yellow");
  }

  p2_game_board.hide_board();

  players[current_player].take_turn();

  this.show_victory = this.bind('ShipShot', function(ship_name) {
    if (ship_name != undefined) {
      Crafty.e('2D, DOM, Color, Button').attr({
        x: 0,
        y: players[current_player].battle_ship_game_board.start_y + height*0.2,
        w: width,
        h: height*0.1
      })
      .color("lightgrey")
      .css({'border': '2px solid grey'});

      Crafty.e('2D, DOM, Text, ButtonText').attr({
        x: 0,
        y: players[current_player].battle_ship_game_board.start_y + height*0.2,
        w: width,
        h: height*0.1
      })
      .text('You just destroyed the ' + ship_name + ' ship')
      .textAlign("center")
      .textColor("#000000")
      .textFont({
        size: '20px',
        weight: 'bold'
      });
    }

    players.forEach(function(item, index) {
      if (item.ships_left() < 1) {
        game_over = true;
      }
    });
    if (game_over) {
      waiting = true;
      setTimeout(function() {
        Crafty("Button, ButtonText").each(function(){
          this.destroy();
        });

        waiting = false;
        Crafty.scene('Victory');
      }, 2000);
    }
  });

  this.switch_turns = this.bind('switch_turns', function() {
    current_player = (current_player + 1) % players.length;
    waiting = true;
    setTimeout(function() {
      Crafty("Button, ButtonText").each(function(){
        this.destroy();
      });

      players.forEach(function(item, index) {
        item.battle_ship_game_board.hide_board();
      });

      players[current_player].take_turn();
      waiting = false;
    }, 2000);
  });

}, function() {
  this.unbind('ShipShot', this.show_victory);
  this.unbind('switch_turns', this.switch_turns);
});

// victory scene
// calculates stats and displays
// winner and stat information
Crafty.defineScene('Victory', function() {
  Crafty.e('2D, DOM, Color').attr({
    x: 0, y: 0,
    w: width,
    h: height
  })
  .color("#000000")
  .css({'border': '1px solid black'});

  Crafty.e("2D, DOM, Text")
        .attr({ x: 0, y: height/4, w: width })
        .text('Game Over! ' + players[current_player].player_name + ' won!')
        .textAlign("center")
        .textColor("#FFFFFF")
        .textFont({
          size: '40px',
          weight: 'bold'
        });

  let total_shots_fired = 0;
  players.forEach(function(item, index) {
    total_shots_fired += item.shots_fired;
  });

  let stats = 'Total shots fired: ' + total_shots_fired.toString();
  Crafty.e("2D, DOM, Text")
        .attr({ x: 0, y: height/2, w: width })
        .text(stats)
        .textAlign("center")
        .textColor("#FFFFFF")
        .textFont({
          size: '20px',
          weight: 'bold'
        });
  players.forEach(function(item, index) {
    Crafty.e("2D, DOM, Text")
          .attr({ x: 0, y: height*(0.6+((1+index)*0.05)), w: width })
          .text(item.player_name + " sunk " + item.ships_sunk + " ships")
          .textAlign("center")
          .textColor("#FFFFFF")
          .textFont({
            size: '20px',
            weight: 'bold'
          });
  });

  setTimeout(function() {
    Crafty.e('2D, DOM, Color, Mouse, Button').attr({
      x: 0, y: height*0.8,
      w: width,
      h: height*0.1
    })
    .color("lightgrey")
    .css({'border': '2px solid grey'})
    .bind('Click', function(MouseEvent) {

      // clean up for next game
      console.log('cleaning up...')
      Crafty("*").each(function(){
        this.destroy();
      });
      players.forEach(function(item, index) {
        item.battle_ship_game_board.destroyed_tiles = {};
        item.battle_ship_game_board.occupied_tiles = {};
        item.ships = [];
        item.ships_sunk = 0;
        item.shots_fired = 0;
      });

      current_player = Math.random() > 0.5 ? 0 : 1;
      players = [p1,p2];
      game_over = false;
      waiting = false;

      Crafty.enterScene('Lobby');
    });

    Crafty.e('2D, DOM, Text, ButtonText').attr({
      x: 0, y: height*0.82,
      w: width,
      h: height*0.1
    })
    .text('Click here to restart game...')
    .textAlign("center")
    .textColor("#000000")
    .textFont({
      size: '20px',
      weight: 'bold'
    });
  }, 3000);

}, function() {});

Crafty.defineScene('Lobby', function(){
    Crafty.background("#000");
    Crafty.e("2D, DOM, Text, Curtain")
          .attr({ x: 0, y: height/3, w: width })
          .text('BattleShip')
          .textAlign("center")
          .textColor("#FFFFFF")
          .textFont({
            size: '40px',
            weight: 'bold'
          });
    Crafty.e("2D, DOM, Text, Curtain")
          .attr({ x: 0, y: height*0.45, w: width })
          .text('By Syed')
          .textAlign("center")
          .textColor("#FFFFFF")
          .textFont({
            size: '15px',
            weight: 'bold'
          });

    Crafty.e('2D, DOM, Color, Mouse, Button').attr({
      x: 0, y: height*0.6,
      w: width,
      h: height*0.1
    })
    .color("lightgrey")
    .css({'border': '2px solid grey'})
    .bind('Click', function(MouseEvent) {
      Crafty("Curtain, CurtainText, Button, ButtonText").each(function(){
        this.destroy();
      });
      Crafty.enterScene('Game');
    });

    Crafty.e('2D, DOM, Text, ButtonText').attr({
      x: 0, y: height*0.62,
      w: width,
      h: height*0.1
    })
    .text('Click here to start game.')
    .textAlign("center")
    .textColor("#000000")
    .textFont({
      size: '20px',
      weight: 'bold'
    });

});
