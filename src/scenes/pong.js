Crafty.scene('Pong', function() {
	const grid = 10
	const paddleVelocity = 400
	const ballMaxVelocityX = [-500, 500]
	const ballMaxVelocityY = [-300, 300]
	const ballInitVelocityX = 100
	const speedIncrease = 1.1
	let p1Score = 0
	let p2Score = 0
	let gameStep = 0

	// components
	Crafty.c('Placable', {
		place: function(x, y) {
			if (x >= 0) {
				this.x = x * grid
			} else {
				this.x = G.width + x * grid
			}
			if (y >= 0) {
				this.y = y * grid
			} else {
				this.y = G.height + y * grid
			}

			return this
		}
	})

	Crafty.c('Sizable', {
		size: function(w, h) {
			this.h = h * grid
			this.w = w * grid
			return this
		}
	})

	Crafty.c('Grid', {
		required: 'Placable, Sizable, 2D, Color, WebGL'
	})

	Crafty.c('Paddle', {
		required: 'Grid, Motion, Collision, GamepadMultiway',
		init: function() {
			this.color('black')
			this.size(1, 5)
			this.lastY = 0
		},
		axisChange: function(e) {
			let y = 225 + 225 * e.value // (game.h/2)-(paddle.h/2) + (game.h/2)-(paddle.h/2) * e.v
			this.lastY = this.y
			this.y = y
		}
	})

	Crafty.c('Ball', {
		required: 'Grid, Motion, Collision, AngularMotion',
		init: function() {
			this.color('black')
			this.size(1, 1)
			this.origin(5, 5)
		},
		reset: function() {
			gameStep = 0
			this.place(-5, 5)
			this.vx = -ballInitVelocityX
			this.vy = 100
			this.ay = 0
			this.ax = 0
			this.resetAngularMotion()
			this.rotation = 0
		},
		increaseSpeed: function() {
			gameStep++
			this.vx = Crafty.math.clamp((this.vx * speedIncrease), ballMaxVelocityX[0], ballMaxVelocityX[1])
			this.vy = Crafty.math.clamp(this.vy, ballMaxVelocityY[0], ballMaxVelocityY[1])
			console.log(`vx ${this.vx} - vy: ${this.vy}`)
		}
	})

	Crafty.c('Score', {
		required: 'DOM, Color, Text',
		init: function() {
			this.textColor('teal')
			this.textFont({family: 'impact', size: '40px', type: 'bold'})
		}
	})

	// entities
	Crafty.e('Score')
		.attr({x: 300, y:40, w:100})
		.text(p1Score)
	Crafty.e('Score')
		.attr({x: G.width - 400, y:40, w: 100})
		.text(p2Score)

	Crafty.e('Paddle')
		.attr({pId: 1})
		.place(-3, -7)
		.gamepadMultiway({analog: true, speed: 0, gamepadIndex: 1})
		.unbind('GamepadAxisChange')
		.bind('GamepadAxisChange', function(e) {
			this.axisChange(e)
		})
		.bind('KeyDown', function(e) {
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
		.bind('KeyUp', function(e) {
			switch(e.key) {
				case Crafty.keys.DOWN_ARROW:
				case Crafty.keys.UP_ARROW:
					this.ay = 0
					this.vy = 0
					break
			}
		})
	Crafty.e('Paddle')
		.attr({pId: 0})
		.place(3, 2)
		.gamepadMultiway({analog: true, speed: 0, gamepadIndex: 0})
		.unbind('GamepadAxisChange')
		.bind('GamepadAxisChange', function(e) {
			this.axisChange(e)
		})
		.bind('KeyDown', function(e) {
			switch(e.key) {
				case Crafty.keys.S:
					this.ay = paddleVelocity
					break
				case Crafty.keys.W:
					this.ay = -paddleVelocity
					break
					case Crafty.keys.T:
						Crafty('Ball').get(0).reset()
					break
					case Crafty.keys.H:
						Crafty('Ball').get(0).vrotation = 200
					break
					case Crafty.keys.F:
						Crafty('Ball').get(0).vrotation = -200
					break
					case Crafty.keys.G:
						Crafty.pause()
						console.log('GameStep: ', gameStep)
					break
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
	Crafty.e('Ball')
		.checkHits('Paddle')
		.bind('HitOn', function(data) {
			console.log(data.obj)
			//	this.vx = -this.vx
			if ((hitData = this.hit('Paddle'))) {
				const paddle = hitData[0].obj

				// angle depending on offset
				this.vy = 10 * ((-1) * (-this._h / 2 + Number(Number(paddle._y) - Number(this._y)) - paddle._h/2))

				/*
				Rotation / Curve
				*/
				// rotation depending on paddle speed
				this.vrotation += paddle.lastY - paddle.y

				// curve ball depending on rotation
				this.ay += this.vrotation * 10 // FIXME - needs to reversed for left player
				console.log('curve', this.vrotation)

				// revert x speed
				this.vx *= -1

				// increse speed and gamestep
				this.increaseSpeed()
			}
		})
		.bind('UpdateFrame', function() {
			// vertical bounce
			if (this.y > G.height-10) {
				// move away to avoid another collision (because of rotating corners)
				this.y = G.height-11
				if (this.vrotation <= 0 && this.vx < 0 || this.vrotation >= 0 && this.vx > 0) {
					// rotation should add to vx
					// console.log('rotation increased vx', this.vx, this.vx + this.vrotation/10)

					// increase vx
					//this.vx += this.vrotation/10

					// revert vy
					this.vy *= -1

					// curve down
					//this.ay = -this.vrotation/10

					// reset vrotation
					this.ay = 0;
					this.vrotation = 0
					return
				} else if (this.vrotation > 0 && this.vx < 0 || this.vrotation < 0 && this.vx > 0) {
					// rotation against surface
					// console.log('rotations decreased vx', this.vx, this.vx + this.vrotation/10)

					// increase vy
					//this.vy = (this.vy + this.vrotation/10) * -1

					// revert vy
					this.vy *= -1

					// reset rotation
					this.ay = 0
					this.vrotation = 0
					return
				} else {
					this.vy *= -1
					this.ay = 0
					this.vrotation = 0
				}
			} else if (this.y < 0) {
				this.vy *= -1
				this.vrotation = 0
				this.ay = 0
			}

			// score
			if (this.x > G.width) {
				console.log('Poäng!!');
				Crafty('Score').get(0).text(++p1Score)
				this.reset()
			} else if (this.x < 0) {
				Crafty('Score').get(1).text(++p2Score)
				console.log('Ja mååål')
				this.reset()
			}
		})
		.reset()
})
