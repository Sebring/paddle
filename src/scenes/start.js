Crafty.scene('start', function() {
	selectedGame = 0;
	games = ['Pong', 'Breakout', 'Snake'];
	$games = undefined;

	// components
	Crafty.c('start_game', {
		required: 'DOM, Color, Text',
		init: function () {
			this.textColor('black')
			this.textFont({
				family: 'impact',
				size: '30px',
			})
			this.bind('select', function() {
				console.log('Im selected')
				$games.each(function() {this.trigger('blur')})
				this.textColor('silver')
			})
			this.bind('blur', function() {
				this.textColor('black')
			})
		}
	});

	// entities
	Crafty.e('Text, DOM, Color')
		.attr({x: 50,y: 100,w: 400})
		.textColor('black')
		.text('Paddle Waddle')
		.textFont({
			family: 'impact',
			size: '50px',
			type: 'bold'
		})
		.bind('KeyDown', function(e) {
			switch (e.key) {
				case Crafty.keys.UP_ARROW:
					$games.get(--selectedGame % games.length).trigger('select')
					break
				case Crafty.keys.RIGHT_ARROW:
					console.log('right')
					break
				case Crafty.keys.DOWN_ARROW:
					$games.get(++selectedGame % games.length).trigger('select')
					break
				case Crafty.keys.LEFT_ARROW:
					console.log('left')
					break
				case Crafty.keys.SPACE:
					console.log('Start scene ', games[Math.abs(selectedGame % games.length)])
					Crafty.scene(games[Math.abs(selectedGame % games.length)])
					break;
			}
		})

	Crafty.e('Text, DOM, Color')
		.attr({x:50, y:150, w:400})
		.textColor('black')
		.text('Välj spel:')
		.textFont({
			family: 'impact',
			size: '20px',
		})

		let i = 0;
		for (let i=0; i<games.length; i ++) {
			Crafty.e('start_game')
				.attr({x: 100, y:200+(i*30), w:200})
				.text(games[i])
		}

		// setup
		$games = Crafty('start_game');
		console.log('Games', $games);
		$games.get(selectedGame % games.length).trigger('select')
})
