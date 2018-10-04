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

OP.on('resize', resizelayout);
OP.init(function() {
	AJAX('GET /api/users/', function(response) {
		SET('common.ready', true);
		var me = response.findItem('id', user.id);
		me.owner = true;
		SET('common.users', response);
		SET('common.state', 'ready');
	});
});

OP.on('screenshot', function(data) {
	OP.loading(true);
	common.selected && AJAX('POST /api/upload/base64/', { data: data.data }, function(response) {
		OP.loading(false, 500);
		if (response.success) {
			var data = {};
			data.userid = common.selected;
			data.body = '<img src="{0}" class="img-responsive" alt="{1}" />'.format(response.value.url, response.value.name);
			data.raw = true;
			AJAX('POST /api/messages/', data, NOOP);
		}
	});
});