
jQuery.prototype.ant=function() { 
	var selector = coma = "";
	$(this).children().eq(1).find("a").each(function() { selector += coma+"a[name="+$(this).html()+"]"; coma = ","});
	return $(selector).parents("tr");
}
	
jQuery.prototype.dep=function() { 
	ref=parseInt($(this).children().eq(0).find("div").text());
	return $("a[href='#"+ref+"']").parents("tr");
}

function htmlent(str) {
	return jQuery('<div />').text(str).html();
}

// Highlight antecedents
function hant() {
	$('.proof tr').removeClass('hant hdep hstmt');
	$(this).closest('tr').addClass('hstmt');
	$(this).closest('tr').ant().addClass('hant');
	$(this).closest('tr').dep().addClass('hdep');
	if(!$(this).find('.hnav').is(":focus")) $(this).find('.hnav').focus();
};

$(function() {
	$('.proof tr th:nth-child(4)').append('<span id="tools"/></span>').css('height','26px').css('line-height','26px');
	$('.proof tr:first').addClass('header');
	$('.proof tr td').wrapInner('<div />');
	$('.proof tr').hover(hant);
});


// Collapsing proofs parts
jQuery.prototype.collapse=function() {
	$(this).each(function() {
		$(this).addClass('collapsed');
		$(this).find('div').slideUp();
		$(this).ant().collapse();
	});
}

jQuery.prototype.expand=function() {
	$(this).each(function() {
		$(this).find('div').slideDown();
		$(this).removeClass('collapsed');
		$(this).filter(":not(.ant-collapsed)").ant().expand();
	});
}

jQuery.prototype.prevWith=function(selector) {
	if((prev = $(this).prev(selector)).length != 0) return prev;
	return $(this).prevUntil(selector).prev();
}

jQuery.prototype.nextWith=function(selector) {
	if((next = $(this).next(selector)).length != 0) return next;
	return $(this).nextUntil(selector).next();
}

var initialLabels = [];
var level = 12; // take only 12 first elements
function resetTree() {
	labels = initialLabels.slice(0, level); 
	$('.proof tr').addClass("ant-collapsed");
	$('.proof tr:not(:last) span.r').each(function() { 
		if(labels.indexOf($(this).text()) != -1) {
			$(this).parents('tr').removeClass("collapsed"); 
			$(this).parents('tr').find('div').slideDown();
			}
		else {
			$(this).parents('tr').find('div').slideUp();
			$(this).parents('tr').addClass("collapsed"); 
			}
		});
	}

var labels = [];
$(function() {
	$('head').append('<link rel="stylesheet" type="text/css" href="../mm-web-ui.css">');
	$('.proof span.r').each(function() { initialLabels.push($(this).text()); });
	initialLabels.sort((a, b) => (Number(b) - Number(a)));
	resetTree();
	$('.proof tr').each(function() { 		
		if($(this).children().eq(1).find("div").text() == '\xa0') $(this).addClass("ant-none"); 
		$(this).children().eq(0).find("div").prepend('<button class="icon hnav">&nbsp;</button>');
	});
	$('.hnav').keydown(function(e) {
		var event = window.event ? window.event : e;
		switch(event.keyCode) {
		case 37: // left
			$(this).closest('tr').removeClass('ant-collapsed').ant().expand(); 
			break;
		case 38: // up
			$(this).closest('tr').prevWith(':not(.collapsed)').find('.hnav').focus();
			break;
		case 39: // right
			$(this).closest('tr').addClass('ant-collapsed').ant().collapse(); 
			break;
		case 40: // down
			$(this).closest('tr').nextWith(':not(.collapsed)').find('.hnav').focus();
			break;
		}
		event.preventDefault();
	}).focus(hant).click(function(){ 
		tr = $(this).closest('tr');
		if(tr.hasClass('ant-collapsed')) tr.ant().expand(); 
		else tr.ant().collapse(); 
		tr.toggleClass('ant-collapsed');
		});
});


// When clicking on a link to a collapsed step, expand it.
$(function() {
	$('.proof td:nth-child(2) a').click(function() {
		$('a[name='+$(this).attr('href').substring(1)+']').closest('tr').removeClass('collapsed').find('div').slideDown();
	});
});

// "Overall" button to restore the initial state
$(function() {
	$('#tools').append('<span class="icon" title="show all steps" id="overall"/></span>');
	$('#overall').click(function() { 
		if($(this).hasClass('collapse-all')) {
			resetTree(); 
			$('#overall').attr('title',"show all steps");
		}
		else {
			$('.proof tr').removeClass("collapsed").removeClass("ant-collapsed");
			$('.proof tr div').slideDown();
			$('#overall').attr('title',"reset view");
		}
		$(this).toggleClass('collapse-all'); 
	});
  } );

// Variable initial depth
$.getScript('mm-web-ui/externals/jquery-ui.min.js', function() {
	$('head').append('<link rel="stylesheet" type="text/css" href="mm-web-ui/externals/jquery-ui.min.css">');
	$('#tools').append('<input id="level" name="level" value="12" title="Number of steps initially shown">');
	$( "#level" ).spinner({
		spin: function( event, ui ) {
			if ( ui.value > 50 ) { $( this ).spinner( "value", 50 ); return false; } 
			else if ( ui.value < 5 ) { $( this ).spinner( "value", 5 ); return false; }
			level = ui.value;
			resetTree();
			$('#overall').attr('title',"show all steps").removeClass("collapse-all");
		}
	});
});

// Clipboard
$.getScript('mm-web-ui/externals/clipboard.min.js', function() {
	$('.proof td:nth-child(4) a').each(function() {
		$(this).parent().attr('title', $(this).attr("title"));
		$(this).parent().append('<span class="icon copy" title="copy this formula to clipboard" data-clipboard-text="'+htmlent($(this).attr("title"))+'"></span>'); });
	new ClipboardJS('.copy');
});

// Marnix's Indentation
$(function() {
	$.getScript('mm-web-ui/mm-calc-user.js');
	$('#tools').append('<span class="icon" title="switch to calculation-like indentation" id="marnix">M</span>');
	$('#marnix').click(function() { $(this).toggle(); marnix(); });
});

// Special hook for fixing the links of the "Tirix" site
$(function() {
	if(window.location.origin!="metamath.tirix.org") return;
	$("a:contains('Unicode version')").each(function() {
		$(this).attr("href", "http://us2.metamath.org/"+$(this).attr("href"));
	});
	$("a:contains('Nearby theorems')").hide();
	$("a:contains('Mirrors')").attr("href", "http://us2.metamath.org:88/mm.html");
});