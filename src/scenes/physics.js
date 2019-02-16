Crafty.scene('Physics', function() {

	// init matter
	Crafty.Matter.init({
		debug: true,
		gravity: {
			x: 0,
			y: 0.5
		}
	});


	var entity = Crafty.e('2D, DOM, Matter')
		.attr({
			x: 150,
			y: 200,
			w: 100,
			h: 100,
		});
	Matter.Body.setAngularVelocity(entity._body, Crafty.math.degToRad(82));

	Matter.World.add(
		Crafty.Matter.world,
		Matter.Constraint.create({
			pointA: { x: 300, y: 100 },
			bodyB: entity._body
		})
	);
	/*Matter.Constraint.create({pointA: { x: 150, y: 100 },
		bodyB: entity._body,
		pointB: { x: -10, y: -10 }})
*/

	Crafty.e('2D, DOM, Matter')
		.attr({
			x: 100, //Crafty.viewport.width * 0.45,
			y: 400, //Crafty.viewport.height * 0.1,
			w: 500,
			h: 20,
			rotation: 20,
			matter: {
				isStatic: true
			}
		});

	Crafty.e('2D, DOM, Matter')
		.attr({
			x: 250,
			y: 50,
			w: 100,
			h: 100,
			matter: {
				shape: 'circle',
				radius: 50
			}
		});

})