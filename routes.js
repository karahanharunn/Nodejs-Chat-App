var gravatar = require('gravatar');
var online = {};

var deger ;
var socket2 ;
var temizle = "undefined\":{},";


module.exports = function(app,io){

    app.get('/', function(req, res){

        res.render('home');
    });

    app.get('/create', function(req,res){


        var id = Math.round((Math.random() * 1000000));


        res.redirect('/chat/'+id);
    });

    app.get('/chat/:id', function(req,res){


        res.render('chat');
    });


    var chat = io.on('connection', function (socket) {


        socket.on('load',function(data){

            var room = findClientsSocket(io,data);
            if(room.length === 0 ) {

                socket.emit('peopleinchat', {number: 0});
            }
            else if(room.length === 1) {

                socket.emit('peopleinchat', {
                    number: 1,
                    user: room[0].username,
                    avatar: room[0].avatar,
                    id: data
                });
            }
            else if(room.length >= 2) {

                chat.emit('tooMany', {boolean: true});
            }
        });

        socket.on('login', function(data) {

            var room = findClientsSocket(io, data.id);

            if (room.length < 2) {



                socket.username = data.user;
                socket.room = data.id;
                online[socket.username] = {online:data.id};

                deger =JSON.stringify(online);
                deger=deger.replace(temizle,"");





                socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});


                socket.emit('img', socket.avatar);




                socket.join(data.id);

                if (room.length == 1) {

                    var usernames = [],
                        avatars = [];

                    usernames.push(room[0].username);
                    usernames.push(socket.username);

                    avatars.push(room[0].avatar);
                    avatars.push(socket.avatar);


                    chat.in(data.id).emit('startChat', {
                        boolean: true,
                        id: data.id,
                        users: usernames,
                        avatars: avatars
                    });
                }
            }
            else {
                socket.emit('tooMany', {boolean: true});
            }


        });



        socket.on('disconnect', function() {

            console.log(socket.room);
            delete online[socket.username];
            online[socket.username]={offline:socket.room};
            deger =JSON.stringify(online);
            deger=deger.replace(temizle,"");

            socket.broadcast.to(this.room).emit('leave', {
                boolean: true,
                room: this.room,
                user: this.username,
                avatar: this.avatar
            });



            socket.leave(socket.room);

        });



        socket.on('msg', function(data){


            socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
            socket2=socket.broadcast.to(socket.room);

        });
        var myVar = setInterval(function(){ ekrana_yazdir() }, 15000);

        function ekrana_yazdir()
        {
            console.log(deger);
            socket.emit('usernames', deger);

        }
    });
};

function findClientsSocket(io,roomId, namespace) {
    var res = [],
        ns = io.of(namespace ||"/");

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            }
            else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}
