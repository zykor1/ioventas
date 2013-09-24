// My SocketStream 0.3 app

var express = require('express')
	, controllers = require('./server/controllers')
	, principal = require('./server/controllers/principal')
	, articulos = require('./server/controllers/articulos')
	, comentarios = require('./server/controllers/comentarios')
	, http = require('http')
	, fs = require('fs')
	, path = require('path')
	, mongoose = require('mongoose')
	, everyauth = require('everyauth')
	, graph = require('fbgraph')
    , ss = require('socketstream');

everyauth.debug = true

/** Connect to database and load models **/
mongoose.connect('mongodb://127.0.0.1/prueba');
var models_path = __dirname + '/server/models';
fs.readdirSync(models_path).forEach(function (file) {
    require(models_path+'/'+file)
});
var UserModel = mongoose.model('UserModel');


/**
 * Social login integration using Facebook
 */
everyauth.everymodule
    .findUserById( function (userId,callback) {
        UserModel.findOne({_id: userId},function(err, user) {
            callback(user, err);
        });
});
// Guardamos datos de facebook
everyauth.facebook
    .appId('555848331151668')
    .appSecret('a4d19d6bba6811ae753c0800a788ba6b')
    .scope('email,user_location,user_photos,publish_actions,user_about_me,user_groups,friends_groups')
    .handleAuthCallbackError( function (req, res) {
        res.send('Error occured');
    })
    .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {

        var promise = this.Promise();
        UserModel.findOne({facebook_id: fbUserMetadata.id},function(err, user) {
            if (err) return promise.fulfill([err]);

            if(user) {

                // user found, life is good
                promise.fulfill(user);

            } else {

                // create new user
                var User = new UserModel({
                    name: fbUserMetadata.name,
                    access_token: accessToken,
                    firstname: fbUserMetadata.first_name,
                    lastname: fbUserMetadata.last_name,
                    email: fbUserMetadata.email,
                    username: fbUserMetadata.username,
                    gender: fbUserMetadata.gender,
                    facebook_id: fbUserMetadata.id,
                    facebook: fbUserMetadata
                });

                User.save(function(err,user) {
                    if (err) return promise.fulfill([err]);
                    promise.fulfill(user);
                });

            }


        });

        return promise;
    })
    .redirectPath('/');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({ keepExtensions: true}));
app.use(express.limit('5mb'));
app.use(express.cookieParser('secret'));
app.use(express.session({ secret: 'viewor' }));
app.use(everyauth.middleware(app));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'client/static')));
app.use(everyauth.middleware(app));
app.use(ss.http.middleware);
app.use(app.router);


ss.client.define('main1', {
	view: 'index.jade',
	css:  ['app.styl', 'libs', 'landing'],
	code: ['libs', 'app'],
	tmpl: '*'
});


// Code Formatters
ss.client.formatters.add(require('ss-jade'));
ss.client.formatters.add(require('ss-stylus'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production') ss.client.packAssets();




app.get('/', controllers.index);
app.get('/principal', principal.index);
// Articulos a la venta
app.get('/vender', articulos.formularioAgregar);
app.post('/vender', articulos.agregar);
app.post('/vender/subirImagen', articulos.subirImagen);
app.get('/eliminaImagen', articulos.eliminaImagen);
app.get('/eliminaArticulo', articulos.eliminaArticulo);
app.get('/posteaFace', articulos.posteaFace);
app.get('/mostrar/:id_articulo/:titulo', articulos.mostrarArticulo);
app.get('/edita/:id_articulo/:titulo', articulos.editarArticulo);
app.post('/edita/guardaCambios', articulos.guardaCambiosArticulo);
app.get('/misArticulos', articulos.misArticulos);
// Comentarios
app.post('/addComentario', comentarios.addComentario);
app.get('/leeComentarios/:id_articulo', comentarios.leeComentarios);
app.get('/eliminaComentario', comentarios.eliminaComentario);
app.get('/calificaComentario', comentarios.calificaComentario);





// Start Console Server (REPL)
// To install client: sudo npm install -g ss-console
// To connect: ss-console <optional_host_or_port>
var consoleServer = require('ss-console')(ss);
consoleServer.listen(5000);

// Start SocketStream
server = app.listen(3000);
ss.start(server);

// Append SocketStream middleware to the stack
app.stack = ss.http.middleware.stack.concat(app.stack);
