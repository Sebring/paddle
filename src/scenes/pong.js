Crafty.scene('Pong', function() {
	const paddleVelocity = 400
	const ballMaxVelocityX = [-1200, 1200]
	const ballMaxVelocityY = [-300, 300]
	const ballInitVelocityX = 100
	const speedIncrease = 1.06
	let ball, player1, player2

	/*
	* C O M P O N E N T S
	*/

	Crafty.c('Solid', {
		required: 'Grid'
	})

	Crafty.c('Wall', {
		required: 'Solid',
		init: function(){
			this.color('#800040')
		}
	})

	Crafty.c('Paddle', {
		required: 'Grid, Motion, Collision, Gamepad',
		init: function() {
			this.color('olive')
			this.size(1, 5)
			this.lastY = 0
			this.dir = 0
			this.points = 0
		},
		axisChange: function(e) {
			if (e.axis !== 0)
				return
			let y = 225 + 225 * e.value
			this.lastY = this.y
			this.y = y
		},
		score: function(point = 1) {
			this.points += point
		},
		events: {
			'player_score': function(player) {
				if (this.pId !== player.pId)
					return
				this.score++
			},
			'GamepadAxisChange': function(e) {	// e: {axis: number, value: [-1 - 1]}
				if (e.axis !== 0)
					return
				let y = 225 + 225 * e.value
				this.lastY = this.y
				this.y = y
			},
			'GamepadKeyChange': function(e) {	// e: {button: number, value: number, pressed: boolean}
					if (e.button === 0 && !e.pressed) {
						const b = Crafty('Ball').get(0)
						if (b._parent === this) {
							this.detach(b)
							b.vy = this.y - this.lastY
							b.vx = ballInitVelocityX * this.dir
						}
					}
			}
		}
	})

	Crafty.c('Score', {
		required: 'DOM, Color, Text',
		init: function() {
			this.value = 0
			this.textColor('teal')
			this.textFont({family: 'impact', size: '40px', type: 'bold'})
			this.text(this.value)
		},
		events: {
			'player_score': function(player) {
				if (player.pId !== this.pId)
					return
				this.text(++this.value)
			}
		}
	})

	/*
	* E N T E T I E S
	*/
	// state counter
	Crafty.e('Counter, DOM, Color, Text')
		.attr({x: 0, y: G.height - 60, w: 800, value: 0})
		.textAlign('center')
		.textFont({ family: 'impact', size: '30px', type: 'bold' })
		.text(0)
		.textColor('teal')
		.bind('ball_reset', function() {
			this.text(0)
		})
		.bind('state_advance', function() {
			this.text(++this.value)
		})

	// scores
	Crafty.e('Score')
		.attr({x: 300, y:40, w:100, pId:0})
	Crafty.e('Score')
		.attr({x: 500, y:40, w: 100, pId:1})

	// walls
	Crafty.e('Wall')
		.size(80, 1)
		.place(0, 1)
	Crafty.e('Wall')
		.size(80, 1)
		.place(0, 48)
		/* wall for one player mode
	Crafty.e('Block')
		.requires('Wall')
		.size(1, 50)
		.color('yellowgreen')
		.place(75, 0)
		*/

	ball = Crafty.c('Ball', {
		required: 'Grid, Motion, Collision, AngularMotion',
		init: function () {
			this.color('#a0c080')
			this.size(1, 1)
			this.origin(5, 5)
			this.hits = 0
		},
		reset: function (paddle) {
			this.hits = 0
			this.vx = 0 // ballInitVelocityX
			this.vy = 0 // 100
			this.x = paddle.ox
			this.y = paddle.oy
			this.ay = 0
			this.ax = 0
			this.resetAngularMotion()
			this.rotation = 0
			paddle.attach(this)
		},
		addHits: function () {
			this.hits++
			Crafty("Counter").text(this.hits);
			this.increaseSpeed()
		},
		increaseSpeed: function () {
			this.vx = Crafty.math.clamp((this.vx * speedIncrease), ballMaxVelocityX[0], ballMaxVelocityX[1])
			this.vy = Crafty.math.clamp(this.vy, ballMaxVelocityY[0], ballMaxVelocityY[1])
		},
	})

	player1 = Crafty.e('Paddle')
		.attr({pId: 0, dir: 1})
		.place(3, 2)
		.origin(15, 25)
		.gamepad(0)
		.bind('KeyDown', function(e) {
			switch(e.key) {
				case Crafty.keys.S:
					this.ay = paddleVelocity
					break
				case Crafty.keys.W:
					this.ay = -paddleVelocity
					break
					case Crafty.keys.T:
						Crafty.trigger('ball_reset', player1)
					break
					case Crafty.keys.H:
						Crafty('Ball').get(0).vrotation = 200
					break
					case Crafty.keys.F:
						Crafty('Ball').get(0).vrotation = -200
					break
					case Crafty.keys.G:
						Crafty.pause()
					break
					case Crafty.keys.SPACE: {
					const b = Crafty('Ball').get(0)
					const p = b._parent

					p.detach(b)
					b.vy = p.dy
					b.vx = ballInitVelocityX * p.dir
					}
			}
		})
		.bind('KeyUp', function(e) {
			switch(e.key) {
				case Crafty.keys.S:
				case Crafty.keys.W:
				this.vy = 0
				this.ay = 0
			}
		})
	player2 = Crafty.e('Paddle')
		.attr({ pId: 1, dir: -1 })
		.place(-3, -7)
		.origin(-15, 25)
		.gamepad(1)
		.bind('KeyDown', function (e) {
			switch (e.key) {
				case Crafty.keys.DOWN_ARROW:
					this.ay = paddleVelocity
					this.vy = 50
					break
				case Crafty.keys.UP_ARROW:
					this.ay = -paddleVelocity
					this.vy = -50
			}
		})
		.bind('KeyUp', function (e) {
			switch (e.key) {
				case Crafty.keys.DOWN_ARROW:
				case Crafty.keys.UP_ARROW:
					this.ay = 0
					this.vy = 0
					break
			}
		})

	ball = Crafty.e('Ball')
		.checkHits('Paddle, Wall')
		.bind('ball_reset', function(player) {this.reset(player)})
		.bind('HitOn', function(data) {

			// hit a paddle
			if ((hitData = this.hit('Paddle'))) {
				const paddle = hitData[0].obj
				const oDiff = paddle.oy - this.oy
				// console.log('diff', oDiff, oDiff * -5 + this.hits * 0.5)
				// angle depending on offset
				this.vy = this.vy + (oDiff * -5 + this.hits * 0.5)

				/*
				Rotation / Curve

				// rotation depending on paddle speed
				this.vrotation += paddle.lastY - paddle.y

				// curve ball depending on rotation
				this.ay += this.vrotation * 10 // FIXME - needs to reversed for left player
				console.log('curve', this.vrotation)
				*/

				// revert x speed
				this.vx *= -1

				// advance game step
				this.addHits()
			}
			if ((hitData = this.hit('Block'))) {
				this.vx *=-1
			} else if ((hitData = this.hit('Wall'))) {
				this.vy *= -1
			}
		})
		.bind('UpdateFrame', function() {
			if (this.x < 0) {
				Crafty.trigger('player_score', player2)
				Crafty.trigger('ball_reset', player2)
			}
			if (this.x > G.width) {
				Crafty.trigger('player_score', player1)
				Crafty.trigger('ball_reset', player1)
			}
		})
		.reset(Crafty("Paddle").get(0))
})
