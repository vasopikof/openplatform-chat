NEWOPERATION('base64', function($) {
	var buffer = $.body.data.base64ToBuffer();
	var name = 'screenshot.jpg';
	FILESTORAGE('files').insert(name, buffer, function(err, id, meta) {
		if (err)
			$.invalid(err);
		else
			$.success({ url: '/files/{0}.jpg'.format(id), name: name, size: meta.size });
	});
});

NEWOPERATION('binary', function($) {
	var file = $.files[0];
	file.fs('files', function(err, id, meta) {
		if (err)
			$.invalid(err);
		else
			$.success({ url: '/files/{0}.{1}'.format(id, U.getExtension(file.filename)), name: file.filename, size: meta.size });
	});
});