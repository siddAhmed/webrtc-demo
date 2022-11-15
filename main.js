import "./style.css";

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};

// Global states
// the actual peer connection object which emits events & generates ice candidates
let pc = new RTCPeerConnection(servers);

let localStream = null;
let remoteStream = null;

const webcamButton = document.getElementById("webcamButton");
const webcamVideo = document.getElementById("webcamVideo");
const callButton = document.getElementById("callButton");
const callInput = document.getElementById("callInput");
const answerButton = document.getElementById("answerButton");
const remoteVideo = document.getElementById("remoteVideo");
const addAnswerButton = document.getElementById("addAnswerButton");
const stateButton = document.getElementById("stateButton");
const connectionText = document.getElementById("connectionText");
const callLoader = document.getElementById("call-loader");
const answerLoader = document.getElementById("answer-loader");

async function checkRTCState(event, loader, objTobeCopied) {
  // event.candidate makes sure that the candidate exists
  if (
    event &&
    event.target &&
    event.target.iceGatheringState === "complete"
  ) 
  {
    await navigator.clipboard.writeText(JSON.stringify(objTobeCopied));
    loader.hidden = true;
    alert(
      "Done gathering candidates.\n" +
      "The offer/answer has been copied to your clipboard.\n" +
      "Paste it into the other peer's respective field"
    );
  } else if (event && event.candidate == null) {
    console.log("got null candidate");
  } else {
    console.log(event.target.iceGatheringState, event);
  }
};

stateButton.addEventListener("click", () => {
  connectionText.innerText = pc.connectionState;
});

webcamButton.onclick = async () => {
  // when the user grants permission, this promise will resolve to a MediaStream object
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  remoteStream = new MediaStream();

  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  // ontrack event is triggered when the other peer adds a track to the stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  webcamButton.disabled = true;
  callButton.disabled = false;
  answerButton.disabled = false;
  addAnswerButton.disabled = false;
};

callButton.addEventListener("click", async () => {
  callLoader.hidden = false;
  const offerDescription = await pc.createOffer();
  // when we call setLocalDescription, it automatically starts generating ICE candidtes for our local
  // user. Those candidates cotain IP/PORT pair which we can use to establish a connection
  await pc.setLocalDescription(offerDescription);

  // Get candidates for caller (local peer)
  pc.onicecandidate = async (event) => {
    await checkRTCState(event, callLoader, pc.localDescription);
  };
});

answerButton.addEventListener("click", async () => {
  answerLoader.hidden = false;
  let peerOneOffer = JSON.parse(callInput.value);
  pc.setRemoteDescription(new RTCSessionDescription(peerOneOffer));

  // wait for the resolved promise from createAnswer
  // then wait for teh setLocalDescription to set the local description as answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer)

  pc.onicecandidate = async (event) => {
    await checkRTCState(event, answerLoader, answer);
  };
});

addAnswerButton.addEventListener("click", async () => {
  console.log("Received offer answer: \n", JSON.parse(addAnswerInput.value));
  const remoteDesc = new RTCSessionDescription(
    JSON.parse(addAnswerInput.value)
  );
  await pc.setRemoteDescription(remoteDesc);
});
