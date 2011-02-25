ig.module(
	'game.entities.bump-pull'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBumpPull = ig.Entity.extend({
	
	size: {x:20, y:20},

	type: ig.Entity.TYPE.B, // This entity can collide with the pointer entity. 
  collides: ig.Entity.COLLIDES.PASSIVE,
	
  animSheet: new ig.AnimationSheet( 'media/bump-pull2.png', 20, 20),	

  isBeingDragged: false,
  isHoveredOver: false,
  nodeType: null,
  inc: null,
  origin: false,

	init: function( x, y, settings ) {

		this.parent( x, y, settings );
	  this.addAnim( 'bump', 1, [1] );
	  this.addAnim( 'origin', 1, [0] );
	  this.addAnim( 'pull', 1, [2] );
	  this.addAnim( 'bumpHover', 1, [4] );
	  this.addAnim( 'originHover', 1, [3] );
	  this.addAnim( 'pullHover', 1, [5] );
    this.vel.x = 0;
    this.vel.y = 0;	
    this.incTimer = new ig.Timer(0.1);
	},

  center: function(){
    //Return the screen coordinates of this entity's center
    return { x: this.pos.x + (this.size.x / 2), y: this.pos.y + (this.size.y / 2) }
  },

  textPos: function(){
    return { x: this.pos.x + 1, y: this.pos.y + 18}
  },

  drag: function(dragState) {
    this.isBeingDragged = dragState;
  },

  hover: function(hoverState) {
    this.isHoveredOver = hoverState;
    switch(this.nodeType){
        case 'pull':
          (hoverState) ? this.currentAnim = this.anims.pullHover 
            : this.currentAnim = this.anims.pull;          
        break;
        case 'bump':
          if (this.origin)
            (hoverState) ? this.currentAnim = this.anims.originHover 
              : this.currentAnim = this.anims.origin;          
          else
            (hoverState) ? this.currentAnim = this.anims.bumpHover 
              : this.currentAnim = this.anims.bump;          
        break;
    }
  },

  update: function(){
    if (this.isBeingDragged){
      //Use the mouse current mouse position and subtract half of
      //the height and width of the entity's size so that the pointer
      //ends up pointing to the middle of the entity.
      this.pos.x = ig.game.pointer.pos.x - this.size.x/2;

      this.pos.y = ig.game.pointer.pos.y - this.size.y/2;
      //If 'D' is being pressed and this is a bump, then queue it for deletion 
      //so long as it is not the origin, which can't be deleted.
      if( ig.input.state('delete') ) {    
        if (this.nodeType == 'bump'){
          if (!this.origin)
            ig.game.bezierLine.removalQueue = this;
        }
      }
    }

    if (this.isHoveredOver){
      if (this.nodeType == 'pull'){
        if (this.touches(ig.game.pointer)){
          if (this.incTimer.delta() >= 0){
            this.incTimer.reset();
            if( ig.input.state('up') ){ 
              ig.game.bezierLine.changeIncrement = {pull: this, direction: 'up'}; 
            }
            if( ig.input.state('down') ){
              ig.game.bezierLine.changeIncrement = {pull: this, direction: 'down'};
            }
          }
        }
      }
    }

    this.parent();
  }


  
  /*
  clicked: function(from) {
    //alert("got hit");
    this.pos.x = from.pos.x;
    this.pos.y = from.pos.y;
  }
  */

});

});

