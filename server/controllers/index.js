var mongoose = require('mongoose');
var ss = require('socketstream');

/*
 * GET home page.
 */

// Muestra la pantalla de los chavos brincando
exports.index = function(req, res){
	if (req.session.auth == undefined){
			 res.serve('main1');
		}
	else
		res.redirect('/principal')
};