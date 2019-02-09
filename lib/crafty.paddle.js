/**
 * Use paddle-like gamepads with craftyjs
 * @source https://github.com/Sebring/paddle
 * @licence MIT https://github.com/Sebring/paddle/blob/master/LICENSE
 * @version 0.0.1
 * @author Johan Sebring
 */

/*
* Control rotations of an entity with a paddle.
*/
Crafty.c('PaddleRotation', {
	required: '2D, Gamepad, AngularMotion',
	paddleRotation(id, relativeRotation, steps, max) {
		this.pId = id
		this.pr_relative = relativeRotation
		this.pr_steps = steps
		this.pr_max = max
		this.gamepad(id)
	},
	events: {
		'GamepadAxisChange': function(e) {
			if (e.axis !== 0)
				return
			if (this.pr_relative) {
				this.vrotation = this.pr_max * Math.floor(e.value * this.pr_steps)
			} else {
				// absolute
				this.rotation = 180 + 180 * e.value
			}
		}
	}
})

/*
 * Gamepad component based on crafty-gamepad by Sven Jabcobs
 * https: //github.com/svenjacobs/crafty-gamepad
 */
Crafty.c('Gamepad', {
	// set gamepad index
	gamepad: function (gamepadIndex) {
		this._gamepadIndex = gamepadIndex || 0
		this._timestamp = 0
		this._buttonsState = []
		this._axesState = []
		this.bind('EnterFrame', this._gpEnterFrame)
		return this
	},

	_gpEnterFrame: function () {
		const gamepad = this._getGamepad(this._gamepadIndex)
		// Only evaluate buttons/axes when we found a gamepad and there
		// have been changes according to timestamp.
		if (gamepad && gamepad.timestamp !== this._timestamp) {
			this._timestamp = gamepad.timestamp
			this._emitGamepadEvents(gamepad)
		}
	},
	_emitGamepadEvents: function (gamepad) {
		for (let i = 0, N = gamepad.buttons.length; i < N; i++) {
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
		for (let j = 0, N = gamepad.axes.length; j < N; j++) {
			if ((this._axesState[j] !== undefined && this._axesState[j] !== gamepad.axes[j]) ||
				(this._axesState[j] === undefined && gamepad.axes[j] !== 0.0)) {

				this.trigger('GamepadAxisChange', {
					axis: j,
					value: gamepad.axes[j]
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