NEWSCHEMA('User', function(schema) {
	schema.setQuery(function($) {
		var users = MAIN.users[$.user.openplatformid];
		$.callback(users ? users.users : EMPTYARRAY);
	});
});