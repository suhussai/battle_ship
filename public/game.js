class ship {
	constructor(ship_name, ship_color, battle_ship_game_board) {
		this.ship_color = ship_color;
		this.ship_name = ship_name;
		this.battle_ship_game_board = battle_ship_game_board;
		this.ship_pieces = 0;
		this.ship_piece_locations = [];
		this.destroyed_ship_pieces = {};
	}

	set_data(data) {
		this.ship_color = data.ship_color;
		this.ship_name = data.ship_name;
		this.battle_ship_game_board = data.battle_ship_game_board;
		this.ship_pieces = data.ship_pieces;
		this.ship_piece_locations = data.ship_piece_locations;
		this.destroyed_ship_pieces = data.destroyed_ship_pieces;
	}

	redraw_ship_pieces() {
		var ship = this;
		this.ship_piece_locations.forEach(function(item, index) {
			let x = item[0], y = item[1];
			let tile_id = ship.battle_ship_game_board.occupied_tiles[(x).toString()+","+(y).toString()];
			let tile = Crafty(tile_id);

			if (tile.has('Ship') || tile.has('ShipDestroyed')) {
				console.log('this is already filled');
				return true;
			}

			if (ship.destroyed_ship_pieces[[x,y]] == undefined) {
				tile.addComponent('Ship');
				tile.removeComponent("Tile");
				tile.color(ship.ship_color);
				tile.css({'border': '1px solid black'});
				tile.bind('ShipHit', function() {
					if (waiting) {return true;}
					console.log('we got a hit');
					if (this.has('Ship')) {
						this.addComponent("ShipDestroyed");
						this.removeComponent("Ship");
						this.color("#000000");
						this.css({'background-image': 'radial-gradient(red, yellow, '+ship.ship_color+')'});
						ship.ship_pieces = ship.ship_pieces - 1;
						ship.destroyed_ship_pieces[[this.x, this.y]] = true;
						if (ship.ship_pieces < 1) {
							players[current_player].ships_sunk += 1;
							console.log('ship destroyed!!!');
							Crafty.trigger('ShipShot', ship.ship_name);
						} else {
							players[current_player].shots_fired += 1;
							console.log('wrecked!!');
						}
						if (!game_over) {
							Crafty.trigger('switch_turns');
						}
					}
				});
			} else {
				tile.addComponent("ShipDestroyed");
				tile.removeComponent("Tile");
				tile.color(ship.ship_color);
				tile.css({'background-image': 'radial-gradient(red, yellow, '+ship.ship_color+')'});
			}
		});
	}

	get_random_x() {
		return Math.floor(Math.random() * 10) % this.battle_ship_game_board.x_tile_count;
	}

	get_random_y() {
		return Math.floor(Math.random() * 10) % this.battle_ship_game_board.y_tile_count;
	}

	xtc(x) {
		return this.x_tile_to_coord(x) + this.battle_ship_game_board.start_x;
	}

	ytc(y) {
		return this.y_tile_to_coord(y) + this.battle_ship_game_board.start_y;
	}

	x_tile_to_coord(y) {
		return y * this.battle_ship_game_board.tile_height;
	}

	y_tile_to_coord(x) {
		return x * this.battle_ship_game_board.tile_width;
	}

	can_place_ship_piece(x,y) {
		//console.log(this.battle_ship_game_board.occupied_tiles);
		if (this.battle_ship_game_board.start_x <= this.xtc(x) && this.xtc(x) < this.battle_ship_game_board.end_x &&
				this.battle_ship_game_board.start_y <= this.ytc(y) && this.ytc(y) < this.battle_ship_game_board.end_y) {
					return Crafty(this.battle_ship_game_board.occupied_tiles[this.xtc(x).toString()+","+this.ytc(y).toString()]).has('Tile');
		}
		return false;
	}

	place_ship_piece(x, y) {
		if (this.can_place_ship_piece(x,y)) {
			this.ship_piece_locations.push([this.xtc(x),this.ytc(y)]);
			var ship = this;
			this.ship_pieces = this.ship_pieces + 1;
			//console.log("placing piece", x, y);
			let tile_id = this.battle_ship_game_board.occupied_tiles[(this.xtc(x)).toString()+","+(this.ytc(y)).toString()];
			let tile = Crafty(tile_id);

			tile.addComponent('Ship');
			tile.removeComponent("Tile");
			tile.color(this.ship_color);
			tile.css({'border': '1px solid black'});
			tile.bind('ShipHit', function() {
				if (waiting) {return true;}
				console.log('we got a hit');
				if (this.has('Ship')) {
					this.addComponent("ShipDestroyed");
					this.removeComponent("Ship");
					this.color("#000000");
					this.css({'background-image': 'radial-gradient(red, yellow, '+ship.ship_color+')'});
					ship.ship_pieces = ship.ship_pieces - 1;
					ship.destroyed_ship_pieces[[this.x, this.y]] = true;
					if (ship.ship_pieces < 1) {
						players[current_player].ships_sunk += 1;
						console.log('ship destroyed!!!');
						Crafty.trigger('ShipShot', ship.ship_name);
					} else {
						players[current_player].shots_fired += 1;
						console.log('wrecked!!');
					}
					if (!game_over) {
						Crafty.trigger('switch_turns');
					}
				}
			});
			return true;
		} else {
			//console.log('cant place');
			//console.log(x);
			//console.log(y);
			return false;
		}
	}

}

