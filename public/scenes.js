// Game scene
// -------------
// Runs the core gameplay loop
Crafty.defineScene('Game', function() {
  p1_game_board.prepare_board();

  if (p1.ships.length > 0) {
    console.log('redrawing ship pieces');
    p1.ships.forEach(function(item, index) {
      item.redraw_ship_pieces();
    });
  } else {
    p1.place_L_ship("Red L Ship", "red");
    p1.place_block_ship("Green Block Ship", "green");
    p1.place_line_ship("Blue Line Ship", "blue");
    p1.place_line_ship("Yellow Line Ship", "yellow");
  }

  p1_game_board.hide_board();

  p2_game_board.prepare_board();

  if (p2.ships.length > 0) {
    console.log('redrawing ship pieces');
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
    console.log('checking if game is over');

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
      console.log('GAME OVER!!');
      waiting = true;
      setTimeout(function() {
        Crafty("Button, ButtonText").each(function(){
          this.destroy();
        });

        waiting = false;
        Crafty.scene('Victory');
      }, 2000);
    } else {
      console.log('GAME NOT OVER!!');
    }
  });

  this.bind('switch_turns', function() {
    console.log('switching turns',current_player, (current_player + 1) % players.length);
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
	// Remove our event binding from above so that we don't
	//  end up having multiple redundant event watchers after
	//  multiple restarts of the game
	this.unbind('ShipShot', this.show_victory);
});

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
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

	// After a short delay, watch for the player to press a key, then restart
	// the game when a key is pressed
  setTimeout(function() {
    Crafty.e('2D, DOM, Color, Mouse, Button').attr({
      x: 0, y: height*0.8,
      w: width,
      h: height*0.1
    })
    .color("lightgrey")
    .css({'border': '2px solid grey'})
    .bind('Click', function(MouseEvent) {
      console.log('removing sign...');
      Crafty("Curtain, CurtainText, Button, ButtonText").each(function(){
        this.destroy();
      });
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

// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.defineScene('Lobby', function(){
	// Draw some text for the player to see in case the file
	//  takes a noticeable amount of time to load

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
			console.log('removing sign...');
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
