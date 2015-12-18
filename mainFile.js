/*
  Two javascript libraries have been included for your use 
  Please do not use any other external javascript library
  
  Included libraries:
     - jQuery
     - jCanvas

  Documentation / references:
  References: 
     - HTML/CSS/JavaScript
     http://www.w3schools.com/
     https://developer.mozilla.org/en-US/Learn/HTML
     - jQuery
     http://learn.jquery.com/
     http://www.w3schools.com/jquery/default.asp
     
  API:
     - jQuery
     http://api.jquery.com/
     - jCavanas  
     http://projects.calebevans.me/jcanvas/docs/
*/

// Stores the id of the canvas element
this.canvasId = 'drawingCanvas';

// Stores the id of the assignment container
this.divContainerId = 'assignmentContainer'; 

// Stores the id of the input textarea
this.inputTextareaId = 'inputData';

// Stores the id of the input textarea
this.outputTextareaId = 'outputData';

// Gets a reference to the canvas
this.$canvas = $('#' + this.canvasId);

// Sets default spacing to 0
this.spacing = 0;

// Sets a reference to the global scope
var self = this;

// Initializes listeners and resets any values
this.init = function() {
    
   // Clears canvas
   self.clearCanvas();
  
   // Adds a click event listeners to the 'Run' button
   $('.run-button').click(function() {
       // Clears canvas
       self.clearCanvas();
     
       // Runs algorithm
       self.run($(this).attr('mode'));
   });
  
  
  
   // Adds a click event listener to the 'Reset' button
   $('.reset-button').click(function() {
       self.clearCanvas();
       $('#outputData').html('');
   });
  
   // Adds click event listeners to all the 'Example' buttons
   $('.example-button').click(function() {
 	     self.loadExample($(this).attr('number'));
   });
};

// Clears canvas of all rendered elements
this.clearCanvas = function() {
   // Clears the drawing canvas of any preiously rendered elements
   self.$canvas.clearCanvas();
};

// Loads pre-configured examples into the inputs
this.loadExample = function(example) {
    this.clearCanvas();
    this.outputString('');
    
    // Gets a reference to the input textarea
    var $inputTextarea = $('#' + self.inputTextareaId);
  
    // Pre-defined examples
    switch(example) {
        // All examples must follow the same format
        case '1':
          $inputTextarea.val(
              				'1: ' + '\n' + 
              				'2: ' + '\n' + 
              				'3: ' + '\n' + 
              				'4: ' + '\n' + 
              				'5: 1 2' + '\n' + 
              				'6: 3 4' + '\n' + 
              				'7: 5 6' + '\n'
                            );
        break;
        
        case '2':
          $inputTextarea.val(
              				'1: ' + '\n' + 
              				'2: ' + '\n' + 
              				'3: 1 2' + '\n' + 
              				'4: 5 6' + '\n' + 
              				'5: ' + '\n' + 
              				'6: ' + '\n' + 
              				'7: 4 8' + '\n' +
              				'8: ' + '\n' +
                      '9: 3 7' + '\n' +
                      '10: ' + '\n' +
                      '11: 9 10' + '\n'
                            );
        break;
        
        case '3':
          $inputTextarea.val(
              				'1: ' + '\n' + 
              				'2: ' + '\n' + 
              				'3: ' + '\n' + 
              				'4: ' + '\n' + 
              				'5: ' + '\n' + 
              				'6: ' + '\n' + 
              				'7: ' + '\n' +
              				'8: ' + '\n' +
                      '9: 1 2 ' + '\n' +
                      '10: 4 5 ' + '\n' +
                      '11: 6 7 ' + '\n' +
                      '12: 3 9 ' + '\n' +
                      '13: 10 11 ' + '\n' +
                      '14: 12 13 ' + '\n' +
                      '15: 8 14 ' + '\n'
                            );
        break;
        
        default:
          $inputTextarea.val('');
    }
  
};

// Gets the indexOf an object in an array that has a property
Array.prototype.objectIndexOf = function(searchTerm, property) {
    for(var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === searchTerm) return i;
    }
    return -1;
};

