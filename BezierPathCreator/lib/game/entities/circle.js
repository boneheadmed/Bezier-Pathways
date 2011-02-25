ig.module(
	'game.entities.circle'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityCircle = ig.Entity.extend({
	
	size: {x:40, y:40},
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
	},

  draw: function() {
        var x = this.pos.x - this.offset.x - ig.game.screen.x;
        var y = this.pos.y - this.offset.y - ig.game.screen.y;

        //draw a circle
        ig.system.context.beginPath();
        ig.system.context.arc(x, y, 10, 0, Math.PI*2, true);
        ig.system.context.closePath();
        ig.system.context.fill();
    }



});

});

