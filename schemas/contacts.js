const NOACTIVE = { active: false };

NEWSCHEMA('Contact', function(schema) {

	schema.define('userid', 'UID', true);

	schema.setQuery(function($) {

		TABLE('contacts').find().make(function(builder) {
			builder.fields('userid');
			builder.where('ownerid', $.user.id);
			builder.where('active', true);
			builder.callback($.callback);
		});

	});

	schema.setSave(function($) {
		var model = $.model;
		model.ownerid = $.user.id;
		model.active = true;

		TABLE('contacts').modify(model, true).make(function(builder) {
			builder.where('ownerid', model.ownerid);
			builder.where('userid', model.userid);
			builder.first();
		});

		$.success();
	});

	schema.setRemove(function($) {

		TABLE('contacts').modify(NOACTIVE).make(function(builder) {
			builder.where('ownerid', $.user.id);
			builder.where('userid', $.options.userid || $.options.id);
			builder.first();
		});

		$.success();
	});

});