// Reads input and returns an array of objects
this.readInputs = function() {
  // Gets a reference to the input textarea
  var $inputTextArea = $('#' + self.inputTextareaId);
  
  // Stores all the lines parsed from the input area
  var lines = $inputTextArea.val().split('\n');
    
  // Stores the dependency list based on the inputs
  var dList = [];
    
  /* Assumes that all input is formatted the same and considered valid */   
  var netArray = new Array();
    
  // Parse input into an object containing the inputs and on-set values
  lines.forEach(function(line, index){ 
      // Parse line into tokens
      var lineContents = line.split(/\s/g);
      
      // Stores the current operation and its dependencies
	    var operationObject = {
      	  label:        null,
          dependencies: new Array()
      };
      
      // This is to check to make sure we do not overwrite a label
      var labelNotSet = true; 
      
      // Iterate through each token to store a dependency relationship
      lineContents.forEach(function(token) {
          // This is our simplistic way of identifying between a label and a dependency	
          if (token.indexOf(':') > 0 && labelNotSet) {
              // Remove the colon character
              var noColonToken = token.replace(':', '');
            
              // To be safe we wil cast it so an integer
              operationObject.label = (noColonToken);//.toInt();
              
              // Set flag indicating a operation label has been set
              labelNotSet = false;
          }
          else if (!isNaN(token) &&  token.length > 0){
              operationObject.dependencies.push((token));//.toInt());
          }
          // Identified a token as not being a number
          else if (token.length > 1){
              throw 'Prasing error.';
          }
      });
      
      // If a label is set then the operation is a valid input
      if (operationObject.label != null) {
         // Push the parsed line onto the dependency list
      	 dList.push(operationObject);
      }
  });
    
  // Checks if the input is parsable
  if (dList.length <= 0) {
      throw 'Parsing error.';
  }
  else {
      return dList;
  }
};

// Creates dependency graph array
this.createDepdencyGraph = function(dList) {
    // Stores the default dependency graph with no constraints
    var dGraph = [];
  	
    // Start initially with all the operations to be looked at
  	var remainingOperations = dList.slice();
  
  	// Stores the operations assigned to a row
    var assignedOperations = new Array();
  
    // Starts the row initially at 0
  	var currentRow = 0;
  
    // Will be used to store the index of any already placed operation
  	var operationIndex = -1;
  
  	// Infinite loop prevention
    var loopCount = 0;
  
    // Iterate through all operations and popping off operations that have been looked at
  	while (remainingOperations.length > 0 && loopCount < 1000) {
        // Checks to see if there is a dependency
        if (remainingOperations[0].dependencies.length <= 0) {
          
          // Pushes the placed operation onto assigned operation tracking array
          assignedOperations.push({
              operationLabel: remainingOperations[0].label,
              row: 0
          });
          
          // Place the operation on the row
          dGraph.push({
              operation: remainingOperations[0],
              row: 0
          });
          
          // Removes the item at the front
      	  remainingOperations.shift();
        }
        else {
          // Starts with the assumption that all dependencies have been placed
          var dependenciesCovered = true;
          var highestDependencyRow = -1;
          
          // For each dependency of the operation check if all the dependencies have been placed
          remainingOperations[0].dependencies.forEach(function(dependency) {

              // Checks if each dependency has been placed
              operationIndex = assignedOperations.objectIndexOf(dependency, 'operationLabel');
            
         			if (operationIndex != -1 && assignedOperations[operationIndex].row > highestDependencyRow) {
                  highestDependencyRow = assignedOperations[operationIndex].row;
              }
            
              // One or more of the dependencies have not been placed
              if (operationIndex == -1) {
									dependenciesCovered = false;
              }
          });
          
          if (dependenciesCovered) {
              if (highestDependencyRow == currentRow) {
                	currentRow++;
              }
            
            	// Place the operation on the row
          		dGraph.push({
               	 	operation: remainingOperations[0],
                	row: currentRow
              });
            
            	// Pushes the placed operation onto assigned operation tracking array
              assignedOperations.push({
                  operationLabel: remainingOperations[0].label,
                  row: currentRow
              });
            
              // Removes the item at the front
           	  remainingOperations.shift();
          }
          // Not all dependencies have been placed
          else {
             // Shifts the object from the front of the list to the back
         		 remainingOperations.push(remainingOperations.shift());
          }
        }
      loopCount++;
    }
  return dGraph;
};

