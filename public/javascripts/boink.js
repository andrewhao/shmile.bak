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

function PhotoView() {
    this.container = $('#viewport');
    this.canvas = new Raphael('viewport', WINDOW_WIDTH, WINDOW_HEIGHT);
    this.frames = this.canvas.set(); // List of SVG black rects
    this.images = this.canvas.set(); // List of SVG images
    this.all = this.canvas.set();
    this.overlayImage = null;
    
    this.photoBorder = 0;
    this.compositeDim = null;
    this.frameDim = null;
    this.compositeOrigin = null;
    this.compositeCenter = null;
}

PhotoView.prototype.toString = function() {
    ret = [];
    ret.push("Size of 'all' set: " + this.all.length);
    ret.push("Size of 'frames' set: " + this.frames.length);
    ret.push("Composite photo is: " + this.all[0].attr('width') + 'x' + this.all[0].attr('height'));
    ret.push("Frame photo is: " + this.frameDim.w + 'x' + this.frameDim.h);
    return ret.join('\n');
}

PhotoView.prototype.render = function() {
    var w = WINDOW_WIDTH - PHOTO_MARGIN;
    var h = WINDOW_HEIGHT - PHOTO_MARGIN;
    this.compositeDim = CameraUtils.scale4x6(w, h);
    this.compositeOrigin = {
        x: (WINDOW_WIDTH - this.compositeDim.w) / 2,
        y: (WINDOW_HEIGHT - this.compositeDim.h) / 2
    };
    this.compositeCenter = {
        x: this.compositeOrigin.x + (this.compositeDim.w/2),
        y: this.compositeOrigin.y + (this.compositeDim.h/2)
    }
    var r = this.canvas.rect(this.compositeOrigin.x, this.compositeOrigin.y, this.compositeDim.w, this.compositeDim.h);
    
    r.attr({'fill': 'white'});
    
    this.all.push(r);
    
    // Scale the photo padding too
    this.photoBorder = this.compositeDim.w / 50;

    //upper x
    var frame_x = this.compositeOrigin.x + this.photoBorder;
    var frame_y = this.compositeOrigin.y + this.photoBorder;
    this.frameDim = {
        w: (this.compositeDim.w - (3*this.photoBorder))/2,
        h: (this.compositeDim.h - (3*this.photoBorder))/2
    };
    var frame = this.canvas.rect(frame_x, frame_y, this.frameDim.w, this.frameDim.h);
    frame.attr({'fill': 'black'});
    var img = this.canvas.image(null, frame_x, frame_y, this.frameDim.w, this.frameDim.h);

    this.images.push(img);
    this.frames.push(frame);
    this.all.push(img);
    this.all.push(frame);
    
    frame = frame.clone();
    img = img.clone();
    frame.translate(this.frameDim.w + this.photoBorder, 0);
    img.translate(this.frameDim.w + this.photoBorder, 0);
    this.frames.push(frame);
    this.images.push(img);
    this.all.push(frame);
    this.all.push(img);
    
    frame = frame.clone();
    img = img.clone();
    frame.translate(-(this.frameDim.w + this.photoBorder), this.frameDim.h + this.photoBorder);
    img.translate(-(this.frameDim.w + this.photoBorder), this.frameDim.h + this.photoBorder);
    this.frames.push(frame);
    this.images.push(img);
    this.all.push(frame);
    this.all.push(img);
    
    frame = frame.clone();
    img = img.clone();
    frame.translate(this.frameDim.w + this.photoBorder, 0);
    img.translate(this.frameDim.w + this.photoBorder, 0);
    this.frames.push(frame);
    this.images.push(img);
    this.all.push(frame);
    this.all.push(img);
    
    // Draw the PNG logo overlay.
    var o = this.canvas.image(
        '/images/overlay.png',
        this.compositeOrigin.x,
        this.compositeOrigin.y,
        this.compositeDim.w,
        this.compositeDim.h);
    this.all.push(o);
    this.overlayImage = o;
    
    // Hide everything and move out of sight.
    this.all.hide();
    this.all.translate(-WINDOW_WIDTH, 0);
}

/**
 * Queries the server for updated photos
 */
