let $input = $("#search"), 
  $searchButton = $("#searchButton"), 
	$results = $("#results"),
	$numResults = $("#numResults"),
  $langInput = $('#langInput'),
  $artCheckbox = $('#artCheckbox'),
  $previewCheckbox = $('#previewCheckbox'),
	$infoCheckbox = $('#infoCheckbox'),
	$artSize = $("#artSize");

$artCheckbox.prop('checked', true);
$previewCheckbox.prop('checked', true);
$infoCheckbox.prop('checked', true);

function getData(term){
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
        $results[0].insertAdjacentHTML('beforeend', '<p>displaying ' + data.results.length + ' results</p><hr>');

        $.each(data.results,function(i,result){
          let displayUrl = result.artworkUrl100.replace('100x100', $artSize.val()+'x'+$artSize.val() );
          let fullUrl = result.artworkUrl100.replace('100x100','3000x3000');
          let show = showCols();
          $results[0].insertAdjacentHTML('beforeend', (show?'<div class="row"><div class="col-sm-6">':'') +
      			'<a class="album-art" title="click for larger album art" href="' + fullUrl + '" target="_blank"><img class="img-thumbnail album-art" src="' + displayUrl + '"></a>' + 
      			'<br><audio controls class="song-preview" title="click play to preview the song"><source src="' + result.previewUrl + '" type="audio/mp4"></audio>' +
      			'<br>' + (show?'</div><div class="col-sm-6 song-info">':'') +
      			'Track: <a href="' + result.trackViewUrl + '" target="_blank">' + result.trackName + (result.trackExplicitness=='explicit'?' 🅴':'') + '</a>' +
      			'<br>Artist: <a href="' + result.artistViewUrl + '" target="_blank">' + result.artistName + '</a>' +
            '<br>Album: <a href="' + result.collectionViewUrl + '" target="_blank">' + result.collectionName + (result.collectionExplicitness=='explicit'?' 🅴':'') + '</a>' +
      			'<br>Track ' + result.trackNumber + ' / ' + result.trackCount +
      			'<br>Length: ' + convetMillis(result.trackTimeMillis) + 
      			'<br>Release Date: ' + result.releaseDate.slice(0,10) + 
      			'<br>Album Price: ' + result.collectionPrice + ' ' + result.currency +
      			'<br>Song Price: ' + result.trackPrice + ' ' + result.currency +
      			'<br>' + (show?'</div></div>':'') + '<hr>');
        });

        $('.album-art').css('display', $artCheckbox.is(':checked') ? 'inline' : 'none');
        $('.song-preview').css('display', $previewCheckbox.is(':checked') ? 'inline' : 'none');
        $('.song-info').css('display', $infoCheckbox.is(':checked') ? 'inline' : 'none');

      },
      error: function(e){
        console.warn(e);
      }
    });
}

//return bool for if we split UI into 2 cols or not
function showCols() {
	return $artSize.val() >= 100 || $artSize.val() <= 240;
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
});
$previewCheckbox.on('change', function() {
  $('.song-preview').css('display', $previewCheckbox.is(':checked') ? 'inline' : 'none');
});
$infoCheckbox.on('change', function() {
  $('.song-info').css('display', $infoCheckbox.is(':checked') ? 'inline' : 'none');
});



$searchButton.on('click',function() {
  getData($input.val() );
});

$input.on('keydown',function(e){
	if(e.keyCode == 13 ) { //enter
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
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
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






//https://codepen.io/shshaw/pen/XddjdR