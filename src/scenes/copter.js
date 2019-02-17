Crafty.scene('Copter', function() {
	let copterVelocity = 2;
	let truckVelocity = 2;
	let gravity = 50

	/*
	* C O M P O N E N T S
	*/
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
			},
			'KeyDown': function (e) {
				switch(e.key) {
					case Crafty.keys.SPACE:
						this.detach(stuntman)
						stuntman.ay = gravity
						break
					case Crafty.keys.A:
						this.vx = 100 * -copterVelocity
						break
					case Crafty.keys.D:
						this.vx = 100 * copterVelocity
						break
					case Crafty.keys.S:
						this.vx = 0
						break
				}
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
			},
			'KeyDown': function (e) {
				switch (e.key) {
					case Crafty.keys.LEFT_ARROW:
						this.vx = 100 * -truckVelocity
						break
					case Crafty.keys.RIGHT_ARROW:
						this.vx = 100 * truckVelocity
						break
				}
			},
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
			},
			'EnterFrame': function() {
				this.vx = (this.vx * 0.99) | 0
			}
		}
	})

	Crafty.c('Cloud', {
		required: 'ViewportTrigger, Color, Motion, Canvas, Collision',
		init: function() {
			this.checkHits('Stuntman')
			this.color('#eeeeee')
		},
		events: {
			'HitOn': function([first], ...data) {
				if (first.obj.has('Stuntman')) {
					let man = first.obj
					man.vx = -this.vx
				}
			},
			'ViewportLeaveX': function(e) {
				console.log('cloud leave ', e)
				if (!~e) this.ox = Crafty.viewport._width
				if (~e) this.ox = 1
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
				stuntman.vx = 0
				stuntman.ax = 0
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
			loadLevel(this.score)
			this.reset();
		})

		R.reset()

		loadLevel = function(index) {
			let cloud_1 = Crafty('Cloud').get(0)
			let cloud_2 = Crafty('Cloud').get(1)
			switch(index) {
				case 1:
					Crafty.e('Cloud, Level')
						.attr({ x: 200, y: 200, w: 100, h: 20 })
					break
				case 2:
					cloud_1.vx = 50
					break
				case 3:
					cloud_1.vx = 100
					break
				case 4:
					cloud_1.vx = 150
					break
				case 5:
					cloud_1.vx = 200
					break;
				case 6:
					Crafty.e('Cloud, Level')
						.attr({ X:200, y:300, w:100, h:20 })
					break
				case 7:
					cloud_2.vx = -50
					break
				case 8:
					cloud_2.vx = -100
					break
				case 9:
					cloud_2.vx = -150
					break
				case 10:
					cloud_2.vx = -200
					break
			}
		}
})