// Prints contents to the output text area
this.outputString = function(string) {
    $('#' + self.outputTextareaId).html(string);
};

// Prints the time cycles
this.printTimeCycles = function(dGraph, additionalText) {

    
    var timeCycles = new Array(dGraph.length);
  	
    // Creates a string with the opreations for each time cycle
  	dGraph.forEach(function(dependencyNode) {
      	if (timeCycles[dependencyNode.row] == null) {
          	timeCycles[dependencyNode.row] = dependencyNode.operation.label + ' ';
        }
      	else {
          	timeCycles[dependencyNode.row] += dependencyNode.operation.label + ' ';
        }
    });
  
    var timeCycleString = '';
   
    // Prepends the Time N: label to each time cycle
    for (var i = 0; i < timeCycles.length; i++) {
      	if (timeCycles[i] != null) {
            timeCycleString +=  'Time ' + (i + 1) + ': ' + timeCycles[i] + '\n';
        }
    }
  
    this.outputString(timeCycleString + additionalText);
};

// Draws the node graph
this.drawNodeGraph = function(dGraph) {
  	/* 
       Stores the number of segments needed for each row
       Allocates the worse case scenario that each node is on its own row
    */
    var rowSegmentCount = new Array(dGraph.length);
  
    // Stores information about the graph sizings
  	var circleSize = 50;
    var horizontalSpacing = 60;
    var rowBasedHorizontalSpacing = 15;
    var verticalSpacing = 80;
    var varticalMarginOffset = 40;
  
    var canvasWidth = this.$canvas.width() - 20;

    // Stores all the positions of the nodes for easy lookup
    var operationLocations = new Array();
  
  	dGraph.forEach(function(operationNode) {
      	if (isNaN(rowSegmentCount[operationNode.row])) {
          	rowSegmentCount[operationNode.row] = 1;
        }
        else {
          	rowSegmentCount[operationNode.row]++;
        }
      
        // Operation node position
      	var xCoord = horizontalSpacing * rowSegmentCount[operationNode.row] + (operationNode.row * rowBasedHorizontalSpacing); 
        var yCoord = verticalSpacing * (operationNode.row + 1) - varticalMarginOffset; 
      

      
        // Stores the location of the drawn operation node
        operationLocations.push({
          	label: operationNode.operation.label,
            x: xCoord,
            y: yCoord
        });
    });
  
    // Since nodes did not exist until after this point lines must be drawn second
    dGraph.forEach(function(operationNode) {
        var operationNodeIndex = operationLocations.objectIndexOf(operationNode.operation.label, 'label');
      
        // Gets the line ends
        var nodePosition = {
          	x: operationLocations[operationNodeIndex].x,
            y: operationLocations[operationNodeIndex].y
        };
       	
        // Draws line to all dependencies
      	operationNode.operation.dependencies.forEach(function(dependency) {
          	// Gets the dependency location information
          	var dependencyIndex = operationLocations.objectIndexOf(dependency, 'label');
          
          	var dependencyPosition = {
              	x: operationLocations[dependencyIndex].x,
            		y: operationLocations[dependencyIndex].y
            };
          
          	self.$canvas.drawLine({
              strokeStyle: '#000',
              strokeWidth: 1,
              x1: nodePosition.x, y1: nodePosition.y,
              x2: dependencyPosition.x, y2: dependencyPosition.y + 25
            });
        });
      
      self.$canvas.drawEllipse({
          fillStyle: '#FBFBFB',
          strokeStyle: '#87ADD2',
          strokeWidth: 2,
          x: nodePosition.x, 
          y: nodePosition.y,
          width: circleSize, 
          height: circleSize
        }).drawText({
          strokeStyle: '#333333',
          strokeWidth: 1,
          x: nodePosition.x, 
          y: nodePosition.y,
          fontSize: 12,
          fontFamily: 'Helvetica, sans-serif',
          text: operationNode.operation.label
        });
    });
   
        
};

/*******************************************************************/
/* If you choose to create more functions please add them here     */

/*******************************************************************/