PhotoView.prototype.updatePhotoSet = function() {
    var view = this;
    
    // Poll the server every second to check if the image has come in.
    var updatePoller = setInterval(function() {
        $.get('photoset', {set_id: State.set_id}, function(data) {
            console.log('polling from poller id ' + updatePoller)
           var images = data.images;
           for (var i in images) {
               // New photo means we'll construct an image element
               if (State.photoset[i] === undefined) {
                   var image = images[i];
                   State.photoset[i] = image;
                   var imgEl = view.images[i];
                   var frameEl = view.frames[i];

                   imgEl.attr({'src': image.url, 'opacity': 0});
                   imgEl.show();
                   console.log('A new photo found at: ' + image.url);

                   var afterShowPhoto = function () {
                       // We've found and revealed the photo, now hide the old black rect and zoom out
                       frameEl.hide();
                       p.zoomFrame(State.current_frame_idx, 'out', function() {
                           // If this is the last photo, then show overlay and begin reset.
                           if (State.current_frame_idx == 3) {
                               p.showOverlay(true);
                               setTimeout(function() {
                                   $('body').trigger('finalize');
                               }, 5000);
                           } else {
                               // Then reset the frame index state.
                               State.current_frame_idx = (State.current_frame_idx + 1) % 4

                               // Now move on to the next frame.
                               CameraUtils.countdown();
                           }
                       });                       
                   }

                   imgEl.animate({'opacity': 1}, 200, afterShowPhoto);

                   // Do some cleanup actions
                   // Cancel the polling timer
                   clearInterval(updatePoller);
               }
           }
        });
    }, 1000);
}

/**
 * For in: assume the view has been rendered and reset to initial state and moved out of sight.
 * Slide in the composite image.
 * For out: assume the composite image is centered. Move out of sight and hide.
 */
PhotoView.prototype.animate = function(dir, cb) {
    if (dir === 'in') {
        this.all.show();
        this.images.hide();
        this.overlayImage.hide();
        this.all.animate({
            'translation': WINDOW_WIDTH+",0"
            }, 1000, "<>", cb);        
    } else if (dir === 'out') {
        this.all.animate({
            'translation': WINDOW_WIDTH+",0"
        }, 1000, "<>", cb);
    }
}

/**
 * zoomFrame zooms into the indicated frame.
 * Call it once to zoom in, call it again to zoom out.
 *
 * @param idx Frame index
 *   Expect zoomFrame(1) to be matched immediately by zoomFrame(1)
 * frame: 0 (upper left), 1 (upper-right), 2 (lower-left), 3 (lower-right)
 * @param dir 'in' or 'out'
 *   Zoom in or out
 * @param onfinish
 *   Callback executed when the animation is finished.
 *
 * Depends on the presence of the State.zoomed object to store zoom info.
 */
PhotoView.prototype.zoomFrame = function(idx, dir, onfinish) {
    var view = this;
    var composite = this.all[idx];

    var frame = this.frames[idx];
    var frameX = frame.attr('x');
    var frameW = frame.attr('width');
    var frameY = frame.attr('y');
    var frameH = frame.attr('height');
    var centerX = frameX + frameW/2;
    var centerY = frameY + frameH/2;

    var animSpeed = 700;
    
    // delta to translate to.
    var dx = this.compositeCenter.x - centerX;
    var dy = this.compositeCenter.y - centerY;
    var scaleFactor = this.compositeDim.w / this.frameDim.w;
    
    console.log('dx, dy: ' + dx + "," + dy);
        
    if (dir === "out" && State.zoomed) {
        scaleFactor = 1;
        dx = -State.zoomed.dx;
        dy = -State.zoomed.dy;
        view.all.animate({
            'scale': [1, 1, view.compositeCenter.x, view.compositeCenter.y].join(','),        
        }, animSpeed, 'bounce', function() {
            view.all.animate({
                'translation': dx+','+dy
            }, animSpeed, '<>', onfinish)
        });
        // Clear the zoom data.
        State.zoomed = null;
    } else if (dir !== "out") {
        view.all.animate({
            'translation': dx+','+dy
        }, animSpeed, '<>', function() {
            view.all.animate({
                'scale': [scaleFactor, scaleFactor, view.compositeCenter.x, view.compositeCenter.y].join(','),
            }, animSpeed, 'bounce', onfinish)
        });
        // Store the zoom data for next zoom.
        State.zoomed = {
            dx: dx,
            dy: dy,
            scaleFactor: scaleFactor
        };
    }
}

/**
 * Reset visibility, location of composite image for next round.
 */
