
jQuery.prototype.ant=function() { 
	var selector = coma = "";
	$(this).children().eq(1).find("a").each(function() { selector += coma+"a[name="+$(this).html()+"]"; coma = ","});
	return $(selector).parents("tr");
}
	
jQuery.prototype.dep=function() { 
	ref=$(this).children().eq(0).find("div").html();
	return $("a[href='#"+ref+"']").parents("tr");
}

function htmlent(str) {
	return jQuery('<div />').text(str).html();
}

// Highlight antecedents

function hant(elt) {
	elt.toggleClass('hstmt'); 
	elt.ant().toggleClass('hant');
	elt.dep().toggleClass('hdep');
};

$(function() {
	$('.proof tr th:nth-child(4)').append('<span id="tools"/></span>');
	$('.proof tr:first').addClass('header');
	$('.proof tr td').wrapInner('<div />');
	$('.proof tr').mouseenter(function(){ hant($(this)); });
	$('.proof tr').mouseleave(function(){ hant($(this)); });
});


// Collapsing proofs parts

jQuery.prototype.collapse=function() {
	$(this).each(function() {
		$(this).addClass('collapsed');
		$(this).ant().collapse();
	});
}

jQuery.prototype.expand=function() {
	$(this).each(function() {
		$(this).removeClass('collapsed');
		$(this).filter(":not(.ant-collapsed)").ant().expand();
	});
}

var initialLabels = [];
var level = 12; // take only 12 first elements
function resetTree() {
	labels = initialLabels.slice(0, level); 
	$('.proof tr').addClass("collapsed").addClass("ant-collapsed");
	$('.proof span.r').each(function() { if(labels.indexOf($(this).text()) != -1) $(this).parents("tr").removeClass("collapsed"); });
	$('.proof tr:last').removeClass("collapsed");
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
	$('.proof tr').click(function(){ 
		if($(this).hasClass('ant-collapsed')) $(this).ant().expand(); 
		else $(this).ant().collapse(); 
		$(this).toggleClass('ant-collapsed');
		});
	$('#tools').append('<span class="icon" title="show all steps" id="overall"/></span>');
	$('#overall').click(function() { 
		if($(this).hasClass('collapse-all')) {
			resetTree(); 
			$('#overall').attr('title',"show all steps");
		}
		else {
			$('.proof tr').removeClass("collapsed").removeClass("ant-collapsed");
			$('#overall').attr('title',"reset view");
		}
		$(this).toggleClass('collapse-all'); 
	});
  } );

// Variable initial depth
$.getScript('mm-web-ui/externals/jquery-ui.min.js', function() {
	$('head').append('<link rel="stylesheet" type="text/css" href="mm-web-ui/externals/jquery-ui.min.css">');
	$('#tools').append('<input id="level" name="level" value="12">');
	$( "#level" ).spinner({
		spin: function( event, ui ) {
			if ( ui.value > 50 ) { $( this ).spinner( "value", 50 ); return false; } 
			else if ( ui.value < 5 ) { $( this ).spinner( "value", 5 ); return false; }
			level = ui.value;
			resetTree();
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
