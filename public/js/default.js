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
	common.ready = true;
	SET('common.state', 'ready');
});

$(document).on('click', '.task', function() {
	var el = $(this);
	var id = el.attrd('id');

	el.tclass('task-checked');

	setTimeout2('task' + id, function(el) {

		var id = el.attrd('id');
		var is = el.hclass('task-checked');
		var item = tasks.db.findItem('id', id);
		if (item) {
			if (item.completed !== is) {
				item.completed = is;
				AJAX('GET /api/tasks/{id}/complete/?is='.arg(item) + (is ? '1' : '0'));
				EXEC('app/prepare');
			}
		}

	}, 1000, null, el);
});

OPENPLATFORM.on('screenshot', console.log);