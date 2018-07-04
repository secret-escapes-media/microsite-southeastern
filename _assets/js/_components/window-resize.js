

// copied snippet from stack overflow, basically waits for window to finish resizing before running code
function debouncer( func , element ) {
   var timeoutID , timeout = timeout || 200;
   return function () {
      var scope = this , args = arguments;
      clearTimeout( timeoutID );
      timeoutID = setTimeout( function () {
          func.apply( scope , Array.prototype.slice.call( args ) );
      } , timeout );
   };
}

function windowResize(func) {
  $(window).resize(debouncer(function(event){
    func();
  }));
}