ig.module( 
	'game.entities.traveler' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTraveler = ig.Entity.extend({

  size: {x:50, y:50},
	type: ig.Entity.TYPE.NONE, 
  collides: ig.Entity.COLLIDES.PASSIVE,

  animSheet: new ig.AnimationSheet( 'media/smiley-traveler.png', 50, 50 ),

  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    this.addAnim( 'idle', 1, [0] );
    this.origin = {x: x, y: y};
    this.bezPath = new ig.Bezierpath(null, {cycle: 1, oscillate: false});
  },

  updatePath: function(pathNodes){
    this.bezPath.pathNodes = pathNodes;
  },

  update: function(){
    newPos = this.bezPath.nextPos();
    this.pos.x = this.origin.x + newPos.x;
    this.pos.y = this.origin.y + newPos.y;
    if (this.bezPath.pathCompleted)
      this.kill();
    this.parent();
  },

  kill: function(){
    this.parent();
  }

});
});
