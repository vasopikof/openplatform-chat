const UNREAD = { count: 0 };
const WSOPEN = { TYPE: 'open' };
const WSCLOSE = { TYPE: 'close' };
const WSUNREAD = { TYPE: 'unread' };

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

		client.user.sessions++;
		WSOPEN.id = client.user.id;
		WSOPEN.sessions = client.user.sessions;
		self.send(WSOPEN, (id, c) => c.user.openplatformid === client.user.openplatformid);

		// Read unread list
		TABLE('unread').find().fields('-ownerid').where('openplatformid', client.user.openplatformid).where('ownerid', client.user.id).callback(function(err, docs) {
			WSUNREAD.items = docs;
			client.send(WSUNREAD);
		});
	});

	self.on('close', function(client) {
		client.user.sessions--;
		WSCLOSE.id = client.user.id;
		WSCLOSE.sessions = client.user.sessions;
		self.send(WSCLOSE, (id, c) => c.user.openplatformid === client.user.openplatformid);
	});

	self.on('message', function(client, message) {
		switch (message.TYPE) {
			case 'unread':
				TABLE('unread').modify(UNREAD).where('ownerid', client.user.id).where('userid', message.userid).first();
				break;
		}
	});

}