import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

const roomName = new URLSearchParams(window.location.search).get('room') || 'afterglow-main';

export class MultiplayerClient {
  constructor() {
    this.doc = new Y.Doc();
    this.provider = new WebrtcProvider(roomName, this.doc, {
      password: 'pizza-afterglow',
    });
    this.awareness = this.provider.awareness;
    this.nickname = createNickname();
    this.lastBroadcast = 0;
    this.awareness.setLocalStateField('profile', {
      nickname: this.nickname,
    });
  }

  updateLocalState(localState, elapsedTime) {
    if (elapsedTime - this.lastBroadcast < 1 / 12) {
      return;
    }

    this.lastBroadcast = elapsedTime;
    this.awareness.setLocalState({
      profile: {
        nickname: this.nickname,
      },
      vehicle: localState,
    });
  }

  getRemoteStates() {
    const states = [];

    this.awareness.getStates().forEach((state, clientId) => {
      if (clientId === this.doc.clientID || !state?.vehicle || !state?.profile) {
        return;
      }

      states.push({
        id: String(clientId),
        nickname: state.profile.nickname,
        ...state.vehicle,
      });
    });

    return states;
  }

  getPresenceSummary() {
    return {
      nickname: this.nickname,
      roomName,
      connectedPlayers: this.awareness.getStates().size,
    };
  }
}

function createNickname() {
  const first = ['Moon', 'Warm', 'Mellow', 'Neon', 'Quiet', 'Golden', 'Soft', 'Late'];
  const second = ['Driver', 'Courier', 'Cruiser', 'Glider', 'Rider', 'Roamer', 'Voyager', 'Skylight'];
  const partA = first[Math.floor(Math.random() * first.length)];
  const partB = second[Math.floor(Math.random() * second.length)];
  const digits = Math.floor(100 + Math.random() * 900);
  return `${partA}${partB}${digits}`;
}
