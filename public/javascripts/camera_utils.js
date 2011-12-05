/**
 * A class of utility methods.
 */
function CameraUtils() {};

/**
 * Play the snap effect.
 * @param {Integer} idx
 *   The frame index to place the updated image.
 */
CameraUtils.snap = function(idx) {
    p.zoomFrame(idx, 'in');
    p.modalMessage('Ready?', 2000);
    setTimeout(function() {p.modalMessage('Cheese!', 2000)}, 2000);
    // $.get('snap', {'new_set': newSet, 'set_id': State.set_id }, function(data) {
    //     // Set the current state
    //     State.set_id = data.set_id;
    //     p.updatePhotoSet();
    // });
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
// CameraUtils.countdown = function(newSet) {
//     // Zoom in
//     p.zoomFrame(State.current_frame_idx, 'in');
//     p.modalMessage('Ready?', 500);

//     var counter = 4;
//     var countdownTimer = setInterval(function() {
//         console.log(counter);
//         p.modalMessage(counter);
//         if (counter == 3) {
//             clearInterval(countdownTimer);
//             setTimeout(function() {
//                 CameraUtils.snap(newSet);
//             }, 1000);
//         }
//         counter -= 1;
//     }, 1000);
// }
