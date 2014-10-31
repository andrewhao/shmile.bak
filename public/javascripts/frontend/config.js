var Config = {
  PHOTO_MARGIN: 50, // Margin for the composite photo per side
  WINDOW_WIDTH: $(window).width(),
  WINDOW_HEIGHT: $(window).height() - 10,
  OVERLAY_DELAY: 2000,
  NEXT_DELAY: 10000,
  CHEESE_DELAY: 400,
  FLASH_DURATION: 1000,
  READY_DELAY: 2000,
  NICE_DELAY: 5000,

  // The amount of time we should pause between each frame shutter
  // I tend to bump this up when 1) photobooth participants want more
  // time to review their photos between shots, and 2) when I'm shooting
  // with external flash and the flash needs more time to recharge.
  BETWEEN_SNAP_DELAY: 1000,

  // For usability enhancements on iPad, set this to "true"
  IS_MOBILE: false
}
