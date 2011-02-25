ig.module( 
	'plugins.bezierpath.bezierpath' 
)
.requires(
	'impact.impact'
)
.defines(function(){

ig.Bezierpath = ig.Class.extend({

  DIRECTION: { 
  FORWARD: 0,
  BACKWARD: 1,
  },

  //The current direction of movement along the path.
  direction: 0,

  //The current 'bump' position of the entity.
  bumpNum: 0,

  //The current position between bumps - 't'.
  segmentPos: 0,

  //Motion will be paused if true.
  paused: false,

  //Determines the number of times the entity should follow the path,
  //i.e. this.cycle = 5 will cause the entity to follow the path 5 times.
  cycle: 1,

  //Entity will continiously loop if set to true. (cycle will be ignored).
  loop: false,

  //Entity will move back and forth from the begining to the end of the path
  //if this is set to true.
  oscillate: false,

  //Set to true when entity has reached the end of its course.
  pathCompleted: false,

  //The coordinates of all nodes on the path.
  pathNodes: null,

  init: function(pathNodes, settings) {
    /*
     * Path needs to be in the format:
         pathNodes = [ { bump: {x:0, y:0} }, 
                  { pull1: {x:75, y:100},
                    pull2: {x: 75, y:150},
                    bump: {x:50, y:200},
                    inc: 0.2
                  },
                  { pull1: {x:25, y:250},
                    pull2: {x: 25, y:300},
                    bump: {x:50, y:350},
                    inc: 0.2
                  },
                  etc.
                ];
      * (Note: position 0 of the pathNodes array should contain only the bump and no pull or inc values.)
    */
    this.pathNodes = pathNodes;
		ig.merge( this, settings );
    //Holds the last performed bezier calculation.
    this.lastResult = {x: 0, y:0};
  },

  //Evaluates a bezier curve for a given t, 
  //where t is value from 0-1.
  bezier: function(p1, p2, p3, p4, t){
    var result = {x: 0, y:0};
    result.x = (1-t) * (1-t) * (1-t) * p1.x +
               3 * t * (1-t) * (1-t) * p2.x +
               3 * t * t * (1-t) * p3.x +
               t * t * t * p4.x;
    result.y = (1-t) * (1-t) * (1-t) * p1.y +
               3 * t * (1-t) * (1-t) * p2.y +
               3 * t * t * (1-t) * p3.y +
               t * t * t * p4.y;
    return result;
  },

  restart: function(settings){
    if (this.DIRECTION.BACKWARD){
      this.bumpNum = this.pathNodes.length - 2;
      if (this.bumpNum < 0)
        this.bumpNum = 0;
      this.segmentPos = 1;
    }
    else{
      this.bumpNum = 0;
      this.segmentPos = 0;
    }
    this.pathCompleted = false;
		ig.merge( this, settings );
  },

  nextPos: function(){
    if ((this.paused) || (this.pathCompleted))
      return this.lastResult;
    p1 = this.pathNodes[this.bumpNum].bump;
    p2 = this.pathNodes[this.bumpNum+1].pull1;
    p3 = this.pathNodes[this.bumpNum+1].pull2;
    p4 = this.pathNodes[this.bumpNum+1].bump;

    result = this.bezier(p1, p2, p3, p4, this.segmentPos);

    //Use the system tick * 100 to adjust for the frame rate. 
    //Therefore the velocity will always be similar at any given point
    //along the path when replayed despite any change in frame rate.
    inc = this.pathNodes[this.bumpNum+1].inc * ig.system.tick * 100;

    if (this.direction == this.DIRECTION.BACKWARD){
     this.segmentPos -= inc;
      if (!(this.segmentPos >= 0.001)){
        this.segmentPos = 1;
        this.bumpNum -= 1;
        if (this.bumpNum < 0)
          this.pathEnd();
      }
    }
    else{
      this.segmentPos += inc;
      if (!(this.segmentPos <= 0.999)){
        this.segmentPos = 0;
        this.bumpNum += 1;
        if (this.bumpNum > this.pathNodes.length - 2)
          this.pathEnd();
      }
    }
    this.lastResult = result;
    return result;
  },

  pathEnd: function(){
  //This function is called when the entity reaches either end of the pathway
  //(the begining position or the last position).
    if (!this.loop){
      this.cycle -= 1;
      if (this.cycle <= 0 )
        return(this.pathCompleted = true); 
    }
    if ((this.loop) || (this.cycle > 0)){
      if (this.oscillate){
          if (this.direction == this.DIRECTION.FORWARD){
            this.direction = this.DIRECTION.BACKWARD;
            this.bumpNum -= 1;
            this.segmentPos = 1;
          }
          else{
            this.direction = this.DIRECTION.FORWARD;
            this.bumpNum += 1;
            this.segmentPos = 0;
          }
      }
      else{
        if (this.bumpNum < 0)  //Reached the begining of the path, so go to the last position.
          this.bumpNum = this.pathNodes.length - 2;
        else                   //Reached the last position on the path, so go to begining.
          this.bumpNum = 0;
      }
      if (this.bumpNum < 0)
        this.bumpNum = 0;
    }
  }

});

});


