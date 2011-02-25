ig.module( 
	'game.entities.test' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTest = ig.Entity.extend({

  size: {x:50, y:50},
	type: ig.Entity.TYPE.NONE, 
  collides: ig.Entity.COLLIDES.PASSIVE,

  animSheet: new ig.AnimationSheet( 'media/smiley-traveler.png', 50, 50 ),

  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    this.addAnim( 'idle', 1, [0] );
    this.origin = {x: x, y: y};
    pathNodes = [ { bump: {x: 0, y: 0} }, { pull1: {x: 5, y: 134}, pull2: {x: 17, y: 272}, bump: {x: 85, y: 350}, inc: 0.02 }, { pull1: {x: 194, y: 491}, pull2: {x: 281, y: 478}, bump: {x: 253, y: 215}, inc: 0.02 }, { pull1: {x: 230, y: 118}, pull2: {x: 150, y: 101}, bump: {x: 89, y: 187}, inc: 0.02 }, { pull1: {x: 44, y: 267}, pull2: {x: 138, y: 321}, bump: {x: 209, y: 304}, inc: 0.02 }, { pull1: {x: 422, y: 276}, pull2: {x: 436, y: 350}, bump: {x: 599, y: 272}, inc: 0.02 } ];
    this.bezPath = new ig.Bezierpath(pathNodes, {cycle: 1, oscillate: false});
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
