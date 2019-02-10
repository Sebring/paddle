Crafty.scene('Gravitor', function () {

	Crafty.sprite('/src/scenes/gravitor/ship.png', {'ship':[0,0,100,108]})

	var thrustParticles = {
		startColour: [255, 131, 0, 1], startColourRandom: [48, 50, 45, 0],
			endColour: [245, 35, 0, 0], endColourRandom: [60, 60, 60, 0],
			sharpness: 20, sharpnessRandom: 10, // gradient sharpness -only applies when fastMode is off
			spread: 4, jitter: 1, // sensible values are 0-3
			duration: -1, // frames this should last
			fastMode: true, // squares or circle gradients
			gravity: {x: 0, y: 0},
			originOffset: {x: 40, y: 95}
	}
	var thrustEnabled = Object.assign({
		maxParticles: 20,
		size: 8, sizeRandom: 2,
		speed: 3, speedRandom: 1.2,
		lifeSpan: 30, lifeSpanRandom: 10, // lifetime in frames
		angle: 0, angleRandom: 15,
	}, thrustParticles);
	var thrustDisabled = Object.assign({
		maxParticles: 5,
		size: 6, sizeRandom: 2,
		speed: 1, speedRandom: 0.5,
		lifeSpan: 20, lifeSpanRandom: 5,
		angle: 0, angleRandom: 25,
		startColour: [255, 131, 0, 1], startColourRandom: [48, 50, 45, 0],
		endColour: [245, 35, 0, 0], endColourRandom: [60, 60, 60, 0],
		sharpness: 20, sharpnessRandom: 10,
		spread: 1, jitter: 0,
		duration: -1,
		fastMode: true,
		gravity: {x: 0, y: 0},
		originOffset: {x: 40, y: 95}
	}, thrustParticles);

	Crafty.c('WorldWrap', {
		required: '2D',
		events: {
			'EnterFrame': function () {
				if (this.ox < 0) {
					this.ox = Crafty.viewport._width
				} else if (this.ox > Crafty.viewport._width) {
					this.ox = 0
				}
				if (this.oy < 0) {
					this.oy = Crafty.viewport._height
				} else if (this.oy > Crafty.viewport._height) {
					this.oy = 0
				}
			}
		}
	})

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
			const px = Math.sin(p) * -1
		  const py = Math.cos(p)
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
			}
		}
	})

	const ship = Crafty.e('Ship')
		.attr({x: 100, y: 100, h:50, w:55})
		.thrust()
		.thrustGravity(0, 0)
		.origin(25, 22.5)
		.addComponent('WiredMBR')

	Crafty.e('Bullet')
		.fire(200, 200, 90)

var fire = Crafty.e("2D, Canvas, Particles")
	.attr({w: 80, h: 100})
	.origin(40, 25)
	.addComponent('WiredMBR')
	.particles(thrustDisabled)


	fire.ox = ship.ox
	fire.y = ship.y-fire.h
	ship.attach(fire)
	ship.setParticles(fire)
	ship.rotation = 180

	console.log('vp', Crafty.viewport._width)
	})