PhotoView.prototype.next = function() {
    this.resetState();
    this.modalMessage('Next!');
    this.all.hide();
    this.all.translate(-WINDOW_WIDTH * 2, 0);
    this.animate('in', function() {
        $('#start-button').fadeIn();
    });
}

/**
 * Resets the state variables.
 */
PhotoView.prototype.resetState = function () {
    State = {
        photoset: [],
        set_id: null,
        current_frame_idx: 0,
        zoomed: null
    };
}

/**
 * Faux camera flash
 */
PhotoView.prototype.flashEffect = function(duration) {
    if (!duration) { duration = 200; }
    var rect = this.canvas.rect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    rect.attr({'fill': 'white', 'opacity': 0});
    rect.animate({'opacity': 1}, duration, ">", function() {
        rect.animate({'opacity': 0}, duration, "<");
        rect.remove();
    })

}

/**
 * Draws a modal with some text.
 */
PhotoView.prototype.modalMessage = function(text, persistTime, animateSpeed, cb) {
    if (animateSpeed === undefined) { var animateSpeed = 200; }
    if (persistTime === undefined) { var persistTime = 500; }

    var sideLength = WINDOW_HEIGHT * 0.3;
    var x = (WINDOW_WIDTH - sideLength)/2;
    var y = (WINDOW_HEIGHT - sideLength)/2;
    var all = this.canvas.set();
    var r = this.canvas.rect(x, y,
        sideLength,
        sideLength,
        15);
    r.attr({'fill': '#222',
            'fill-opacity': 0.7,
            'stroke-color': 'white'});
    all.push(r);
    var txt = this.canvas.text(x + sideLength/2, y + sideLength/2, text);
    txt.attr({'fill': 'white',
        'font-size': '50',
        'font-weight': 'bold'
    });
    all.push(txt);
    all.attr({'opacity': 0});
    all.animate({
        'opacity': 1,
        'scale': '1.5,1.5',
        'font-size': '70'
    }, animateSpeed, '>');
    
    // Timer to delete self nodes.
    var t = setTimeout(function(all) {
        // Delete nodes
        txt.remove();
        r.remove();
        if (cb) cb();
    }, persistTime, all);
}

/**
 * Applies the final image overlay to the composite image.
 * This will usually contain the wedding logo: 24-bit transparent PNG
 */
PhotoView.prototype.showOverlay = function(animate) {
    this.overlayImage.show();
    if (animate) {
        //this.overlayImage.attr({'opacity':0});
        this.overlayImage.animate({'opacity':1}, 2000);
    }
}
/**
 * Removes the overlay
 */
PhotoView.prototype.hideOverlay = function(animate) {
    var view = this;
    if (animate) {
        this.overlayImage.animate({'opacity':0}, 2000, function() {
            view.overlayImage.hide();
        });
    } else {
        this.overlayImage.hide();
    }
}

/**
 * A class of utility methods.
 */
function CameraUtils() {};

/**
 * Play the snap effect.
 */
CameraUtils.snap = function(newSet) {
    p.modalMessage('...', 2000);
    setTimeout(function() {p.modalMessage('Cheese!', 2000)}, 2000);
    $.get('snap', {'new_set': newSet, 'set_id': State.set_id }, function(data) {
        // Set the current state
        State.set_id = data.set_id;
        p.updatePhotoSet();
    });
//    p.flashEffect();
}

/**
 * Given a max w and h bounds, return the dimensions
 * of the largest 4x6 rect that will fit within.
 */
CameraUtils.scale4x6 = function(maxw, maxh) {
    var s0 = 6/4; // width / height
    var s1 = maxw/maxh;
    
    // Then the width is longer. Use the shorter side (height)
    if (s0 <= s1) {
        return {w: maxh * 6/4, h: maxh};
    } else {
        return {w: maxw, h: maxw * 4/6}
    }
}

/**
 * Wrapper around snap()
 * Will count a 3-2-1 countdown before snap() is invoked.
 */
CameraUtils.countdown = function(newSet) {
    // Zoom in
    p.zoomFrame(State.current_frame_idx, 'in');
    p.modalMessage('Ready?', 500);

    var counter = 4;
    var countdownTimer = setInterval(function() {
        console.log(counter);
        p.modalMessage(counter);
        if (counter == 1) {
            clearInterval(countdownTimer);
            setTimeout(function() {
                CameraUtils.snap(newSet);
            }, 1000);
        }
        counter -= 1;
    }, 1000);
}

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

