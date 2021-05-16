const socket = io("/");

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});

let videoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
  })
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

let text = document.getElementById('chat_message');

let html = document.querySelector('html');

let ul = document.querySelector('.messages');

html.addEventListener('keydown', (e) => {
    if (e.code === "Enter" && text.value.length !== 0) {
        socket.emit('message', text.value);
        text.value = '';
    }
});

socket.on('createMessage', message => {
    let li = document.createElement('li');
    let b = document.createElement('b');
    b.appendChild(document.createTextNode('user '));
    li.appendChild(b);
    li.appendChild(document.createTextNode(message));
    li.setAttribute('class', 'message');
    ul.append(li);
});

const scrollToBottom = () => {
    let chatWindow = document.querySelector('.main__chat_window');
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
}

const muteUnmute = () => {
    const enabled = videoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        videoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        videoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `

    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `

    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
    let enabled = videoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        videoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        videoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `;

    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `;

  document.querySelector('.main__video_button').innerHTML = html;
};
