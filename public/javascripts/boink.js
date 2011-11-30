// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

var PHOTO_MARGIN = 50; // Margin for the composite photo per side
var WINDOW_WIDTH = $(window).width();
var WINDOW_HEIGHT = $(window).height() - 10;

// Current app state 
var State = {
    photoset: [],
    set_id: null,
    current_frame_idx: 0,
    zoomed: null
};

$(window).ready(function () {
    
    var startButton = $('button#start-button');
    var buttonX = (WINDOW_WIDTH - startButton.outerWidth())/2;
    var buttonY = (WINDOW_HEIGHT - startButton.outerHeight())/2;
    
    startButton.hide();
    
    // Position the start button in the center
    startButton.css({'top': buttonY, 'left': buttonX});
    
    // Click handler for the start button.
    startButton.click(function(e) {
        var button = $(e.currentTarget);
        button.fadeOut(1000);
        CameraUtils.countdown(true);
    });
    
    $('body').bind('finalize', function() {
        // TODO
       p.animate('out');
       p.modalMessage('Nice!', 3000, 200, function() {p.next()});
       //p.next();
    });
    p = new PhotoView();
    p.render();
    p.animate('in', function() {
        startButton.fadeIn();
    });
});

