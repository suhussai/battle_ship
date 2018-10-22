QUnit.test( "no ships overlap", function( assert ) {
  var width = 480, height = 480, x_tile_count = 8, y_tile_count = 8,
      start_x_p1 = 0, start_y_p1 = 0, end_x_p1 = width, end_y_p1 = height/2,
      start_x_p2 = 0, start_y_p2 = end_y_p1, end_x_p2 = width, end_y_p2 = height;

  Crafty.init(width + 5, height + 5);
  Crafty.background('rgb(87, 109, 20)');

  document.getElementById("cr-stage").style.display = 'none';

  var p1_game_board = new battle_ship_game_board(
        x_tile_count, y_tile_count / 2, start_x_p1, start_y_p1,
        end_x_p1, end_y_p1
      );
  var p1 = new battle_ship_game_player("Player 1", p1_game_board);

  p1_game_board.prepare_board();
  p1.place_L_ship("Red L Ship", "red");
  p1.place_block_ship("Green Block Ship", "green");
  p1.place_line_ship("Blue Line Ship", "blue");
  p1.place_line_ship("Yellow Line Ship", "yellow");

  let locations = {};
  p1.ships.forEach(function(item, index) {
    item.ship_piece_locations.forEach(function(ship_coords, ship_coords_index) {
      assert.ok(locations[[ship_coords[0], ship_coords[1]]] != "taken", "Does not overlap!");
      locations[[ship_coords[0], ship_coords[1]]] = "taken";
    });
  });

  assert.ok( 1 == "1", "Passed!" );
});