class line_ship extends ship {
	constructor(ship_name, ship_color, battle_ship_game_board) {
		super(ship_name, ship_color, battle_ship_game_board)
	}

	place_line_ship_pieces() {
		let random_x, random_y, placed;

		// place first line piece
		placed = false;
		while (placed == false) {
			random_x = this.get_random_x();
			random_y = this.get_random_y();
			//console.log('setting Line random_x and random_y');
			//console.log(random_x, random_y);
			placed = this.can_place_line_piece(random_x, random_y);
		}
		//console.log("line coords", placed);

		let this_reference = this;
		placed.forEach(function(e) {
			this_reference.place_ship_piece(e[0], e[1]);
		});

	}

	can_place_line_piece(random_x, random_y) {
    if (!this.can_place_ship_piece((random_x), (random_y))){
      return false;
    }

    if (this.can_place_ship_piece((random_x+1), (random_y)) &&
      this.can_place_ship_piece((random_x+2), (random_y)) &&
      this.can_place_ship_piece((random_x+3), (random_y))) {
      return [
        [random_x, random_y],
        [random_x+1, random_y],
        [random_x+2, random_y],
        [random_x+3, random_y],
      ];
    }
    if (this.can_place_ship_piece((random_x-1), (random_y)) &&
        this.can_place_ship_piece((random_x-2), (random_y)) &&
        this.can_place_ship_piece((random_x-3), (random_y))) {
      return [
        [random_x, random_y],
        [random_x-1, random_y],
        [random_x-2, random_y],
        [random_x-3, random_y],
      ];
    }
    if (this.can_place_ship_piece((random_x), (random_y+1)) &&
        this.can_place_ship_piece((random_x), (random_y+2)) &&
        this.can_place_ship_piece((random_x), (random_y+3))) {
      return [
        [random_x, random_y],
        [random_x, random_y+1],
        [random_x, random_y+2],
        [random_x, random_y+3],
      ];
    }
    if (this.can_place_ship_piece((random_x), (random_y-1)) &&
        this.can_place_ship_piece((random_x), (random_y-2)) &&
        this.can_place_ship_piece((random_x), (random_y-3))) {
      return [
        [random_x, random_y],
        [random_x, random_y-1],
        [random_x, random_y-2],
        [random_x, random_y-3],
      ];
    }
    return false;
  }

}

class block_ship extends ship {
	constructor(ship_name, ship_color, battle_ship_game_board) {
		super(ship_name, ship_color, battle_ship_game_board)
	}

	place_block_ship_pieces() {
		let random_x, random_y, placed;

		placed = false;
		while (placed == false) {
			random_x = this.get_random_x();
			random_y = this.get_random_y();
			//console.log('setting Block random_x and random_y');
			//console.log(random_x, random_y);
			placed = this.can_place_block_piece(random_x, random_y);
		}
		//console.log("block coords", placed);
		let this_reference = this;
		placed.forEach(function(e) {
			this_reference.place_ship_piece(e[0], e[1]);
		});
	}

