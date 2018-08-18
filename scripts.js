let $input = $("#search"), 
  $searchButton = $("#searchButton"), 
	$results = $("#results"),
	$numResults = $("#numResults"),
  $langInput = $('#langInput'),
  $artCheckbox = $('#artCheckbox'),
  $previewCheckbox = $('#previewCheckbox'),
  $infoCheckbox = $('#infoCheckbox'),
	$linkCheckbox = $('#linkCheckbox'),
	$artSize = $("#artSize");

$artCheckbox.prop('checked', true);
$previewCheckbox.prop('checked', true);
$infoCheckbox.prop('checked', true);
$linkCheckbox.prop('checked', false);

function getData(term){
  try {
  $.ajax({
      url: 'https://itunes.apple.com/search',
      dataType: 'jsonp',
      data: {
        term: term,
        entity: 'song',
        country: $langInput.val(),
        limit: Math.max($numResults.val(),1)
      },
      method: 'GET',
      success: function(data){
        console.log(data.results);

        //searchParams
        history.replaceState({}, "", "?q=" + term);

        $('#logo').toggleClass('animated');

        $results.empty();
        $results[0].insertAdjacentHTML('beforeend', '<p>Displaying ' + data.results.length + ' result' + (data.results.length==1?'':'s') + ' for <b>' + term + '</b></p><hr>');

        $.each(data.results,function(i,result){
          let displayUrl = result.artworkUrl100.replace('100x100', $artSize.val()+'x'+$artSize.val() );
          let fullUrl = result.artworkUrl100.replace('100x100','3000x3000');
          let searchTerm = escape( (result.artistName + '+' + result.trackName).replace(' ','+') );
          //example of bpm search term: "blink-182-bored-to-death?q=blink-182%20bored%20to%20death"
          //test cases: artist and song names with and without spaces, dashes, parentheses, apostrophies, commas, dollar signs, ampersands
          //yes this line of code is stupid. don't touch it. please. 
          let bpmSearchTerm = ( (result.artistName + '-' + result.trackName).replace(/%20/g, "-").replace(/ /g, "-").replace(/'/g, "").replace(/,/g, "").replace(/\$/g, "").replace(/&/g, "").replace(/--/,"-").replace(/--/,"-") + '?q=' + escape(result.artistName + ' ' + result.trackName) );
          bpmSearchTerm = bpmSearchTerm.replace('(','').replace(')','').toLowerCase();
          let show = showCols();
          $results[0].insertAdjacentHTML('beforeend', (show?'<div class="row"><div class="col-sm-6">':'') +
      			'<a class="album-art" title="click for larger album art" href="' + fullUrl + '" target="_blank"><img class="img-thumbnail album-art" src="' + displayUrl + '"></a>' + 
      			'<br><audio controls class="song-preview" title="click play to preview ' + result.trackName + '"><source src="' + result.previewUrl + '" type="audio/mp4"></audio>' +
      			'<br>' + (show?'</div><div class="col-sm-6">':'') + '<div class="song-info">' +
      			'Track: <a href="' + result.trackViewUrl + '" target="_blank">' + result.trackName + (result.trackExplicitness=='explicit'?' 🅴':'') + '</a>' +
      			'<br>Artist: <a href="' + result.artistViewUrl + '" target="_blank">' + result.artistName + '</a>' +
            '<br>Album: <a href="' + result.collectionViewUrl + '" target="_blank">' + result.collectionName + (result.collectionExplicitness=='explicit'?' 🅴':'') + '</a>' +
      			'<br>Track ' + result.trackNumber + ' / ' + result.trackCount +
      			'<br>Length: ' + convetMillis(result.trackTimeMillis) + 
      			'<br>Release Date: ' + result.releaseDate.slice(0,10) + 
      			'<br>Album Price: ' + result.collectionPrice + ' ' + result.currency +
      			'<br>Song Price: ' + result.trackPrice + ' ' + result.currency +

            '</div><div class="song-links"><br>' + 
            '<a href="https://www.youtube.com/results?search_query=' + searchTerm + '" target="_blank"><button class="btn btn-sm btn-outline-dark"><i class="fab fa-youtube"></i> Search YouTube</button></a><br>' + 
            '<a href="https://search.azlyrics.com/search.php?q=' + searchTerm + '" target="_blank"><button class="btn btn-sm btn-outline-dark">Search AZLyrics</button></a><br>' + 
            '<a href="https://songbpm.com/' + bpmSearchTerm + '" target="_blank"><button class="btn btn-sm btn-outline-dark">Search BPM</button></a></div><br>' + 

      			(show?'</div></div>':'</div>') + '<hr>');
        });

        $('.album-art').css('display', $artCheckbox.is(':checked') ? 'inline' : 'none');
        $('.song-preview').css('display', $previewCheckbox.is(':checked') ? 'inline' : 'none');
        $('.song-info').css('display', $infoCheckbox.is(':checked') ? 'inline' : 'none');
        $('.song-links').css('display', $linkCheckbox.is(':checked') ? 'inline' : 'none');

      },
      error: function(e){
        console.warn('Error retrieving data');
        console.warn(e);
      }
    });
    }catch(e) {
      console.warn('Caught error');
      console.warn(e);
    }
}

//return bool for if we split UI into 2 cols or not
function showCols() {
	return $artSize.val() >= 100 && $artSize.val() <= 240 && $artCheckbox.is(':checked') && $infoCheckbox.is(':checked');
}

//https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
function convetMillis(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ( (millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

$(function() {
  //load select with country codes
	$.getJSON('country-codes.json', function(data) {
		console.log(data);
		//https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
		//https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes/blob/master/all/all.csv
		//https://stackoverflow.com/questions/18417114/add-item-to-dropdown-list-in-html-using-javascript
		let options = [];
		let option = document.createElement('option');
		for(let i = 0; i < data.length; i++) {
			option.text = data[i]["name"];
			option.value = data[i]["alpha-2"];
			options.push(option.outerHTML);
		}
		langInput.insertAdjacentHTML('beforeEnd', options.join('\n'));
		langInput.selectedIndex = 235; //us

	});

  //get url params
  let url = new URL(window.location.href);
  let q = url.searchParams.get("q");
  $input.val(q || 'Imagine Dragons');
  //search
  getData($input.val() );

  //select input on page load for faster typing
  $input.select();

});

$artCheckbox.on('change', function() {
  $('.album-art').css('display', $artCheckbox.is(':checked') ? 'inline' : 'none');
  $(this).next().toggleClass("fas").toggleClass("far").toggleClass("fa-check-square").toggleClass("fa-square");
});
$previewCheckbox.on('change', function() {
  $('.song-preview').css('display', $previewCheckbox.is(':checked') ? 'inline' : 'none');
  $(this).next().toggleClass("fas").toggleClass("far").toggleClass("fa-check-square").toggleClass("fa-square");
});
$infoCheckbox.on('change', function() {
  $('.song-info').css('display', $infoCheckbox.is(':checked') ? 'inline' : 'none');
  $(this).next().toggleClass("fas").toggleClass("far").toggleClass("fa-check-square").toggleClass("fa-square");
});

$linkCheckbox.on('change', function() {
  $('.song-links').css('display', $linkCheckbox.is(':checked') ? 'inline' : 'none');
  $(this).next().toggleClass("fas").toggleClass("far").toggleClass("fa-check-square").toggleClass("fa-square");
});


$('#logo').on('click', function() {
  $('#logo').toggleClass('animated');
});

$('#copy').on('click', function() {
	let tmp = $('<input type="text">').appendTo(document.body);
	tmp.val(window.location.href);
	tmp.select();
	document.execCommand('copy');
	tmp.remove();
});

$searchButton.on('click', function() {
  getData($input.val() );
});

$input.on('keydown', function(e){
	if(e.keyCode == 13) { //enter
		getData($input.val() );
	}
});


let night = false;
$('#nightButton').click(function() {
    night = !night;
    if(night) {
      $('#nightStyles').prop('href','night.css');
      $('#logo').prop('src','logo/logo-white.svg');
    }
    else {
      $('#nightStyles').prop('href','');
      $('#logo').prop('src','logo/logo.svg');
    }
});


let zoom = false;
$('#zoomButton').click(function() {
    zoom = !zoom;
    if(zoom) {
      $('#zoomStyles').prop('href','zoom.css');
      $('#zoomButton').html('<i class="fas fa-search-minus"></i> Zoom out');

    }
    else {
      $('#zoomStyles').prop('href','');
      $('#zoomButton').html('<i class="fas fa-search-plus"></i> Zoom in');
    }
});


//https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
// When the user scrolls down 100px from the top of the document, show the button
window.onscroll = function() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    document.getElementById("topButton").style.display = "block";
  } else {
    document.getElementById("topButton").style.display = "none";
  }
};

// When the user clicks on the button, scroll to the top of the document
function toTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


//https://stackoverflow.com/questions/3900701/onclick-go-full-screen
function toggleFullscreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }  
  } else {  
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }  
  }  
}


//https://codepen.io/shshaw/pen/XddjdR