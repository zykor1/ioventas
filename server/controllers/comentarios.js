var mongoose = require('mongoose');
var comentariosModel = mongoose.model('ArticuloComentarioModel');
var queryString = require( "querystring" );
var url = require( "url" );
/*
 * GET home page.
 */

// Agrega un comentario
exports.addComentario = function(req, res){
	if (req.session.auth != undefined){
		var comentario = undefined;
		if (req.body.id_comentario != ""){
			comentario = new comentariosModel({
			_creador: req.session.auth.userId,
			_articulo: req.body.articulo,
			respuesta: req.body.id_comentario,
			comentario: req.body.comentario
			});
		}else{
			comentario = new comentariosModel({
			_creador: req.session.auth.userId,
			_articulo: req.body.articulo,
			comentario: req.body.comentario
			});
		}
		comentario.save(function (err) {
			if (err){
				res.send({
					tipo: "error",
					from: "addComentario",
					mensaje: "No se pudo guardar"
				});
			}
			else{
				comentariosModel.populate(comentario, { path : '_creador _articulo' }, function(err, comentarioPop){
					res.send({
						tipo: "success",
						from: "addComentario",
						mensaje: "Se ha agregado tu comentario correctamente",
						comentario: comentarioPop,
						user_name: req.session.auth.facebook.user.name,
						user_id: req.session.auth.userId
					});
				});
			  	}
		});
	}else res.redirect('/')
};


// Muestra la pantalla de los chavos brincando
exports.leeComentarios = function(req, res){
	if (req.session.auth != undefined){
	    comentariosModel.find({_articulo: req.params.id_articulo }).sort({fecha_creacion: 1}).populate('_creador _articulo').execFind( function(err,comentarios){
			if (err){
				res.send({
					tipo: "error",
					from: "leeComentarios",
					mensaje: err
				});
			}
			else{
					res.send({
						tipo: "success",
						from: "leeComentarios",
						mensaje: "Leyendo comentarios",
						comentarios: comentarios,
						user_id: req.session.auth.userId
					});
			  	}
	    });
	}else{
		res.redirect('/')
	} 
};


// Eliminar un articulo
exports.eliminaComentario = function(req, res){
	if (req.session.auth != undefined){
		var theUrl = url.parse( req.url );
		var queryObj = queryString.parse( theUrl.query );
		var aux =  queryObj;
		comentariosModel.findByIdAndRemove(aux.id_comentario, function(err, comentario){
			if(err == undefined){
				res.send({
					tipo: "success",
					from: "removeComentario",
					mensaje: 'Se ha eliminado el comentario'
				});
			}
			else{
				res.send({
					tipo: "error",
					from: "removeComentario",
					mensaje: 'No se pudo eliminar el comentario'
				});				
			}

		});
	}
	else{
    	res.redirect('/');
    }
};

exports.calificaComentario = function(req, res){
	if (req.session.auth != undefined){
		var theUrl = url.parse( req.url );
		var queryObj = queryString.parse( theUrl.query );
		var aux =  queryObj;
		comentariosModel.findById(aux.id_comentario, function(err, comentario){
			console.log(err);
			var calificacionValor = 0;
			if (aux.calificacion == "true")
				calificacionValor = 1;
			comentario.calificacion.push({usuario: req.session.auth.userId, calificacion: aux.calificacion});
				comentario.save(function (err) {
				if (err){
					res.send({
						tipo: "error",
						from: "calificaComentario",
						mensaje: "No se pudo guardar tu calificacion"
					});
				}
				else{
						res.send({
							tipo: "success",
							from: "calificaComentario",
							mensaje: "Se ha agregado tu calificacion correctamente",
							comentario: comentario,
							calificacionValor: calificacionValor
						});
				  	}
				});
		});
	}
	else{
    	res.redirect('/');
    }
};