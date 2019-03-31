mysql= require('mysql');
exports.connecting = function(){
	var connection = mysql.createConnection({
        	host: 'localhost',
        	user: 'me',
        	password: 'mypassword',
        	database: 'mydb'
	});
	return connection;
};
