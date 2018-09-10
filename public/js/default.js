UPTODATE('1 hour', function() {
	return !document.hasFocus();
});

function resizelayout() {
	var h = $(window).height();
	$('.scroller').each(function() {
		var el = $(this);
		var m = el.attrd('margin');

		if (m)
			m = +m;
		else
			m = 0;

		el.css('height', h - (el.offset().top + m));
	});
}

NAV.clientside('.jR');

ON('ready', resizelayout);
$(document).ready(resizelayout);

OPENPLATFORM.on('resize', resizelayout);
OPENPLATFORM.init(function() {
	AJAX('GET /api/users/', function(response) {
		SET('common.ready', true);
		var me = response.findItem('id', user.id);
		me.owner = true;
		SET('common.users', response);
		SET('common.state', 'ready');
	});
});
