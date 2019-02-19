Crafty.c('WorldWrap', {
	required: '2D, Motion',
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

Crafty.c('Grid', {
	required: 'Placable, Sizable, 2D, Color, WebGL',
	init: function() {
		this.grid = 10
	},
	grid: function(size) {
		this.grid = size
		return this
	},
	size: function(w, h) {
		this.h = h * this.grid
		this.w = w * this.grid
		return this
	},
	place: function (x, y) {
		if (x >= 0) {
			this.x = x * this.grid
		} else {
			this.x = G.width + x * this.grid
		}
		if (y >= 0) {
			this.y = y * this.grid
		} else {
			this.y = G.height + y * this.grid
		}
		return this
	}
})

Crafty.c('RandomColor', {
	required: 'Color',
	init: function(){
		let r = Crafty.math.randomInt(50, 250)
		let g = Crafty.math.randomInt(50, 250)
		let b = Crafty.math.randomInt(50, 250)
		this.color(r, g, b)
	}
})