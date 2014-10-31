/**
 * A class of utility methods.
 */
function CameraUtils() {};

/**
 * Play the snap effect.
 * @param {Integer} idx
 *   The frame index to place the updated image.
 * @param {Function} cheeseCB
 *   Code to execute after "Cheese" is displayed.
 *   Typically, this wraps the command to fire the shutter.
 */
CameraUtils.snap = function(idx, cheeseCb) {
    p.zoomFrame(idx, 'in');
    p.modalMessage('Ready?', Config.READY_DELAY);
    setTimeout(function() {
        p.modalMessage('Cheese!', Config.CHEESE_DELAY);
        cheeseCb();
        p.flashEffect(Config.FLASH_DURATION);
    }, Config.READY_DELAY);
    
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
