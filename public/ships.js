class ship {
  constructor(ship_name, ship_color, battle_ship_game_board) {
    this.ship_color = ship_color;
    this.ship_name = ship_name;
    this.battle_ship_game_board = battle_ship_game_board;
    this.ship_pieces = 0;
    this.ship_piece_locations = [];
    this.destroyed_ship_pieces = {};
  }

  // for bulk setting data values
  // when reloading game settings
  // after game refresh
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
        return true;
      }

      if (ship.destroyed_ship_pieces[[x,y]] == undefined) {
        tile.addComponent('Ship');
        tile.removeComponent("Tile");
        tile.color(ship.ship_color);
        tile.css({'border': '1px solid black'});
        tile.bind('ShipHit', function() {
          if (waiting) {return true;}
          if (this.has('Ship')) {
            this.addComponent("ShipDestroyed");
            this.removeComponent("Ship");
            this.color("#000000");
            this.css({'background-image': 'radial-gradient(red, yellow, '+ship.ship_color+')'});
            ship.ship_pieces = ship.ship_pieces - 1;
            ship.destroyed_ship_pieces[[this.x, this.y]] = true;
            if (ship.ship_pieces < 1) {
              players[current_player].ships_sunk += 1;
              Crafty.trigger('ShipShot', ship.ship_name);
            } else {
              players[current_player].shots_fired += 1;
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
      let tile_id = this.battle_ship_game_board.occupied_tiles[(this.xtc(x)).toString()+","+(this.ytc(y)).toString()];
      let tile = Crafty(tile_id);

      tile.addComponent('Ship');
      tile.removeComponent("Tile");
      tile.color(this.ship_color);
      tile.css({'border': '1px solid black'});
      tile.bind('ShipHit', function() {
        if (waiting) {return true;}
        if (this.has('Ship')) {
          this.addComponent("ShipDestroyed");
          this.removeComponent("Ship");
          this.color("#000000");
          this.css({'background-image': 'radial-gradient(red, yellow, '+ship.ship_color+')'});
          ship.ship_pieces = ship.ship_pieces - 1;
          ship.destroyed_ship_pieces[[this.x, this.y]] = true;
          if (ship.ship_pieces < 1) {
            players[current_player].ships_sunk += 1;
            Crafty.trigger('ShipShot', ship.ship_name);
          } else {
            players[current_player].shots_fired += 1;
          }
          if (!game_over) {
            Crafty.trigger('switch_turns');
          }
        }
      });
      return true;
    } else {
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
      placed = this.can_place_line_piece(random_x, random_y);
    }

    let this_reference = this;
    placed.forEach(function(e) {
      this_reference.place_ship_piece(e[0], e[1]);
    });

  }

  // given a starting x and y coords,
  // this function will attempt to find
  // a configuration that includes the given
  // x and y in order to place the ship
  // in a proper location.
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
      placed = this.can_place_block_piece(random_x, random_y);
    }

    let this_reference = this;
    placed.forEach(function(e) {
      this_reference.place_ship_piece(e[0], e[1]);
    });
  }

  // given a starting x and y coords,
  // this function will attempt to find
  // a configuration that includes the given
  // x and y in order to place the ship
  // in a proper location.
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
