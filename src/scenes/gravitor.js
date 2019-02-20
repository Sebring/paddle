Crafty.scene('Gravitor', function () {

	// Crafty.sprite('/src/scenes/gravitor/ship.png', {'ship':[0,0,100,108]})
	Crafty.sprite('/src/scenes/gravitor/rock.png',
	{'rock-4-1':[0,0,250,250], 'rock-4-2': [250,0,250,250],
	'rock-2-1': [0,250,250,250], 'rock-2-2': [250,250,250,250],
	'rock-1-1':[0,500,250,250], 'rock-1-2': [250,500,250,250],
	'ship':[500,500,250,250]}
	)

	var thrustParticles = {

		sharpness: 20, sharpnessRandom: 10, // gradient sharpness -only applies when fastMode is off
		spread: 4, jitter: 1, // sensible values are 0-3
		duration: -1, // frames this should last
		fastMode: false, // squares or circle gradients
		gravity: {x: 0, y: 0},
		originOffset: {x: 40, y: 5}
	}
	var thrustEnabled = Object.assign({
		startColour: [255, 131, 0, 1], startColourRandom: [48, 50, 45, 0],
		endColour: [245, 35, 0, 0], endColourRandom: [60, 60, 60, 0],
		maxParticles: 20,
		size: 10, sizeRandom: 3,
		speed: 3, speedRandom: 1.2,
		lifeSpan: 30, lifeSpanRandom: 10, // lifetime in frames
		angle: 180, angleRandom: 15,
	}, thrustParticles);
	var thrustDisabled = Object.assign({
		maxParticles: 5,
		size: 8, sizeRandom: 1,
		speed: 1, speedRandom: 0.5,
		lifeSpan: 20, lifeSpanRandom: 5,
		angle: 180, angleRandom: 25,
		startColour: [100, 100, 200, 1], startColourRandom: [50, 50, 50, 0],
		endColour: [245, 35, 0, 0], endColourRandom: [60, 60, 60, 0],
	}, thrustParticles);


	Crafty.c('Bullet', {
		required: '2D, Canvas, Color, Motion, WorldWrap',
		init: function() {
			this.h = 5
			this.w = 5
			this.color('white')
			this._timestamp = Date.now()
		},
		fire: function(angle, ox, oy, power) {
			this.x = ox
			this.y = oy
			const p = Crafty.math.degToRad(angle)
			const px = Math.sin(p)
		  const py = -Math.cos(p)
			this.vx = power * px
			this.vy = power * py
		},
		events: {
			'EnterFrame': function() {
				const lifespan = Date.now() - this._timestamp
				if (lifespan > 1000) {
					this.destroy()
				}
			}
		}
	})

	Crafty.c('Shooter', {
		required: 'PaddleButton',
		init: function() {
			this.bulletOriginX = 0
			this.bulletOriginY = 0
			this.bulletVelocity = 400
		},
		shooter(ox, oy, power) {
			this.bulletOriginX = ox
			this.bulletOriginY = oy
			this.bulletVelocity = power
		},
		events: {
			'PaddleButton_A': function(btn) {
				if (btn.pressed) {
					Crafty.e('Bullet')
						.fire(this.rotation, this.ox + this.bulletOriginX, this.oy + this.bulletOriginY, this.bulletVelocity)
				}
			}
		}
	})

	Crafty.c('Ship', {
		required: 'Canvas, Collision, ship, Thrust, WorldWrap, Shooter',
		setParticles(particles) {
			this.particles = particles;
		},
		events: {
			'ThrustChanged': function(thrust) {
				if (thrust) {
					this.particles.particles(thrustEnabled)
				} else {
					this.particles.particles(thrustDisabled);
				}
			},
			'KeyDown': function(e) {
				switch(e.key) {
					case Crafty.keys.SPACE:
						this.thrust = true
						this.trigger('ThrustChanged', true)
						break
					case Crafty.keys.LEFT_ARROW:
						this.vrotation = -80
						break
					case Crafty.keys.RIGHT_ARROW:
						this.vrotation = 80
						break
					case Crafty.keys.SHIFT:
						this.trigger('PaddleButton_A', {pressed: true})
						break
				}
			},
			'KeyUp': function(e) {
				switch (e.key) {
					case Crafty.keys.SPACE:
						this.thrust = false
						this.trigger('ThrustChanged', false)
						break
					case Crafty.keys.LEFT_ARROW:
					case Crafty.keys.RIGHT_ARROW:
						this.vrotation = 0
						break
				}
			}
		}
	})

	Crafty.c('Rock', {
		required: 'Canvas, WorldWrap, Collision, AngularMotion',
		init: function() {
			this.vx = Crafty.math.randomInt(-100, 100)
			this.vy = Crafty.math.randomInt(-100, 100)
			this.checkHits('Ship, Bullet')
		},
		rock: function(size=4) {
			let r = Crafty.math.randomInt(1, 2)
			this.addComponent(`rock-${size}-${r}`)
			this.size = size
			this.h = 20*size
			this.w = 20*size
			this.origin(this.w/2, this.h/2)
			r = Crafty.math.randomInt(-100, 100)
			this.vrotation = r
			return this
		},
		split: function(nr, destroy = true) {
			if (this.size === 1) {
				if (destroy) {
					this.destroy()
				 }
				return
			}
			const pOx = this.ox
			const pOy = this.oy
			for (let i=0; i<nr; i++) {
				Crafty.e('Rock')
					.attr({ox:pOx, oy:pOy})
					.rock(this.size/2)
			}
			if (destroy)
				this.destroy()
		},
		events: {
			'HitOn': function([first], ...rest) {
				if (first.obj.has('Ship')) {
					this.destroy()
					first.obj.trigger('Crash', this)
					R.trigger('CrashShip')
					this.trigger('Split')
				}
				if (first.obj.has('Bullet')) {
					console.log('bullet')
					first.obj.destroy()
					this.trigger('Split')
					R.trigger('HitRock')
				}
			},
			'Split': function() {
				this.split(2)
			}
		}
	})

	const ship = Crafty.e('Ship')
		.attr({ x: 100, y: 100, w:50, h:50})
		.thrust()
		.thrustGravity(0, 0)
		.origin(24.5, 24.5)

	var exhaust = Crafty.e("2D, Canvas, Particles")
		.attr({w: 80, h: 100})
		.origin(44, 25)
		.particles(thrustDisabled)

	exhaust.ox = ship.ox
	exhaust.y = ship.y+ship.h
	exhaust.addComponent('WiredMBR')
	ship.addComponent('WiredMBR')
	ship.attach(exhaust)

	ship.setParticles(exhaust)
	// ship.rotation = 180

	/*
	* R U L E S
	*/
	let R = Crafty.e('Rules, Delay')
		.attr({
			score: 0,
			level: 1,
			scoreUI: Crafty.e('Score, Text, DOM, Color')
				.attr({ x: 0, y: 30, w: 800, value: 0 })
				.textAlign('center')
				.textFont({ family: 'impact', size: '30px', type: 'bold' })
				.text(0)
				.textColor('teal'),
			reset: function() {
				Crafty('Rock').each(function() {
					this.destroy()
				})
				ship.ox = Crafty.viewport._width/2
				ship.oy = Crafty.viewport._height/2
			},
			loadLevel: function(level=this.level) {
				this.reset()
				/*
				switch(level) {
					case 1:
						this.addRocks(1, 4)
						break;
					case 2:
						this.addRocks(2, 4)
						break;
				}*/
				this.addRocks(this.level, 4)

			},
			addRocks: function(noOfRocks, size) {
				console.log('Rules addRock', size)
				if (!(size | 0)) return
				for (let i=0; i<noOfRocks; i++) {
					Crafty.e('Rock')
						.attr({x:13, y:10})
						.rock(size)
				}
			}
		})
		.bind('HitRock', function() {
			this.scoreUI.text(++this.score)
			if (!Crafty('Rock').length) {
				this.loadLevel(++this.level)
			}
		})
		.bind('CrashShip', function() {
			Crafty('Rock').each(function() {
				this.ignoreHits('Ship')
			})
			this.delay(function() {
				this.score = 0
				this.level = 1
				this.scoreUI.text(this.score)
				this.loadLevel(this.level)
			}, 4000)
		})

		R.loadLevel(1)

	})
