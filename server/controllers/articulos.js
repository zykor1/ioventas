var fs = require('fs');
var mongoose = require('mongoose');
var articulo = require('../models/articuloModel')
var graph = require('fbgraph');
var mkdirp = require('mkdirp');
var queryString = require( "querystring" );
var url = require( "url" );

/*
 * GET users listing.
 */
var ArticuloModel = mongoose.model('ArticuloModel');




//funcion para agregar texto a las cadenas
	String.prototype.insert = function (index, string) {
  		if (index > 0)
    		return this.substring(0, index) + string + this.substring(index, this.length);
  		else
    		return string + this;
	};

//funcion para obtener el datetime actual
function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;

}

//funcion para obtener el datetime actual
function DateNow() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

}



// --------------------------------inicio de metodos para manegar imagenes--------------------------------------------

// Elimina una imagen
exports.eliminaImagen = function(req, res){
	if (req.session.auth != undefined){
		var theUrl = url.parse( req.url );
		var queryObj = queryString.parse( theUrl.query );
		var aux =  {imagenes : queryObj};
		var ruta = require('path').dirname(module.parent.filename) + "/public/static" + aux.imagenes.ruta_imagen;
		if (aux.imagenes.id_articulo == 'NO')
			{
				fs.unlink(ruta, function (err) {
				if (err) throw err;
					console.log(err);
					res.send({
						tipo: "success",
						mensaje: 'Se ha eliminado su imagen'
					});
				});
			}
		else
			{
				ArticuloModel.findOneAndUpdate({_id: aux.imagenes.id_articulo}, {$pull : {imagenes : {_id : parseInt(aux.imagenes.id_imagen)}}}, function(err, dato){
					console.log(err);
					console.log(dato);

					fs.unlink(ruta, function (err) {
					if (err) throw err;
						console.log(err);
						res.send({
							tipo: "success",
							mensaje: 'Se ha eliminado su imagen'
						});
					});					

				});
			}

	}else{
    	res.redirect('/');
    }
};



// Prepara la imagen para ser movida a nuestras carpetas
exports.subirImagen = function(req, res){

	// Obtenemos la ruta estatica donde nodejs almacenara la imagen /imagenes/id_user/ventas/id_venta/nombreimagen.xxx
	var ruta_relativa = "/imagenes/"+req.session.auth.facebook.user.username+"/ventas/";
	// Obtenemos la ruta absoluta
	var ruta_absoluta = require('path').dirname(module.parent.filename) + "/public/static" + ruta_relativa;
	// Creamos un nombre inrrepetible  y eliminamos los espacis en el nombre
	var nombre = req.files.imagen.name.insert(0,getDateTime()+"--");
	nombre= nombre.replace(/ /g,"_");
	//Obtenemos la ruta definitiva donde se guargara la imagen
    var path = ruta_absoluta + nombre;
    var vieja_ruta = req.files.imagen.path;
	//Obtenemos al padre de esta ruta articulos.js
    fs.exists(path, function(exists){
    	if (exists){
    		   moverImagen(res, path, ruta_relativa, nombre, vieja_ruta)
    	} else{
    		mkdirp(ruta_absoluta, function(err){
    			moverImagen(res, path, ruta_relativa, nombre, vieja_ruta)
    		});

    	}
    });

};



// Funcion solo para mover la imagen subida de lugar
function moverImagen(res, path, ruta_relativa, nombre, vieja_ruta){
	// Movemos del archivo temporal a la carpeta /public/static/imagenes/id_user/ventas/id_venta/nombreimagen.xxx
	fs.rename(
		vieja_ruta, path,
		function(error) {
			// Si existe un error mandamos el json error con el mensaje
			if(error) {
				res.send({
					error: 'No se pudo subir tu imagen: ' + error
				});
			    return;
			}
			// Enviamos la ruta statica de la imagen xD
			res.send({
				path: ruta_relativa + nombre
			});
		}
	);
}

// --------------------------------Fin de metodos para manegar imagenes--------------------------------------------

//------------- Muestra el formulario para agregar articulos
exports.formularioAgregar = function(req, res){
	if (req.session.auth != undefined){
		res.render('articulos/vender', { title: 'Yo Soy Ventas' });
	}else{
    	res.redirect('/');
    }
};