	can_place_block_piece(random_x, random_y) {
		if (!this.can_place_ship_piece(random_x, (random_y))){
			return false;
		}
		if (this.can_place_ship_piece(random_x, (random_y+1)) &&
				this.can_place_ship_piece((random_x+1), (random_y+1)) &&
				this.can_place_ship_piece((random_x+1), (random_y))) {
			return [
				[random_x, random_y],
				[random_x, random_y+1],
				[random_x+1, random_y+1],
				[random_x+1, random_y],
			];
		}
		if (this.can_place_ship_piece(random_x, (random_y)) &&
				this.can_place_ship_piece((random_x+1), (random_y)) &&
				this.can_place_ship_piece((random_x+1), (random_y-1))) {
			return [
				[random_x, random_y-1],
				[random_x, random_y],
				[random_x+1, random_y],
				[random_x+1, random_y-1],
			];
		}
		if (this.can_place_ship_piece((random_x-1), (random_y)) &&
				this.can_place_ship_piece(random_x, (random_y)) &&
				this.can_place_ship_piece(random_x, (random_y-1))) {
			return [
				[random_x-1, random_y-1],
				[random_x-1, random_y],
				[random_x, random_y],
				[random_x, random_y-1],
			];
		}
		if (this.can_place_ship_piece((random_x-1), (random_y)) &&
				this.can_place_ship_piece(random_x, (random_y)) &&
				this.can_place_ship_piece(random_x, (random_y-1))) {
			return [
				[random_x-1, random_y],
				[random_x-1, random_y+1],
				[random_x, random_y],
				[random_x, random_y+1],
			];
		}
		return false;
	}

}

class L_ship extends ship {
	constructor(ship_name, ship_color, battle_ship_game_board) {
		super(ship_name, ship_color, battle_ship_game_board);
	}

	place_L_ship_pieces() {
		let random_x;
		let random_y;

		// place L Ship
		random_x = this.get_random_x();
		random_y = this.get_random_y();
		//console.log('setting Boot random_x and random_y');
		//console.log(random_x, random_y);

		this.place_ship_piece(random_x, random_y);
		if (Math.random() > 0.5) {
			if (!this.place_ship_piece((random_x + 1), random_y)) {
				this.place_ship_piece((random_x - 1), random_y);
			}
			if (this.place_ship_piece(random_x, (random_y + 2))) {
				this.place_ship_piece(random_x, (random_y + 1))
			} else {
				this.place_ship_piece(random_x, (random_y - 1));
				this.place_ship_piece(random_x, (random_y - 2));
			}
		} else {
			if (!this.place_ship_piece(random_x, (random_y + 1))) {
				this.place_ship_piece(random_x, (random_y - 1));
			}
			if (this.place_ship_piece((random_x + 2), random_y)) {
				this.place_ship_piece((random_x + 1), random_y)
			} else {
				this.place_ship_piece((random_x - 1), random_y);
				this.place_ship_piece((random_x - 2), random_y);
			}
		}
	}
}

class battle_ship_game_player {
	constructor(player_name, battle_ship_game_board) {
		this.battle_ship_game_board = battle_ship_game_board;
		this.player_name = player_name;
		this.ships = [];
		this.ships_sunk = 0;
		this.shots_fired = 0;
	}

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

	ship_pieces_left() {
		let ship_pieces_left = 0;
		this.ships.forEach(function(item, index) {
			ship_pieces_left = ship_pieces_left + item.ship_pieces;
		});
		return ship_pieces_left;
	}

