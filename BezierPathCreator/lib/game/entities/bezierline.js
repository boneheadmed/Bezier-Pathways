ig.module(
	'game.entities.bezierline'
)
.requires(
	'impact.entity',
  'plugins.bezierpath.bezierpath'
)
.defines(function(){

EntityBezierline = ig.Entity.extend({

  name: 'bezier-line',

	size: {x:300, y:300},

  STATE: { 
  LINE: 0,
  POINTS: 1,
  OFF: 2
  },

  defaultPath: null,
	
	init: function( initx, inity, settings ) {
		this.parent( initx, inity, settings );
    this.path = [ { bump: {x:50, y:50} }, 
                  { pull1: {x:75, y:100},
                    pull2: {x: 75, y:150},
                    bump: {x:50, y:200},
                    inc: 0.2
                  },
                  { pull1: {x:25, y:250},
                    pull2: {x: 25, y:300},
                    bump: {x:50, y:350},
                    inc: 0.2
                  }
                ];
    this.origin = {x: initx, y: inity};
    this.bumps = [];
    this.pulls = [];
    //The last bump array position.
    this.lastBump = 4;
    this.firstUpdate = true;
    this.removalQueue = null;
    this.currentState = this.STATE.LINE;
    this.toggleTimer = new ig.Timer(0.2);
    this.extendTimer = new ig.Timer(1);
    this.testTimer = new ig.Timer(0.5);
    this.testEntity = null;
    this.changeIncrement = null;
    this.initialInc = 0.02;
	},

  createInitialPath: function(){
    //****Using the default path is not yet functional.
    //If a default path has been supplied, then use this as the pathway.
    //Otherwise create a new path.
    if (this.defaultPath){
      this.path = this.defaultPath;
      return;
    }

    //This function creates each initial bump and pull entity.
    //The first 'bump' on the path is special as it is the origin of the path.
    bump = ig.game.spawnEntity( EntityBumpPull, this.origin.x, this.origin.y);
    bump.currentAnim = bump.anims.origin;
    bump.nodeType = 'bump';
    bump.origin = true;
    this.bumps.push(bump);

    //The spacing of bumps and pulls along the x axis.
    var xspacing = 100;
    for (i=0; i < this.lastBump; i++) {
      pull = ig.game.spawnEntity( EntityBumpPull, this.origin.x + 25 + (i*xspacing), this.origin.y - 50);
      pull.nodeType = 'pull';
      pull.currentAnim = pull.anims.pull;
      pull.inc = this.initialInc;
      this.pulls.push(pull);
      pull = ig.game.spawnEntity( EntityBumpPull, this.origin.x + 25 + (i*xspacing) + 50, this.origin.y - 50);
      pull.nodeType = 'pull';
      pull.currentAnim = pull.anims.pull;
      this.pulls.push(pull);
      bump = ig.game.spawnEntity( EntityBumpPull, this.origin.x + 25 + (i*xspacing) + 75, this.origin.y);
      bump.nodeType = 'bump';
      this.bumps.push(bump);
    }

  },

  createPath: function(){
    //Get the current position of each bump and pull and use that to create the hash
    //of bump and pull positions for the path. All positions are made relative to the path 
    //origin position of 0, 0.
    //Each bumpPull Group consists of 2 pulls, the following bump and the t increment.
    
    //Erase the previous path.
    this.path = [];

    //Update the this entity's (the bezier path) origin to that of
    //the first bump's screen coordinates.
    this.origin = this.bumps[0].center();

    //This is the relative origin of the path.
    this.path.push( { bump: {x:0, y:0} } ); 

    //Add each succesive 2 pulls, 1 bump and associated t increment.
    for (i=0; i < this.lastBump; i++) {
      this.path.push( this.createBumpPullGroup(i) );
    }
  },

  createBumpPullGroup: function(i){
    //Each bumpPull Group consists of 2 pulls, the following bump and the 
    //t increment. i indicates the position within the bump or pull array
    //of entities.
    bumpPullGroup =   { pull1: {x: this.pulls[i*2].center().x - this.origin.x, 
                                y: this.pulls[i*2].center().y - this.origin.y},
                        pull2: {x: this.pulls[(i*2)+1].center().x - this.origin.x, 
                                y: this.pulls[(i*2)+1].center().y - this.origin.y},
                        bump:  {x: this.bumps[i+1].center().x - this.origin.x, 
                                y: this.bumps[i+1].center().y - this.origin.y},
                        inc: this.pulls[i*2].inc
                     }
    return bumpPullGroup;
  },

  //...Evaluates a bezier curve for a given t, 
  //where t is value from 0-1...
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

  update: function(){
    if ( this.firstUpdate ){
      this.createInitialPath();
      this.createPath();
      this.zIndex = 500;
      ig.game.sortEntities();
      this.firstUpdate = false;
    }
    if( ig.input.state('extend') ) 
      this.extendPath();
    if (this.changeIncrement)
      this.updateIncrement();
    this.createPath();
    if( ig.input.state('path-toggle') ) {
      if (this.toggleTimer.delta() >= 0){
        this.toggleTimer.reset();
        this.currentState++;
        if (this.currentState > this.STATE.OFF) {
          this.currentState = this.STATE.LINE;
        }
      }
    }
    if( ig.input.state('testTraveler') ){
      if (this.testTimer.delta() >= 0){
        this.testTimer.reset();
        this.testEntity = ig.game.spawnEntity( EntityTraveler, this.origin.x , this.origin.y);

      }
    }
    if (this.testEntity){
      this.testEntity.updatePath(this.path);
    }

		this.parent();
    if (this.removalQueue)
      this.remove(this.removalQueue);
  },

  draw: function() {
        if (this.currentState == this.STATE.OFF){
          return false;
        }        
        var x = this.origin.x - this.offset.x - ig.game.screen.x;
        var y = this.origin.y - this.offset.y - ig.game.screen.y;
  
        old = this.path[0].bump;
        ig.system.context.beginPath();
        ig.system.context.moveTo(x + old.x, y + old.y);

        for (i=0; i < this.path.length - 1; i++) {
          p1 = this.path[i].bump;
          //alert(p1.x + ' ' + p1.y);
          p2 = this.path[i+1].pull1;
          //alert(p2.x + ' ' + p2.y);
          p3 = this.path[i+1].pull2;
          //alert(p3.x + ' ' + p3.y);
          p4 = this.path[i+1].bump;
          //alert(p4.x + ' ' + p4.y);
          inc = this.path[i+1].inc;

          for (t=0; t <=1; t += inc){
            result = this.bezier(p1, p2, p3, p4, t);
            //alert(result.x);
            //If this.currenState == POINTS then only draw a dot (small square)
            //at each point along the path,
            //otherwise draw a continuous line connecting all points.
            if (this.currentState == this.STATE.POINTS){
              ig.system.context.fillStyle = "white"; 
              ig.system.context.fillRect(x + result.x, y + result.y, 1.5, 1.5);
            }
            else{
              ig.system.context.lineTo(x + result.x, y + result.y); 
            }
          }
        }
        ig.system.context.strokeStyle = "#eee";
        ig.system.context.stroke();
        
  },
  /*
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
                */
  generatePathText: function(){
    var pathText = "pathNodes = [ { bump: {x: " + this.path[0].bump.x + ", y: " + this.path[0].bump.y + "} }";
    for (i=1; i <= this.path.length - 1; i ++){
      pull1 = this.path[i].pull1;
      pull2 = this.path[i].pull2;
      bump = this.path[i].bump;
      inc = this.path[i].inc;
      pathText = pathText + ", { pull1: {x: " + pull1.x + ", y: " + pull1.y + "}";
      pathText = pathText + ", pull2: {x: " + pull2.x + ", y: " + pull2.y + "}";
      pathText = pathText + ", bump: {x: " + bump.x + ", y: " + bump.y + "}";
      pathText = pathText + ", inc: " + inc + " }"; 

    }
    pathText = pathText + " ];";
    return pathText;
  },

  extendPath: function(){
    if (this.extendTimer.delta() < 0)
      return false;
    this.extendTimer.reset();
    //Get the current last bump.
    oldLastBump = this.bumps[this.lastBump];
    this.lastBump += 1;
    //Create the new final bump at last bump x position + 100. If this is 
    //going to be beyond the width of the canvas then use canvas width
    //minus 10 for the position.
    newBumpX = oldLastBump.pos.x + 100;
    if (newBumpX > ig.system.width - 10)
      newBumpX = ig.system.width - 10;
    bump = ig.game.spawnEntity( EntityBumpPull, newBumpX, oldLastBump.pos.y);
    bump.nodeType = 'bump';
    this.bumps.push(bump);
    //Create the 2 new pulls with x positions between the new an old bumps
    //at 25% and 75% distance between the two.
    newPullX1 = oldLastBump.pos.x + ((newBumpX - oldLastBump.pos.x)*0.25);
    newPullX2 = oldLastBump.pos.x + ((newBumpX - oldLastBump.pos.x)*0.75);
    //Create the new pull Y position to be above the new bump position
    //by 50, unless this is off of the canvas.
    newPullY = oldLastBump.pos.y - 50;
    if (newPullY < -10)
      newPullY = -10;
    pull = ig.game.spawnEntity( EntityBumpPull, newPullX1, newPullY);
    pull.nodeType = 'pull';
    pull.currentAnim = pull.anims.pull;
    pull.inc = this.initialInc;
    this.pulls.push(pull);
    pull = ig.game.spawnEntity( EntityBumpPull, newPullX2, newPullY);
    pull.nodeType = 'pull';
    pull.currentAnim = pull.anims.pull;
    this.pulls.push(pull);
  },

  remove: function(bump){
    //Identify which bump is affected.
    bumpNum = -1;
    for (i=0; i <= this.lastBump; i++) {
      if (this.bumps[i] == bump){
        bumpNum = i;
        break;
      }
    }
    //If bump not found then return.
    if (bumpNum == -1)
      return false;
    //Identify the affected pulls, which will be the two that precede 
    //the bump.
    pull1 = this.pulls[bumpNum*2-1];
    pull2 = this.pulls[bumpNum*2-2];
    //Erase and kill the selected bump and the 2 preceding pulls.
    this.bumps.erase(bump);
    this.pulls.erase(pull1);
    this.pulls.erase(pull2);
    bump.kill();
    pull1.kill();
    pull2.kill();
    //Establish a new last bump.
    this.lastBump -=1
  },
    
  bumpHover: function(other, hovering){
    //Identify which bump is affected.
    lastBump = this.bumps.length - 1;
    lastPull = lastBump * 2 - 1;
    bumpNum = -1;
    for (i=0; i <= lastBump; i++) {
      if (this.bumps[i] == other){
        bumpNum = i;
        break;
      }
    }
    //If bump not found then return.
    if (bumpNum == -1)
      return false;
    //Find out which nodes are affected. Will be the bump that was
    //selected as well as the pull that immediately precedes and
    //immediately proceeds the bump.
    var affectedNodes = [];
    affectedNodes.push(other);
    pullNum = bumpNum * 2;
    if (pullNum <= lastPull)
      affectedNodes.push(this.pulls[pullNum]);
    pullNum -=1;
    if (pullNum >= 0)
      affectedNodes.push(this.pulls[pullNum]);
    this.setHover(affectedNodes, hovering);
  },

  identifyPull: function(other){
    //Identify which pull is affected.
    lastBump = this.bumps.length - 1;
    lastPull = lastBump * 2 - 1;
    var pullNum = -1;
    for (i=0; i <= lastPull; i++) {
      if (this.pulls[i] == other){
        pullNum = i;
        break;
      }
    }
    return pullNum;
  },

  pullHover: function(other, hovering){
    pullNum = this.identifyPull(other);
    //If pull not found then return.
    if (pullNum == -1)
      return false;
    //Find out which nodes are affected. Will be the pull that was
    //selected as well as the bumps that immediately precede and
    //immediately proceed the pull. Additionally the other pull 
    //between the two selected bumps will be affected.
    var affectedNodes = [];
    var precedingBump = pullNum/2;
    affectedNodes.push(other);
    //if the pullNum is odd then also select the preceding, 
    //otherwise select the next pull. The preceding bump is another
    //0.5 less than pullNum/2 in that case.
    if (pullNum % 2){
      affectedNodes.push(this.pulls[pullNum-1]);
      precedingBump -= 0.5;
    }
    else
      affectedNodes.push(this.pulls[pullNum+1]);
    affectedNodes.push(this.bumps[precedingBump]);
    affectedNodes.push(this.bumps[precedingBump+1]);
    this.setHover(affectedNodes, hovering);
  },

  setHover: function(affectedNodes, hovering){
    //Turn on or off hovering for each affected node depending on 
    //hovering being true or false.
    for (i=0; i < affectedNodes.length; i++) {
      affectedNodes[i].hover(hovering);
    }
  },

  updateIncrement: function(){
    incChange = 0.001;
    pullNum =  this.identifyPull(this.changeIncrement.pull);
    if (pullNum%2)
      pullNum -= 1;
    //alert ("Pull is " + pullNum);
    changePull = this.pulls[pullNum];
    if (this.changeIncrement.direction == 'down')
      incChange = incChange * -1;
    changePull.inc += incChange;
    if (changePull.inc > 0.999)
      changePull.inc = 0.999;
    if (changePull.inc < 0.001)
      changePull.inc = 0.001;
/*
    //alert("Pull #: " + Math.floor(pullNum/2));
    //Identify position in path array.
    pathPos = Math.floor(pullNum/2) + 1;
    if (this.changeIncrement.direction == 'down')
      incChange = incChange * -1;
    alert(this.path[pathPos].inc);
    this.path[pathPos].inc += 0.05;
    if (this.path[pathPos].inc > 0.999)
      this.path[pathPos].inc = 0.999;
    if (this.path[pathPos].inc < 0.001)
      this.path[pathPos].inc = 0.001;
    this.inc = new Number(this.path[pathPos].inc);
*/
    this.changeIncrement = false;
  }


});

});


        //Triangle Sample
/*
        //draw lines 
        ig.system.context.beginPath();
        ig.system.context.moveTo(x +75, y + 50);
        ig.system.context.lineTo(x + 100, y + 75);
        ig.system.context.lineTo(x + 100, y + 25);
        ig.system.context.closePath();
        ig.system.context.stroke();
*/