// Agrega un articulo y lo postea en facebook
exports.agregar = function(req, res){
	if (req.session.auth != undefined){
		var articulo = undefined;
		if (req.body.imagenes != ''){
			var imgs = JSON.parse(req.body.imagenes);
			var articulo = new ArticuloModel({
				_creador: req.session.auth.userId, 
				titulo: req.body.titulo,
				descripcion: req.body.descripcionField,
				descripcion_corta: req.body.descripcion_corta,
				precio: req.body.precio,
				precio_negociable: req.body.precio_negociable,
				local: req.body.local,
				fecha_modificacion: DateNow(),
				tipo_moneda: req.body.tipo_moneda,
				imagenes: imgs.imagenes
			 });
		}else{
			var articulo = new ArticuloModel({ 
				_creador: req.session.auth.userId, 
				titulo: req.body.titulo,
				descripcion: req.body.descripcionField,
				descripcion_corta: req.body.descripcion_corta,
				precio: req.body.precio,
				precio_negociable: req.body.precio_negociable,
				local: req.body.local,
				fecha_modificacion: DateNow(),
				tipo_moneda: req.body.tipo_moneda
			 });
		}
		articulo.save(function (err) {
		  if (err){
			//res.render('articulos/vender', { exito: "No se pudo guardar" });
			res.send({
				tipo: "error",
				from: "add",
				mensaje: "No se pudo guardar"
			});
			}
		  else{
			// Requisitos quien="add" or "edit" que solicita el posteo, user_id, articulo,
			// a donde se va a publicar, y response para poder contestar al cliente
			postFacebook("add", req.session.auth.facebook.user.id, articulo, req.session.auth.facebook.accessToken, "546275092104440", res )
		  	}
		});
		
	}else{
    	res.redirect('/');
    }
};


//Muestra el articulo
exports.mostrarArticulo = function(req, res){
	if (req.session.auth != undefined){
		ArticuloModel.findById(req.params.id_articulo).populate('_creador').execFind( function (err, articulo){
			if (articulo != undefined){
				res.render('articulos/mostrarArticulo', { title: 'Yo Soy Ventas', articulo1: articulo });
			}else{
				res.redirect('/principal');
			}
			
		});
	}
	else{
		res.redirect('/principal');
	}
};

// Muestra el formulario para editar el articulo
exports.editarArticulo = function(req, res){
	if (req.session.auth != undefined){
		ArticuloModel.findById(req.params.id_articulo, function (err, articulo){
			var aux = JSON.stringify(articulo.imagenes)
			res.render('articulos/editarArticulo', { title: 'Yo Soy Ventas', articulo: articulo, imagenes: aux});
		});
	}
	else{
		res.redirect('/principal')
	}
};

//Guarda los cambios hechos
exports.guardaCambiosArticulo = function(req, res){
	if (req.session.auth != undefined){
		var articulo = undefined;
		if (req.body.imagenes != ''){
			var imgs = JSON.parse(req.body.imagenes);
			var articulo = { 
				titulo: req.body.titulo,
				descripcion: req.body.descripcionField,
				descripcion_corta: req.body.descripcion_corta,
				precio: req.body.precio,
				precio_negociable: req.body.precio_negociable,
				local: req.body.local,				
				fecha_modificacion: DateNow(),
				tipo_moneda: req.body.tipo_moneda,
				imagenes: imgs.imagenes
			 };
		}else{
			var articulo = { 
				titulo: req.body.titulo,
				descripcion: req.body.descripcionField,
				descripcion_corta: req.body.descripcion_corta,
				precio: req.body.precio,
				precio_negociable: req.body.precio_negociable,
				local: req.body.local,
				fecha_modificacion: DateNow(),
				tipo_moneda: req.body.tipo_moneda,
			 };
		}
		ArticuloModel.findOneAndUpdate({_id: req.body.idArticuloField}, articulo , function(err, dato){
			console.log(err);
			console.log(dato);
			if (dato.postFaceId != undefined){
				eliminaPostFacebook(req.session.auth.facebook.accessToken, dato.postFaceId);
				postFacebook("edit", req.session.auth.facebook.user.id, dato, req.session.auth.facebook.accessToken, "546275092104440", res )
			}
		});
	}
	else{
		res.redirect('/principal')
	}
};


