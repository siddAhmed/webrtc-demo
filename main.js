import "./style.css";
import peerConnection from "./config.js";

let pc = peerConnection;

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

async function copyIce(loader, objTobeCopied) {
  await navigator.clipboard.writeText(JSON.stringify(objTobeCopied));
  loader.hidden = true;
  console.log("Done gathering candidates, copied SDP to clipboard.\n");
}

async function checkIceState(event, loader, objTobeCopied) {
  let connection = event.target;

  switch (connection.iceGatheringState) {
    case "gathering":
      console.log("collection of candidates has begun");
      // Not waiting more than 7 seconds for the ice candidates to be generated
      // Either the gathering state will be complete or
      // the timeout will complete candidates will be copied to the clipboard
      setTimeout(() => {
        console.log("Timeout exhausted for ice candidates gathering.");
        copyIce(callLoader, pc.localDescription);
      }, 7000);
      break;
    case "complete":
      copyIce(loader, objTobeCopied);
      break;
  }
}

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
  callInput.disabled = true;

  const offerDescription = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  // when we call setLocalDescription, it automatically starts generating ICE candidtes for our local
  // user. Those candidates cotain IP/PORT pair which we can use to establish a connection
  await pc.setLocalDescription(offerDescription);

  // Get candidates for caller (local peer)
  pc.onicegatheringstatechange = async (ev) => {
    await checkIceState(ev, callLoader, pc.localDescription);
  };

});

answerButton.addEventListener("click", async () => {
  if (!callInput.value) {
    alert("Please enter the SDP offer in the answer input field");
    return;
  }

  addAnswerInput.disabled = true;
  answerLoader.hidden = false;

  let peerOneOffer = JSON.parse(callInput.value);
  pc.setRemoteDescription(new RTCSessionDescription(peerOneOffer));

  // wait for the resolved promise from createAnswer
  // then wait for teh setLocalDescription to set the local description as answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  pc.onicegatheringstatechange = async (event) => {
    await checkIceState(event, answerLoader, answer);
  };
});

addAnswerButton.addEventListener("click", async () => {
  if (!addAnswerInput.value) {
    alert("Please enter the SDP answer to the offer in the input field");
    return;
  }

  console.log("Received offer answer: \n", JSON.parse(addAnswerInput.value));
  const remoteDesc = new RTCSessionDescription(
    JSON.parse(addAnswerInput.value)
  );
  await pc.setRemoteDescription(remoteDesc);
});
