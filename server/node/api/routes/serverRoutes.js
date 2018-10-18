module.exports = function(app) {
	var server = require('../controllers/serverController');
	app.use(function(req, res, next){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	app.route('/addUser')
		.post(server.addUser);

	app.route('/identifyUser')
		.post(server.identifyUser);

	app.route("/helloWorld")
		.get(server.helloWorld);

	app.route("/save")
		.post(server.save);
	
	app.route("/get")
		.get(server.get);
};