//Muestra mis articulos
exports.misArticulos = function(req, res){
	if (req.session.auth != undefined){
    ArticuloModel.find({_creador: req.session.auth.userId }).sort({fecha_modificacion: -1}).execFind( function(err,articulos){
        res.render('articulos/misArticulos', { title: 'Yo Soy Ventas', articulos: articulos });
    });
	}
	else{
		res.redirect('/principal')
	}
};


// Elimina un articulo
exports.eliminaArticulo = function(req, res){
	if (req.session.auth != undefined){
		var theUrl = url.parse( req.url );
		var queryObj = queryString.parse( theUrl.query );
		var aux =  queryObj;
		ArticuloModel.findByIdAndRemove(aux.id_articulo, function(err, articulo){
			if(err == undefined){
				for (var name in articulo.imagenes) {
				   var ruta = require('path').dirname(module.parent.filename) + "/public/static" + articulo.imagenes[name].imagen;
					fs.unlink(ruta, function (err) {
						if (err) throw err;
						console.log(err);
					});
				}
				if (articulo.postFaceId != undefined){
					eliminaPostFacebook(req.session.auth.facebook.accessToken, articulo.postFaceId);
				}

				res.send({
					tipo: "success",
					from: "removeArticulo",
					mensaje: 'Se ha eliminado el articulo'
				});
			}
			else{
				res.send({
					tipo: "error",
					from: "removeArticulo",
					mensaje: 'No se pudo eliminar'
				});				
			}

		});
	}
	else{
    	res.redirect('/');
    }
};

// Esta funcion entra en accion cuando el usuario no pertenece al grupo
// O por si alguna razon el articulo no se postea automaticamente esta funcion puede
//Intetnar postear
exports.posteaFace = function(req, res){
	if (req.session.auth != undefined){
		var theUrl = url.parse( req.url );
		var queryObj = queryString.parse( theUrl.query );
		var aux =  queryObj;
		ArticuloModel.findById(aux.id_articulo, function (err, articulo){
			if (articulo != undefined){
				postFacebook("posteaFace" ,req.session.auth.facebook.user.id, articulo, req.session.auth.facebook.accessToken, "546275092104440", res )
			}
			else{
				res.send({
					tipo: "error",
					from: "posteaFace",
					mensaje: 'Tu articulo no existe, verificalo por favor'
				});	
			}
		});
	}
	else{
    	res.redirect('/');
    }
};

// Esta funcion elimina un post de facebook
function eliminaPostFacebook(accessToken, post_id){
	graph.setAccessToken(accessToken);
	graph.del(post_id, function(err, res) {
		console.log(res);
		return res;
	});
}



// Funcion para mandar a publicar a facebook
// Requisitos quien=Funcion que solicita el posteo, user_id, articulo, a donde se va a publicar, y response para poder contestar al cliente
function postFacebook(quien, user_id, articulo, accessToken, to_face, res){
	var titulo_sin_espacios = articulo.titulo.replace(/ /g,"_")
	var crea_link = "http://10.156.97.15:3000/mostrar/"+ articulo.id+"/"+titulo_sin_espacios;
	console.log(articulo);
	var wallPost = {
		caption: articulo.titulo,
		description: articulo.descripcion_corta,
		link: crea_link,
		type: "link",
		from: user_id
	};
	graph.setAccessToken(accessToken);
	graph.post(to_face+"/feed", wallPost, function(err, faceRes) {
		// returns the post id
		// code: 1376025 error no tienes permisos en el grupo
		console.log("------Post return postFacebook----------");
		console.log(faceRes);
		if (faceRes.error != undefined && faceRes.id == undefined){
				if (faceRes.error.code == 1376025){
					res.send({
					  	tipo: "warning",
					  	from: quien,
						mensaje: 'Tu articulo esta guardado pero no tienes permisos para publicar en el grupo de Facebook, por favor ponte en contacto. <a target="_blank" href="https://www.facebook.com/groups/546275092104440/">Ir al grupo</a>'
					});
				}
			}
		else{
				articulo.postFaceId = faceRes.id;
				articulo.save(function (err, articulo, numberAffected) {
					console.log("Se guardo el post id");
				})
				res.send({
					tipo: "success",
					from: quien,
					mensaje: "Tu articulo esta guardado y se ha publicado en el grupo de Facebook."
				});
			}
		});
}


