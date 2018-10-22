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

  // for bulk setting data values
	// when reloading game settings
	// after game refresh
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

  // draw checkered board map
  // or redraw previous game settings
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
		var board = this;
		Crafty("Tile, Ship").each(function() {
			if (this.has('ShipDestroyed') || this.has('TileDestroyed')) {
				return true;
			}
			if (this.has('HiddenTile')) {
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
							});
					}
		});
	}

	// show board during player turn
	show_board() {
		var board = this;
		Crafty("HiddenTile").each(function() {
			if (this.has('Destroyed')) {
				return true;
			}
			if (board.start_x <= this.x && this.x < board.end_x &&
					board.start_y <= this.y && this.y < board.end_y) {
						this.destroy();
					}
		});
	}
}
