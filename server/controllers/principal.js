var mongoose = require('mongoose');
var graph = require('fbgraph');
var articulo = require('../models/articuloModel')
var queryString = require( "querystring" );
var url = require( "url" )


/*
 * GET users listing.
 */

var ArticuloModel = mongoose.model('ArticuloModel');
//Muestra la pantalla una vez logeado xD
exports.index = function(req, res){
	if (req.session.auth != undefined){
		var theUrl = url.parse( req.url );
		var inicio = 0;
		var fin = 10;
		if (theUrl.query != undefined ){
			var queryObj = queryString.parse( theUrl.query );
			var paginacion =  queryObj;
			inicio = paginacion.pagina * 10;
			ArticuloModel.find({}, {} ,{ skip: inicio, limit: fin }).sort({fecha_modificacion: -1}).execFind( function(err,articulos){
		        res.send({
		        	tipo: "success",
					nuevosArticulos: JSON.stringify(articulos)
				});
		        //res.render('principal', { title: 'Yo Soy Ventas', articulos: articulos, paginacion: {inicio: inicio, fin: fin}});
		    });
		}else{
		    ArticuloModel.find({}, {} ,{ skip: inicio, limit: fin }).sort({fecha_modificacion: -1}).execFind( function(err,articulos){
		        res.render('principal', { title: 'Yo Soy Ventas', articulos: articulos, articulos_txt: JSON.stringify(articulos),paginacion: {inicio: inicio, fin: fin}});
		    });
	    }
	}else{
    	res.redirect('/')
    }
};