	take_turn() {
		console.log('setting up block...');

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
			console.log('removing sign...');
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

class battle_ship_game_board {
	constructor(x_tile_count, y_tile_count, start_x, start_y, end_x, end_y) {
		this.start_x = start_x;
		this.start_y = start_y;
		this.end_x   = end_x;
		this.end_y   = end_y;
		this.x_tile_count = x_tile_count;
		this.y_tile_count = y_tile_count;

		this.tile_width = Math.floor(
			(this.end_x - this.start_x) / this.x_tile_count
		);

		this.tile_height = Math.floor(
			(this.end_y - this.start_y) / this.y_tile_count
		);

		this.occupied_tiles = {};
		this.destroyed_tiles = {};
	}

	set_data(data) {
		this.start_x = data.start_x;
		this.start_y = data.start_y;
		this.end_x   = data.end_x;
		this.end_y   = data.end_y;
		this.x_tile_count = data.x_tile_count;
		this.y_tile_count = data.y_tile_count;

		this.tile_width = data.tile_width;

		this.tile_height = data.tile_height;

		this.occupied_tiles = data.occupied_tiles;
		this.destroyed_tiles = data.destroyed_tiles;
	}

	prepare_board() {
		var board = this;
		for (var x = this.start_x; x < this.end_x; x = x + this.tile_width) {
      for (var y = this.start_y; y < this.end_y; y = y + this.tile_height) {
				if (board.occupied_tiles[x.toString()+","+y.toString()] == undefined) {
					let tile = Crafty.e('2D, DOM, Color, Mouse, Tile')
	          .attr({x: x, y: y, w: this.tile_width, h: this.tile_height})
	          .color("#FFFFFF")
	          .css({'border': '1px solid black'})
						.bind('TileHit', function(MouseEvent) {
							if (waiting) {return true;}
							this.color("lightgrey");
							this.addComponent('TileDestroyed');
							board.destroyed_tiles[[this.x, this.y]] = true;
							this.removeComponent("Tile");
							players[current_player].shots_fired += 1;
							Crafty.trigger('switch_turns');
						});
						board.occupied_tiles[x.toString()+","+y.toString()] = tile.getId();
				} else {
					if (board.destroyed_tiles[[x,y]] == undefined) {
						let tile = Crafty.e('2D, DOM, Color, Mouse, Tile')
		          .attr({x: x, y: y, w: this.tile_width, h: this.tile_height})
		          .color("#FFFFFF")
		          .css({'border': '1px solid black'})
							.bind('TileHit', function(MouseEvent) {
								if (waiting) {return true;}
								this.color("lightgrey");
								this.addComponent('TileDestroyed');
								this.removeComponent("Tile");
								players[current_player].shots_fired += 1;
								Crafty.trigger('switch_turns');
							});
							board.occupied_tiles[x.toString()+","+y.toString()] = tile.getId();
					} else {
						let tile = Crafty.e('2D, DOM, Color, TileDestroyed')
		          .attr({x: x, y: y, w: this.tile_width, h: this.tile_height})
		          .color("lightgrey")
		          .css({'border': '1px solid black'});
							board.occupied_tiles[x.toString()+","+y.toString()] = tile.getId();
					}
				}
      }
    }
	}

	// hide board during opposing player's turn
	hide_board() {
		console.log('hiding board...');

		var board = this;
		Crafty("Tile, Ship").each(function() {
			if (this.has('ShipDestroyed') || this.has('TileDestroyed')) {
				console.log('destroyed ship/tile found', this.x, this.y);
				return true;
			}
			if (this.has('HiddenTile')) {
				console.log('tile already covered', this.x, this.y);
				return true;
			}
			var underlying_tile = this;
			if (board.start_x <= this.x && this.x < board.end_x &&
					board.start_y <= this.y && this.y < board.end_y) {
						Crafty.e('2D, DOM, Color, Mouse, HiddenTile')
		          .attr({x: this.x, y: this.y, w: board.tile_width, h: board.tile_height})
		          .color("#FFFFFF")
		          .css({'border': '1px solid black', 'background-image': 'repeating-linear-gradient(45deg, white, white, white 10px, black 10px, white 20px)'})
							.bind('Click', function(MouseEvent) {
								if (waiting) {return true;}
								this.destroy();
								if (underlying_tile.has('Ship')) {
									underlying_tile.trigger('ShipHit');
								} else if (underlying_tile.has('Tile')) {
									underlying_tile.trigger('TileHit');
								}
								console.log('clicked hidden board');
							});
						//console.log('Placed hidden on my board', this.x/60, this.y/60);
						// this.css({'background-image': 'repeating-linear-gradient(45deg, white, white, white 10px, black 10px, white 20px)'});
					} else {
						//console.log('NOT my board', this.x/60, this.y/60);
					}
		});
	}

	// show board during player turn
	show_board() {
		console.log('showing board...');
		var board = this;
		Crafty("HiddenTile").each(function() {
			if (this.has('Destroyed')) {
				console.log('destroyed ship found', this.x, this.y);
				return true;
			}
			if (board.start_x <= this.x && this.x < board.end_x &&
					board.start_y <= this.y && this.y < board.end_y) {
						//console.log('my board', this.x, this.y);
						this.destroy();
					} else {
						//console.log('NOT my board', this.x, this.y);
					}
		});

	}

}
