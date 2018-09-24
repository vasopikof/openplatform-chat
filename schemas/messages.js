NEWSCHEMA('Message', function(schema) {

	schema.define('userid', 'UID', true);
	schema.define('body', 'String(500)', true);

	schema.setInsert(function($) {

		// BADGE
		var target = MAIN.users[$.user.openplatformid].users.findItem('id', $.model.userid);
		if (!target) {
			$.invalid().push('error-users-404');
			return;
		}


		var model = $.clean();
		model.id = UID('messages');
		model.ownerid = $.user.id;
		model.created = new Date();
		model.openplatformid = $.user.openplatformid;
		model.roomid = joinid(model.userid, model.ownerid);
		model.mobile = $.controller.mobile;
		model.ip = $.ip;

		TABLE('messages').insert(model).callback($.done());

		// NOTIFY + UNREAD
		// MAIN.ws && MAIN.ws.send

		// Send the client
		var msg = CLONE(model);
		msg.TYPE = 'message';

		var is = false;

		MAIN.ws && MAIN.ws.send(msg, function(id, client) {

			if (client.user.openplatformid !== $.user.openplatformid)
				return false;

			if (client.user.id === model.userid) {
				is = true;
				return true;
			}

			return client.user.id === model.ownerid;
		});

		MAIN.badge(target);

		if (is)
			return;

		var data = {};
		data['+count'] = 1;
		data.updated = NOW;

		TABLE('unread').modify(data, true).first().where('ownerid', model.userid).where('userid', $.user.id).insert(function(doc) {
			doc.ownerid = model.userid;
			doc.userid = model.ownerid;
			doc.openplatformid = $.user.openplatformid;
		});
	});

	schema.setQuery(function($) {
		TABLE('messages').find2().where('roomid', joinid($.id, $.user.id)).take(100).callback($.callback);
	});

});

function joinid(a, b) {
	var arr = a.split('');
	arr.push.apply(arr, b.split(''));
	arr.sort();
	return arr.join('');
}