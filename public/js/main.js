var instruments = [
  'drums',
  'uprightbass',
  'guitar',
  'piano',
  'sax',
  'trombone',
  'trumpet'
]

var tracks = [];
var activeTracks = [];
var musicRoot = 'music/';
var defaultParams = {
  mute: true,
  loop: true,
  html5: true,
  buffer: true
}

function shuffle(arrayToShuffle) {
  var array = arrayToShuffle.slice(0);
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function initMusic() {
  $.each(instruments, function(index, instrument) {
    var src = musicRoot + instrument + '.mp3';
    var params = jQuery.extend(true, {}, defaultParams);
    params['src'] = src;
    var track = new Howl(params);
    tracks.push(track);
  });
}

function beginMusic() {
  $.each(tracks, function(index, track) {
    track.play();
  });
}

function insertInstruments() {
  var size = ($(window).width() / 4) - 10;
  var shuffled = shuffle(instruments);
  $.each(shuffled, function(newIndex, instrument) {
    var index = instruments.indexOf(instrument);
    var div = $('<div></div>');
    div.addClass('instrument');
    div.attr('id', 'instrument'+index);
    div.css({
      width: size+'px',
      height: size+'px',
      backgroundImage: 'url(style/images/'+instrument+'.png)'
    });
    $('body').append(div);
  });
}

function wiggle(div, index, direction) {
  if (activeTracks.indexOf(index) < 0) {
    return false;
  }
  var nextDirection;
  if (direction == 'left') {
    nextDirection = 'right';
  } else {
    nextDirection = 'left';
  }
  div.removeClass('rotate-left rotate-right');
  div.addClass('rotate-'+direction);
  setTimeout(function() {
    wiggle(div, index, nextDirection);
  }, 200);
}

function activateInstrument(index) {
  if (activeTracks.indexOf(index) > -1) {
    return false;
  }
  activeTracks.push(index);
  var div = $('#instrument'+index);
  div.addClass('active');
  wiggle(div, index);
  tracks[index].mute(false);
}

function muteInstrument(index) {
  var activeIndex = activeTracks.indexOf(index);
  if (activeIndex > -1) {
    activeTracks.splice(activeIndex, 1);
  } else {
    return false;
  }
  var div = $('#instrument'+index);
  div.removeClass('active');
  tracks[index].mute(true);
}

function initSocket() {
  var url = $(location).attr('origin');
  var socket = io.connect(url);
  socket.on('play', function (data) {
    console.log('Data received!');
    console.log(data);
    activateInstrument(data.instrument);
  });
  socket.on('stop', function (data) {
    muteInstrument(data.instrument);
  });
}

function preloadImages() {
  $.each(instruments, function(index, instrument) {
    var url = 'style/images/'+instrument+'.png';
    var img = new Image();
    img.src = url;
  });
}

function finishLoading() {
  $('.spinner').hide();
  insertInstruments();
  initSocket();
  beginMusic();
}

$(document).keydown(function(e) {
  if ((e.keyCode >= 48 && e.keyCode <= 54)) { 
    var instrument = e.keyCode - 48;
    if (activeTracks.indexOf(instrument) > -1) {
      muteInstrument(instrument);
    } else {
      activateInstrument(instrument);
    }
  }
});

initMusic();
preloadImages();

$(document).ready(function() {
  setTimeout(finishLoading, 3000);
});