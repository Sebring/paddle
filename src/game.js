const G = {
	currScene: 0,
	width: 800,
	height: 500,
	scenes: ['start'],
	start: function () {
		Crafty.init(this.width, this.height)
		Crafty.background('thistle')
		Crafty.scene(this.scenes[0])
	}
}