// ==UserScript==
// @name     mm-calc
// @description  Make `metamath /html' proofs look more like calculations.  (License: public domain; initial author: Marnix Klooster.)
// @version  1
// @grant    none
// @include  https://*.metamath.org/*/*.html
// @include  http://*.metamath.org/*/*.html
// @include  http://metamath.tirix.org/*.html
// @require  https://code.jquery.com/jquery-3.3.1.slim.min.js
// ==/UserScript==

function removeCalcAntsOf(proofTable, stepNumber) {
	var proofStep = proofTable.find('tr[data-step="' + String(stepNumber) + '"]');
	var result = JSON.parse(proofStep.attr('data-calcants'));
	proofStep.attr('data-calcants', JSON.stringify([]));
	return result;
}

// FOR EVERY PROOF TABLE
function marnix() {
$('table:has(> tbody > tr > th:contains("Step"))').each(function() {
	proofTable = $(this);
  
	// calculate indentations
	var previousLevels = [];
	proofTable.find('tr').each(function() { if ($(this).find('td').length == 0) return;
	  var stepNumber = Number($(this).find('td:first div').text());
  	$(this).attr('data-step', String(stepNumber));
		var levelSpan = $(this).find('td:last span.i');
		var level = Number(levelSpan.text().replace(/^(\. )*/, ''));
		$(this).attr('data-level', String(level));

		var ants = [];
		while (previousLevels.length > 0 && previousLevels[0].level > level) {
			ants.unshift(previousLevels[0].stepNumber);
			previousLevels.shift();
		}
		$(this).attr('data-ants', JSON.stringify(ants));

		var calcAnts = ants;
		if (ants.length > 0) {
			calcAnts = [ants[0]].concat(removeCalcAntsOf(proofTable, ants[0]), ants.slice(1));
		}
		$(this).attr('data-calcants', JSON.stringify(calcAnts));

		var indent = String(previousLevels.length);
		$(this).attr('data-indent', indent);
		previousLevels.unshift({level:level,stepNumber:stepNumber});
	});
	// change indent to (space-only) 'logical' indent
	proofTable.find('tr').each(function() { if ($(this).find('td').length == 0) return;
		var levelSpan = $(this).find('td:last span.i');
		var levelString = $(this).attr('data-level');
		var indent = Number($(this).attr('data-indent'));
		levelSpan.parents().css('padding-left', String(indent*5)+'ex');
		levelSpan.text(levelString);                            
	});
  
});
}