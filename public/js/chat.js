// var connection = new WebSocket("wss://andrushko-test1.herokuapp.com/");
(function() {
    ew.fn.getCurrentUser(function(user) {

        var picture,
            picBase64,
            photoMessage = false,
            _e = getElements(),
            currentUser = user,
            connection = new WebSocket(ew.socket);

        connection.onopen = function() {
            connection.send(JSON.stringify({ action: 'ujoined', userId: 13 }));
        }
        connection.onmessage = function(_message) {
            var m = JSON.parse(_message.data);
            if(m.action !== 'ujoined'){
                chatBox.insertAdjacentHTML('beforeend',
                    templates.chatMessage(m.sender, m.text, m.image)
                );
                _scrollTo(chatAreaScroll, chatAreaScroll.scrollHeight, 1000);
            }
        }
        connection.onclose = function() {
            console.log('connection closed')
        }

        (function eventHandlers() {

            _e.btnSendMessage.addEventListener("click", function() {
                if(!_e.messageText.value && !photoMessage){
                    alert('write text for message before send it');
                    return;
                }

                _e.canvas.getContext('2d')
                         .clearRect(0, 0, canvas.width, canvas.height);
                _e.videoPlayer.style.display = 'none';

                connection.send(
                    JSON.stringify({ 
                        action: 'sendmes', 
                        sender: currentUser,
                        text: _e.messageText.value,
                        image: picBase64
                    })
                );
                photoMessage = false;
                _e.messageText.value = '';
                picBase64 = null;

                show(_e.btnCamera);
                hide(_e.btnCapture, _e.btnCancel, _e.videoPlayer, _e.canvas)
            });

            _e.btnCamera.addEventListener('click', function(event) {
                initializeMedia();

                show(_e.videoPlayer, _e.btnCapture, _e.btnCancel)
                hide(_e.btnCamera, _e.btnSendMessage, _e.btnUploadImg);
            });

            _e.btnCapture.addEventListener('click', function(event) {
                photoMessage = true;

                hide(_e.btnCapture, _e.videoPlayer);
                show(_e.canvas, _e.btnSendMessage, _e.btnCamera, _e.btnUploadImg, _e.btnCancel);

                var ctx = _e.canvas.getContext('2d');
                ctx.clearRect(0, 0, _e.canvas.width, _e.canvas.height);

                var videoHeight = _e.videoPlayer.videoHeight;
                var videoWidth = _e.videoPlayer.videoWidth;
                if(videoWidth > videoHeight){
                    _e.canvas.height = videoHeight / (videoWidth / _e.canvas.width);
                    ctx.drawImage(_e.videoPlayer, 0, 0, _e.canvas.width, _e.canvas.height);
                } else {
                    _e.canvas.width = videoWidth / (videoHeight / _e.canvas.height);
                    ctx.drawImage(_e.videoPlayer, 0, 0, _e.canvas.width, _e.canvas.height);
                }
                picBase64 = _e.canvas.toDataURL('image/jpeg');

                _e.videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
                    track.stop();
                });
            });

            _e.btnUploadImg.addEventListener('click', function(event){ imagePicker.click(); });

            _e.btnCancel.addEventListener('click', function(event){
                photoMessage = false;

                show(_e.btnSendMessage, _e.btnCamera, _e.btnUploadImg);
                hide(_e.btnCapture, _e.btnCancel, _e.canvas, _e.videoPlayer);

                picBase64 = null;
            });

            _e.imagePicker.addEventListener('change', function(event) {
                photoMessage = true;

                //debugger;
                hide(_e.videoPlayer);
                show(_e.canvas, _e.btnCancel);

                picture = event.target.files[0];

                var ctx = _e.canvas.getContext('2d');
                ctx.clearRect(0, 0, _e.canvas.width, _e.canvas.height);

                var img = new Image();
                img.onload = function() {
                    if(img.width > img.height) {
                        _e.canvas.height = img.height / (img.width / _e.canvas.width);
                        ctx.drawImage(img, 0, 0, _e.canvas.width, _e.canvas.height);
                    } else {
                        _e.canvas.width = img.width / (img.height / _e.canvas.height);
                        ctx.drawImage(img, 0, 0, _e.canvas.width, _e.canvas.height);
                    }
                    picBase64 = _e.canvas.toDataURL('image/jpeg');
                }
                img.src = URL.createObjectURL(picture);

            });


            function hide(arr) {
                if(!Array.isArray(arr)) {
                    arr = Array.prototype.slice.call(arguments);
                }
                for (var i = 0; i < arr.length; i++) {
                    if(arr[i].tagName === 'canvas'){
                        var ctx = _e.canvas.getContext('2d');
                        ctx.clearRect(0, 0, _e.canvas.width, _e.canvas.height);
                    }
                    arr[i].style.display = 'none';
                }
            }
            function show(arr) {
                if(!Array.isArray(arr)) {
                    arr = Array.prototype.slice.call(arguments);
                }
                for (var i = 0; i < arr.length; i++) {
                    if(arr[i] === _e.canvas) {
                        _e.canvas.style.display = 'block';
                        _e.canvas.width = _e.canvas.parentElement.clientWidth - 30;
                        _e.canvas.height = _e.canvas.parentElement.clientHeight;
                    } else if(arr[i].tagName === _e.videoPlayer){
                        _e.videoPlayer.style.display = "block";
                    } else {
                        arr[i].style.display = 'inline-block';
                    }
                }
            }
        }());

        

        var templates = {
            chatMessage: function(sender, msgText, msgImageSrc, dateTime) {
                var msgImgHtml = '',
                    dateTimeHtml = `
                        <div class="chat-time">
                            ${dateTime ? dateTime.toLocaleString("uk") : (new Date()).toLocaleString("uk")}
                        </div>
                    `;

                if(msgImageSrc) {
                    msgImgHtml = `<img src="${msgImageSrc}" alt="User Avatar" class="img-msg" />`;
                } 

                return `
                    <li class="left clearfix">
                        <span class="chat-img1 pull-left">
                          <img src="${sender.avatar}" alt="User Avatar" class="img-circle">
                        </span>
                        <div class="chat-body1 clearfix">
                            <p class="message-text" style="display: ${msgText || msgImageSrc ? 'block' : 'none'}">
                                <span class="user-name text-info">${sender.firstName} ${sender.lastName} </span>
                                <span class="msg-txt">${msgText}</span>
                                ${msgImgHtml}
                                ${dateTimeHtml}
                            </p>
                            
                        </div>
                    </li>
                `;
            }
        }

        function getElements() {
            return {
                videoPlayer: document.getElementById('player'),
                btnCapture: document.getElementById('btnCapture'),
                btnCamera: document.getElementById('btnCamera'),
                btnSendMessage: document.getElementById('btnSendMessage'),
                btnCancel: document.getElementById('btnCancel'),
                btnUploadImg: document.getElementById('btnUploadImg'),
                canvas: document.getElementById('canvas'),
                imagePicker: document.getElementById('imagePicker'),
                imagePickWrapper: document.getElementById('imagePickWrapper'),
                messageText: document.getElementById('messageText'),
                chatAreaScroll: document.getElementById('chatAreaScroll')
            }
        }

        function initializeMedia() {
            if (!('mediaDevices' in navigator)) {
                navigator.mediaDevices = {};
            }

            if (!('getUserMedia' in navigator.mediaDevices)) {
                navigator.mediaDevices.getUserMedia = function(constraints) {
                    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                    if (!getUserMedia) {
                        return Promise.reject(new Error('getUserMedia is not implemented!'));
                    }

                    return new Promise(function(resolve, reject) {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            }

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    _e.videoPlayer.srcObject = stream;
                    _e.videoPlayer.style.display = 'block';
                })
                .catch(function(err) {
                    _e.imagePickWrapper.style.display = 'block';
                });
        }

        function _scrollTo(element, to, duration) {
            var start = element.scrollTop,
                change = to - start,
                startDate = +new Date(),
                // t = current time
                // b = start value
                // c = change in value
                // d = duration
            easeInOutQuad = function(t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            },
            animateScroll = function() {
                var currentDate = +new Date();
                var currentTime = currentDate - startDate;
                element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration));
                if(currentTime < duration) {
                    requestAnimationFrame(animateScroll);
                }
                else {
                    element.scrollTop = to;
                }
            };
            animateScroll();
        };
    });
}());