var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Schema
 */
var ArticuloSchema = Schema({
	_creador: { type: Schema.Types.ObjectId, ref: 'UserModel' },
    titulo: String,
    descripcion: String,
    descripcion_corta: String,
    precio: Number,
    tipo_moneda: String,
    precio_negociable: Boolean,
    local: Boolean,
    fecha_creacion: { type: Date, default: Date.now },
    fecha_modificacion: { type: Date, default: Date.now },
    imagenes: {},
    calificacion: [{type: Schema.Types.ObjectId, ref: 'UserModel', calificacion: Boolean}],
    postFaceId: String
});


var ArticuloComentarioSchema = Schema({
	_creador: { type: Schema.Types.ObjectId, ref: 'UserModel' },
	_articulo: { type: Schema.Types.ObjectId, ref: 'ArticuloModel' },
    respuesta: { type: Schema.Types.ObjectId, ref: 'Comentario' },
    comentario: String,
    fecha_creacion: { type: Date, default: Date.now },
    calificacion: [{
                        usuario: {type: Schema.Types.ObjectId, ref: 'UserModel'},
                        calificacion: Boolean
                    }]
});

module.exports = mongoose.model('ArticuloModel', ArticuloSchema);
module.exports = mongoose.model('ArticuloComentarioModel', ArticuloComentarioSchema);