// Runs your code
this.run = function(mode) {
    // |mode| will store the run mode
    // 0 = resource constraint
    // 1 = time constraint

	  this.clearCanvas();
    this.outputString('');
    
    // Declares an array variable to store wire connections
    var inputs;
  
    try {
        inputs = self.readInputs();
    }
    catch(error) {
        // Failed to parse input
        self.outputString(error);
        return;
    }   
   
    // Stores the resource constraint
  	var numberOfResources = $('#resouceAmount').val();
  
    // Stores the time constraint
  	var alottedTime = $('#timeContraint').val();
  
    /*
    		Stores the operation along with the initial row placement
        |operation| - operation object
             *  Has a dependencies array of all operations it depends on and a label
        |row|       - the row the operation is currently placed on
    */
    
    //debugger;
    var operationList = createDepdencyGraph(inputs);
  
    // Draws the dependency node graph
    //this.drawNodeGraph(operationList);


    /* Place your code here */
    /* Hint: you only need to change the rows for each operation for this assignment. */
    
    
        
    // Stores any additional text that is needed for output
    var additionalText = '';
    
    // Resource Constraint - Hu's Algorithm
    var numResCheckFlag = 1;
    var alapAlgoFeasible = 1;
    var errCondn = 1;
    if( mode == 0 )
    {
       // debugger;
        if( numberOfResources < 1 )
            numResCheckFlag = -1;
        else    
            huAlgorithm( operationList, numberOfResources );
        //debugger;
        
        if( numResCheckFlag == -1 )
        {
            additionalText = '---*** Cannot be scheduled. Less number of resources ***---';
            errCondn = -1;
        }
        else
            this.drawNodeGraph(operationList);
    }
    else if( mode == 1 )    // Time Constraint - List-R Algorithm
    {
        var listRfeasible = 0;
        listRfeasible = list_RAlgorithm( operationList, alottedTime );
        
        if( listRfeasible == -1 )
        {
            additionalText = '---*** Cannot be scheduled. Time is less ***---';
            errCondn = -1;
        }
        else
        {
            //this.drawNodeGraph( operationList );
        }
    }
    
    if( errCondn == -1 )
    {
        for( var i=0; i<operationList.length; i++ )
        {
            operationList[i].row = "";
        }
    }
  
    // Prints the time cycles assuming each row is a time cycle. (this can be changed if needed)
    this.printTimeCycles(operationList, additionalText);
};

// List_R Algorithm
this.list_RAlgorithm = function( operationList, alottedTime )
{
    var time            = 1;
    var numOfResources  = 1;
    var listU           = new Array();
    var timeAlap        = new Array();
    var goAhead         = false;
    var numOfVertex     = operationList.length;
    var numOfVertexScheduled = 0;
    var drawVertexes = new Array();
    
    // 1. Algorithm exist if ALAP detects no feasible solution with dedicated resources
   
    var alapAlgoFeasible = alapAlgorithm( operationList, alottedTime, timeAlap );
    
    if( alapAlgoFeasible == -1 )
    {
        return -1;
    }
    
    
    while( 1 )
    {
        // 3. Determine the candidate operation
        j = 0;
        while( j<numOfVertex )
        {
            
            var lbl = operationList[j].operation.label;
            goAhead = scheduleOperation( lbl, operationList );
            
            if( goAhead  )
            {
                var lbl = operationList[j].operation.label;
                listU.push({ 
                        vertexLabel: lbl, 
                        labelDist:  operationList[j].labelDist,
                        row: operationList[j].row
                });
            }
        
            j++;
        }
    
        //debugger;
        // 2. Find node with slack 0
        var zeroSlackVertex = new Array();
        findNodeWithZeroSlack( listU, timeAlap, time, zeroSlackVertex );
        //listU.splice(0, listU.length );
    
        // 3. a) Schedule the Zero slack operation
        
        var numOfRescrsConsumed = 0;
        if( zeroSlackVertex.length > numOfResources )
            numOfResources = zeroSlackVertex.length;
        
        for( var i=0; i<zeroSlackVertex.length; i++ )
        {
            var lbl = zeroSlackVertex[i].vertexLabel;
            for( var j=0; j<operationList.length; j++ )
            {
                if( lbl == operationList[j].operation.label )
                {
                    operationList[j].row = time-1;
                    operationList[j].scheduled = true;
                    numOfVertexScheduled++;
                    numOfRescrsConsumed++;
                    
                    // animation code
                    drawVertexes.push( operationList[j] );
                    displayOutput( drawVertexes );
                }
            }
        }
        zeroSlackVertex.splice( 0, zeroSlackVertex.length );
        //debugger;
        // 3. b) Schedule the candidate operations requiring no additional resources
        
        listU.sort( function(a, b ){
            return parseInt( b.labelDist ) - parseInt( a.labelDist ) ;
        });
        
        var k = 0;
        
        while( numOfRescrsConsumed < numOfResources && k<listU.length )
        {
            var lblRem = listU[k].vertexLabel;
            var indx = findIndexForVertexLabel( operationList, lblRem );
            operationList[indx].scheduled = true;
            operationList[indx].row = time-1;
            numOfVertexScheduled++;
            numOfRescrsConsumed++;
            k++;
        }
        
        listU.splice( 0, listU.length );
        
        if( numOfVertexScheduled >= numOfVertex )
            break;
        time++;
    }
    
    return 0;
};

