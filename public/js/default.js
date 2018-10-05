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

function smilefy(str) {
	var db = { ':-)': 1, ':)': 1, ';)': 8, ':D': 0, '8)': 5, ':((': 7, ':(': 3, ':|': 2, ':P': 6, ':O': 4, ':*': 9, '+1': 10, '1': 11, '\/': 12 };
	return str.replace(/(-1|[:;8O\-)DP(|*]|\+1){1,3}/g, function(match) {
		if (match === '-1')
			return match;
		var smile = db[match.replace('-', '')];
		return smile === undefined ? match : '<i class="smiles smiles-' + smile + '"></i>';
	}).replace(/:[a-z0-9-]+:/g, function(text) {
		return '<i class="fa fa-' + text.substring(1, text.length - 1) + '"></i>';
	});
}

function urlify(str) {
	return str.replace(/(((https?:\/\/)|(www\.))[^\s]+)/g, function(url, b, c) {

		// Check the markdown
		var l = url.substring(url.length - 1, url.length);
		var p = url.substring(url.length - 2, url.length - 1);

		if (l === ')' || l === '>' || p === ')' || p === '>')
			return url;

		var len = url.length;
		l = url.substring(len - 1);
		if (l === ')')
			return url;
		if (l === '.' || l === ',')
			url = url.substring(0, len - 1);
		else
			l = '';
		var raw = url;
		url = c === 'www.' ? 'http://' + url : url;
		return '<a href="{0}" target="_blank">{1}</a>'.format(url, raw);
	});
}

function mailify(str) {
	return str.replace(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g, function(m) {
		var len = m.length;
		var l = m.substring(len - 1);
		if (l === '.' || l === ',')
			m = m.substring(0, len - 1);
		else
			l = '';
		return '<a href="mailto:{0}">{0}</a>'.format(m);
	});
}