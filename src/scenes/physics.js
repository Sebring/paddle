Crafty.scene('Physics', function() {

	// init matter
	Crafty.Matter.init({
		debug: true,
		gravity: {
			x: 0,
			y: 0.5
		}
	});

	Crafty.c('MatterRectangle', {
		required: '2D, Canvas, Matter'
	})

	let Ragdoll = function(x=100, y=100, scale=1, options={}) {

		let Body = Matter.Body,
			Bodies = Matter.Bodies,
			Constraint = Matter.Constraint,
			Composite = Matter.Composite,
			Common = Matter.Common;

		let headOptions = Common.extend({
			label: 'head',
			collisionFilter: {
				group: Body.nextGroup(true)
			},
			chamfer: {
				radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
			},
			render: {
				fillStyle: '#FFBC42'
			}
		}, options);

		let chestOptions = Common.extend({
			label: 'chest',
			collisionFilter: {
				group: Body.nextGroup(true)
			},
			chamfer: {
				radius: [20 * scale, 20 * scale, 26 * scale, 26 * scale]
			},
			render: {
				fillStyle: '#E0A423'
			}
		}, options);

		let leftArmOptions = Common.extend({
			label: 'left-arm',
			collisionFilter: {
				group: Body.nextGroup(true)
			},
			chamfer: {
				radius: 10 * scale
			},
			render: {
				fillStyle: '#FFBC42'
			}
		}, options);

		let leftLowerArmOptions = Common.extend({}, leftArmOptions, {
			render: {
				fillStyle: '#E59B12'
			}
		});

		let rightArmOptions = Common.extend({
			label: 'right-arm',
			collisionFilter: {
				group: Body.nextGroup(true)
			},
			chamfer: {
				radius: 10 * scale
			},
			render: {
				fillStyle: '#FFBC42'
			}
		}, options);

		let rightLowerArmOptions = Common.extend({}, rightArmOptions, {
			render: {
				fillStyle: '#E59B12'
			}
		});

		let leftLegOptions = Common.extend({
			label: 'left-leg',
			collisionFilter: {
				group: Body.nextGroup(true)
			},
			chamfer: {
				radius: 10 * scale
			},
			render: {
				fillStyle: '#FFBC42'
			}
		}, options);

		let leftLowerLegOptions = Common.extend({}, leftLegOptions, {
			render: {
				fillStyle: '#E59B12'
			}
		});

		let rightLegOptions = Common.extend({
			label: 'right-leg',
			collisionFilter: {
				group: Body.nextGroup(true)
			},
			chamfer: {
				radius: 10 * scale
			},
			render: {
				fillStyle: '#FFBC42'
			}
		}, options);

		let rightLowerLegOptions = Common.extend({}, rightLegOptions, {
			render: {
				fillStyle: '#E59B12'
			}
		});

		let head = Crafty.e('MatterRectangle')
			.attr({ x, y:y-60*scale, w:34*scale, h:40*scale })
			.matter(headOptions)
		let chest = Crafty.e('MatterRectangle')
			.attr({x, y, w:55*scale, h:80*scale})
			.matter(chestOptions)
		let rightUpperArm = Crafty.e('MatterRectangle')
			.attr({x:x+39*scale, y:y-15*scale, w:20*scale, h:40*scale})
			.matter(rightArmOptions)
		let rightLowerArm = Crafty.e('MatterRectangle')
			.attr({x:x+39*scale, y:y+25*scale, w:20*scale, h:60*scale})



		var headContraint = Constraint.create({
			bodyA: head._body,
			bodyB: chest._body,
			pointA: {
				x: 0,
				y: 25 * scale
			},
			pointB: {
				x: 0,
				y: -35 * scale
			},
			stiffness: 0.6,
			render: {
				visible: false
			}
		})
		var upperToLowerRightArm = Constraint.create({
			bodyA: rightUpperArm._body,
			bodyB: rightLowerArm._body,
			pointA: {
				x: 0,
				y: 15 * scale
			},
			pointB: {
				x: 0,
				y: -25 * scale
			},
			stiffness: 0.6,
			render: {
				visible: false
			}
		});
	}

	Ragdoll()



/*
																							var head = Bodies.rectangle(x, y - 60 * scale, 34 * scale, 40 * scale, headOptions);var chest = Bodies.rectangle(x, y, 55 * scale, 80 * scale, chestOptions);var rightUpperArm = Bodies.rectangle(x + 39 * scale, y - 15 * scale, 20 * scale, 40 * scale, rightArmOptions);var rightLowerArm = Bodies.rectangle(x + 39 * scale, y + 25 * scale, 20 * scale, 60 * scale, rightLowerArmOptions);
	var leftUpperArm = Bodies.rectangle(x - 39 * scale, y - 15 * scale, 20 * scale, 40 * scale, leftArmOptions);
	var leftLowerArm = Bodies.rectangle(x - 39 * scale, y + 25 * scale, 20 * scale, 60 * scale, leftLowerArmOptions);
	var leftUpperLeg = Bodies.rectangle(x - 20 * scale, y + 57 * scale, 20 * scale, 40 * scale, leftLegOptions);
	var leftLowerLeg = Bodies.rectangle(x - 20 * scale, y + 97 * scale, 20 * scale, 60 * scale, leftLowerLegOptions);
	var rightUpperLeg = Bodies.rectangle(x + 20 * scale, y + 57 * scale, 20 * scale, 40 * scale, rightLegOptions);
	var rightLowerLeg = Bodies.rectangle(x + 20 * scale, y + 97 * scale, 20 * scale, 60 * scale, rightLowerLegOptions);
*/





/*

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
/*

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
		*/
})