this.displayOutput = function( drawVertexes )
{
    setInterval( function(){
                    this.clearCanvas();
                    this.drawNodeGraph( drawVertexes );
                },
        3000
    );
};

// Finding node with 0 slack
this.findNodeWithZeroSlack = function( listU, timeAlap, time, zeroSlackVertex )
{
    var numOfVertex = listU.length;
    var criticalTime = 0;
    var deleteItem = new Array();
    
    for( var i=0; i<numOfVertex; i++ )
    {
        var lbl = listU[i].vertexLabel;
        for( j=0; j<timeAlap.length; j++ )
        {
            if( lbl == timeAlap[j].vertexLabel )
            {
                criticalTime = timeAlap[j].alapTm - time;
                if( criticalTime == 0 )
                {
                    zeroSlackVertex.push({
                        vertexLabel: timeAlap[j].vertexLabel,
                    });
                   // listU.splice( i, 1 );
                }
                break;
            }
        }
    }
    //debugger;
    // deleting the selected operation from listU
    for( var i=0; i<zeroSlackVertex.length; i++ )
    {
        var lbl = zeroSlackVertex[i].vertexLabel
        for( var k=0; k<listU.length; k++ )
        {
            if( lbl == listU[k].vertexLabel )
            {
                listU.splice( k, 1 );
                break;
            }
        }
    }
};


// ALAP Algorithm for latency constraint
this.alapAlgorithm = function( operationList, alottedTime, timeAlap )
{
    
    var sequentialGraph     = operationList.slice();
    var numOfVertex         = operationList.length;
    var listTemp            = new Array();
    var isTimeDeficiency    = false;
    labelVertices( sequentialGraph );

    for( var i=0; i<numOfVertex; i++ )
    {
        var lbl = sequentialGraph[i].operation.label;
        var lblDist = sequentialGraph[i].labelDist;
        
        listTemp.push({
            vertexLabel: lbl,
            labelDist: lblDist
        });
    }
    //debugger;
    listTemp.sort( function(a, b ){
            return parseInt( b.labelDist ) - parseInt( a.labelDist ) ;
    });
        
    var minmTime = parseInt( listTemp[0].labelDist );
    if(  minmTime > alottedTime )
        return -1
        
    
    for( var i=0; i<numOfVertex; i++ )
    {
        var lbl = sequentialGraph[i].operation.label;
        var lblDist = sequentialGraph[i].labelDist;
        var time = alottedTime - lblDist + 1;
        timeAlap.push({
            vertexLabel: lbl,
            alapTm: time
        });
    }
   return 1; 
};

