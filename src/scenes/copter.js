Crafty.scene('Copter', function() {
	let copterVelocity = 2;
	let truckVelocity = 2;
	let gravity = 50

	/*
	* C O M P O N E N T S
	*/

	Crafty.c('ViewportTrigger', {
		required: '2D',
		events: {
			'EnterFrame': function () {
				if (this.ox < 0) {
					this.trigger('ViewportLeaveX', -1)
				} else if (this.ox > Crafty.viewport._width) {
					this.trigger('ViewportLeaveX', 1)
				}
				if (this.oy < 0) {
					this.trigger('ViewportLeaveY', -1)
				} else if (this.oy > Crafty.viewport._height) {
					this.trigger('ViewportLeaveY', 1)
				}
			}
		}
	})

	Crafty.c('Actor', {
		required: 'PaddleAxis, ViewportTrigger, Color, Motion, Canvas',
		events: {
			'ViewportLeaveX': function(e) {
				console.log('leaveX', e)
				this.vx = 0
				this.ax = 0
				if (!~e) this.ox = 1
				if (~e) this.ox = Crafty.viewport._width - 1
			}
		}
	})

	Crafty.c('Copter', {
		required: 'Actor, PaddleButton',
		init: function() {
			this.attr({h:25, w:50})
			this.origin(20, 25)
			this.paddleButton(0)
			this.paddleAxis(0)
		},
		events: {
			'PaddleAxisChange': function (e) {
				this.vx = -e.value * copterVelocity
			},
			'PaddleButton_A': function(e) {
				console.log(e)
				this.detach(stuntman)
				stuntman.ay = gravity
			}
		}
	})

	Crafty.c('Truck', {
		required: 'Actor',
		init: function() {
			this.paddleAxis(1)
		},
		events: {
			'PaddleAxisChange': function(e) {
					this.vx = -e.value * truckVelocity
				}
		}
	})

	Crafty.c('Stuntman', {
		required: 'ViewportTrigger, Color, Motion, Canvas, Collision',
		init: function() {
			this.checkHits('Actor')
		},
		events: {
			'ViewportLeaveY': function(e) {
				console.log('StuntmanCrash')
				Crafty('Rules').get(0).trigger('stuntmanCrash', null)
			},
			'HitOn': function([first], ...data) {
				if (first.obj.has('Truck')) {
					Crafty('Rules').get(0).trigger('stuntmanSave', this)
				}
			}
		}
	})

	/*
	* E N T I T I E S
	*/
	let copter = Crafty.e('Copter')
		.attr({x:100, y:50, w:50, h:25})
		.color('red')

	let truck = Crafty.e('Truck')
		.attr({x:100, y:450, w:50, h:25})
		.origin(25, 25)
		.color('blue')

	let stuntman = Crafty.e('Stuntman')
		.attr({x:20, y:20, h: 20, w: 10})
		.color('white')


	/*
	* R U L E S
	*/
	let R = Crafty.e('Rules')
		.attr({
			score: 0,
			scoreUI: Crafty.e('Score, Text, DOM, Color')
				.attr({ x: 0, y: 30, w: 800, value: 0 })
				.textAlign('center')
				.textFont({ family: 'impact', size: '30px', type: 'bold' })
				.text(0)
				.textColor('teal'),
			reset: function () {
				stuntman.vy = 0
				stuntman.ay = 0
				stuntman.x = copter.ox
				stuntman.y = copter.oy
				copter.attach(stuntman)

			}
		})
		.bind('stuntmanCrash', function () {
			console.log('ahaha')
			this.reset()
		})
		.bind('stuntmanSave', function(_truck) {
			console.log('bravo')
			this.scoreUI.text(++this.score)
			truckVelocity = 4;
			copterVelocity = 6;
			this.reset();
		})

		R.reset()
})