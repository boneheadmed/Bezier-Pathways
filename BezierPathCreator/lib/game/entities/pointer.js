ig.module(
	'game.entities.pointer'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPointer = ig.Entity.extend({

  name: 'pointer',
  nodeType: null,
	
	size: {x:1, y:1},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, // Check Against B - bumps and pulls 
	collides: ig.Entity.COLLIDES.LITE,
	
  
  game: null,
  isClicking: false,
  isMouseButtonDown: false,
  currentlyDragging: null,
  currentlyHovering: null,
  anyHovered: false,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
	},

  update: function(){
    this.pos.x = ig.input.mouse.x;
    this.pos.y = ig.input.mouse.y;

    // Only check for the click once per frame, instead of
    // for each entity it touches in the 'check' function
    this.isMouseButtonDown = ig.input.state('click');
    ig.game.pressedState = this.isMouseButtonDown;

    this.parent();

    //All checks have been done, so see if any entities have been 
    //hovered over. If not turn off hovering.
    if (!this.anyHovered)
      this.hoverOff();
    this.anyHovered = false;

  },

  draw: function(){
    this.parent();
  },

	// This function is called when the pointer overlaps anonther entity of the
	// checkAgainst group. I.e. for this entity, all entities in the B group,
  // which would be the bump and pull nodes.
	check: function( other ) {
    //Make sure the 'other' entity can be dragged.
    if ( typeof(other.drag) == 'function' ) {
      //If currently dragging then check to see if the mouse button
      //has been released.
      if (this.currentlyDragging){
        if ( !this.isMouseButtonDown ){
          //Mouse was released, stop dragging.
          other.drag(false);
          this.currentlyDragging = null;
        }
      }
      //If not currently dragging, then check to see if the mouse
      //button is down.
      else{
        if( this.isMouseButtonDown ) {
          //Mouse is down, so start dragging the 'other' entity.
          other.drag(true);
          this.currentlyDragging = other;
        }
        else{
          //Not currently dragging and mouse button is not down,
          //so check to see if the mouse pointer is hovering.
          //Make sure the 'other' entity can be hovered over.
        }
      }
    }
    if ( typeof(other.hover) == 'function' ) {
      this.anyHovered = true;
      this.hoverOn(other);
    }
	},	

  hoverOn: function(other){
    //Only allow one node to be hovered over at a time.
    if (this.currentlyHovering)
      return;
    else{
      this.currentlyHovering = other;
      if (other.nodeType == 'bump')
        ig.game.bezierLine.bumpHover(other, true);
      else
        ig.game.bezierLine.pullHover(other, true);
    }
  },

  hoverOff: function(){
    if (this.currentlyHovering){
      if (this.currentlyHovering.nodeType == 'bump')
        ig.game.bezierLine.bumpHover(this.currentlyHovering, false);
      else
        ig.game.bezierLine.pullHover(this.currentlyHovering, false);
      this.currentlyHovering = null;
    }
  }

});

});

