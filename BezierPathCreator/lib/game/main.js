ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

  'game.entities.bezierline',
  'game.entities.bump-pull',
  'game.entities.pointer',
  'game.entities.traveler',
  'game.entities.test',

  'game.levels.bezierboard',

  'game.director.director',

  'plugins.bezierpath.bezierpath'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
  name: "bezier paths",
	
	init: function() {
    ig.input.bind( ig.KEY.UP_ARROW, 'up' );
    ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bind( ig.KEY.D, 'delete' );
		ig.input.bind( ig.KEY.E, 'extend' );
		ig.input.bind( ig.KEY.G, 'generate' );
		ig.input.bind( ig.KEY.H, 'help' );
		ig.input.bind( ig.KEY.P, 'path-toggle' );
		ig.input.bind( ig.KEY.T, 'testTraveler' );
		ig.input.bind( ig.KEY.MOUSE1, 'click' );
    ig.input.initMouse();

    this.myDirector = new ig.Director(this, [LevelBezierboard]);

    this.pointer = this.getEntityByName('pointer');
    this.bezierLine = this.getEntityByName('bezier-line');
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
    if( ig.input.state('generate') ) {
      jAlert(this.bezierLine.generatePathText(), 'Path Nodes');
    }
    if( ig.input.state('help') ) {
      jAlert('Instructions<br><br><div align=LEFT>- Drag red squares (bumps) and green circles (pulls) to create path.<br>- Hover over any bump or pull to see adjacent nodes.<br>- Click \'Copy Path Nodes to Clipboard\' to generate the code snippet.<br>E - elongate path<br>T - test entity on path<br>P - toggle path line<br>D - click mouse and hold on any red square then press \'D\' to delete<br>Up/Down arrows - hover over any pull (green circles) and press up or down key to change the increment (use P to see increment)<br>G - generate path snippet without copying to clipboard<br>H - This help box<br></div>','Bezier Path Creator');
    }
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();

    ig.system.context.fillStyle = 'white';

    
    ig.system.context.font = '12px sans-serif';    
    for (i=0; i < this.bezierLine.bumps.length; i++) {
      bump = this.bezierLine.bumps[i];
      ig.system.context.fillText( String.fromCharCode(65+i), bump.textPos().x, bump.textPos().y, ig.Font.ALIGN.CENTER );
    }
	}
});


// Start the Game with 60fps, a resolution of 640x640.
ig.main( '#canvas', MyGame, 60, 640, 640, 1 );


});
