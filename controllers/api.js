const UNREAD = { count: 0 };
const WSOPEN = { TYPE: 'open' };
const WSCLOSE = { TYPE: 'close' };
const WSUNREAD = { TYPE: 'unread' };
const WSCONTACTS = { TYPE: 'contacts' };
const WSINIT = { TYPE: 'init' };

exports.install = function() {

	GROUP(['authorize'], function() {
		ROUTE('GET      /api/users/                  *User --> @query');
		ROUTE('GET      /api/messages/{id}/          *Message --> @query');
		ROUTE('POST     /api/messages/               *Message --> @insert');
	});

	WEBSOCKET('/', socket, ['json', 'authorize']);
};

function socket() {

	var self = this;

	MAIN.ws = self;
	self.autodestroy(() => MAIN.ws = null);

	self.on('open', function(client) {

		// Client is ready to use a chat
		client.send(WSINIT);

		var id = client.user.id;

		client.user.sessions++;
		WSOPEN.id = id;
		WSOPEN.sessions = client.user.sessions;
		self.send(WSOPEN, (id, c) => c.user.openplatformid === client.user.openplatformid);

		// Read unread list
		TABLE('unread').find().fields('-ownerid').where('count', '>', 0).where('openplatformid', client.user.openplatformid).where('ownerid', id).callback(function(err, docs) {
			WSUNREAD.items = docs;
			client.send(WSUNREAD);
		});

		// Sessions
		MAIN.sessions(client.user.openplatformid, client.user.id, client.user.sessions);
	});

	self.on('close', function(client) {
		var id = client.user.id;
		client.user.sessions--;
		WSCLOSE.id = id;
		WSCLOSE.sessions = client.user.sessions;
		self.send(WSCLOSE, (id, c) => c.user.openplatformid === client.user.openplatformid);

		// Sessions
		MAIN.sessions(client.user.openplatformid, client.user.id, client.user.sessions);
	});

	self.on('message', function(client, message) {
		switch (message.TYPE) {
			case 'unread':
				TABLE('unread').modify(UNREAD).where('ownerid', client.user.id).where('userid', message.userid).first();
				break;
			case 'contacts-add':
				$SAVE('Contact', message, NOOP, client);
				break;
			case 'contacts-rem':
				$REMOVE('Contact', message, NOOP, client);
				break;
			case 'contacts':
				$QUERY('Contact', null, function(err, response) {
					WSCONTACTS.items = response;
					client.send(WSCONTACTS);
				}, client);
				break;
		}
	});
}