/*
 * Paddle component
 * see: https: //developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 *
 * Note:
 * Will sort the gamepads on number of buttons,
 * this is to ensure the gamepad index will always
 * be the same for each paddle.
 */
let _gamepads = [];
Crafty.c('Gamepad', {
	init: function () {
		window.addEventListener("gamepadconnected", function (e) {
			let gamepads = navigator.getGamepads()

			// FIXME: not an array in chrome
			// sort gamepads on button count (as index will vary from time to time)
			gamepads.sort((a, b) => b.buttons.length - a.buttons.length)
			_gamepads = gamepads
		})
	},
	gamepad: function(gamepadIndex) {
		this._gamepadIndex = gamepadIndex || 0
		this._timestamp = 0
		this._buttonsState = []
		this._axesState = []
		this.bind('EnterFrame', this._enterFrame)
		return this
	},

	_enterFrame: function() {
		const gamepad = _gamepads[this._gamepadIndex]
		if (!gamepad)
			return
		if (gamepad.timestamp !== this._timestamp) {
			this._timestamp = gamepad.timestamp
			this._triggerEvents(gamepad)
		}
	},
	_triggerEvents: function(gamepad) {
		for (let i=0, N=gamepad.buttons.length; i<N; i++) {
			if ((this._buttonsState[i] !== undefined && this._buttonsState[i] !== gamepad.buttons[i].value) ||
				(this._buttonsState[i] === undefined && gamepad.buttons[i].value !== 0.0)) {

				this.trigger('GamepadKeyChange', {
					button: i,
					value: gamepad.buttons[i].value,
					pressed: gamepad.buttons[i].pressed
				})
			}
			this._buttonsState[i] = gamepad.buttons[i].value
		}
		for (let i=0, N=gamepad.axes.length; i<N; i++) {
			if ((this._axesState[i] !== undefined && this._axesState[i] !== gamepad.axes[i]) ||
				(this._axesState[i] === undefined && gamepad.axes[i] !== 0.0)) {

				this.trigger('GamepadAxisChange', {
					axis: i,
					value: gamepad.axes[i]
				})
			}
		}
	},
	_getGamepad: function () {
		let gamepad = navigator.getGamepads || navigator.webkitGetGamepads
		if (gamepad) {
			gamepad = gamepad.apply(navigator)[this._gamepadIndex]
		}
		return gamepad
	}
})

/**
 * Use paddle-like gamepads with craftyjs
 * @source https://github.com/Sebring/paddle
 * @licence MIT https://github.com/Sebring/paddle/blob/master/LICENSE
 * @version 0.0.1
 * @author Johan Sebring
 */

Crafty.c('PaddleButton', {
	required: 'Gamepad',
	paddleButton(id) {
		this.gamepad(id)
		return this
	},
	events: {
		'GamepadKeyChange': function(e) {
			// console.log(e)
			if (e.button === 0) {
				this.trigger('PaddleButton_A', {pressed: e.pressed})
			}
			if (e.button === 1) {
				this.trigger('PaddleButton_B', {pressed: e.pressed})
			}
		}
	}
})

/*
* Control rotations of an entity with a paddle.
*/
Crafty.c('PaddleRotation', {
	required: '2D, Gamepad, AngularMotion',
	paddleRotation(id = 0, relativeRotation = true, steps = 5, max = 50) {
		this.pr_relative = relativeRotation
		this.pr_steps = steps
		this.pr_max = max
		if (id !== -1)
			this.gamepad(id)
		return this
	},
	events: {
		'GamepadAxisChange': function(e) {
			if (e.axis !== 0)
				return
			if (this.pr_relative) {
				this.vrotation = this.pr_max * Math.floor(-e.value * this.pr_steps)
			} else {
				// absolute
				this.rotation = 180 + 180 * -e.value
			}
		}
	}
})

/**
 * Add thrust like behaviour.
 */
Crafty.c('Thrust', {
	required: 'Motion, PaddleRotation, PaddleButton',
	init: function() {
		this.gravityX = 0
		this.gravityY = 0
	},
	thrust(id = 0, power = 100) {
		this.thrust = false
		this.thrustPower = power
		this.paddleButton(id)
		this.paddleRotation(id)
		return this
	},
	thrustGravity(gx, gy) {
		this.gravityX = gx
		this.gravityY = gy
		return this
	},
	events: {
		'PaddleButton_B': function (e) {
			this.thrust = e.pressed
			this.trigger('ThrustChanged', e.pressed)
		},
		'UpdateFrame': function () {
			if (this.thrust) {
				const p = Crafty.math.degToRad(this.rotation)
				const px = Math.sin(p)*-1
				const py = Math.cos(p)
				this.ax = this.thrustPower * px
				this.ay = this.thrustPower * py
			} else {
				this.ax = this.gravityX;
				this.ay = this.gravityY;
			}
		}
	}
})


