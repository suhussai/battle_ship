class battle_ship_game_player {
	constructor(player_name, battle_ship_game_board) {
		this.battle_ship_game_board = battle_ship_game_board;
		this.player_name = player_name;
		this.ships = [];
		this.ships_sunk = 0;
		this.shots_fired = 0;
	}

	// for bulk setting data values
	// when reloading game settings
	// after game refresh
	set_data(data) {
		let board = new battle_ship_game_board();
		board.set_data(data.battle_ship_game_board);
		this.battle_ship_game_board = board;
		this.player_name = data.player_name;
		this.ships = [];
		let old_this = this;
		data.ships.forEach(function(item, index) {
			old_this.ship = new ship();
			item.battle_ship_game_board = old_this.battle_ship_game_board;
			old_this.ship.set_data(item);
			old_this.ships.push(old_this.ship);
		});
		this.ships_sunk = data.ships_sunk;
		this.shots_fired = data.shots_fired;
	}

	ships_left() {
		let ships_left = 0;
		this.ships.forEach(function(item, index) {
			if (item.ship_pieces > 0) {
				ships_left = ships_left + 1;
			}
		});
		return ships_left;
	}

	// setup UI component to handle turn switch
	take_turn() {
		var player = this;
		Crafty.e('2D, DOM, Color, Mouse, Curtain').attr({
			x: 0, y: 0,
			w: width,
			h: height
		})
		.color("#000000")
		.css({'border': '1px solid black'});

		Crafty.e("2D, DOM, Text, CurtainText")
					.attr({ x: 0, y: height/3, w: width })
					.text('Waiting for '+player.player_name+'...')
					.textAlign("center")
					.textColor("#FFFFFF")
					.textFont({
						size: '20px',
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
			player.battle_ship_game_board.show_board();
		});

		Crafty.e('2D, DOM, Text, ButtonText').attr({
			x: 0, y: height*0.62,
			w: width,
			h: height*0.1
		})
		.text('Click here to start turn...')
		.textAlign("center")
		.textColor("#000000")
		.textFont({
			size: '20px',
			weight: 'bold'
		});

	}

	place_L_ship(L_ship_name, L_ship_color) {
		this.L_ship = new L_ship(L_ship_name, L_ship_color, this.battle_ship_game_board);
		this.L_ship.place_L_ship_pieces();

		this.ships.push(this.L_ship);
	}

	place_block_ship(block_ship_name, block_ship_color) {
		this.block_ship = new block_ship(block_ship_name, block_ship_color, this.battle_ship_game_board);
		this.block_ship.place_block_ship_pieces();

		this.ships.push(this.block_ship);
	}

	place_line_ship(line_ship_name, line_ship_color) {
		this.line_ship = new line_ship(line_ship_name, line_ship_color, this.battle_ship_game_board);
		this.line_ship.place_line_ship_pieces();

		this.ships.push(this.line_ship);
	}
}
