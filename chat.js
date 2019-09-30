$(function(){
    var a=0;

    var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);


    var socket = io();


    var name = "",
        email = "",
        img = "",
        friend = "";


    var section = $(".section"),

        footer = $("footer"),
        onConnect = $(".bagli"),
        inviteSomebody = $(".davet-ekrani"),
        personInside = $(".personinside"),
        mesajEkrani = $(".mesajEkrani"),
        users = $(".users"),
        left = $(".left"),
        noMessages = $(".nomessages"),
        fazla_kisi = $(".fazla_kisi"),
        infobagli = $(".infobagli");



    var chatNickname = $(".nickname-chat"),
        leftNickname = $(".nickname-left"),
        girisForm = $(".girisForm"),
        kisi_Ad = $("#kisi_Ad"),
        kisi_ip = $("#kisi_ip"),
        kisi2_Ad = $("#kisi2_Ad"),
        kisi2_ip = $("#kisi2_ip"),
        mesajform = $("#mesajform"),
        textarea = $("#message"),
        messageTimeSent = $(".timesent"),
        chats = $(".chats"),
        asd = $(".asd"),
        users = $(".users");

    var kisi1Resim = $("#kisi1Resim"),
        kisi2Resim = $("#kisi2Resim"),
        resimYok = $("#resimYok");




    socket.on('usernames',function(deger){
        var li = $(
            '<li>'+
            '<h></h>' +
            '</li>');
        var i =0;

        console.log("güncellendi");
        asd.text($.trim(kisi_Ad.val()) + " " + deger);



    });


    socket.on('connect', function(){


        socket.emit('load', id);
        socket.emit('cagir', id);


    });




    socket.on('img', function(data){
        img = data;
    });


    socket.on('peopleinchat', function(data){

        if(data.number === 0){

            showMessage("bagli");

            girisForm.on('submit', function(e){

                e.preventDefault();

                name = $.trim(kisi_Ad.val());

                if(name.length < 1){
                    alert("Kullanıcı adi bir karakterden uzun olmalıdır");
                    return;
                }

                email = kisi_ip.val();



                showMessage("inviteSomebody");

                socket.emit('login', {user: name, avatar: email, id: id});

            });
        }

        else if(data.number === 1) {

            showMessage("personinchat",data);

            girisForm.on('submit', function(e){

                e.preventDefault();

                name = $.trim(kisi2_Ad.val());

                if(name.length < 1){
                    alert("İsminiz 1 Karakterden uzun olmalıdır");
                    return;
                }

                if(name == data.user){
                    alert("Lütfen başka bir isimle giriş yapınız");
                    return;
                }
                email = kisi2_ip.val();


                socket.emit('login', {user: name, avatar: email, id: id});


            });
        }

        else {
            showMessage("fazla_kisi");
        }

    });

    socket.on('startChat', function(data){
        console.log(data);
        if(data.boolean && data.id == id) {

            chats.empty();

            if(name === data.users[0]) {

                showMessage("youStartedChatWithNoMessages",data);
            }
            else {

                showMessage("heStartedChatWithNoMessages",data);
            }

            chatNickname.text(friend);
        }
    });

    socket.on('leave',function(data){

        if(data.boolean && id==data.room){

            showMessage("somebodyLeft", data);
            chats.empty();
        }

    });

    socket.on('tooMany', function(data){

        if(data.boolean && name.length === 0) {

            showMessage('fazla_kisi');
        }
    });

    socket.on('receive', function(data){

        showMessage('chatStarted');

        if(data.msg.trim().length) {


            if(a==0){
                var r = confirm("özel mesajın isteği");
                if (r == true ) {

                    a=1;
                    createChatMessage(data.msg, data.user, data.img, moment());
                    scrollToBottom();

                }else{

                    exit(0);
                }

            }
            else{
                createChatMessage(data.msg, data.user, data.img, moment());
                scrollToBottom();

            }
        }
    });

    textarea.keypress(function(e){


        if(e.which == 13) {
            e.preventDefault();
            mesajform.trigger('submit');
        }

    });

    mesajform.on('submit', function(e){

        e.preventDefault();


        showMessage("chatStarted");

        if(textarea.val().trim().length) {
            createChatMessage(textarea.val(), name, img, moment());
            scrollToBottom();


            socket.emit('msg', {msg: textarea.val(), user: name, img: img});

        }

        textarea.val("");
    });
    girisForm.on('online', function(e){

        socket.emit('cagir');

    });






    function createChatMessage(msg,user,imgg,now){

        var who = '';

        if(user===name) {
            who = 'me';
        }
        else {
            who = 'you';
        }

        var li = $(
            '<li class=' + who + '>'+
            '<div class="image">' +
            '<img src=' + imgg + ' />' +
            '<b></b>' +
            '<i class="timesent" data-time=' + now + '></i> ' +
            '</div>' +
            '<p></p>' +
            '</li>');


        li.find('p').text(msg);
        li.find('b').text(user);

        chats.append(li);

    }

    function scrollToBottom(){
        $("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
    }

    function isValid(thatemail) {

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(thatemail);
    }

    function showMessage(status,data){

        if(status === "bagli"){

            section.children().css('display', 'none');
            onConnect.fadeIn(1200);
        }

        else if(status === "inviteSomebody"){


            $("#link").text(window.location.href);

            onConnect.fadeOut(1200, function(){
                inviteSomebody.fadeIn(1200);
            });
        }

        else if(status === "personinchat"){

            onConnect.css("display", "none");
            personInside.fadeIn(1200);

            chatNickname.text(data.user);
            kisi1Resim.attr("src",data.avatar);
        }

        else if(status === "youStartedChatWithNoMessages") {

            left.fadeOut(1200, function() {
                inviteSomebody.fadeOut(1200,function(){
                    noMessages.fadeIn(1200);
                    footer.fadeIn(1200);
                });
            });

            friend = data.users[1];
            resimYok.attr("src",data.avatars[1]);
        }

        else if(status === "heStartedChatWithNoMessages") {

            personInside.fadeOut(1200,function(){
                noMessages.fadeIn(1200);
                footer.fadeIn(1200);
            });

            friend = data.users[0];
            resimYok.attr("src",data.avatars[0]);
        }

        else if(status === "chatStarted"){

            section.children().css('display','none');
            mesajEkrani.css('display','block');
        }

        else if(status === "somebodyLeft"){

            kisi2Resim.attr("src",data.avatar);
            leftNickname.text(data.user);

            section.children().css('display','none');
            footer.css('display', 'none');
            left.fadeIn(1200);
        }

        else if(status === "fazla_kisi") {

            section.children().css('display', 'none');
            fazla_kisi.fadeIn(1200);
        }
        else if(status === "fazla_kisi") {

            section.children().css('display', 'none');
            fazla_kisi.fadeIn(1200);
        }
    }

});