// Hu's Algorithm for Resource constraint
this.huAlgorithm = function( operationList, numberOfResources )
{
    //debugger;
    var sequentialGraph = operationList.slice();
    var time = 0;
    var numOfVertex = operationList.length;
    var i = 0;
    var j = 0;
    var listU = new Array();
    var listS = new Array();
    var goAhead = false;
    var a = numberOfResources;
    var noOfSchOperation = 0;
    // 1. Label the vertices  ( label with distance of vertices to sink node )
   // debugger;
    labelVertices( sequentialGraph );
    
    
    // 2. Initiate scheduled time
    
    time = time;
    
    // 3. Loop for scheduling operations
   // debugger;
    while( 1 )
    {
        // a) Select Unscheduled vertices in sequentialGraph without predecessors OR whose predecessor have been scheduled
        j = 0;
        while( j<numOfVertex )
        {
            // 
            //var vertex = sequentialGraph[j];
            var lbl = sequentialGraph[j].operation.label;
            goAhead = scheduleOperation( lbl, sequentialGraph );
            
            if( goAhead  )
            {
                var lbl = sequentialGraph[j].operation.label;
                listU.push({ 
                        vertexLabel: lbl, 
                        labelDist:  sequentialGraph[j].labelDist
                });
            }
            j++;
        }
        
        // b) Select listS subset of listU such that |S| <= a (num of resources)
        //    & labels in listS are maximal
        //debugger;
        // Sorting 
        listU.sort( function(a, b ){
            return parseInt( b.labelDist ) - parseInt( a.labelDist ) ;
        });
        
        j = 0;
        a = numberOfResources;
        var lenU = listU.length;
        //debugger;
        while( j<numberOfResources && j<lenU )
        {
            listS.push( listU[j] );
            j++;
        }
        
        listU.splice(0, listU.length );
        // Schedule the listS operation at given time
        
        j=0;
        var vertex = 0;
        var index = 0;
        while( j<listS.length )
        {
            vertex = listS[j].vertexLabel;
            index = findIndexForVertexLabel( sequentialGraph, vertex );
            sequentialGraph[index].scheduled = true;
            sequentialGraph[index].row = time;
            j++;
            noOfSchOperation++;
        }
        listS.splice( 0, j );
        
        time++;
        i++;
        if( noOfSchOperation >= numOfVertex )
            break;
        //debugger;
    }
   // debugger;
    
    for( var c=0; c<operationList.length; c++ )
    {
   //     operationList[c].row = sequentialGraph[c].row;
    }
};

this.scheduleOperation = function( vertex, sequentialGraph )
{
    //debugger;
    var i = 0;
    var scheduleOperation = true;
    var indx = findIndexForVertexLabel( sequentialGraph, vertex );
    var len = sequentialGraph[indx].operation.dependencies.length;
    var lblScheduled = sequentialGraph[indx].scheduled;

    if( lblScheduled == true )
        return false;
    
    if( len <= 0 & lblScheduled == false )
        return true;
    else if( len <= 0 & lblScheduled == true )
        return false;
    else
    {
        var dependencies = sequentialGraph[indx].operation["dependencies"];
        while( i<dependencies.length )
        {
            dependOn = parseInt( dependencies[i] );
            var index = findIndexForVertexLabel( sequentialGraph, dependOn );
            if( sequentialGraph[index].scheduled == false )
                return false;
            i++;
        }
    }
    
    return scheduleOperation;
};
                                                           
this.unscheduleOrNoPredecessorVertices = function( listU, sequentialGraph )
{
    while( sequentialGraph.length > 0 )
    {
        // Check to see
    }
};

this.labelVertices = function( sequentialGraph )
{
    //debugger;
    var len = sequentialGraph.length;
    var i = 0;
    var lavelDist = 0;
    var levelFrmSink = 0;
    var maxRowNum = 0;
    var rowNum = -1;
    var label;
    var dependencies;
    var j = 0;
    
    
    while( i<len )
    {
        sequentialGraph[i].labelDist = 1;
        sequentialGraph[i].scheduled = false;
        i++;
    }
    
    i=0;
    
    i = len - 1;
    var dist = 0;
    var distParent = 0;
    //debugger;
    var index = 0;
    while( i>= 0 )
    {
        dependencies = sequentialGraph[i].operation.dependencies;
        dist = sequentialGraph[i].labelDist;
        var k = 0;
        while( k<dependencies.length )
        {
            dependOn = parseInt( dependencies[k] );
            index = findIndexForVertexLabel( sequentialGraph, dependOn );
            
            distParent = sequentialGraph[index].labelDist;
            distParent = dist + 1;
            sequentialGraph[index].labelDist = distParent;
            k++;
        }
        i--;
    } 
};

this.findIndexForVertexLabel = function( sequentialGraph, vertex )
{
    for( var k=0; k<sequentialGraph.length; k++ )
    {
        if( vertex == sequentialGraph[k].operation.label )
           return k;
    }
};


// Initializes listeners and resets any values
this.init();