// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 1 / 4
//  Styles · DOM refs · State · Helpers · Auth · Socket Init
// ════════════════════════════════════════════════════════════════════════════

/* ── Inject CSS for new features ─────────────────────────────────────────── */
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
/* ── Reply preview bar ─── */
.reply-preview-bar{display:flex;align-items:center;gap:10px;padding:8px 14px;
  background:#162130;border-top:1px solid #223045;border-left:3px solid #00bfa5;animation:fadeIn .15s}
.reply-preview-bar .rp-content{flex:1;min-width:0}
.reply-preview-bar .rp-name{font-size:12px;font-weight:700;color:#00bfa5}
.reply-preview-bar .rp-text{font-size:12px;color:#6a8098;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reply-preview-bar .rp-close{width:28px;height:28px;border-radius:50%;border:none;background:transparent;
  color:#6a8098;font-size:16px;cursor:pointer;flex-shrink:0}
/* ── Reply quote in bubble ─── */
.reply-quote{background:rgba(0,0,0,.25);border-left:3px solid #00bfa5;border-radius:6px;
  padding:5px 9px;margin-bottom:5px;cursor:pointer}
.reply-quote-name{font-size:11px;font-weight:700;color:#00bfa5;margin-bottom:2px}
.reply-quote-text{font-size:12px;color:#aabbcc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* ── Reactions ─── */
.msg-reactions{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.message-row.in .msg-reactions{justify-content:flex-start}
.message-row.out .msg-reactions{justify-content:flex-end}
.reaction-pill{display:flex;align-items:center;gap:3px;background:#1f2e40;border:1px solid #2a3d56;
  border-radius:99px;padding:2px 7px;font-size:13px;cursor:pointer;transition:background .12s;user-select:none}
.reaction-pill:hover{background:#2a3d56}
.reaction-pill .r-count{font-size:11px;color:#6a8098}
.reaction-pill.my-reaction{border-color:#00bfa5;background:rgba(0,191,165,.12)}
/* ── Reaction picker popup ─── */
.reaction-picker-popup{position:fixed;z-index:600;background:#1a2433;border:1px solid #2a3d56;
  border-radius:14px;padding:8px;display:flex;gap:4px;box-shadow:0 4px 24px rgba(0,0,0,.5)}
.reaction-picker-popup span{font-size:22px;cursor:pointer;transition:transform .12s;border-radius:50%;
  width:38px;height:38px;display:flex;align-items:center;justify-content:center}
.reaction-picker-popup span:hover{transform:scale(1.3);background:#223045}
/* ── Voice recording ─── */
.voice-record-btn{width:42px;height:42px;border-radius:50%;border:none;background:transparent;
  color:#6a8098;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:color .15s}
.voice-record-btn:hover{color:#d8e4f0}
.voice-record-btn.recording{color:#e53e3e;animation:recPulse 1s ease-in-out infinite}
@keyframes recPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
.recording-bar{display:flex;align-items:center;gap:10px;padding:8px 14px;background:#1a0a0a;
  border-top:1px solid #3d1a1a;color:#fc8181;flex-shrink:0}
.recording-timer{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;min-width:40px}
.recording-cancel{padding:5px 12px;background:transparent;border:1px solid #3d2020;border-radius:6px;
  color:#fc8181;font-size:12px;cursor:pointer}
.recording-send{padding:5px 14px;background:#e53e3e;border:none;border-radius:6px;
  color:#fff;font-size:12px;font-weight:700;cursor:pointer;margin-left:auto}
/* ── Video record btn ─── */
.video-note-btn{width:42px;height:42px;border-radius:50%;border:none;background:transparent;
  color:#6a8098;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:color .15s}
.video-note-btn:hover{color:#d8e4f0}
/* ── Audio message ─── */
.msg-audio{width:220px;max-width:100%;height:36px;accent-color:#00bfa5;display:block;margin:4px 0}
/* ── Video note (circular) ─── */
.msg-video-note{width:180px;height:180px;border-radius:50%;overflow:hidden;object-fit:cover;display:block;cursor:pointer}
/* ── Media preview overlay ─── */
.media-preview-overlay{position:fixed;inset:0;z-index:960;background:rgba(0,0,0,.92);
  display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
.media-preview-topbar{width:100%;display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;background:rgba(0,0,0,.5)}
.media-preview-topbar h3{font-size:15px;font-weight:600;color:#fff}
.mpo-close{background:rgba(255,255,255,.1);border:none;color:#fff;font-size:18px;cursor:pointer;
  width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.mpo-close:hover{background:rgba(255,255,255,.2)}
.media-preview-canvas-wrap{flex:1;display:flex;align-items:center;justify-content:center;
  width:100%;padding:8px;overflow:hidden}
.media-preview-canvas-wrap canvas{max-width:100%;max-height:calc(100vh - 200px);border-radius:8px;touch-action:none}
.media-preview-tools{display:flex;align-items:center;gap:8px;padding:10px 16px;
  background:rgba(0,0,0,.6);border-radius:12px;margin:6px}
.mpt-btn{width:36px;height:36px;border-radius:50%;border:2px solid transparent;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:15px;background:rgba(255,255,255,.08);color:#fff;
  transition:all .12s}
.mpt-btn:hover{background:rgba(255,255,255,.18)}
.mpt-btn.active{border-color:#fff;background:rgba(255,255,255,.2)}
.mpt-color{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;
  transition:transform .12s,border-color .12s;flex-shrink:0}
.mpt-color:hover{transform:scale(1.15)}
.mpt-color.active{border-color:#fff;transform:scale(1.15)}
.mpt-sep{width:1px;height:26px;background:#2a3d56;margin:0 3px}
.media-preview-footer{width:100%;display:flex;align-items:center;gap:10px;padding:10px 16px;
  background:rgba(0,0,0,.5)}
.media-preview-caption{flex:1;max-width:480px;background:#1a2433;border:1px solid #223045;
  border-radius:8px;padding:9px 13px;color:#d8e4f0;font-size:14px;outline:none;font-family:var(--font)}
.media-preview-send{padding:10px 24px;background:#00bfa5;border:none;border-radius:8px;
  color:#000;font-size:14px;font-weight:700;cursor:pointer;transition:filter .15s;white-space:nowrap}
.media-preview-send:hover{filter:brightness(1.1)}
/* ── File preview modal ─── */
.file-preview-modal{position:fixed;inset:0;z-index:960;background:rgba(0,0,0,.82);
  display:flex;align-items:center;justify-content:center}
.file-preview-card{background:#131b24;border:1px solid #223045;border-radius:16px;
  padding:28px;width:340px;max-width:95vw;text-align:center}
.file-preview-icon{font-size:52px;margin-bottom:12px}
.file-preview-name{font-size:14px;font-weight:600;margin-bottom:4px;word-break:break-all;color:#d8e4f0}
.file-preview-size{font-size:12px;color:#6a8098;margin-bottom:18px}
.fpc-btns{display:flex;gap:12px;justify-content:center}
.fpc-cancel{padding:10px 20px;background:transparent;border:1px solid #223045;border-radius:8px;
  color:#d8e4f0;cursor:pointer;font-size:13px}
.fpc-send{padding:10px 20px;background:#00bfa5;border:none;border-radius:8px;
  color:#000;font-size:13px;font-weight:700;cursor:pointer}
/* ── Forward modal ─── */
.forward-modal-overlay{position:fixed;inset:0;z-index:920;background:rgba(0,0,0,.75);
  display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px)}
.forward-modal-card{background:#131b24;border:1px solid #223045;border-radius:16px;
  padding:22px;width:400px;max-width:95vw;max-height:88vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.6)}
/* ── Chat theme full-app (header + footer + body) ─── */
[data-chat-theme="ocean"] .chat-header,
[data-chat-theme="ocean"] .input-bar,
[data-chat-theme="ocean"] .reply-preview-bar,
[data-chat-theme="ocean"] .recording-bar{background:#051e2e;border-color:#0a4060}
[data-chat-theme="ocean"] .messages-area{--out-bg:#062a3d;--accent:#0a9dcc}
[data-chat-theme="sunset"] .chat-header,
[data-chat-theme="sunset"] .input-bar,
[data-chat-theme="sunset"] .reply-preview-bar,
[data-chat-theme="sunset"] .recording-bar{background:#2a0e04;border-color:#4a2010}
[data-chat-theme="sunset"] .messages-area{--out-bg:#3d1a06;--accent:#e8622e}
[data-chat-theme="forest"] .chat-header,
[data-chat-theme="forest"] .input-bar,
[data-chat-theme="forest"] .reply-preview-bar,
[data-chat-theme="forest"] .recording-bar{background:#051a05;border-color:#0a3010}
[data-chat-theme="forest"] .messages-area{--out-bg:#0a2a0a;--accent:#2ecc71}
[data-chat-theme="midnight"] .chat-header,
[data-chat-theme="midnight"] .input-bar,
[data-chat-theme="midnight"] .reply-preview-bar,
[data-chat-theme="midnight"] .recording-bar{background:#0f0520;border-color:#2a1050}
[data-chat-theme="midnight"] .messages-area{--out-bg:#1a0a2e;--accent:#9b59b6}
[data-chat-theme="rose"] .chat-header,
[data-chat-theme="rose"] .input-bar,
[data-chat-theme="rose"] .reply-preview-bar,
[data-chat-theme="rose"] .recording-bar{background:#1a0408;border-color:#3d0a18}
[data-chat-theme="rose"] .messages-area{--out-bg:#2a060f;--accent:#e91e8c}
/* ── Live location in bubble ─── */
.live-loc-wrap{min-width:230px}
.live-loc-map-el{width:100%;height:145px;border-radius:8px;overflow:hidden;margin-bottom:6px;background:#0d1a2a}
.live-loc-map-el iframe{width:100%;height:100%;border:none;display:block}
.live-loc-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(0,191,165,.2);
  color:#00bfa5;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700;margin-bottom:4px}
.live-loc-badge-dot{width:6px;height:6px;border-radius:50%;background:#00bfa5;
  animation:recPulse 1s infinite}
.live-loc-timer{font-size:11px;color:#6a8098;margin-top:3px}
/* ── Swipe-to-reply hint arrow ─── */
.reply-arrow-hint{position:absolute;left:-34px;top:50%;transform:translateY(-50%);
  width:26px;height:26px;border-radius:50%;background:#00bfa5;
  display:flex;align-items:center;justify-content:center;color:#000;font-size:13px;
  opacity:0;transition:opacity .2s;pointer-events:none}
.message-row{position:relative}
/* ── Mobile input bar always visible ─── */
@media(max-width:768px){
  .messages-area{display:flex;flex-direction:column;overflow:hidden}
  .messages-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .input-bar{flex-shrink:0;position:relative;bottom:0;z-index:3}
  .reply-preview-bar{flex-shrink:0}
  .recording-bar{flex-shrink:0}
}
/* ── Mini Call PiP with local video ─── */
.mini-call-pip{position:fixed;bottom:90px;right:18px;z-index:900;width:360px;
  background:#0d1a2a;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.7);
  cursor:move;border:1px solid #223045}
.mini-pip-remote{width:100%;height:120px;background:#000;position:relative}
.mini-pip-remote video{width:100%;height:100%;object-fit:cover;display:block}
.mini-pip-local{position:absolute;bottom:6px;right:6px;width:50px;height:50px;
  border-radius:10px;overflow:hidden;border:2px solid #00bfa5;background:#000;z-index:2}
.mini-pip-local video{width:100%;height:100%;object-fit:cover;display:block}
.mini-pip-local-avatar{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  background:#1a2433;font-size:18px;color:#d8e4f0}
.mini-pip-info{padding:6px 10px;display:flex;align-items:center;justify-content:space-between}
.mini-pip-actions{display:flex;gap:6px;padding:0 8px 8px}
.mini-pip-btn{flex:1;padding:6px;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer}
.mini-pip-expand{background:#1a2e40;color:#d8e4f0}
.mini-pip-end-btn{background:#e53e3e;color:#fff}
/* ── Hold call overlay ─── */
.hold-overlay{position:absolute;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;
  justify-content:center;flex-direction:column;gap:8px;z-index:10;border-radius:inherit}
.hold-overlay-text{color:#fff;font-size:14px;font-weight:700}
.hold-overlay-sub{color:#aaa;font-size:12px}
/* ── Active call local video pip ─── */
#localVideoWrap{position:absolute;bottom:80px;right:16px;width:90px;height:120px;
  border-radius:12px;overflow:hidden;border:2px solid #00bfa5;background:#000;z-index:5;cursor:move}
#localVideoWrap video{width:100%;height:100%;object-fit:cover;display:block}
`;
  document.head.appendChild(s);
})();

/* ── DOM refs ─────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const authScreen=$('authScreen'),loginForm=$('loginForm'),registerForm=$('registerForm');
const loginEmail=$('loginEmail'),loginPassword=$('loginPassword'),loginBtn=$('loginBtn'),loginError=$('loginError');
const regUsername=$('regUsername'),regEmail=$('regEmail'),regPassword=$('regPassword'),registerBtn=$('registerBtn'),registerError=$('registerError');
const appContainer=$('appContainer'),myAvatarEl=$('myAvatarEl'),myUsernameLabel=$('myUsernameLabel');
const chatList=$('chatList'),searchInput=$('searchInput');
const chatEmptyState=$('chatEmptyState'),chatHeader=$('chatHeader');
const chatHeaderAvatar=$('chatHeaderAvatar'),chatHeaderName=$('chatHeaderName'),chatHeaderStatus=$('chatHeaderStatus');
const messagesArea=$('messagesArea'),messagesList=$('messagesList');
const typingBar=$('typingBar'),typingText=$('typingText');
const inputBar=$('inputBar'),messageInput=$('messageInput'),sendBtn=$('sendBtn');
const attachBtn=$('attachBtn'),fileInput=$('fileInput'),cameraInput=$('cameraInput'),backBtn=$('backBtn');
const inputAttachMenu=$('inputAttachMenu');
const attachFileOpt=$('attachFileOpt'),attachCameraOpt=$('attachCameraOpt');
const attachLocationOpt=$('attachLocationOpt'),attachContactOpt=$('attachContactOpt');
const chatInfoBtn=$('chatInfoBtn');
const headerAudioCallBtn=$('headerAudioCallBtn'),headerVideoCallBtn=$('headerVideoCallBtn');
const headerGroupAudioCallBtn=$('headerGroupAudioCallBtn'),headerGroupVideoCallBtn=$('headerGroupVideoCallBtn');
const addToCallBtn=$('addToCallBtn');
const incomingCallScreen=$('incomingCallScreen'),incomingCallerName=$('incomingCallerName');
const incomingAvatarEl=$('incomingAvatarEl'),incomingCallType=$('incomingCallType');
const acceptCallBtn=$('acceptCallBtn'),acceptVideoCallBtn=$('acceptVideoCallBtn'),rejectCallBtn=$('rejectCallBtn');
const incomingOnCallBanner=$('incomingOnCallBanner'),iocAvatar=$('iocAvatar'),iocName=$('iocName'),iocType=$('iocType');
const iocDecline=$('iocDecline'),iocHoldAccept=$('iocHoldAccept'),iocCutAccept=$('iocCutAccept');
const outgoingCallScreen=$('outgoingCallScreen'),outgoingCallerName=$('outgoingCallerName');
const outgoingAvatarEl=$('outgoingAvatarEl'),outgoingCallTypeLabel=$('outgoingCallTypeLabel'),cancelOutgoingBtn=$('cancelOutgoingBtn');
const activeCallScreen=$('activeCallScreen'),callVideoArea=$('callVideoArea');
const audioCallDisplay=$('audioCallDisplay'),audioCallAvatar=$('audioCallAvatar'),audioCallName=$('audioCallName');
const callDuration=$('callDuration'),remoteVideosGrid=$('remoteVideosGrid'),localVideo=$('localVideo');
const aCallMuteBtn=$('aCallMuteBtn'),aCallVideoBtn=$('aCallVideoBtn');
const aCallMinimizeBtn=$('aCallMinimizeBtn'),aCallAddBtn=$('aCallAddBtn'),activeEndCallBtn=$('activeEndCallBtn');
const camFlipBtn=$('camFlipBtn');
const miniCallPip=$('miniCallPip'),miniPipName=$('miniPipName'),miniPipDur=$('miniPipDur');
const miniPipAvatar=$('miniPipAvatar'),miniRemoteVideo=$('miniRemoteVideo');
const miniPipExpand=$('miniPipExpand'),miniPipEnd=$('miniPipEnd');
const newGroupBtn=$('newGroupBtn'),newGroupModal=$('newGroupModal'),closeGroupModal=$('closeGroupModal');
const groupNameInput=$('groupNameInput'),groupMembersList=$('groupMembersList'),createGroupBtn=$('createGroupBtn');
const addToCallModal=$('addToCallModal'),closeAddToCallModal=$('closeAddToCallModal'),addToCallList=$('addToCallList');
const newChatBtn=$('newChatBtn'),newChatModal=$('newChatModal'),closeNewChatModal=$('closeNewChatModal');
const newChatEmailInput=$('newChatEmailInput'),newChatSearchBtn=$('newChatSearchBtn');
const userSearchResult=$('userSearchResult'),contactsListModal=$('contactsListModal');
const liveLocationModal=$('liveLocationModal'),closeLiveLocModal=$('closeLiveLocModal');
const locationMapContainer=$('locationMapContainer'),locLoadingMsg=$('locLoadingMsg');
const locInfoBar=$('locInfoBar'),locSpeed=$('locSpeed'),locHeading=$('locHeading'),locAccuracy=$('locAccuracy');
const sendLiveLocBtn=$('sendLiveLocBtn');
const panelStatus=$('panelStatus'),myStatusAvatar=$('myStatusAvatar'),myStatusSub=$('myStatusSub');
const statusAddPlusBtn=$('statusAddPlusBtn'),statusContactsList=$('statusContactsList'),statusEmptyHint=$('statusEmptyHint');
const statusViewerModal=$('statusViewerModal'),svProgressBar=$('svProgressBar'),svAvatar=$('svAvatar');
const svName=$('svName'),svTime=$('svTime'),svCloseBtn=$('svCloseBtn'),svContent=$('svContent');
const svViews=$('svViews'),svViewCount=$('svViewCount'),svReactions=$('svReactions');
const svReactBtn=$('svReactBtn'),svEmojiPicker=$('svEmojiPicker'),svTapPrev=$('svTapPrev'),svTapNext=$('svTapNext');
const createStatusModal=$('createStatusModal'),closeCreateStatus=$('closeCreateStatus');
const statusTextSection=$('statusTextSection'),statusPhotoSection=$('statusPhotoSection');
const statusTextInput=$('statusTextInput'),statusTextPreview=$('statusTextPreview');
const statusPhotoInput=$('statusPhotoInput'),statusPhotoPreview=$('statusPhotoPreview'),spuPlaceholder=$('spuPlaceholder');
const statusCaptionInput=$('statusCaptionInput'),postStatusBtn=$('postStatusBtn');
const statusViewersModal=$('statusViewersModal'),closeViewersModal=$('closeViewersModal'),statusViewersList=$('statusViewersList');
const contextMenu=$('contextMenu');
const settingsLogout=$('settingsLogout'),settingsProfile=$('settingsProfile');
const settingsAccount=$('settingsAccount'),settingsPrivacy=$('settingsPrivacy');
const subProfile=$('subProfile'),subAccount=$('subAccount'),subPrivacy=$('subPrivacy');
const profileBigAvatar=$('profileBigAvatar'),changePhotoBtn=$('changePhotoBtn'),profilePicInput=$('profilePicInput');
const profileNameInput=$('profileNameInput'),profileAboutInput=$('profileAboutInput'),profilePhoneInput=$('profilePhoneInput');
const saveProfileBtn=$('saveProfileBtn');
const twoStepToggle=$('twoStepToggle'),twoStepPinRow=$('twoStepPinRow'),twoStepPinInput=$('twoStepPinInput'),saveTwoStepBtn=$('saveTwoStepBtn');
const newEmailInput=$('newEmailInput'),changeEmailCurPass=$('changeEmailCurPass'),changeEmailBtn=$('changeEmailBtn');
const curPassInput=$('curPassInput'),newPassInput=$('newPassInput'),changePassBtn=$('changePassBtn');
const deleteAccountBtn=$('deleteAccountBtn');
const privLastSeen=$('privLastSeen'),privProfilePic=$('privProfilePic'),privAbout=$('privAbout');
const privGroupAdd=$('privGroupAdd'),liveLocToggle=$('liveLocToggle'),savePrivacyBtn=$('savePrivacyBtn');
const profileInfoPanel=$('profileInfoPanel'),pipCloseBtn=$('pipCloseBtn'),pipHeaderTitle=$('pipHeaderTitle');
const pipHeroAvatar=$('pipHeroAvatar'),pipHeroName=$('pipHeroName'),pipHeroStatus=$('pipHeroStatus');
const pipRowPhone=$('pipRowPhone'),pipPhoneVal=$('pipPhoneVal'),pipEmailVal=$('pipEmailVal');
const pipRowAbout=$('pipRowAbout'),pipAboutVal=$('pipAboutVal');
const pipShareContactBtn=$('pipShareContactBtn'),pipBlockBtn=$('pipBlockBtn'),pipBlockLabel=$('pipBlockLabel');
const pipMediaGrid=$('pipMediaGrid'),pipMediaCount=$('pipMediaCount'),pipNoMedia=$('pipNoMedia');
const pipGroupsCard=$('pipGroupsCard'),pipGroupsList=$('pipGroupsList');
const pipDMSelect=$('pipDMSelect'),pipDMHint=$('pipDMHint');
const pipThemeRow=$('pipThemeRow'),pipLockToggle=$('pipLockToggle'),pipLockPinWrap=$('pipLockPinWrap');
const pipLockPinInput=$('pipLockPinInput'),pipSaveLockBtn=$('pipSaveLockBtn');
const pipExportBtn=$('pipExportBtn'),pipClearBtn=$('pipClearBtn');
const lockedChatScreen=$('lockedChatScreen'),lockedChatPinInput=$('lockedChatPinInput');
const lockedChatPinError=$('lockedChatPinError'),lockedChatUnlockBtn=$('lockedChatUnlockBtn');
const desktopTabBar=$('desktopTabBar'),mobileBottomNav=$('mobileBottomNav');
const sidebarEl=$('sidebarEl'),mainArea=$('mainArea');
const panelChats=$('panelChats'),panelCalls=$('panelCalls'),panelSettings=$('panelSettings');
const callHistoryList=$('callHistoryList');

/* ── State ───────────────────────────────────────────────────────────────── */
let socket=null,myUser=null,myToken=null,activeChat=null;
let allUsersMap={},groups={},contacts={},chats={};
let localStream=null,isMuted=false,isVideoOff=false;
let currentCallType='audio',currentCallPeers=[],callSeconds=0,callTimer=null;
let currentCallRoomId=null,isGroupCall=false,currentGroupCallId=null,isCallMinimized=false;
let contextMsgId=null,contextMsgObj=null,typingTimer=null,isTypingSent=false;
let currentFacingMode='user';
let currentUserLoc=null,liveLocDuration=0,liveLocWatchId=null,liveMsgId=null;
let pendingIncomingCaller=null,pendingIncomingCallType='audio',pendingIncomingRoomId=null;
let activePipUser=null;
let statusBgColor='#0d3d35',statusType='text';
let currentStatusList=[],currentStatusUserIdx=0,currentStatusItemIdx=0,statusTimer=null;
// FIXED: lockedChats now persists via sessionStorage
let lockedChats={};
let replyToMsg=null;
let mediaRecorder=null,audioChunks=[],isRecordingVoice=false,recTimerInterval=null,recSeconds=0;
let videoRecorder=null,videoChunks=[],isRecordingVideo=false;
let liveLocMapInstances={};
let liveLocStartTimes={};
let liveLocTimerIntervals={};
let activeReactionPicker=null;
// FIXED: hold call state
let heldCallPeer=null,heldCallType='audio',heldCallRoomId=null;
let isCallOnHold=false;
const typingUsers=new Set();
const peerConnections={},iceCandidateQueue={},pendingOffers={};
let liveMapInstance=null,liveMarker=null;

/* ── Load lockedChats from sessionStorage (persists in tab, cleared on close) */
try {
  const saved = sessionStorage.getItem('unlockedChats');
  if (saved) lockedChats = JSON.parse(saved);
} catch {}

function saveUnlockedChats() {
  try { sessionStorage.setItem('unlockedChats', JSON.stringify(lockedChats)); } catch {}
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const genId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const getInitial=n=>(n||'?')[0].toUpperCase();
function getAvatarColor(name){
  const c=['#00A884','#1565C0','#6A1B9A','#AD1457','#00838F','#2E7D32','#E65100'];
  let h=0;for(const ch of(name||''))h=ch.charCodeAt(0)+((h<<5)-h);
  return c[Math.abs(h)%c.length];
}
const nowStr=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const isoToTime=iso=>iso?new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
function formatLastSeen(iso){
  if(!iso)return'online';
  const d=new Date(iso),diff=Date.now()-d;
  if(diff<60000)return'last seen just now';
  if(diff<3600000)return'last seen '+Math.floor(diff/60000)+'m ago';
  if(diff<86400000)return'last seen today at '+isoToTime(iso);
  return'last seen '+d.toLocaleDateString();
}
const chatKey=(type,id)=>type==='private'?`p:${id}`:`g:${id}`;
function ensureChat(key){if(!chats[key])chats[key]={messages:[],unread:0,lastMsg:'',lastTime:''};}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function formatSize(b){if(!b)return'';if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(1)+' MB';}
const fmtDuration=s=>{if(!s)return'0s';const m=Math.floor(s/60);return m>0?`${m}m ${s%60}s`:`${s}s`;};
function makeAvatarHtml(u,size=48,fontSize=19){
  const url=u?.avatar_url||u?.profile_pic||u?.avatarUrl;
  const color=u?.avatar_color||getAvatarColor(u?.username||'?');
  const content=url?`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:getInitial(u?.username||'?');
  return `<div class="chat-item-avatar" style="width:${size}px;height:${size}px;font-size:${fontSize}px;${url?'':'background:'+color+';'}">${content}</div>`;
}
function setAvatarEl(el,u){
  const url=u?.avatar_url||u?.profile_pic||u?.avatarUrl;
  if(url){el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;el.style.background='';}
  else{el.textContent=getInitial(u?.username||'?');el.style.background=u?.avatar_color||getAvatarColor(u?.username||'?');}
}
async function api(method,path,body){
  const opts={method,headers:{'Content-Type':'application/json'}};
  if(myToken)opts.headers['Authorization']='Bearer '+myToken;
  if(body)opts.body=JSON.stringify(body);
  const r=await fetch(path,opts);
  const data=await r.json();
  if(!r.ok)throw new Error(data.error||'Request failed');
  return data;
}
function showToast(msg){
  const t=document.createElement('div');t.className='toast';t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add('show'),10);
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300);},3000);
}
function normaliseMsg(msg){
  return{
    id:msg.id,from:msg.from||msg.sender_name,to:msg.to,groupId:msg.groupId||msg.group_id,
    content:msg.content||null,msgType:msg.msgType||msg.msg_type||'text',
    fileUrl:msg.fileUrl||msg.file_path||null,fileName:msg.fileName||msg.file_name||null,
    fileSize:msg.fileSize||msg.file_size||null,fileType:msg.fileType||msg.file_type||null,
    time:msg.time||msg.created_at||new Date().toISOString(),
    status:msg.status||msg.msg_status||'sent',is_edited:msg.is_edited||false,
    reactions:msg.reactions||[],
    reply_to:msg.reply_to||(msg.replyToId?{id:msg.replyToId}:null),
    replyToId:msg.replyToId||msg.reply_to_id||null
  };
}
function updateMsgStatus(msgId,status){
  const t=$(`ticks-${msgId}`);if(t){t.innerHTML=ticksHTML(status);if(status==='seen')t.classList.add('seen');}
}
function ticksHTML(s){if(s==='sent')return'✓';if(s==='delivered'||s==='seen')return'✓✓';return'';}
const activeChatKey=()=>activeChat?chatKey(activeChat.type,activeChat.id):null;
const DEFAULT_ICE_SERVERS=[
  {urls:'stun:stun.l.google.com:19302'},
  {urls:'stun:stun1.l.google.com:19302'},
  {urls:'stun:stun2.l.google.com:19302'}
];
let rtcIceServers=[...DEFAULT_ICE_SERVERS],iceServersPromise=null,iceServersLoaded=false;
async function ensureIceServersLoaded(){
  if(iceServersLoaded)return rtcIceServers;
  if(!iceServersPromise){
    iceServersPromise=(async()=>{
      try{
        const d=await api('GET','/api/ice-servers');
        if(Array.isArray(d.iceServers)&&d.iceServers.length)rtcIceServers=d.iceServers;
      }catch(e){console.warn('Using fallback ICE servers:',e.message);}
      iceServersLoaded=true;
      return rtcIceServers;
    })();
  }
  return iceServersPromise;
}

/* ════════════════════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.auth-tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.auth-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loginForm.style.display=btn.dataset.tab==='login'?'block':'none';
    registerForm.style.display=btn.dataset.tab==='register'?'block':'none';
    loginError.textContent=registerError.textContent='';
  });
});
loginBtn.addEventListener('click',async()=>{
  loginError.textContent='';
  try{const d=await api('POST','/api/login',{email:loginEmail.value.trim(),password:loginPassword.value});onAuthSuccess(d.token,d.user);}
  catch(e){loginError.textContent=e.message;}
});
registerBtn.addEventListener('click',async()=>{
  registerError.textContent='';
  try{const d=await api('POST','/api/register',{username:regUsername.value.trim(),email:regEmail.value.trim(),password:regPassword.value});onAuthSuccess(d.token,d.user);}
  catch(e){registerError.textContent=e.message;}
});
[loginPassword,loginEmail].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter')loginBtn.click();}));
[regPassword,regEmail,regUsername].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter')registerBtn.click();}));
settingsLogout?.addEventListener('click',doLogout);
function doLogout(){localStorage.removeItem('chatapp_token');localStorage.removeItem('chatapp_user');sessionStorage.removeItem('unlockedChats');location.reload();}

function onAuthSuccess(token,user){
  myToken=token;
  user.avatarUrl=user.avatarUrl||user.profile_pic||user.avatar_url||null;
  myUser=user;
  localStorage.setItem('chatapp_token',token);
  localStorage.setItem('chatapp_user',JSON.stringify(user));
  authScreen.style.display='none';
  appContainer.style.display='flex';
  setAvatarEl(myAvatarEl,user);
  myUsernameLabel.textContent=user.username;
  if(profileNameInput)profileNameInput.value=user.username||'';
  if(profileAboutInput)profileAboutInput.value=user.about||'';
  if(profilePhoneInput)profilePhoneInput.value=user.phone||'';
  if(profileBigAvatar)setAvatarEl(profileBigAvatar,user);
  if(myStatusAvatar)setAvatarEl(myStatusAvatar,user);
  injectInputBarExtras();
  initSocket();
  ensureIceServersLoaded();
  loadInitialData();
}
window.addEventListener('load',()=>{
  const token=localStorage.getItem('chatapp_token'),user=localStorage.getItem('chatapp_user');
  if(token&&user){myToken=token;myUser=JSON.parse(user);onAuthSuccess(token,myUser);}
});

/* ── Inject voice/video buttons + reply bar + forward modal ─── */
function injectInputBarExtras(){
  // Reply bar
  if(!$('replyPreviewBar')){
    const bar=document.createElement('div');bar.id='replyPreviewBar';bar.className='reply-preview-bar';bar.style.display='none';
    bar.innerHTML=`<div style="width:3px;height:34px;background:#00bfa5;border-radius:2px;flex-shrink:0"></div>
      <div class="rp-content"><div class="rp-name" id="replyPreviewName">Reply</div>
      <div class="rp-text" id="replyPreviewText"></div></div>
      <button class="rp-close" id="replyPreviewClose">✕</button>`;
    inputBar.parentNode.insertBefore(bar,inputBar);
    $('replyPreviewClose').addEventListener('click',clearReplyTo);
  }
  // Recording bar
  if(!$('recordingBar')){
    const bar=document.createElement('div');bar.id='recordingBar';bar.className='recording-bar';bar.style.display='none';
    bar.innerHTML=`<svg viewBox="0 0 24 24" width="16" height="16" style="flex-shrink:0"><circle cx="12" cy="12" r="8" fill="#e53e3e"/></svg>
      <span class="recording-timer" id="recTimer">0:00</span>
      <span style="flex:1;font-size:12px;color:#fc8181">Recording voice...</span>
      <button class="recording-cancel" id="recCancelBtn">Cancel</button>
      <button class="recording-send" id="recSendBtn">Send ✓</button>`;
    inputBar.parentNode.insertBefore(bar,inputBar);
    $('recCancelBtn').addEventListener('click',()=>stopVoiceRecording(false));
    $('recSendBtn').addEventListener('click',()=>stopVoiceRecording(true));
  }
  // Voice btn
  if(!$('voiceRecordBtn')){
    const btn=document.createElement('button');btn.id='voiceRecordBtn';btn.className='voice-record-btn';
    btn.title='Hold to record voice note';
    btn.innerHTML=`<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/></svg>`;
    sendBtn.parentNode.insertBefore(btn,sendBtn);
    btn.addEventListener('click',startVoiceRecording);
  }
  // Forward modal
  if(!$('forwardModalOverlay')){
    const m=document.createElement('div');m.id='forwardModalOverlay';m.className='forward-modal-overlay';m.style.display='none';
    m.innerHTML=`<div class="forward-modal-card">
      <div class="modal-header"><h3>Forward Message</h3><button class="modal-close" id="closeFwdModal">✕</button></div>
      <div class="modal-user-list" id="forwardContactsList"></div>
    </div>`;
    document.body.appendChild(m);
    $('closeFwdModal').addEventListener('click',()=>{m.style.display='none';});
    m.addEventListener('click',e=>{if(e.target===m)m.style.display='none';});
  }
  // FIXED: Make mini PiP draggable
  makeDraggable(miniCallPip);
}

/* ── Make element draggable ─── */
function makeDraggable(el){
  if(!el)return;
  let ox=0,oy=0,sx=0,sy=0;
  el.addEventListener('mousedown',e=>{
    if(e.target.tagName==='BUTTON')return;
    sx=e.clientX;sy=e.clientY;
    ox=el.offsetLeft;oy=el.offsetTop;
    function move(ev){
      el.style.right='auto';el.style.bottom='auto';
      el.style.left=(ox+(ev.clientX-sx))+'px';
      el.style.top=(oy+(ev.clientY-sy))+'px';
    }
    function up(){document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);}
    document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
  });
  // Touch drag
  el.addEventListener('touchstart',e=>{
    if(e.target.tagName==='BUTTON')return;
    const t=e.touches[0];sx=t.clientX;sy=t.clientY;ox=el.offsetLeft;oy=el.offsetTop;
  },{passive:true});
  el.addEventListener('touchmove',e=>{
    if(e.target.tagName==='BUTTON')return;
    const t=e.touches[0];
    el.style.right='auto';el.style.bottom='auto';
    el.style.left=(ox+(t.clientX-sx))+'px';
    el.style.top=(oy+(t.clientY-sy))+'px';
  },{passive:true});
}

async function loadInitialData(){
  try{
    const[contList,grps,allUsers]=await Promise.all([api('GET','/api/contacts'),api('GET','/api/groups'),api('GET','/api/users')]);
    allUsersMap={};allUsers.forEach(u=>{allUsersMap[u.username]=u;});
    contacts={};contList.forEach(u=>{contacts[u.username]=u;});
    groups={};grps.forEach(g=>{groups[g.id]={id:g.id,name:g.name,members:g.members?g.members.split(','):[]};}); 
    renderChatList();loadCallHistory();loadStatuses();
  }catch(e){console.error('loadInitialData:',e);}
}

/* ════════════════════════════════════════════════════════════════════════════
   SOCKET INIT
════════════════════════════════════════════════════════════════════════════ */
function initSocket(){
  socket=io({auth:{token:myToken}});
  socket.on('connect_error',e=>{
    console.error('Socket error:',e.message);
    if(['auth_required','invalid_token'].includes(e.message)){localStorage.clear();location.reload();}
  });

  // FIXED: On reconnect, re-join any active call room
  socket.on('connect',()=>{
    if(currentCallRoomId && currentCallPeers.length > 0){
      socket.emit('rejoin-call',{roomId:currentCallRoomId,callType:currentCallType});
    }
  });

  socket.on('online-users',(onlineIds)=>{
    onlineIds.forEach(uid=>{
      for(const uname in allUsersMap){if(allUsersMap[uname].id===uid)allUsersMap[uname].is_online=1;}
      for(const uname in contacts){if(contacts[uname].id===uid)contacts[uname].is_online=1;}
    });
    renderChatList();
  });
  socket.on('user-status',({userId,username,isOnline,lastSeen})=>{
    if(allUsersMap[username]){allUsersMap[username].is_online=isOnline?1:0;if(!isOnline&&lastSeen)allUsersMap[username].last_seen=lastSeen;}
    if(contacts[username]){contacts[username].is_online=isOnline?1:0;if(!isOnline&&lastSeen)contacts[username].last_seen=lastSeen;}
    renderChatList();
    if(activeChat?.type==='private'&&activeChat.id===username){
      chatHeaderStatus.textContent=isOnline?'online':formatLastSeen(lastSeen);
      chatHeaderStatus.style.color=isOnline?'var(--accent)':'var(--ts)';
    }
    if(activePipUser===username)updatePipStatus(isOnline,lastSeen);

    // FIXED: When user comes online, upgrade pending 'sent' msgs to 'delivered'
    if(isOnline){
      const key=chatKey('private',username);
      if(chats[key]){
        chats[key].messages.forEach(m=>{
          if(m.from===myUser?.username && m.status==='sent'){
            m.status='delivered';
            updateMsgStatus(m.id,'delivered');
          }
        });
      }
    }
  });

  // FIXED: Profile pic live update
  socket.on('user-avatar-updated',({username,avatarUrl})=>{
    if(allUsersMap[username])allUsersMap[username].avatarUrl=avatarUrl;
    if(contacts[username])contacts[username].avatarUrl=avatarUrl;
    // Update chat header if active
    if(activeChat?.type==='private'&&activeChat.id===username){
      const u=allUsersMap[username]||contacts[username];
      if(u)setAvatarEl(chatHeaderAvatar,u);
    }
    // Update PiP if open
    if(activePipUser===username){
      const u=allUsersMap[username]||contacts[username];
      if(u)setAvatarEl(pipHeroAvatar,u);
    }
    renderChatList();
  });

  socket.on('group-created',({groupId,name,createdBy,members})=>{
    groups[groupId]={id:groupId,name,members};
    const key=chatKey('group',groupId);ensureChat(key);
    chats[key].lastMsg=`${createdBy} created this group`;chats[key].lastTime=nowStr();
    renderChatList();
    if(createdBy===myUser.username)openChat({type:'group',id:groupId,name,isGroup:true});
  });
  socket.on('message-sent',({id,status})=>updateMsgStatus(id,status));
  socket.on('private-message',msg=>{
    if(msg.from===myUser?.username)return;
    const key=chatKey('private',msg.from);ensureChat(key);
    const m=normaliseMsg(msg);
    chats[key].messages.push(m);
    chats[key].lastMsg=m.content||(m.fileName?`📎 ${m.fileName}`:'');
    chats[key].lastTime=isoToTime(m.time);
    if(!contacts[msg.from]&&allUsersMap[msg.from])contacts[msg.from]=allUsersMap[msg.from];
    if(activeChat?.type==='private'&&activeChat.id===msg.from){
      appendMessageToDom(m);
      socket.emit('message-seen',{msgId:m.id,fromUser:msg.from});
      updateMsgStatus(m.id,'seen');
    }else{chats[key].unread=(chats[key].unread||0)+1;}
    renderChatList();
  });
  socket.on('group-message',msg=>{
    if(msg.from===myUser?.username)return;
    const key=chatKey('group',msg.groupId);ensureChat(key);
    const m=normaliseMsg(msg);
    chats[key].messages.push(m);
    chats[key].lastMsg=`${msg.from}: ${m.content||(m.fileName?`📎 ${m.fileName}`:'')}`;
    chats[key].lastTime=isoToTime(m.time);
    if(activeChat?.type==='group'&&activeChat.id===msg.groupId)appendMessageToDom(m);
    else chats[key].unread=(chats[key].unread||0)+1;
    renderChatList();
  });
  socket.on('message-edited',({msgId,newContent})=>{
    const key=activeChatKey();
    if(key&&chats[key]){const m=chats[key].messages.find(m=>m.id===msgId);if(m){m.content=newContent;m.is_edited=true;}}
    const bubble=document.querySelector(`[data-msg-id="${msgId}"] .message-bubble`);
    if(bubble){
      const t=bubble.querySelector('.msg-text');if(t)t.textContent=newContent;
      if(!bubble.querySelector('.edit-mark')){const em=document.createElement('span');em.className='edit-mark';em.textContent=' (edited)';bubble.querySelector('.msg-footer')?.prepend(em);}
    }
  });
  socket.on('message-deleted',({msgId,deleteFor})=>{
    const key=activeChatKey();
    if(key&&chats[key]&&deleteFor==='everyone'){const idx=chats[key].messages.findIndex(m=>m.id===msgId);if(idx!==-1)chats[key].messages.splice(idx,1);}
    const rowEl=document.querySelector(`[data-msg-id="${msgId}"]`);
    if(rowEl){
      if(deleteFor==='everyone'){const b=rowEl.querySelector('.message-bubble');if(b)b.innerHTML='<span class="deleted-msg">🚫 This message was deleted</span>';}
      else rowEl.remove();
    }
  });
  socket.on('message-reacted',({msgId,reactions})=>{
    updateMessageReactionsDOM(msgId,reactions);
    const key=activeChatKey();
    if(key&&chats[key]){const m=chats[key].messages.find(m=>m.id===msgId);if(m)m.reactions=reactions;}
  });
  socket.on('message-seen',({msgId})=>updateMsgStatus(msgId,'seen'));

  // FIXED: Bulk seen update when user opens chat
  socket.on('messages-delivered',({msgIds})=>{
    msgIds.forEach(id=>updateMsgStatus(id,'delivered'));
  });
  socket.on('messages-seen',({msgIds})=>{
    msgIds.forEach(id=>updateMsgStatus(id,'seen'));
  });

  socket.on('message-blocked',({to})=>showToast(`Cannot send to ${to}`));
  socket.on('typing',({from,to,isTyping,isGroup})=>{
    if(from===myUser?.username||!activeChat)return;
    const relevant=isGroup?(activeChat.type==='group'&&activeChat.id===to):(activeChat.type==='private'&&activeChat.id===from);
    if(!relevant)return;
    if(isTyping)typingUsers.add(from);else typingUsers.delete(from);
    typingBar.style.display=typingUsers.size?'flex':'none';
    if(typingUsers.size)typingText.textContent=[...typingUsers].join(', ')+(typingUsers.size===1?' is typing...':' are typing...');
  });
  socket.on('live-location-update',({from,userId,lat,lng,speed,heading,accuracy,sessionId})=>{
    updateLiveLocationBubble(from,lat,lng,sessionId);
  });
  socket.on('stop-live-location',({from,sessionId})=>{
    stopLiveLocationDisplay(sessionId);
  });
  socket.on('status-new',()=>{loadStatuses();});

  // Calls
  socket.on('call-invite',({from,callType,isGroup,groupId,addToCall,roomId})=>{
    if(isGroup&&groupId){handleGroupCallInvite(from,callType,groupId,roomId);return;}
    pendingIncomingCaller=from;pendingIncomingCallType=callType||'audio';pendingIncomingRoomId=roomId||null;
    if(activeCallScreen.style.display==='flex'){
      iocAvatar.textContent=getInitial(from);iocAvatar.style.background=getAvatarColor(from);
      iocName.textContent=from;iocType.textContent=callType==='video'?'Incoming video call':'Incoming voice call';
      incomingOnCallBanner.style.display='flex';playRingtone(true);return;
    }
    incomingCallerName.textContent=from;
    setAvatarEl(incomingAvatarEl,allUsersMap[from]||contacts[from]||{username:from});
    incomingCallType.textContent=callType==='video'?'Incoming video call':'Incoming voice call';
    acceptCallBtn.style.display=callType==='audio'?'flex':'none';
    acceptVideoCallBtn.style.display=callType==='video'?'flex':'none';
    incomingCallScreen.style.display='flex';playRingtone(true);
  });
  socket.on('call-accepted',async({from,callType,roomId})=>{
    if(roomId&&currentCallRoomId&&roomId!==currentCallRoomId)return;
    if(outgoingCallScreen.style.display!=='flex'&&(!roomId||roomId!==currentCallRoomId))return;
    currentCallRoomId=roomId||currentCallRoomId;
    hideOutgoingRing();
    await showActiveCallScreen(from,callType||currentCallType);
    await sendOfferTo(from);
  });
  socket.on('call-rejected',({from})=>{hideOutgoingRing();showToast(`${from} declined the call`);});
  socket.on('call-ended',({from})=>{
    cleanupPeer(from);currentCallPeers=currentCallPeers.filter(u=>u!==from);
    // FIXED: If on hold call ends, resume held call instead of ending everything
    if(currentCallPeers.length===0){
      if(isCallOnHold && heldCallPeer){
        resumeHeldCall();
      } else {
        cleanupCall();
        if(isCallMinimized){miniCallPip.style.display='none';isCallMinimized=false;}
      }
    }
  });
  socket.on('please-connect',async({to,roomId})=>{
    if(roomId&&currentCallRoomId&&roomId!==currentCallRoomId)return;
    currentCallRoomId=roomId||currentCallRoomId;
    await sleep(120);await sendOfferTo(to);
  });
  socket.on('offer',async({from,offer,roomId})=>{
    if(roomId&&currentCallRoomId&&roomId!==currentCallRoomId)return;
    currentCallRoomId=roomId||currentCallRoomId;
    if(incomingCallScreen.style.display==='flex'){pendingOffers[from]=offer;return;}
    processOffer(from,offer);
  });
  socket.on('answer',async({from,answer,roomId})=>{
    if(roomId&&currentCallRoomId&&roomId!==currentCallRoomId)return;
    currentCallRoomId=roomId||currentCallRoomId;
    const pc=peerConnections[from];if(!pc||pc.signalingState!=='have-local-offer')return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer));await flushIce(from);
  });
  socket.on('icecandidate',async({from,candidate,roomId})=>{
    if(!candidate||!from)return;
    if(roomId&&currentCallRoomId&&roomId!==currentCallRoomId)return;
    currentCallRoomId=roomId||currentCallRoomId;
    const pc=peerConnections[from];
    if(!pc?.remoteDescription?.type){if(!iceCandidateQueue[from])iceCandidateQueue[from]=[];iceCandidateQueue[from].push(candidate);return;}
    try{await pc.addIceCandidate(new RTCIceCandidate(candidate));}catch{}
  });
  socket.on('peer-toggle-media',({from,kind,enabled})=>{
    if(kind==='audio'){const el=$(`mute-ind-${from}`);if(el)el.style.display=enabled?'none':'flex';}
  });

  // FIXED: Reconnect peers after page refresh
  socket.on('call-peer-reconnect',async({from,callType,roomId})=>{
    currentCallType=callType;currentCallRoomId=roomId;
    if(!currentCallPeers.includes(from))currentCallPeers.push(from);
    await sendOfferTo(from);
  });
}

/* ── Resume held call after new call ends ─── */
function resumeHeldCall(){
  if(!heldCallPeer)return;
  isCallOnHold=false;
  currentCallPeers=[heldCallPeer];
  currentCallType=heldCallType;
  currentCallRoomId=heldCallRoomId;
  heldCallPeer=null;heldCallType='audio';heldCallRoomId=null;
  // Resume local stream
  if(localStream)localStream.getTracks().forEach(t=>t.enabled=true);
  // Remove hold overlay from active call screen
  const holdOv=activeCallScreen.querySelector('.hold-overlay');
  if(holdOv)holdOv.remove();
  activeCallScreen.style.display='flex';
  showToast('Resumed previous call');
  startCallTimer();
}

/* ════════════════════════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════════════════════════ */
function switchPanel(panel){
  ['chats','status','calls','settings'].forEach(p=>{
    const el=$(`panel${p.charAt(0).toUpperCase()+p.slice(1)}`);if(el)el.classList.toggle('active',p===panel);
  });
  document.querySelectorAll('.dtab').forEach(b=>b.classList.toggle('active',b.dataset.panel===panel));
  document.querySelectorAll('.mnav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===panel));
  const sw=$('searchBarWrap');if(sw)sw.style.display=panel==='chats'?'flex':'none';
  if(panel==='status')loadStatuses();
}
desktopTabBar?.querySelectorAll('.dtab').forEach(btn=>btn.addEventListener('click',()=>switchPanel(btn.dataset.panel)));
mobileBottomNav?.querySelectorAll('.mnav-btn').forEach(btn=>{btn.addEventListener('click',()=>{switchPanel(btn.dataset.nav);showSidebar();});});
backBtn?.addEventListener('click',()=>{showSidebar();closeProfilePanel();activeChat=null;clearReplyTo();});
function showSidebar(){
  sidebarEl?.classList.remove('hidden');
  mainArea?.classList.remove('open');
  document.body.classList.remove('chatting');
}
function showMain(){
  sidebarEl?.classList.add('hidden');
  mainArea?.classList.add('open');
  document.body.classList.add('chatting');
}

/* ════════════════════════════════════════════════════════════════════════════
   CHAT LIST
════════════════════════════════════════════════════════════════════════════ */
function renderChatList(filter=''){
  chatList.innerHTML='';
  const items=[];
  for(const gid in groups){
    const g=groups[gid];if(filter&&!g.name.toLowerCase().includes(filter))continue;
    const key=chatKey('group',gid),c=chats[key]||{};
    items.push({type:'group',id:gid,name:g.name,isGroup:true,lastMsg:c.lastMsg||'',lastTime:c.lastTime||'',unread:c.unread||0});
  }
  for(const uname in contacts){
    if(uname===myUser?.username)continue;
    if(filter&&!uname.toLowerCase().includes(filter))continue;
    const u=contacts[uname]||allUsersMap[uname]||{};
    const key=chatKey('private',uname),c=chats[key]||{};
    items.push({type:'private',id:uname,name:uname,isGroup:false,lastMsg:c.lastMsg||'',lastTime:c.lastTime||'',unread:c.unread||0,online:u.is_online,lastSeen:u.last_seen});
  }
  items.sort((a,b)=>b.lastTime>a.lastTime?1:-1);
  if(!items.length){chatList.innerHTML=`<div class="empty-panel-hint"><svg viewBox="0 0 24 24" width="40" height="40" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" stroke="currentColor" stroke-width="1.5"/></svg><p>No chats yet.<br>Tap ✏ to start.</p></div>`;return;}
  items.forEach(item=>{
    const key=chatKey(item.type,item.id),isActive=activeChat&&chatKey(activeChat.type,activeChat.id)===key;
    const div=document.createElement('div');div.className='chat-item'+(isActive?' active':'');
    const u=contacts[item.id]||allUsersMap[item.id];
    const av=document.createElement('div');av.className='chat-item-avatar'+(item.isGroup?' grp':'');
    if(!item.isGroup)setAvatarEl(av,u);else{av.textContent=getInitial(item.name);av.style.background=getAvatarColor(item.name);}
    if(!item.isGroup&&item.online){const dot=document.createElement('div');dot.className='online-dot';av.appendChild(dot);}
    const body=document.createElement('div');body.className='chat-item-body';
    body.innerHTML=`<div class="chat-item-top"><span class="chat-item-name">${item.name}${item.isGroup?' 👥':''}</span><span class="chat-item-time">${item.lastTime}</span></div><div class="chat-item-bottom"><span class="chat-item-preview">${item.lastMsg||(item.online?'online':'')}</span>${item.unread>0?`<span class="unread-count">${item.unread}</span>`:''}</div>`;
    div.appendChild(av);div.appendChild(body);
    div.addEventListener('click',()=>openChat(item));
    chatList.appendChild(div);
  });
}
searchInput?.addEventListener('input',()=>renderChatList(searchInput.value.trim().toLowerCase()));

/* ── New Chat modal ─── */
newChatBtn?.addEventListener('click',openNewChatModal);
closeNewChatModal?.addEventListener('click',()=>{newChatModal.style.display='none';});
function openNewChatModal(){
  userSearchResult.innerHTML='';newChatEmailInput.value='';contactsListModal.innerHTML='';
  Object.values(contacts).forEach(u=>{
    if(u.username===myUser?.username)return;
    const item=document.createElement('div');item.className='modal-user-item';
    item.innerHTML=`${makeAvatarHtml(u,36,14)}<span>${u.username}</span><small style="margin-left:auto;color:var(--ts)">${u.email}</small>`;
    item.addEventListener('click',()=>{newChatModal.style.display='none';openChat({type:'private',id:u.username,name:u.username,isGroup:false});});
    contactsListModal.appendChild(item);
  });
  newChatModal.style.display='flex';newChatEmailInput.focus();
}
newChatSearchBtn?.addEventListener('click',searchUserByEmail);
newChatEmailInput?.addEventListener('keydown',e=>{if(e.key==='Enter')searchUserByEmail();});
async function searchUserByEmail(){
  const email=newChatEmailInput.value.trim();if(!email)return;
  userSearchResult.innerHTML=`<div class="user-search-not-found">Searching...</div>`;
  try{
    const u=await api('GET',`/api/users/search?email=${encodeURIComponent(email)}`);
    userSearchResult.innerHTML='';
    const found=document.createElement('div');found.className='user-search-found';
    found.innerHTML=`${makeAvatarHtml(u,40,16)}<div><div style="font-weight:600">${u.username}</div><div style="font-size:11px;color:var(--ts)">${u.email}</div></div><div style="margin-left:auto;display:flex;gap:8px"><button class="start-chat-btn" id="searchStartChat">Message</button><button class="start-chat-btn" style="background:var(--bg3);color:var(--tp);border:1px solid var(--border)" id="searchAddOnly">Add</button></div>`;
    userSearchResult.appendChild(found);
    found.querySelector('#searchStartChat').addEventListener('click',async()=>{
      contacts[u.username]=u;await api('POST','/api/contacts',{contactId:u.id});
      allUsersMap[u.username]=u;newChatModal.style.display='none';
      openChat({type:'private',id:u.username,name:u.username,isGroup:false});renderChatList();
    });
    found.querySelector('#searchAddOnly').addEventListener('click',async()=>{
      contacts[u.username]=u;await api('POST','/api/contacts',{contactId:u.id});
      allUsersMap[u.username]=u;renderChatList();showToast(`${u.username} added`);newChatModal.style.display='none';
    });
  }catch{userSearchResult.innerHTML=`<div class="user-search-not-found">No user found with that email.</div>`;}
}
function updatePipStatus(isOnline,lastSeen){
  if(!pipHeroStatus)return;
  pipHeroStatus.textContent=isOnline?'online':formatLastSeen(lastSeen);
  pipHeroStatus.style.color=isOnline?'var(--accent)':'var(--ts)';
}
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 2 / 4
//  Open Chat · Render Messages · Send · Voice Note
//  File/Image Preview · Image Editor · Location · Reply · React · Forward
// ════════════════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════════════════════════════════════
   OPEN CHAT + LOCK CHECK
════════════════════════════════════════════════════════════════════════════ */
async function openChat({type,id,name,isGroup}){
  activeChat={type,id,name,isGroup};
  const key=chatKey(type,id);ensureChat(key);
  if(chats[key])chats[key].unread=0;
  showMain();closeProfilePanel();
  const settings=await getChatSettings(key);
  // FIXED: Check DB is_locked, but also check our session unlock store
  if(settings.is_locked && !lockedChats[key]){
    showLockedScreen(key,settings);
    return;
  }
  showChatUI(type,id,name,isGroup,key,settings);
}

function showLockedScreen(key,settings){
  chatEmptyState.style.display='none';lockedChatScreen.style.display='flex';
  chatHeader.style.display='none';messagesArea.style.display='none';inputBar.style.display='none';
  const rBar=$('replyPreviewBar');if(rBar)rBar.style.display='none';
  const recBar=$('recordingBar');if(recBar)recBar.style.display='none';
  lockedChatPinError.textContent='';lockedChatPinInput.value='';
  lockedChatUnlockBtn.onclick=async()=>{
    const pin=lockedChatPinInput.value;
    try{
      const r=await api('POST',`/api/chat-settings/${encodeURIComponent(key)}/verify-pin`,{pin});
      if(r.valid){
        lockedChats[key]=true;
        saveUnlockedChats(); // FIXED: persist unlock in sessionStorage
        lockedChatScreen.style.display='none';
        if(activeChat)showChatUI(activeChat.type,activeChat.id,activeChat.name,activeChat.isGroup,key,settings||{});
      }
      else lockedChatPinError.textContent='Incorrect PIN';
    }catch{lockedChatPinError.textContent='Error verifying PIN';}
  };
}

async function showChatUI(type,id,name,isGroup,key,settings){
  lockedChatScreen.style.display='none';chatEmptyState.style.display='none';
  chatHeader.style.display='flex';messagesArea.style.display='flex';inputBar.style.display='flex';
  const theme=settings.theme||'default';
  if(theme!=='default')mainArea.setAttribute('data-chat-theme',theme);
  else mainArea.removeAttribute('data-chat-theme');
  const u=allUsersMap[id]||contacts[id];
  chatHeaderAvatar.className='chat-avatar-sm'+(isGroup?' grp':'');
  if(!isGroup&&u)setAvatarEl(chatHeaderAvatar,u);
  else{chatHeaderAvatar.textContent=getInitial(name);chatHeaderAvatar.style.background=getAvatarColor(name);}
  chatHeaderName.textContent=name;
  headerAudioCallBtn.style.display=!isGroup?'flex':'none';
  headerVideoCallBtn.style.display=!isGroup?'flex':'none';
  headerGroupAudioCallBtn.style.display=isGroup?'flex':'none';
  headerGroupVideoCallBtn.style.display=isGroup?'flex':'none';
  addToCallBtn.style.display=currentCallPeers.length>0?'flex':'none';
  chatInfoBtn.style.display='flex';
  if(isGroup){
    const g=groups[id];chatHeaderStatus.textContent=g?`${g.members.length} members`:'group';chatHeaderStatus.style.color='var(--ts)';activeChat.groupId=id;
  }else{
    activeChat.targetUserId=u?.id;
    chatHeaderStatus.textContent=u?.is_online?'online':formatLastSeen(u?.last_seen);
    chatHeaderStatus.style.color=u?.is_online?'var(--accent)':'var(--ts)';
  }
  if(!chats[key]._loaded){
    try{
      let rows;
      if(isGroup)rows=await api('GET',`/api/messages/group/${id}`);
      else{const uid=(allUsersMap[id]||contacts[id])?.id;rows=uid?await api('GET',`/api/messages/private/${uid}`):[]; }
      chats[key].messages=rows.map(normaliseMsg);chats[key]._loaded=true;
    }catch(e){console.error('load history:',e);}
  }
  renderMessages(key);
  renderChatList(searchInput?.value?.trim()?.toLowerCase()||'');
  messageInput.focus();

  // FIXED: Mark all unread messages as seen when opening chat
  if(!isGroup && u?.id){
    const unread=chats[key].messages.filter(m=>m.from===id && m.status!=='seen');
    if(unread.length){
      socket.emit('mark-all-seen',{fromUser:id});
      unread.forEach(m=>{m.status='seen';});
    }
  }
}

async function getChatSettings(key){
  try{return await api('GET',`/api/chat-settings/${encodeURIComponent(key)}`);}
  catch{return{disappearing_msgs:'off',theme:'default',is_locked:0,is_muted:0};}
}
$('chatHeaderInfo')?.addEventListener('click',()=>{if(!activeChat)return;openProfilePanel(activeChat.id,activeChat.isGroup);});
chatInfoBtn?.addEventListener('click',()=>{if(!activeChat)return;openProfilePanel(activeChat.id,activeChat.isGroup);});

/* ── Render Messages ─── */
function renderMessages(key){
  messagesList.innerHTML='';
  const chat=chats[key];if(!chat)return;
  chat.messages.forEach(m=>appendMessageToDom(m,false));
  setTimeout(()=>{messagesList.scrollTop=messagesList.scrollHeight;},50);
}

const REACTION_EMOJIS=['❤️','😂','😮','😢','👍','🙏','🔥'];

function appendMessageToDom(msg,scroll=true){
  const isOwn=msg.from===myUser?.username;
  const row=document.createElement('div');
  row.className=`message-row ${isOwn?'out':'in'}`;row.dataset.msgId=msg.id;
  if(activeChat?.isGroup&&!isOwn){
    const sn=document.createElement('div');sn.className='msg-sender-name';
    sn.textContent=msg.from;sn.style.color=getAvatarColor(msg.from);row.appendChild(sn);
  }
  const bubble=document.createElement('div');bubble.className='message-bubble';

  // Reply quote
  if(msg.reply_to||msg.replyToId){
    const rt=msg.reply_to;
    const q=document.createElement('div');q.className='reply-quote';
    const rtName=rt?.sender_name||'?';
    const rtText=rt?.content||(rt?.file_name?`📎 ${rt.file_name}`:rt?.msg_type==='image'?'📷 Photo':'Media');
    q.innerHTML=`<div class="reply-quote-name">${rtName}</div><div class="reply-quote-text">${rtText}</div>`;
    if(rt?.id)q.addEventListener('click',()=>{const el=document.querySelector(`[data-msg-id="${rt.id}"]`);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.outline='2px solid #00bfa5';setTimeout(()=>{el.style.outline='';},1200);}});
    bubble.appendChild(q);
  }

  // Image
  if(msg.fileUrl&&msg.fileType?.startsWith('image/')){
    const img=document.createElement('img');img.className='msg-image';img.src=msg.fileUrl;img.loading='lazy';
    img.addEventListener('click',()=>openImageViewer(msg.fileUrl));bubble.appendChild(img);
  }
  // Video note (circular)
  else if(msg.msgType==='video_note'&&msg.fileUrl){
    const vid=document.createElement('video');vid.className='msg-video-note';vid.src=msg.fileUrl;vid.controls=true;vid.loop=true;vid.playsInline=true;bubble.appendChild(vid);
  }
  // Video
  else if(msg.fileUrl&&msg.fileType?.startsWith('video/')){
    const vid=document.createElement('video');vid.className='msg-image';vid.src=msg.fileUrl;vid.controls=true;vid.style.maxWidth='240px';vid.playsInline=true;bubble.appendChild(vid);
  }
  // Voice/Audio
  else if(msg.fileUrl&&(msg.msgType==='voice_note'||msg.fileType?.startsWith('audio/'))){
    const audio=document.createElement('audio');audio.src=msg.fileUrl;audio.controls=true;audio.className='msg-audio';bubble.appendChild(audio);
  }
  // Other file
  else if(msg.fileUrl){
    const link=document.createElement('a');link.className='msg-file';link.href=msg.fileUrl;link.download=msg.fileName||'file';link.target='_blank';
    link.innerHTML=`<div class="msg-file-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="white"/></svg></div><div><div class="msg-file-name">${msg.fileName||'File'}</div><div class="msg-file-size">${formatSize(msg.fileSize)}</div></div>`;
    bubble.appendChild(link);
  }

  // Location
  if(msg.msgType==='location'&&msg.content){
    try{
      const loc=JSON.parse(msg.content);
      const isLive=loc.duration>0;
      const wrap=document.createElement('div');wrap.className='live-loc-wrap';
      const mapDiv=document.createElement('div');mapDiv.className='live-loc-map-el';
      mapDiv.id=`locmap-${msg.id}`;
      mapDiv.innerHTML=`<iframe src="https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=15&output=embed&hl=en" width="100%" height="100%" style="border:none;display:block" loading="lazy"></iframe>`;
      wrap.appendChild(mapDiv);
      if(isLive){wrap.innerHTML+=`<div class="live-loc-badge"><span class="live-loc-badge-dot"></span>LIVE</div>`;}
      else{wrap.innerHTML+=`<span style="font-size:16px">📍</span>`;}
      wrap.innerHTML+=`<div><a href="https://maps.google.com/?q=${loc.lat},${loc.lng}" target="_blank" style="color:var(--accent);font-size:12px">Open in Maps</a></div>`;
      if(isLive)wrap.innerHTML+=`<div class="live-loc-timer" id="llt-${loc.sessionId}">Sharing live location...</div>`;
      bubble.appendChild(wrap);
      if(isLive&&loc.sessionId){
        liveLocStartTimes[loc.sessionId]=new Date();
        startLiveLocTimerDisplay(loc.sessionId);
        if(typeof google!=='undefined'&&google.maps){
          setTimeout(()=>upgradeLiveLocMap(mapDiv,loc.lat,loc.lng,loc.sessionId),300);
        }else{
          window.addEventListener('google-maps-ready',()=>upgradeLiveLocMap(mapDiv,loc.lat,loc.lng,loc.sessionId),{once:true});
        }
      }else if(!isLive&&typeof google!=='undefined'&&google.maps){
        setTimeout(()=>{
          try{
            mapDiv.innerHTML='';
            const map=new google.maps.Map(mapDiv,{zoom:15,center:{lat:loc.lat,lng:loc.lng},disableDefaultUI:true});
            new google.maps.Marker({position:{lat:loc.lat,lng:loc.lng},map});
          }catch{}
        },300);
      }
    }catch{}
  }

  // Contact card
  if(msg.msgType==='contact'&&msg.content){
    try{
      const c=JSON.parse(msg.content);
      const el=document.createElement('div');el.className='msg-contact';
      el.innerHTML=`<div class="msg-contact-av" style="background:${getAvatarColor(c.username)}">${getInitial(c.username)}</div><div><div class="msg-contact-name">${c.username}</div><div class="msg-contact-email">${c.email}</div>${!contacts[c.username]?`<div class="msg-contact-add" data-uid="${c.id}" data-uname="${c.username}">Add to contacts</div>`:''}</div>`;
      el.querySelector('.msg-contact-add')?.addEventListener('click',async(ev)=>{
        const uid=ev.target.dataset.uid,uname=ev.target.dataset.uname;
        await api('POST','/api/contacts',{contactId:uid});
        if(allUsersMap[uname])contacts[uname]=allUsersMap[uname];
        showToast(`${uname} added!`);ev.target.remove();
      });
      bubble.appendChild(el);
    }catch{}
  }

  // Text
  if(msg.content&&msg.msgType!=='location'&&msg.msgType!=='contact'){
    const t=document.createElement('div');t.className='msg-text';t.textContent=msg.content;bubble.appendChild(t);
  }
  if(msg.is_edited){const em=document.createElement('span');em.className='edit-mark';em.textContent=' (edited)';bubble.appendChild(em);}

  // Footer
  const footer=document.createElement('div');footer.className='msg-footer';
  footer.innerHTML=`<span class="msg-time">${isoToTime(msg.time)}</span>`;
  if(isOwn)footer.innerHTML+=`<span class="msg-ticks ${msg.status==='seen'?'seen':''}" id="ticks-${msg.id}">${ticksHTML(msg.status)}</span>`;
  bubble.appendChild(footer);
  row.appendChild(bubble);

  // Reactions row
  const reactRow=document.createElement('div');reactRow.className='msg-reactions';reactRow.id=`reactions-${msg.id}`;
  if(msg.reactions?.length)renderReactionPills(reactRow,msg.reactions,msg.id);
  row.appendChild(reactRow);

  // Desktop: right-click context menu
  row.addEventListener('contextmenu',e=>{e.preventDefault();contextMsgId=msg.id;contextMsgObj=msg;showContextMenu(e.clientX,e.clientY,msg,isOwn);});
  // Desktop: double-click → reaction picker
  bubble.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();showReactionPicker(msg.id,bubble);});
  // Mobile: swipe right → reply
  let txStart=0,tyStart=0;
  row.addEventListener('touchstart',e=>{txStart=e.touches[0].clientX;tyStart=e.touches[0].clientY;},{passive:true});
  row.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-txStart,dy=Math.abs(e.changedTouches[0].clientY-tyStart);
    if(dx>60&&dy<40){setReplyTo(msg);}
  },{passive:true});

  messagesList.appendChild(row);
  if(scroll)setTimeout(()=>{messagesList.scrollTop=messagesList.scrollHeight;},30);
}

function upgradeLiveLocMap(mapDiv,lat,lng,sessionId){
  try{
    mapDiv.innerHTML='';
    const mapObj=new google.maps.Map(mapDiv,{zoom:15,center:{lat,lng},disableDefaultUI:true});
    const myMarker=new google.maps.Marker({position:{lat,lng},map:mapObj,title:'Location',icon:{path:google.maps.SymbolPath.CIRCLE,scale:8,fillColor:'#00bfa5',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});
    liveLocMapInstances[sessionId]={map:mapObj,myMarker,peerMarkers:{}};
  }catch(e){}
}

function startLiveLocTimerDisplay(sessionId){
  if(liveLocTimerIntervals[sessionId])clearInterval(liveLocTimerIntervals[sessionId]);
  liveLocTimerIntervals[sessionId]=setInterval(()=>{
    const el=$(`llt-${sessionId}`);if(!el)return;
    const start=liveLocStartTimes[sessionId];if(!start)return;
    const elapsed=Math.floor((Date.now()-start)/1000);
    const m=Math.floor(elapsed/60),s=elapsed%60;
    el.textContent=`Live • ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} elapsed`;
  },1000);
}

function updateLiveLocationBubble(from,lat,lng,sessionId){
  if(sessionId&&liveLocMapInstances[sessionId]){
    const inst=liveLocMapInstances[sessionId];
    const pos={lat,lng};
    if(from===myUser?.username){
      inst.myMarker.setPosition(pos);inst.map.setCenter(pos);
    }else{
      if(!inst.peerMarkers[from]){
        inst.peerMarkers[from]=new google.maps.Marker({position:pos,map:inst.map,title:from,icon:{path:google.maps.SymbolPath.CIRCLE,scale:7,fillColor:'#007cff',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});
      }else{inst.peerMarkers[from].setPosition(pos);}
    }
  }else if(sessionId){
    const mapEl=document.querySelector(`#llt-${sessionId}`)?.closest('.live-loc-wrap')?.querySelector('.live-loc-map-el iframe');
    if(mapEl)mapEl.src=`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=en`;
  }
}

function stopLiveLocationDisplay(sessionId){
  if(liveLocTimerIntervals[sessionId]){clearInterval(liveLocTimerIntervals[sessionId]);delete liveLocTimerIntervals[sessionId];}
  if(liveLocMapInstances[sessionId])delete liveLocMapInstances[sessionId];
  const el=$(`llt-${sessionId}`);if(el)el.textContent='Live location ended';
}

function openImageViewer(src){
  const ov=document.createElement('div');ov.className='img-viewer-overlay';
  ov.innerHTML=`<img src="${src}" class="img-viewer-img"><button class="img-viewer-close">✕</button>`;
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.classList.contains('img-viewer-close'))ov.remove();});
  document.body.appendChild(ov);
}

/* ── Context menu ─── */
function showContextMenu(x,y,msg,isOwn){
  contextMenu.innerHTML='';
  const items=[{id:'reply',icon:'↩️',label:'Reply'}];
  if(isOwn&&msg.msgType==='text')items.push({id:'edit',icon:'✏️',label:'Edit'});
  items.push({id:'react',icon:'😊',label:'React'},{id:'forward',icon:'➡️',label:'Forward'});
  if(isOwn){items.push({id:'deleteMe',icon:'🗑',label:'Delete for Me'},{id:'deleteAll',icon:'🗑',label:'Delete for Everyone',danger:true});}
  else{items.push({id:'deleteMe',icon:'🗑',label:'Delete for Me'});}
  items.forEach(item=>{
    const btn=document.createElement('button');btn.className='ctx-item'+(item.danger?' danger':'');
    btn.innerHTML=`${item.icon}&nbsp;${item.label}`;
    btn.addEventListener('click',()=>{
      contextMenu.style.display='none';
      if(item.id==='reply')setReplyTo(msg);
      else if(item.id==='edit'){messageInput.value=msg.content||'';messageInput.dataset.editId=msg.id;messageInput.focus();}
      else if(item.id==='react')showReactionPicker(msg.id,document.querySelector(`[data-msg-id="${msg.id}"] .message-bubble`));
      else if(item.id==='forward')openForwardModal(msg);
      else if(item.id==='deleteMe')deleteMessage('me');
      else if(item.id==='deleteAll')deleteMessage('everyone');
    });
    contextMenu.appendChild(btn);
  });
  contextMenu.style.display='block';
  contextMenu.style.left=Math.min(x,window.innerWidth-195)+'px';
  contextMenu.style.top=Math.min(y,window.innerHeight-items.length*42-10)+'px';
}
document.addEventListener('click',()=>{contextMenu.style.display='none';closeAllReactionPickers();});

function deleteMessage(deleteFor){
  if(!contextMsgId||!activeChat)return;
  socket.emit('delete-message',{msgId:contextMsgId,deleteFor,to:activeChat.type==='private'?activeChat.id:undefined,groupId:activeChat.type==='group'?activeChat.id:undefined});
  const key=activeChatKey();
  if(chats[key]&&deleteFor==='everyone'){const idx=chats[key].messages.findIndex(m=>m.id===contextMsgId);if(idx!==-1)chats[key].messages.splice(idx,1);}
  contextMsgId=null;contextMsgObj=null;
}

/* ── Reactions ─── */
function renderReactionPills(container,reactions,msgId){
  container.innerHTML='';
  if(!reactions?.length)return;
  const grouped={};
  reactions.forEach(r=>{if(!grouped[r.emoji])grouped[r.emoji]=[];grouped[r.emoji].push(r);});
  Object.entries(grouped).forEach(([emoji,users])=>{
    const isMine=users.some(u=>u.username===myUser?.username);
    const pill=document.createElement('div');pill.className='reaction-pill'+(isMine?' my-reaction':'');
    pill.innerHTML=`${emoji}<span class="r-count">${users.length}</span>`;
    pill.title=users.map(u=>u.username).join(', ');
    pill.addEventListener('click',e=>{
      e.stopPropagation();
      const myEmoji=isMine?null:emoji;
      socket.emit('react-message',{msgId,emoji:myEmoji,to:activeChat?.type==='private'?activeChat?.id:undefined,groupId:activeChat?.type==='group'?activeChat?.id:undefined});
    });
    container.appendChild(pill);
  });
}
function updateMessageReactionsDOM(msgId,reactions){
  const container=$(`reactions-${msgId}`);if(container)renderReactionPills(container,reactions,msgId);
}
function closeAllReactionPickers(){if(activeReactionPicker){activeReactionPicker.remove();activeReactionPicker=null;}}
function showReactionPicker(msgId,bubbleEl){
  closeAllReactionPickers();
  if(!bubbleEl)return;
  const picker=document.createElement('div');picker.className='reaction-picker-popup';
  REACTION_EMOJIS.forEach(em=>{
    const span=document.createElement('span');span.textContent=em;
    span.addEventListener('click',e=>{
      e.stopPropagation();
      socket.emit('react-message',{msgId,emoji:em,to:activeChat?.type==='private'?activeChat?.id:undefined,groupId:activeChat?.type==='group'?activeChat?.id:undefined});
      closeAllReactionPickers();
    });
    picker.appendChild(span);
  });
  const rect=bubbleEl.getBoundingClientRect();
  picker.style.bottom=(window.innerHeight-rect.top+4)+'px';
  picker.style.left=Math.min(Math.max(rect.left,6),window.innerWidth-300)+'px';
  document.body.appendChild(picker);
  activeReactionPicker=picker;
  setTimeout(()=>document.addEventListener('click',closeAllReactionPickers,{once:true}),50);
}

/* ── Reply ─── */
function setReplyTo(msg){
  replyToMsg=msg;
  const bar=$('replyPreviewBar');if(!bar)return;
  bar.style.display='flex';
  $('replyPreviewName').textContent=msg.from||'Message';
  $('replyPreviewText').textContent=msg.content||(msg.fileName?`📎 ${msg.fileName}`:'Media');
  messageInput.focus();
}
function clearReplyTo(){
  replyToMsg=null;
  const bar=$('replyPreviewBar');if(bar)bar.style.display='none';
}

/* ── Forward ─── */
function openForwardModal(msg){
  const overlay=$('forwardModalOverlay');if(!overlay)return;
  const list=$('forwardContactsList');list.innerHTML='';
  const targets=Object.values(contacts).filter(u=>u.username!==myUser?.username);
  if(!targets.length){list.innerHTML='<div style="padding:16px;color:var(--ts);text-align:center">No contacts to forward to</div>';}
  targets.forEach(u=>{
    const item=document.createElement('div');item.className='modal-user-item';
    item.innerHTML=`${makeAvatarHtml(u,36,14)}<span>${u.username}</span>`;
    item.addEventListener('click',()=>{
      overlay.style.display='none';
      const id=genId();
      const fwdMsg={id,from:myUser.username,to:u.username,content:msg.content,msgType:msg.msgType,fileUrl:msg.fileUrl,fileName:msg.fileName,fileSize:msg.fileSize,fileType:msg.fileType,time:new Date().toISOString(),status:'sent',reactions:[]};
      socket.emit('private-message',{to:u.username,content:msg.content,msgType:msg.msgType,fileUrl:msg.fileUrl,fileName:msg.fileName,fileSize:msg.fileSize,fileType:msg.fileType,msgId:id});
      if(activeChat?.type==='private'&&activeChat.id===u.username){
        const key=chatKey('private',u.username);ensureChat(key);
        chats[key].messages.push(fwdMsg);appendMessageToDom(fwdMsg);
      }
      showToast(`Forwarded to ${u.username}`);
    });
    list.appendChild(item);
  });
  overlay.style.display='flex';
}

/* ════════════════════════════════════════════════════════════════════════════
   SEND MESSAGE
════════════════════════════════════════════════════════════════════════════ */
function sendMessage(){
  const text=messageInput.value.trim();if(!text||!activeChat)return;
  const editId=messageInput.dataset.editId;
  if(editId){
    socket.emit('edit-message',{msgId:editId,newContent:text,to:activeChat.type==='private'?activeChat.id:undefined,groupId:activeChat.type==='group'?activeChat.id:undefined});
    const m=chats[activeChatKey()]?.messages.find(m=>m.id===editId);
    if(m){m.content=text;m.is_edited=true;}
    const b=document.querySelector(`[data-msg-id="${editId}"] .message-bubble`);
    if(b){const t=b.querySelector('.msg-text');if(t)t.textContent=text;if(!b.querySelector('.edit-mark')){const em=document.createElement('span');em.className='edit-mark';em.textContent=' (edited)';b.querySelector('.msg-footer')?.prepend(em);}}
    messageInput.value='';delete messageInput.dataset.editId;return;
  }
  stopTyping();
  const id=genId();
  const replyToId=replyToMsg?.id||null;
  const msg={id,from:myUser.username,content:text,msgType:'text',time:new Date().toISOString(),status:'sent',reply_to:replyToMsg||null,replyToId,reactions:[]};
  if(activeChat.type==='group'){msg.groupId=activeChat.id;socket.emit('group-message',{groupId:activeChat.id,content:text,msgType:'text',msgId:id,replyToId});}
  else{msg.to=activeChat.id;socket.emit('private-message',{to:activeChat.id,content:text,msgType:'text',msgId:id,replyToId});}
  const key=activeChatKey();ensureChat(key);
  chats[key].messages.push(msg);chats[key].lastMsg=text;chats[key].lastTime=isoToTime(msg.time);
  appendMessageToDom(msg);messageInput.value='';messageInput.style.height='auto';
  clearReplyTo();renderChatList(searchInput?.value?.trim()?.toLowerCase()||'');
}
sendBtn?.addEventListener('click',sendMessage);
messageInput?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
messageInput?.addEventListener('input',()=>{
  messageInput.style.height='auto';messageInput.style.height=Math.min(messageInput.scrollHeight,120)+'px';
  if(!activeChat||!socket)return;
  if(!isTypingSent){socket.emit('typing',{to:activeChat.id,isTyping:true,isGroup:activeChat.type==='group'});isTypingSent=true;}
  clearTimeout(typingTimer);typingTimer=setTimeout(stopTyping,1500);
});
function stopTyping(){if(isTypingSent&&activeChat&&socket){socket.emit('typing',{to:activeChat.id,isTyping:false,isGroup:activeChat.type==='group'});isTypingSent=false;}}

/* ── Attach menu ─── */
attachBtn?.addEventListener('click',e=>{e.stopPropagation();inputAttachMenu.style.display=(inputAttachMenu.style.display==='flex')?'none':'flex';});
document.addEventListener('click',()=>{if(inputAttachMenu)inputAttachMenu.style.display='none';});
attachFileOpt?.addEventListener('click',()=>{fileInput.click();inputAttachMenu.style.display='none';});
attachCameraOpt?.addEventListener('click',()=>{cameraInput.click();inputAttachMenu.style.display='none';});
attachLocationOpt?.addEventListener('click',()=>{openLiveLocationModal();inputAttachMenu.style.display='none';});
attachContactOpt?.addEventListener('click',()=>{openShareContactModal();inputAttachMenu.style.display='none';});

cameraInput?.addEventListener('change',()=>{if(cameraInput.files[0]){showMediaPreviewModal(cameraInput.files[0]);cameraInput.value='';}});
fileInput?.addEventListener('change',()=>{if(fileInput.files[0]){showMediaPreviewModal(fileInput.files[0]);fileInput.value='';}});

/* ── Media preview dispatcher ─── */
function showMediaPreviewModal(file){
  if(!file||!activeChat)return;
  if(file.size>50*1024*1024){showToast('File too large (max 50MB)');return;}
  if(file.type.startsWith('image/'))showImageEditorModal(file);
  else showFilePreviewModal(file);
}

/* ── File preview modal ─── */
function showFilePreviewModal(file){
  const ov=document.createElement('div');ov.className='file-preview-modal';
  const icon=file.type.startsWith('video/')?'🎬':file.type.startsWith('audio/')?'🎵':'📄';
  ov.innerHTML=`<div class="file-preview-card">
    <div class="file-preview-icon">${icon}</div>
    <div class="file-preview-name">${file.name}</div>
    <div class="file-preview-size">${formatSize(file.size)}</div>
    <div class="fpc-btns">
      <button class="fpc-cancel" id="fpcCancel">Cancel</button>
      <button class="fpc-send" id="fpcSend">Send</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('#fpcCancel').addEventListener('click',()=>ov.remove());
  ov.querySelector('#fpcSend').addEventListener('click',()=>{ov.remove();uploadAndSendFile(file);});
}

/* ── Image editor modal ─── */
function showImageEditorModal(file){
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=new Image();
    img.onload=()=>{
      const ov=document.createElement('div');ov.className='media-preview-overlay';
      ov.innerHTML=`
        <div class="media-preview-topbar">
          <button class="mpo-close" id="mpoClose">✕</button>
          <h3>Preview & Edit</h3>
          <span style="width:36px"></span>
        </div>
        <div class="media-preview-canvas-wrap"><canvas id="imgEdCanvas"></canvas></div>
        <div class="media-preview-tools">
          <button class="mpt-btn active" id="toolDraw" title="Draw">✏️</button>
          <button class="mpt-btn" id="toolCrop" title="Crop">✂️</button>
          <button class="mpt-btn" id="toolUndo" title="Undo">↩</button>
          <div class="mpt-sep"></div>
          <div class="mpt-color active" data-color="#e53e3e" style="background:#e53e3e" title="Red"></div>
          <div class="mpt-color" data-color="#3182ce" style="background:#3182ce" title="Blue"></div>
          <div class="mpt-color" data-color="#38a169" style="background:#38a169" title="Green"></div>
          <div class="mpt-color" data-color="#f6e05e" style="background:#f6e05e" title="Yellow"></div>
          <div class="mpt-sep"></div>
          <input type="range" id="brushSize" min="2" max="20" value="4" style="width:70px;accent-color:#00bfa5">
        </div>
        <div class="media-preview-footer">
          <input class="media-preview-caption" id="imgEdCaption" placeholder="Add a caption...">
          <button class="media-preview-send" id="imgEdSend">Send ➤</button>
        </div>`;
      document.body.appendChild(ov);
      const canvas=ov.querySelector('#imgEdCanvas');
      const ctx=canvas.getContext('2d');
      const maxW=Math.min(window.innerWidth-40,680);
      const maxH=Math.min(window.innerHeight-200,520);
      const scale=Math.min(maxW/img.width,maxH/img.height,1);
      canvas.width=img.width*scale;canvas.height=img.height*scale;
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      let drawColor='#e53e3e',brushSz=4,isDrawing=false,tool='draw';
      let cropStart=null;
      let snapshots=[ctx.getImageData(0,0,canvas.width,canvas.height)];
      canvas.style.cursor='crosshair';
      ov.querySelector('#toolDraw').addEventListener('click',()=>{
        tool='draw';ov.querySelectorAll('.mpt-btn').forEach(b=>b.classList.remove('active'));ov.querySelector('#toolDraw').classList.add('active');canvas.style.cursor='crosshair';
      });
      ov.querySelector('#toolCrop').addEventListener('click',()=>{
        tool='crop';ov.querySelectorAll('.mpt-btn').forEach(b=>b.classList.remove('active'));ov.querySelector('#toolCrop').classList.add('active');canvas.style.cursor='cell';
      });
      ov.querySelector('#toolUndo').addEventListener('click',()=>{
        if(snapshots.length>1){snapshots.pop();ctx.putImageData(snapshots[snapshots.length-1],0,0);}
      });
      ov.querySelectorAll('.mpt-color').forEach(el=>{
        el.addEventListener('click',()=>{ov.querySelectorAll('.mpt-color').forEach(c=>c.classList.remove('active'));el.classList.add('active');drawColor=el.dataset.color;});
      });
      ov.querySelector('#brushSize').addEventListener('input',e=>{brushSz=parseInt(e.target.value);});
      function getPos(e){
        const rect=canvas.getBoundingClientRect();
        const cx=e.touches?e.touches[0].clientX:e.clientX;
        const cy=e.touches?e.touches[0].clientY:e.clientY;
        return{x:(cx-rect.left)*(canvas.width/rect.width),y:(cy-rect.top)*(canvas.height/rect.height)};
      }
      canvas.addEventListener('mousedown',e=>{isDrawing=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);if(tool==='crop')cropStart={x:p.x,y:p.y};});
      canvas.addEventListener('mousemove',e=>{
        if(!isDrawing)return;const p=getPos(e);
        if(tool==='draw'){ctx.lineWidth=brushSz;ctx.strokeStyle=drawColor;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineTo(p.x,p.y);ctx.stroke();}
        else if(tool==='crop'&&cropStart){ctx.putImageData(snapshots[snapshots.length-1],0,0);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.setLineDash([6,3]);ctx.strokeRect(cropStart.x,cropStart.y,p.x-cropStart.x,p.y-cropStart.y);ctx.setLineDash([]);}
      });
      function endDraw(e){
        if(!isDrawing)return;isDrawing=false;
        if(tool==='crop'&&cropStart){
          const p=getPos(e.changedTouches?{clientX:e.changedTouches[0].clientX,clientY:e.changedTouches[0].clientY}:e);
          const cx2=Math.min(cropStart.x,p.x),cy2=Math.min(cropStart.y,p.y),cw=Math.abs(p.x-cropStart.x),ch=Math.abs(p.y-cropStart.y);
          if(cw>10&&ch>10){const tmp=document.createElement('canvas');tmp.width=cw;tmp.height=ch;tmp.getContext('2d').drawImage(canvas,cx2,cy2,cw,ch,0,0,cw,ch);canvas.width=cw;canvas.height=ch;ctx.drawImage(tmp,0,0);}
          cropStart=null;
        }
        snapshots.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(snapshots.length>20)snapshots.shift();
      }
      canvas.addEventListener('mouseup',endDraw);
      canvas.addEventListener('touchstart',e=>{isDrawing=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);if(tool==='crop')cropStart={x:p.x,y:p.y};},{passive:true});
      canvas.addEventListener('touchmove',e=>{if(!isDrawing)return;const p=getPos(e);if(tool==='draw'){ctx.lineWidth=brushSz;ctx.strokeStyle=drawColor;ctx.lineCap='round';ctx.lineTo(p.x,p.y);ctx.stroke();}},{passive:true});
      canvas.addEventListener('touchend',endDraw);
      ov.querySelector('#mpoClose').addEventListener('click',()=>ov.remove());
      ov.querySelector('#imgEdSend').addEventListener('click',()=>{
        canvas.toBlob(async blob=>{
          ov.remove();
          const caption=ov.querySelector('#imgEdCaption')?.value?.trim()||'';
          const f=new File([blob],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg'});
          await uploadAndSendFile(f,caption);
        },'image/jpeg',0.88);
      });
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

/* ── Upload and send file ─── */
async function uploadAndSendFile(file,caption=''){
  if(!file||!activeChat)return;
  const formData=new FormData();formData.append('file',file);
  try{
    showToast('Uploading...');
    const r=await fetch('/api/upload/media',{method:'POST',headers:{'Authorization':'Bearer '+myToken},body:formData});
    if(!r.ok)throw new Error('Upload failed');
    const{url,name,size,type}=await r.json();
    const id=genId();
    const replyToId=replyToMsg?.id||null;
    let msgType=type.startsWith('image/')?'image':type.startsWith('video/')?'video':type.startsWith('audio/')?'audio':'file';
    const msg={id,from:myUser.username,msgType,fileUrl:url,fileName:name,fileSize:size,fileType:type,time:new Date().toISOString(),status:'sent',content:caption||null,reply_to:replyToMsg||null,replyToId,reactions:[]};
    if(activeChat.type==='group'){msg.groupId=activeChat.id;socket.emit('group-message',{groupId:activeChat.id,msgType,fileUrl:url,fileName:name,fileSize:size,fileType:type,msgId:id,content:caption||null,replyToId});}
    else{msg.to=activeChat.id;socket.emit('private-message',{to:activeChat.id,msgType,fileUrl:url,fileName:name,fileSize:size,fileType:type,msgId:id,content:caption||null,replyToId});}
    const key=activeChatKey();ensureChat(key);
    chats[key].messages.push(msg);chats[key].lastMsg=`📎 ${name}`;chats[key].lastTime=isoToTime(msg.time);
    appendMessageToDom(msg);clearReplyTo();renderChatList();
  }catch(e){showToast('Upload failed: '+e.message);}
}

/* ════════════════════════════════════════════════════════════════════════════
   VOICE NOTE RECORDING
════════════════════════════════════════════════════════════════════════════ */
function startVoiceRecording(){
  if(isRecordingVoice||!activeChat){return;}
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    isRecordingVoice=true;audioChunks=[];
    const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
    mediaRecorder=new MediaRecorder(stream,{mimeType});
    mediaRecorder.ondataavailable=e=>{if(e.data.size>0)audioChunks.push(e.data);};
    mediaRecorder.start(100);
    const voiceBtn=$('voiceRecordBtn');if(voiceBtn)voiceBtn.classList.add('recording');
    const recBar=$('recordingBar');if(recBar)recBar.style.display='flex';
    inputBar.style.display='none';
    const rBar=$('replyPreviewBar');if(rBar&&replyToMsg)rBar.style.display='none';
    recSeconds=0;updateRecTimer();
    recTimerInterval=setInterval(()=>{recSeconds++;updateRecTimer();},1000);
  }).catch(()=>showToast('Microphone access denied'));
}
function updateRecTimer(){
  const el=$('recTimer');if(!el)return;
  const m=Math.floor(recSeconds/60),s=recSeconds%60;
  el.textContent=`${m}:${String(s).padStart(2,'0')}`;
}
function stopVoiceRecording(send){
  if(!isRecordingVoice||!mediaRecorder)return;
  isRecordingVoice=false;clearInterval(recTimerInterval);
  mediaRecorder.stop();
  mediaRecorder.stream.getTracks().forEach(t=>t.stop());
  const recBar=$('recordingBar');if(recBar)recBar.style.display='none';
  inputBar.style.display='flex';
  const voiceBtn=$('voiceRecordBtn');if(voiceBtn)voiceBtn.classList.remove('recording');
  if(replyToMsg){const rBar=$('replyPreviewBar');if(rBar)rBar.style.display='flex';}
  if(!send){audioChunks=[];return;}
  mediaRecorder.onstop=async()=>{
    const blob=new Blob(audioChunks,{type:'audio/webm'});
    const file=new File([blob],`voice_${Date.now()}.webm`,{type:'audio/webm'});
    const fd=new FormData();fd.append('file',file);
    try{
      const r=await fetch('/api/upload/media',{method:'POST',headers:{'Authorization':'Bearer '+myToken},body:fd});
      const{url,name,size,type}=await r.json();
      const id=genId();
      const replyToId=replyToMsg?.id||null;
      const msg={id,from:myUser.username,msgType:'voice_note',fileUrl:url,fileName:name,fileSize:size,fileType:type,time:new Date().toISOString(),status:'sent',reply_to:replyToMsg||null,replyToId,reactions:[]};
      if(activeChat.type==='group'){msg.groupId=activeChat.id;socket.emit('group-message',{groupId:activeChat.id,msgType:'voice_note',fileUrl:url,fileName:name,fileSize:size,fileType:type,msgId:id,replyToId});}
      else{msg.to=activeChat.id;socket.emit('private-message',{to:activeChat.id,msgType:'voice_note',fileUrl:url,fileName:name,fileSize:size,fileType:type,msgId:id,replyToId});}
      const key=activeChatKey();ensureChat(key);
      chats[key].messages.push(msg);appendMessageToDom(msg);clearReplyTo();renderChatList();
    }catch(e){showToast('Voice send failed');}
    audioChunks=[];
  };
}

/* ── FIXED: Share Contact — select recipient first, then share ─── */
function openShareContactModal(){
  if(!activeChat)return;
  // Show contact picker — select WHICH contact to share
  const picker=document.createElement('div');picker.className='modal-overlay';
  picker.innerHTML=`<div class="modal-card"><div class="modal-header"><h3>Share Contact</h3><button class="modal-close" id="closeContactPicker">✕</button></div>
    <div style="padding:10px 16px;font-size:12px;color:var(--ts)">Select a contact to share in this chat</div>
    <div class="modal-user-list" id="contactPickerList"></div></div>`;
  document.body.appendChild(picker);
  picker.querySelector('#closeContactPicker').addEventListener('click',()=>picker.remove());
  picker.addEventListener('click',e=>{if(e.target===picker)picker.remove();});
  const list=picker.querySelector('#contactPickerList');
  // Show ALL contacts (including self) that can be shared, except current chat partner
  const allContacts=Object.values(allUsersMap).filter(u=>u.id!==myUser?.id);
  if(!allContacts.length){
    list.innerHTML='<div style="padding:16px;color:var(--ts);text-align:center">No contacts available</div>';
  }
  allContacts.forEach(u=>{
    const item=document.createElement('div');item.className='modal-user-item';
    item.innerHTML=`${makeAvatarHtml(u,36,14)}<div><div style="font-weight:600">${u.username}</div><div style="font-size:11px;color:var(--ts)">${u.email||''}</div></div>`;
    item.addEventListener('click',()=>{sendContactCard(u);picker.remove();});
    list.appendChild(item);
  });
}

function sendContactCard(u){
  if(!activeChat)return;
  const id=genId();
  const content=JSON.stringify({id:u.id,username:u.username,email:u.email,avatarColor:u.avatar_color||u.avatarColor});
  const msg={id,from:myUser.username,msgType:'contact',content,time:new Date().toISOString(),status:'sent',reactions:[]};
  if(activeChat.type==='group'){msg.groupId=activeChat.id;socket.emit('group-message',{groupId:activeChat.id,content,msgType:'contact',msgId:id});}
  else{msg.to=activeChat.id;socket.emit('private-message',{to:activeChat.id,content,msgType:'contact',msgId:id});}
  const key=activeChatKey();ensureChat(key);
  chats[key].messages.push(msg);appendMessageToDom(msg);renderChatList();
}

/* ════════════════════════════════════════════════════════════════════════════
   LIVE LOCATION
════════════════════════════════════════════════════════════════════════════ */
function openLiveLocationModal(){
  locLoadingMsg.style.display='flex';locInfoBar.style.display='none';
  liveLocationModal.style.display='flex';
  document.querySelectorAll('.loc-opt-btn').forEach(b=>b.classList.toggle('active',b.dataset.duration==='0'));
  liveLocDuration=0;
  navigator.geolocation.getCurrentPosition(pos=>{
    const{latitude:lat,longitude:lng,speed,heading,accuracy}=pos.coords;
    currentUserLoc={lat,lng,speed,heading,accuracy};
    locLoadingMsg.style.display='none';locInfoBar.style.display='flex';
    if(locSpeed)locSpeed.textContent=Math.round((speed||0)*3.6)+' km/h';
    if(locHeading)locHeading.textContent=Math.round(heading||0)+'°';
    if(locAccuracy)locAccuracy.textContent=Math.round(accuracy||0)+'m';
    renderLocationMap(lat,lng);
  },()=>{locLoadingMsg.innerHTML='<span>Location access denied.</span>';},{enableHighAccuracy:true});
}
function renderLocationMap(lat,lng){
  if(typeof google!=='undefined'&&google.maps){
    if(!liveMapInstance){
      liveMapInstance=new google.maps.Map(locationMapContainer,{zoom:15,center:{lat,lng},mapTypeId:'roadmap'});
      liveMarker=new google.maps.Marker({position:{lat,lng},map:liveMapInstance,icon:{path:google.maps.SymbolPath.CIRCLE,scale:9,fillColor:'#00bfa5',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});
    }else{liveMapInstance.setCenter({lat,lng});liveMarker.setPosition({lat,lng});}
  }else{
    locationMapContainer.innerHTML=`<iframe src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed" width="100%" height="100%" style="border:none;display:block"></iframe>`;
    locLoadingMsg.style.display='none';
  }
}
closeLiveLocModal?.addEventListener('click',()=>{liveLocationModal.style.display='none';stopLiveLocation();});
document.querySelectorAll('.loc-opt-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{document.querySelectorAll('.loc-opt-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');liveLocDuration=parseInt(btn.dataset.duration);});
});
sendLiveLocBtn?.addEventListener('click',()=>{
  if(!currentUserLoc){showToast('Location not available');return;}
  const{lat,lng}=currentUserLoc;
  liveMsgId=genId();
  const msg={id:liveMsgId,from:myUser.username,msgType:'location',content:JSON.stringify({lat,lng,duration:liveLocDuration,sessionId:liveMsgId}),time:new Date().toISOString(),status:'sent',reactions:[]};
  if(activeChat.type==='group'){msg.groupId=activeChat.id;socket.emit('group-message',{groupId:activeChat.id,content:msg.content,msgType:'location',msgId:liveMsgId});}
  else{msg.to=activeChat.id;socket.emit('private-message',{to:activeChat.id,content:msg.content,msgType:'location',msgId:liveMsgId});}
  const key=activeChatKey();ensureChat(key);
  chats[key].messages.push(msg);chats[key].lastMsg='📍 Location';chats[key].lastTime=isoToTime(msg.time);
  appendMessageToDom(msg);renderChatList();
  liveLocationModal.style.display='none';
  showToast(liveLocDuration>0?'Live location started!':'Location shared!');
  if(liveLocDuration>0){
    liveLocStartTimes[liveMsgId]=new Date();
    startLiveLocTimerDisplay(liveMsgId);
    startLiveLocationWatch();
  }
  liveMapInstance=null;liveMarker=null;
});
function startLiveLocationWatch(){
  if(liveLocWatchId)navigator.geolocation.clearWatch(liveLocWatchId);
  liveLocWatchId=navigator.geolocation.watchPosition(pos=>{
    const{latitude:lat,longitude:lng,speed,heading,accuracy}=pos.coords;
    socket.emit('live-location-update',{to:activeChat?.type==='private'?activeChat.id:undefined,groupId:activeChat?.type==='group'?activeChat.id:undefined,lat,lng,speed:speed||0,heading:heading||0,accuracy:accuracy||0,sessionId:liveMsgId});
    updateLiveLocationBubble(myUser.username,lat,lng,liveMsgId);
  },{enableHighAccuracy:true,maximumAge:5000});
  if(liveLocDuration>0)setTimeout(stopLiveLocation,liveLocDuration*60000);
}
function stopLiveLocation(){
  if(liveLocWatchId){navigator.geolocation.clearWatch(liveLocWatchId);liveLocWatchId=null;}
  if(liveMsgId&&activeChat){
    socket.emit('stop-live-location',{to:activeChat?.type==='private'?activeChat.id:undefined,groupId:activeChat?.type==='group'?activeChat.id:undefined,sessionId:liveMsgId});
  }
  if(liveMsgId&&liveLocTimerIntervals[liveMsgId]){clearInterval(liveLocTimerIntervals[liveMsgId]);delete liveLocTimerIntervals[liveMsgId];}
}
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 3 / 4
//  Profile Info Panel · Groups · Settings · Status · Call History
// ════════════════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════════════════════════════════════
   PROFILE INFO PANEL
════════════════════════════════════════════════════════════════════════════ */
pipCloseBtn?.addEventListener('click',closeProfilePanel);
function closeProfilePanel(){profileInfoPanel.classList.remove('open');activePipUser=null;}

async function openProfilePanel(id,isGroup){
  activePipUser=isGroup?null:id;
  profileInfoPanel.classList.add('open');
  pipHeaderTitle.textContent=isGroup?'Group Info':'Contact Info';
  if(isGroup){
    const g=groups[id];
    pipHeroName.textContent=g?.name||id;
    pipHeroStatus.textContent=`${g?.members?.length||0} members`;pipHeroStatus.style.color='var(--ts)';
    pipHeroAvatar.textContent=getInitial(g?.name||id);pipHeroAvatar.style.background=getAvatarColor(g?.name||id);
    pipRowPhone.style.display='none';pipRowAbout.style.display='none';
    pipEmailVal.textContent='Group';pipGroupsCard.style.display='none';
    document.querySelector('.pip-quick-actions')?.style&&(document.querySelector('.pip-quick-actions').style.display='none');
    return;
  }
  document.querySelector('.pip-quick-actions')&&(document.querySelector('.pip-quick-actions').style.display='');
  const u=allUsersMap[id]||contacts[id];
  try{
    const profile=await api('GET',`/api/users/${u?.id||0}/profile`);
    setAvatarEl(pipHeroAvatar,profile);
    pipHeroName.textContent=profile.username;
    pipHeroStatus.textContent=profile.is_online?'online':formatLastSeen(profile.last_seen);
    pipHeroStatus.style.color=profile.is_online?'var(--accent)':'var(--ts)';
    pipEmailVal.textContent=profile.email||'';
    if(profile.phone){pipPhoneVal.textContent=profile.phone;pipRowPhone.style.display='flex';}else pipRowPhone.style.display='none';
    if(profile.about){pipAboutVal.textContent=profile.about;pipRowAbout.style.display='flex';}else pipRowAbout.style.display='none';
    const bs=await api('GET',`/api/block/check/${profile.id}`);
    pipBlockLabel.textContent=bs.iBlockedThem?'Unblock':'Block';
    pipBlockBtn.dataset.blocked=bs.iBlockedThem?'1':'0';
    pipBlockBtn.dataset.uid=profile.id;
    pipBlockBtn.style.display='flex';
    try{
      const cg=await api('GET',`/api/users/${profile.id}/common-groups`);
      if(cg.length){
        pipGroupsCard.style.display='block';pipGroupsList.innerHTML='';
        cg.forEach(g=>{const row=document.createElement('div');row.className='pip-group-row';row.innerHTML=`<div class="pip-gr-av">${getInitial(g.name)}</div><div><div class="pip-gr-name">${g.name}</div><div class="pip-gr-count">${g.member_count} members</div></div>`;pipGroupsList.appendChild(row);});
      }else pipGroupsCard.style.display='none';
    }catch{pipGroupsCard.style.display='none';}
    loadPipMedia(profile.id);
    const chatK=chatKey('private',id);
    const cs=await getChatSettings(chatK);
    if(pipDMSelect){pipDMSelect.value=cs.disappearing_msgs||'off';updateDMHint(cs.disappearing_msgs||'off');}
    if(pipLockToggle){
      pipLockToggle.checked=!!cs.is_locked;
      pipLockPinWrap.style.display=cs.is_locked?'block':'none';
    }
    document.querySelectorAll('.theme-swatch').forEach(s=>s.classList.toggle('active',s.dataset.theme===(cs.theme||'default')));
  }catch(e){
    setAvatarEl(pipHeroAvatar,u||{username:id});
    pipHeroName.textContent=id;
    pipHeroStatus.textContent=u?.is_online?'online':formatLastSeen(u?.last_seen);
    pipHeroStatus.style.color=u?.is_online?'var(--accent)':'var(--ts)';
    pipEmailVal.textContent=u?.email||'';
  }
}

async function loadPipMedia(userId){
  try{
    const media=await api('GET',`/api/chat-media/${userId}`);
    pipMediaCount.textContent=media.length;
    pipMediaGrid.innerHTML='';pipNoMedia.style.display='none';
    if(!media.length){pipNoMedia.style.display='block';return;}
    media.slice(0,9).forEach(m=>{
      const t=document.createElement('div');t.className='pip-media-thumb';
      if(m.file_type?.startsWith('image/'))t.innerHTML=`<img src="${m.file_path}" loading="lazy">`;
      else t.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:24px">📄</div>`;
      t.addEventListener('click',()=>{if(m.file_type?.startsWith('image/'))openImageViewer(m.file_path);else window.open(m.file_path,'_blank');});
      pipMediaGrid.appendChild(t);
    });
  }catch{}
}

pipBlockBtn?.addEventListener('click',async()=>{
  const uid=pipBlockBtn.dataset.uid,blocked=pipBlockBtn.dataset.blocked==='1';
  try{
    if(blocked){await api('DELETE',`/api/block/${uid}`);pipBlockLabel.textContent='Block';pipBlockBtn.dataset.blocked='0';showToast('Unblocked');}
    else{await api('POST',`/api/block/${uid}`);pipBlockLabel.textContent='Unblock';pipBlockBtn.dataset.blocked='1';showToast('Blocked');}
  }catch(e){showToast(e.message);}
});

pipShareContactBtn?.addEventListener('click',()=>{
  const u=allUsersMap[activePipUser]||contacts[activePipUser];if(!u)return;
  sendContactCard(u);closeProfilePanel();showToast('Contact shared!');
});

pipDMSelect?.addEventListener('change',async()=>{
  if(!activeChat)return;
  updateDMHint(pipDMSelect.value);
  try{await api('PUT',`/api/chat-settings/${encodeURIComponent(activeChatKey())}`,{disappearingMsgs:pipDMSelect.value});showToast('Disappearing messages updated');}
  catch(e){showToast(e.message);}
});
function updateDMHint(val){if(pipDMHint)pipDMHint.textContent=val==='off'?'Off':val;}

// Theme swatches
pipThemeRow?.querySelectorAll('.theme-swatch').forEach(s=>{
  s.addEventListener('click',async()=>{
    if(!activeChat)return;
    document.querySelectorAll('.theme-swatch').forEach(x=>x.classList.remove('active'));
    s.classList.add('active');
    const theme=s.dataset.theme;
    if(theme!=='default')mainArea.setAttribute('data-chat-theme',theme);
    else mainArea.removeAttribute('data-chat-theme');
    try{await api('PUT',`/api/chat-settings/${encodeURIComponent(activeChatKey())}`,{theme});}catch{}
  });
});

// FIXED: Lock chat — save to DB, manage sessionStorage correctly
pipLockToggle?.addEventListener('change',()=>{
  pipLockPinWrap.style.display=pipLockToggle.checked?'block':'none';
  // If turning off, clear pin field
  if(!pipLockToggle.checked)pipLockPinInput.value='';
});
pipSaveLockBtn?.addEventListener('click',async()=>{
  if(!activeChat)return;
  const key=activeChatKey(),pin=pipLockPinInput.value;
  if(pipLockToggle.checked&&pin.length<4){showToast('Enter at least 4 digit PIN');return;}
  try{
    await api('PUT',`/api/chat-settings/${encodeURIComponent(key)}`,{
      isLocked:pipLockToggle.checked,
      lockPin:pipLockToggle.checked?pin:null
    });
    if(pipLockToggle.checked){
      // Just locked — mark as unlocked for current session (don't ask pin right now)
      lockedChats[key]=true;
      saveUnlockedChats();
      showToast('Chat locked! PIN set.');
    }else{
      // Unlocked — remove from DB and from session
      delete lockedChats[key];
      saveUnlockedChats();
      showToast('Chat unlocked!');
    }
    pipLockPinInput.value='';
  }catch(e){showToast(e.message);}
});

// Export chat
if(pipExportBtn){
  pipExportBtn.addEventListener('click',async e=>{
    e.stopImmediatePropagation();
    if(!activeChat)return;
    const key=activeChatKey();
    try{
      const r=await fetch(`/api/chat/export/${encodeURIComponent(key)}`,{headers:{'Authorization':'Bearer '+myToken}});
      if(!r.ok){const d=await r.json();throw new Error(d.error||'Export failed');}
      const text=await r.text();
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
      a.download=`chat_export_${Date.now()}.txt`;a.click();
      showToast('Chat exported!');
    }catch(e){showToast('Export failed: '+e.message);}
  },{capture:true});
}

// Clear chat
pipClearBtn?.addEventListener('click',async()=>{
  if(!activeChat||!confirm('Clear all messages? This cannot be undone.'))return;
  const key=activeChatKey();
  try{
    await api('DELETE',`/api/chat/clear/${encodeURIComponent(key)}`);
    chats[key]={messages:[],unread:0,lastMsg:'',lastTime:'',_loaded:true};
    renderMessages(key);renderChatList();showToast('Chat cleared');
  }catch(e){showToast(e.message);}
});

/* ════════════════════════════════════════════════════════════════════════════
   GROUPS
════════════════════════════════════════════════════════════════════════════ */
newGroupBtn?.addEventListener('click',()=>{
  groupMembersList.innerHTML='';groupNameInput.value='';
  Object.values(contacts).forEach(u=>{
    if(u.username===myUser?.username)return;
    const item=document.createElement('div');item.className='modal-user-item';item.dataset.username=u.username;
    item.innerHTML=`${makeAvatarHtml(u,36,14)}<span>${u.username}</span><div class="check"></div>`;
    item.addEventListener('click',()=>item.classList.toggle('selected'));
    groupMembersList.appendChild(item);
  });
  newGroupModal.style.display='flex';
});
closeGroupModal?.addEventListener('click',()=>{newGroupModal.style.display='none';});
createGroupBtn?.addEventListener('click',()=>{
  const name=groupNameInput.value.trim();if(!name){showToast('Enter a group name');return;}
  const sel=[...groupMembersList.querySelectorAll('.modal-user-item.selected')].map(el=>el.dataset.username);
  if(!sel.length){showToast('Select at least 1 member');return;}
  socket.emit('create-group',{groupId:genId(),name,members:[myUser.username,...sel]});
  newGroupModal.style.display='none';
});

/* ════════════════════════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════════════════════════ */
settingsProfile?.addEventListener('click',()=>openSubPanel(subProfile));
settingsAccount?.addEventListener('click',()=>openSubPanel(subAccount));
settingsPrivacy?.addEventListener('click',()=>openSubPanel(subPrivacy));

function openSubPanel(panel){
  [subProfile,subAccount,subPrivacy].forEach(p=>{if(p)p.style.display='none';});
  if(panel)panel.style.display='flex';
  showMain();
}
document.querySelectorAll('.sub-back-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    [subProfile,subAccount,subPrivacy].forEach(p=>{if(p)p.style.display='none';});
    if(window.innerWidth<=768){showSidebar();switchPanel('settings');}
    else{chatEmptyState.style.display='flex';chatHeader.style.display='none';messagesArea.style.display='none';inputBar.style.display='none';profileInfoPanel.classList.remove('open');}
  });
});

saveProfileBtn?.addEventListener('click',async()=>{
  try{
    await api('PUT','/api/profile',{username:profileNameInput.value.trim(),about:profileAboutInput.value,phone:profilePhoneInput.value});
    myUser.username=profileNameInput.value.trim()||myUser.username;
    localStorage.setItem('chatapp_user',JSON.stringify(myUser));
    myUsernameLabel.textContent=myUser.username;
    showToast('Profile saved!');
  }catch(e){showToast(e.message);}
});

changePhotoBtn?.addEventListener('click',()=>profilePicInput.click());
profilePicInput?.addEventListener('change',async()=>{
  const file=profilePicInput.files[0];if(!file)return;
  const formData=new FormData();formData.append('file',file);
  try{
    const r=await fetch('/api/upload',{method:'POST',headers:{'Authorization':'Bearer '+myToken},body:formData});
    const data=await r.json();const url=data.url;if(!url){showToast('Upload failed');return;}
    myUser.avatarUrl=url;localStorage.setItem('chatapp_user',JSON.stringify(myUser));
    setAvatarEl(profileBigAvatar,myUser);setAvatarEl(myAvatarEl,myUser);
    if(myStatusAvatar)setAvatarEl(myStatusAvatar,myUser);
    // FIXED: Broadcast avatar update to all contacts via socket
    socket.emit('avatar-updated',{avatarUrl:url});
    showToast('Photo updated!');
  }catch{showToast('Upload failed');}
  profilePicInput.value='';
});

twoStepToggle?.addEventListener('change',()=>{twoStepPinRow.style.display=twoStepToggle.checked?'block':'none';});
saveTwoStepBtn?.addEventListener('click',async()=>{
  try{await api('PUT','/api/two-step',{pin:twoStepPinInput.value});showToast('PIN set!');}catch(e){showToast(e.message);}
});
changeEmailBtn?.addEventListener('click',async()=>{
  try{await api('PUT','/api/change-email',{newEmail:newEmailInput.value.trim(),currentPassword:changeEmailCurPass.value});showToast('Email changed!');}catch(e){showToast(e.message);}
});
changePassBtn?.addEventListener('click',async()=>{
  try{await api('PUT','/api/change-password',{currentPassword:curPassInput.value,newPassword:newPassInput.value});showToast('Password changed!');curPassInput.value='';newPassInput.value='';}catch(e){showToast(e.message);}
});
deleteAccountBtn?.addEventListener('click',async()=>{
  if(!confirm('Are you sure? This cannot be undone.'))return;
  try{await api('DELETE','/api/account');doLogout();}catch(e){showToast(e.message);}
});
savePrivacyBtn?.addEventListener('click',async()=>{
  try{await api('PUT','/api/privacy',{privLastSeen:privLastSeen.value,privPhoto:privProfilePic.value,privAbout:privAbout.value,privGroupAdd:privGroupAdd.value,liveLocEnabled:liveLocToggle.checked});showToast('Privacy settings saved!');}catch(e){showToast(e.message);}
});
profileAboutInput?.addEventListener('input',()=>{
  const s=profileAboutInput.parentElement.querySelector('small');if(s)s.textContent=`${profileAboutInput.value.length}/200`;
});

/* ════════════════════════════════════════════════════════════════════════════
   CALL HISTORY
════════════════════════════════════════════════════════════════════════════ */
async function loadCallHistory(){
  try{const calls=await api('GET','/api/calls');renderCallHistory(calls);}
  catch(e){console.error('call history:',e);}
}
function renderCallHistory(calls){
  callHistoryList.innerHTML='';
  if(!calls.length){callHistoryList.innerHTML=`<div class="empty-panel-hint"><svg viewBox="0 0 24 24" width="40" height="40" fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" stroke-width="1.5"/></svg><p>No call history yet</p></div>`;return;}
  calls.forEach(c=>{
    const isMe=c.caller_id===myUser.id;
    const otherName=isMe?(c.callee_name||c.group_name||'?'):(c.caller_name||'?');
    const otherColor=isMe?(c.callee_color||'#00A884'):(c.caller_color||'#00A884');
    let direction,dirClass;
    if(c.status==='missed'){direction='↙ Missed';dirClass='ch-icon-miss';}
    else if(isMe){direction='↗ Outgoing';dirClass='ch-icon-out';}
    else{direction='↙ Incoming';dirClass='ch-icon-in';}
    const d=new Date(c.started_at);
    const item=document.createElement('div');item.className='call-hist-item';
    item.innerHTML=`<div class="ch-avatar" style="background:${otherColor}">${getInitial(otherName)}</div><div class="ch-body"><div class="ch-name">${otherName}</div><div class="ch-meta"><span class="${dirClass}">${direction}</span><span>·</span><span>${c.call_type==='video'?'📹':'📞'}${c.is_group?' Group':''}</span>${c.duration_s?`<span>· ${fmtDuration(c.duration_s)}</span>`:''}</div></div><div class="ch-side"><div class="ch-time">${d.toLocaleDateString([],{day:'2-digit',month:'short'})} ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div></div>`;
    item.addEventListener('click',()=>{if(!c.is_group&&otherName&&contacts[otherName]){openChat({type:'private',id:otherName,name:otherName,isGroup:false});switchPanel('chats');if(window.innerWidth<=768)showMain();}});
    callHistoryList.appendChild(item);
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   STATUS  (WhatsApp-style 24h)
════════════════════════════════════════════════════════════════════════════ */
statusAddPlusBtn?.addEventListener('click',()=>{createStatusModal.style.display='flex';});
closeCreateStatus?.addEventListener('click',()=>{createStatusModal.style.display='none';});
document.querySelectorAll('.stt-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.stt-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    statusType=btn.dataset.type;
    statusTextSection.style.display=statusType==='text'?'block':'none';
    statusPhotoSection.style.display=statusType==='image'?'block':'none';
  });
});
document.querySelectorAll('.sbg-opt').forEach(opt=>{
  opt.addEventListener('click',()=>{
    document.querySelectorAll('.sbg-opt').forEach(o=>o.classList.remove('active'));opt.classList.add('active');
    statusBgColor=opt.dataset.bg;if(statusTextPreview)statusTextPreview.style.background=statusBgColor;
  });
});
document.querySelector('.status-photo-upload')?.addEventListener('click',()=>statusPhotoInput.click());
statusPhotoInput?.addEventListener('change',()=>{
  const f=statusPhotoInput.files[0];if(!f)return;
  const r=new FileReader();r.onload=e=>{statusPhotoPreview.src=e.target.result;statusPhotoPreview.style.display='block';spuPlaceholder.style.display='none';};r.readAsDataURL(f);
});
postStatusBtn?.addEventListener('click',async()=>{
  try{
    if(statusType==='text'){
      const content=statusTextInput.value.trim();if(!content){showToast('Enter some text');return;}
      const r=await api('POST','/api/status',{contentType:'text',content,bgColor:statusBgColor,textColor:'#ffffff',fontSize:24});
      socket.emit('status-posted',{statusId:r.id});
    }else{
      const file=statusPhotoInput.files[0];if(!file){showToast('Select a photo');return;}
      const fd=new FormData();fd.append('file',file);
      const ur=await fetch('/api/upload/media',{method:'POST',headers:{'Authorization':'Bearer '+myToken},body:fd});
      const{url}=await ur.json();
      const r=await api('POST','/api/status',{contentType:'image',fileUrl:url,caption:statusCaptionInput.value.trim()||null});
      socket.emit('status-posted',{statusId:r.id});
    }
    createStatusModal.style.display='none';
    statusTextInput.value='';statusCaptionInput.value='';
    statusPhotoPreview.style.display='none';spuPlaceholder.style.display='flex';statusPhotoPreview.src='';
    showToast('Status posted!');loadStatuses();
  }catch(e){showToast(e.message);}
});

async function loadStatuses(){
  try{const list=await api('GET','/api/status');renderStatusPanel(list);}catch{}
}

function renderStatusPanel(list){
  statusContactsList.innerHTML='';
  currentStatusList=list;
  let myEntry=null;const others=[];
  list.forEach(u=>{if(u.is_mine)myEntry=u;else others.push(u);});
  if(myStatusAvatar)setAvatarEl(myStatusAvatar,myUser);
  if(myStatusSub){
    if(myEntry&&myEntry.statuses.length){myStatusSub.textContent=`${myEntry.statuses.length} update${myEntry.statuses.length>1?'s':''}`;document.querySelector('.my-status-avatar')?.classList.add('has-status');}
    else{myStatusSub.textContent='Tap to add status update';document.querySelector('.my-status-avatar')?.classList.remove('has-status');}
  }
  document.querySelector('.my-status-row')?.addEventListener('click',()=>{
    if(myEntry&&myEntry.statuses.length)openStatusViewer(list.indexOf(myEntry));
    else createStatusModal.style.display='flex';
  },{once:true});
  if(!others.length){if(statusEmptyHint)statusEmptyHint.style.display='flex';return;}
  if(statusEmptyHint)statusEmptyHint.style.display='none';
  others.forEach(u=>{
    const allViewed=u.statuses.every(s=>s.i_viewed);
    const row=document.createElement('div');row.className='status-contact-row';
    const ringDiv=document.createElement('div');ringDiv.className=`status-ring-avatar ${allViewed?'all-viewed':'unviewed'}`;
    const imgDiv=document.createElement('div');imgDiv.className='sri-img';setAvatarEl(imgDiv,u);ringDiv.appendChild(imgDiv);
    const info=document.createElement('div');info.innerHTML=`<div class="sr-name">${u.username}</div><div class="sr-time">${isoToTime(u.statuses[0]?.created_at)}</div>`;
    row.appendChild(ringDiv);row.appendChild(info);
    row.addEventListener('click',()=>openStatusViewer(list.indexOf(u)));
    statusContactsList.appendChild(row);
  });
}

/* ── Status Viewer ─── */
function openStatusViewer(userIdx){currentStatusUserIdx=userIdx;currentStatusItemIdx=0;statusViewerModal.style.display='flex';renderStatusItem();}
function renderStatusItem(){
  const u=currentStatusList[currentStatusUserIdx];if(!u){closeStatusViewer();return;}
  const s=u.statuses[currentStatusItemIdx];if(!s){closeStatusViewer();return;}
  setAvatarEl(svAvatar,u);svName.textContent=u.username;svTime.textContent=isoToTime(s.created_at);svViewCount.textContent=s.view_count||0;
  svProgressBar.innerHTML='';
  for(let i=0;i<u.statuses.length;i++){
    const seg=document.createElement('div');seg.className='sv-progress-seg';
    const fill=document.createElement('div');fill.className='sv-progress-seg-fill';
    if(i<currentStatusItemIdx)fill.classList.add('done');
    seg.appendChild(fill);svProgressBar.appendChild(seg);
  }
  svContent.innerHTML='';
  if(s.content_type==='image'&&s.file_url){
    statusViewerModal.style.background='#000';
    const wrap=document.createElement('div');wrap.className='sv-img-content';
    wrap.innerHTML=`<img src="${s.file_url}" style="width:100%;height:100%;object-fit:contain">`;
    if(s.caption)wrap.innerHTML+=`<div class="sv-caption">${s.caption}</div>`;
    svContent.appendChild(wrap);
  }else{
    const wrap=document.createElement('div');wrap.className='sv-text-content';
    wrap.style.background=s.bg_color||'#1a2433';
    wrap.innerHTML=`<p style="font-size:${s.font_size||24}px;color:${s.text_color||'#fff'}">${s.content||''}</p>`;
    svContent.appendChild(wrap);statusViewerModal.style.background='transparent';
  }
  if(!u.is_mine){svReactions.style.display='flex';svReactBtn.textContent=s.my_reaction||'❤️';}
  else svReactions.style.display='none';
  if(!s.i_viewed)api('POST',`/api/status/${s.id}/view`).catch(()=>{});
  clearInterval(statusTimer);
  const fillEl=svProgressBar.children[currentStatusItemIdx]?.querySelector('.sv-progress-seg-fill');
  if(fillEl){
    let w=0;fillEl.style.width='0%';
    statusTimer=setInterval(()=>{w+=100/50;fillEl.style.width=Math.min(w,100)+'%';if(w>=100){clearInterval(statusTimer);advanceStatus();}},100);
  }
}
function advanceStatus(){
  const u=currentStatusList[currentStatusUserIdx];
  if(u&&currentStatusItemIdx<u.statuses.length-1){currentStatusItemIdx++;renderStatusItem();}
  else if(currentStatusUserIdx<currentStatusList.length-1){currentStatusUserIdx++;currentStatusItemIdx=0;renderStatusItem();}
  else closeStatusViewer();
}
function prevStatus(){
  if(currentStatusItemIdx>0){currentStatusItemIdx--;renderStatusItem();}
  else if(currentStatusUserIdx>0){currentStatusUserIdx--;const u=currentStatusList[currentStatusUserIdx];currentStatusItemIdx=Math.max(0,u.statuses.length-1);renderStatusItem();}
}
svTapNext?.addEventListener('click',()=>{clearInterval(statusTimer);advanceStatus();});
svTapPrev?.addEventListener('click',()=>{clearInterval(statusTimer);prevStatus();});
svCloseBtn?.addEventListener('click',closeStatusViewer);
function closeStatusViewer(){clearInterval(statusTimer);statusViewerModal.style.display='none';loadStatuses();}
svReactBtn?.addEventListener('click',()=>{svEmojiPicker.style.display=svEmojiPicker.style.display==='flex'?'none':'flex';});
svEmojiPicker?.querySelectorAll('span').forEach(em=>{
  em.addEventListener('click',async()=>{
    const u=currentStatusList[currentStatusUserIdx],s=u?.statuses[currentStatusItemIdx];if(!s)return;
    svReactBtn.textContent=em.dataset.emoji;svEmojiPicker.style.display='none';
    await api('POST',`/api/status/${s.id}/like`,{emoji:em.dataset.emoji});
  });
});
svViews?.addEventListener('click',async()=>{
  const u=currentStatusList[currentStatusUserIdx],s=u?.statuses[currentStatusItemIdx];
  if(!u?.is_mine||!s)return;
  try{
    const viewers=await api('GET',`/api/status/${s.id}/viewers`);
    statusViewersList.innerHTML='';
    viewers.forEach(v=>{
      const row=document.createElement('div');row.className='sv-viewer-row';
      row.innerHTML=`<div class="sv-viewer-av" style="background:${v.avatar_color||getAvatarColor(v.username)}">${getInitial(v.username)}${v.profile_pic?`<img src="${v.profile_pic}">`:''}</div><div><div class="sv-viewer-name">${v.username}</div><div class="sv-viewer-time">${isoToTime(v.viewed_at)}</div></div>${v.reaction?`<div class="sv-viewer-reaction">${v.reaction}</div>`:''}`;
      statusViewersList.appendChild(row);
    });
    statusViewersModal.style.display='flex';
  }catch{}
});
closeViewersModal?.addEventListener('click',()=>{statusViewersModal.style.display='none';});

/* ── Modal close on overlay click ─── */
[newGroupModal,addToCallModal,newChatModal,liveLocationModal,createStatusModal,statusViewersModal].forEach(modal=>{
  modal?.addEventListener('click',e=>{if(e.target===modal)modal.style.display='none';});
});
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 4 / 4
//  Calls · WebRTC · Media · Ringtone · Google Maps · Utils
//  FIXED: local video PiP in call, hold/resume, page refresh call persist
// ════════════════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════════════════════════════════════
   MEDIA  (camera / mic for calls)
════════════════════════════════════════════════════════════════════════════ */
async function startMedia(video = false) {
  if (localStream) return;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
  } catch {
    try { localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); } catch {}
  }
 
  // OLD localVideo element (keep for compatibility but hidden)
  if (localVideo && localStream) localVideo.srcObject = localStream;
 
  // Create/update our single local PiP
  createLocalPip();
}
// ── Single local PiP creator ─────────────────────────────────────────────
function createLocalPip() {
  // Remove any existing
  document.querySelectorAll('.call-local-pip').forEach(el => el.remove());
 
  if (!localStream || !activeCallScreen) return;
  if (currentCallType !== 'video') return;
  const videoTracks = localStream.getVideoTracks();
  if (!videoTracks.length) return;
 
  const pip = document.createElement('div');
  pip.className = 'call-local-pip';
  pip.id = 'callLocalPip';
  pip.innerHTML = `
    <video autoplay muted playsinline></video>
    <div class="call-local-pip-label">You</div>
    <button class="call-local-pip-flip" id="callLocalFlipBtn" title="Flip camera">
      <svg viewBox="0 0 24 24" width="14" height="14"><path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/></svg>
    </button>
  `;
 
  const vid = pip.querySelector('video');
  vid.srcObject = localStream;
  activeCallScreen.appendChild(pip);
 
  // Draggable
  makeDraggable(pip);
 
  // Flip button
  pip.querySelector('#callLocalFlipBtn').addEventListener('click', async (e) => {
    e.stopPropagation();
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    localStream.getVideoTracks().forEach(t => t.stop());
    try {
      const ns = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: currentFacingMode } });
      const nvt = ns.getVideoTracks()[0];
      localStream.getVideoTracks().forEach(t => localStream.removeTrack(t));
      localStream.addTrack(nvt);
      vid.srcObject = localStream;
      if (localVideo) localVideo.srcObject = localStream;
      for (const pc of Object.values(peerConnections)) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(nvt);
      }
      // Update mini pip too
      const miniLocal = document.querySelector('.mini-pip-local-video video');
      if (miniLocal) miniLocal.srcObject = localStream;
    } catch { showToast('Cannot flip camera'); }
  });
}

/* ── FIXED: Local video PiP element in active call ─── */
function updateLocalVideoPip(){
  // Create or update the draggable local video pip inside active call screen
  let localWrap=$('localVideoWrap');
  if(!localWrap&&activeCallScreen){
    localWrap=document.createElement('div');
    localWrap.id='localVideoWrap';
    localWrap.innerHTML=`<video id="localVidPip" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video>`;
    activeCallScreen.appendChild(localWrap);
    makeDraggable(localWrap);
  }
  if(localWrap){
    const vid=localWrap.querySelector('video');
    if(vid&&localStream)vid.srcObject=localStream;
    localWrap.style.display=(currentCallType==='video'&&localStream?.getVideoTracks().length)?'block':'none';
  }
}

camFlipBtn?.addEventListener('click',async()=>{
  currentFacingMode=currentFacingMode==='user'?'environment':'user';
  if(!localStream)return;
  localStream.getVideoTracks().forEach(t=>t.stop());
  try{
    const ns=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:currentFacingMode}});
    const nvt=ns.getVideoTracks()[0];
    localStream.getVideoTracks().forEach(t=>localStream.removeTrack(t));
    localStream.addTrack(nvt);
    if(localVideo)localVideo.srcObject=localStream;
    updateLocalVideoPip();
    for(const pc of Object.values(peerConnections)){
      const sender=pc.getSenders().find(s=>s.track?.kind==='video');if(sender)sender.replaceTrack(nvt);
    }
  }catch{showToast('Cannot flip camera');}
});

/* ════════════════════════════════════════════════════════════════════════════
   CALL FLOW
════════════════════════════════════════════════════════════════════════════ */
headerAudioCallBtn?.addEventListener('click',()=>initiateCall('audio',false));
headerVideoCallBtn?.addEventListener('click',()=>initiateCall('video',false));
headerGroupAudioCallBtn?.addEventListener('click',()=>initiateCall('audio',true));
headerGroupVideoCallBtn?.addEventListener('click',()=>initiateCall('video',true));
addToCallBtn?.addEventListener('click',openAddToCallModal);

async function initiateCall(callType,isGroup){
  if(!activeChat)return;
  currentCallType=callType;currentCallRoomId=genId();isGroupCall=isGroup;currentGroupCallId=isGroup?activeChat.id:null;
  await ensureIceServersLoaded();
  await startMedia(callType==='video');
  showOutgoingRing(activeChat.name,callType);
  socket.emit('call-invite',{to:!isGroup?activeChat.id:undefined,callType,isGroup,groupId:isGroup?activeChat.id:undefined,roomId:currentCallRoomId});
}
function showOutgoingRing(name,type){
  outgoingCallerName.textContent=name;
  const u=allUsersMap[name]||contacts[name];setAvatarEl(outgoingAvatarEl,u||{username:name});
  outgoingCallTypeLabel.textContent=(type==='video'?'Video':'Voice')+' calling...';
  outgoingCallScreen.style.display='flex';playRingtone(true);
}
function hideOutgoingRing(){outgoingCallScreen.style.display='none';playRingtone(false);}
cancelOutgoingBtn?.addEventListener('click',()=>{socket.emit('call-rejected',{to:outgoingCallerName.textContent});hideOutgoingRing();cleanupCall();});
acceptCallBtn?.addEventListener('click',()=>acceptIncomingCall('audio'));
acceptVideoCallBtn?.addEventListener('click',()=>acceptIncomingCall('video'));

async function acceptIncomingCall(type){
  if(!pendingIncomingCaller)return;
  currentCallType=pendingIncomingCallType||type;
  currentCallRoomId=pendingIncomingRoomId;
  isGroupCall=false;currentGroupCallId=null;
  const from=pendingIncomingCaller;
  playRingtone(false);incomingCallScreen.style.display='none';
  await ensureIceServersLoaded();
  await startMedia(currentCallType==='video');
  socket.emit('call-accepted',{to:from,callType:currentCallType,roomId:pendingIncomingRoomId});
  await showActiveCallScreen(from,currentCallType);
  if(pendingOffers[from]){processOffer(from,pendingOffers[from]);delete pendingOffers[from];}
  pendingIncomingCaller=null;pendingIncomingRoomId=null;
}
rejectCallBtn?.addEventListener('click',()=>{
  if(!pendingIncomingCaller)return;
  socket.emit('call-rejected',{to:pendingIncomingCaller,roomId:pendingIncomingRoomId});
  delete pendingOffers[pendingIncomingCaller];pendingIncomingCaller=null;
  incomingCallScreen.style.display='none';playRingtone(false);
});

/* ── FIXED: iocDecline ─── */
iocDecline?.addEventListener('click',()=>{
  socket.emit('call-rejected',{to:pendingIncomingCaller,roomId:pendingIncomingRoomId});
  delete pendingOffers[pendingIncomingCaller];pendingIncomingCaller=null;
  incomingOnCallBanner.style.display='none';playRingtone(false);
});

/* ── FIXED: Hold & Accept — put current call on hold, answer new one ─── */
iocHoldAccept?.addEventListener('click',async()=>{
  if(!pendingIncomingCaller)return;
  // Save current call state as held
  heldCallPeer=currentCallPeers[0]||null;
  heldCallType=currentCallType;
  heldCallRoomId=currentCallRoomId;
  isCallOnHold=true;

  // Pause current call media (audio + video)
  if(localStream)localStream.getTracks().forEach(t=>t.enabled=false);
  // Notify current peer they are on hold
  if(heldCallPeer){
    socket.emit('call-hold',{to:heldCallPeer,onHold:true,roomId:heldCallRoomId});
  }
  // Add hold overlay to active call screen
  const existingHold=activeCallScreen.querySelector('.hold-overlay');
  if(!existingHold){
    const ov=document.createElement('div');ov.className='hold-overlay';
    ov.innerHTML=`<div class="hold-overlay-text">⏸ Call on Hold</div><div class="hold-overlay-sub">${heldCallPeer||''}</div>`;
    activeCallScreen.appendChild(ov);
  }

  // Accept new incoming call
  incomingOnCallBanner.style.display='none';
  const newCaller=pendingIncomingCaller;
  const newType=pendingIncomingCallType;
  const newRoomId=pendingIncomingRoomId;
  pendingIncomingCaller=null;pendingIncomingRoomId=null;

  // Reset call state for new call
  currentCallType=newType;currentCallRoomId=newRoomId;
  currentCallPeers=[];isGroupCall=false;currentGroupCallId=null;
  await ensureIceServersLoaded();
  if(!localStream)await startMedia(newType==='video');
  else localStream.getTracks().forEach(t=>t.enabled=true);

  socket.emit('call-accepted',{to:newCaller,callType:newType,roomId:newRoomId});
  await showActiveCallScreen(newCaller,newType);
  if(pendingOffers[newCaller]){processOffer(newCaller,pendingOffers[newCaller]);delete pendingOffers[newCaller];}
  playRingtone(false);
});

/* ── FIXED: Cut current call and accept new one ─── */
iocCutAccept?.addEventListener('click',async()=>{
  if(!pendingIncomingCaller)return;
  // End current call cleanly
  const dur=callSeconds;
  currentCallPeers.forEach(u=>socket.emit('call-ended',{to:u,isGroup:isGroupCall,groupId:currentGroupCallId,roomId:currentCallRoomId,durationSeconds:dur}));
  Object.keys(peerConnections).forEach(cleanupPeer);
  // Reset hold state too
  isCallOnHold=false;heldCallPeer=null;
  // Clear active call screen
  activeCallScreen.style.display='none';clearInterval(callTimer);callSeconds=0;
  currentCallPeers=[];
  // Now accept
  incomingOnCallBanner.style.display='none';
  await acceptBannerCall();
});

async function acceptBannerCall(){
  if(!pendingIncomingCaller)return;
  currentCallType=pendingIncomingCallType;currentCallRoomId=pendingIncomingRoomId;isGroupCall=false;currentGroupCallId=null;
  const from=pendingIncomingCaller;playRingtone(false);
  await ensureIceServersLoaded();
  if(!localStream)await startMedia(currentCallType==='video');
  else localStream.getTracks().forEach(t=>t.enabled=true);
  socket.emit('call-accepted',{to:from,callType:currentCallType,roomId:pendingIncomingRoomId});
  await showActiveCallScreen(from,currentCallType);
  if(pendingOffers[from]){processOffer(from,pendingOffers[from]);delete pendingOffers[from];}
  pendingIncomingCaller=null;pendingIncomingRoomId=null;
}

async function handleGroupCallInvite(from,callType,groupId,roomId){
  currentCallType=callType;currentCallRoomId=roomId;isGroupCall=true;currentGroupCallId=groupId;
  await ensureIceServersLoaded();
  await startMedia(callType==='video');
  socket.emit('call-accepted',{to:from,callType,roomId});
  await showActiveCallScreen(from,callType);
}

async function showActiveCallScreen(peerName, callType) {
  if(!currentCallPeers.includes(peerName))currentCallPeers.push(peerName);
  activeCallScreen.style.display = 'flex';

  const u = allUsersMap[peerName] || contacts[peerName];
  setAvatarEl(audioCallAvatar, u || { username: peerName });
  audioCallName.textContent = peerName;

  if (callType === 'video') {
    callVideoArea.style.display = 'block';
    audioCallDisplay.style.display = 'none';
    aCallVideoBtn.style.display = 'flex';

    // Create local PiP after delay
    setTimeout(() => createLocalPip(), 300);
  } else {
    callVideoArea.style.display = 'none';
    audioCallDisplay.style.display = 'flex';
    aCallVideoBtn.style.display = 'none';
  }

  aCallAddBtn.style.display = 'flex';
  addToCallBtn.style.display = 'flex';

  startCallTimer();
  buildMiniPip(peerName); // 👈 this was correct
}

function buildMiniPip(peerName) {
  if (!miniCallPip) return;

  const u = allUsersMap[peerName] || contacts[peerName];
  const initial = (peerName || '?')[0].toUpperCase();
  const avatarColor = getAvatarColor(peerName);

  miniCallPip.innerHTML = `
    <div class="mini-pip-video-wrap" id="miniPipVideoWrap">
      <video id="miniRemoteVideo" autoplay playsinline 
        style="width:100%;height:100%;object-fit:cover;display:block"></video>

      <div class="mini-pip-avatar" id="miniPipAvatar" 
        style="background:${avatarColor}">
        ${initial}
      </div>

      <div class="mini-pip-local-video" id="miniPipLocalBox">
        <div class="mini-pip-local-video-avatar">👤</div>
      </div>

      <div class="mini-pip-badges">
        <div class="mini-pip-live-badge">
          <span class="mini-pip-live-dot"></span>LIVE
        </div>
        <div class="mini-pip-muted-badge" id="miniPipMutedBadge">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M3.27 2L2 3.27l18.73 18.73 1.41-1.41L3.27 2z" fill="#fff"/>
          </svg>
        </div>
      </div>

      <div class="mini-pip-video-info">
        <span class="mini-pip-call-name" id="miniPipName">${peerName}</span>
        <span class="mini-pip-call-dur" id="miniPipDur">00:00</span>
      </div>
    </div>

    <div class="mini-pip-controls-row">
      <button class="mpip-btn mpip-expand" id="miniPipExpand">Expand</button>
      <button class="mpip-btn mpip-mute" id="miniPipMuteBtn">Mute</button>
      <button class="mpip-btn mpip-end" id="miniPipEnd">End</button>
    </div>
  `;

  // Expand
  document.getElementById('miniPipExpand').addEventListener('click', () => {
    miniCallPip.style.display = 'none';
    activeCallScreen.style.display = 'flex';
    isCallMinimized = false;
    createLocalPip();
  });

  // Mute
  const miniMuteBtn = document.getElementById('miniPipMuteBtn');
  miniMuteBtn.addEventListener('click', () => {
    isMuted = !isMuted;

    localStream?.getAudioTracks().forEach(t => {
      t.enabled = !isMuted;
    });

    aCallMuteBtn.classList.toggle('active', isMuted);
    miniMuteBtn.classList.toggle('muted', isMuted);

    const badge = document.getElementById('miniPipMutedBadge');
    if (badge) badge.classList.toggle('show', isMuted);

    currentCallPeers.forEach(u => {
      socket.emit('toggle-media', {
        to: u,
        kind: 'audio',
        enabled: !isMuted,
        roomId: currentCallRoomId
      });
    });
  });

  // End Call
  document.getElementById('miniPipEnd')
    .addEventListener('click', endAllCalls);

  // Drag
  makeDraggable(miniCallPip);

  // Local video update
  updateMiniPipLocalVideo();
}

/* ── FIXED: Mini PiP shows local video in corner ─── */
function updateMiniPipLocalVideo() {
  const box = document.getElementById('miniPipLocalBox');
  if (!box) return;
  if (localStream && currentCallType === 'video' && localStream.getVideoTracks().length) {
    box.innerHTML = '';
    const vid = document.createElement('video');
    vid.autoplay = true; vid.muted = true; vid.playsInline = true;
    vid.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transform:scaleX(-1)';
    vid.srcObject = localStream;
    box.appendChild(vid);
    box.style.display = 'block';
  } else {
    box.innerHTML = `<div class="mini-pip-local-video-avatar">👤</div>`;
    // Hide for audio call
    if (currentCallType !== 'video') box.style.display = 'none';
  }
}


activeEndCallBtn?.addEventListener('click',endAllCalls);
miniPipEnd?.addEventListener('click',endAllCalls);
function endAllCalls(){
  const dur=callSeconds;
  currentCallPeers.forEach(u=>socket.emit('call-ended',{to:u,isGroup:isGroupCall,groupId:currentGroupCallId,roomId:currentCallRoomId,durationSeconds:dur}));
  // If there was a held call, end that too
  if(isCallOnHold&&heldCallPeer){
    socket.emit('call-ended',{to:heldCallPeer,isGroup:false,roomId:heldCallRoomId,durationSeconds:0});
    isCallOnHold=false;heldCallPeer=null;
  }
  Object.keys(peerConnections).forEach(cleanupPeer);
  cleanupCall();
  setTimeout(loadCallHistory,600);
}
function cleanupCall(){
  activeCallScreen.style.display = 'none';
  miniCallPip.style.display = 'none';
  isCallMinimized = false;
  callVideoArea.style.display = 'none';
  audioCallDisplay.style.display = 'flex';
  clearInterval(callTimer);
  callDuration.textContent = '00:00';
  callSeconds = 0;
  currentCallPeers = [];
  isMuted = isVideoOff = false;
  aCallMuteBtn.classList.remove('active');
  aCallVideoBtn.classList.remove('active');
  aCallAddBtn.style.display = 'none';
  addToCallBtn.style.display = 'none';
  isGroupCall = false; currentGroupCallId = null; currentCallRoomId = null;
  // Remove local pip
  document.getElementById('callLocalPip')?.remove();
  // Remove hold overlay
  activeCallScreen?.querySelector('.hold-overlay')?.remove();
  isCallOnHold = false; heldCallPeer = null;
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  remoteVideosGrid.innerHTML = '';
}

/* ── FIXED: Minimize call — show local video in mini PiP corner ─── */
aCallMinimizeBtn?.addEventListener('click', () => {
  activeCallScreen.style.display = 'none';
  // Remove local pip from fullscreen
  document.getElementById('callLocalPip')?.remove();
 
  // Set remote video in mini pip
  const remoteVid = remoteVideosGrid.querySelector('video');
  const miniRemote = document.getElementById('miniRemoteVideo');
  const miniAvatar = document.getElementById('miniPipAvatar');
  if (remoteVid && miniRemote) {
    miniRemote.srcObject = remoteVid.srcObject;
    if (miniAvatar) miniAvatar.style.display = 'none';
    miniRemote.style.display = 'block';
  } else {
    if (miniAvatar) miniAvatar.style.display = 'flex';
    if (miniRemote) miniRemote.style.display = 'none';
  }
 
  // Update local box in mini pip
  updateMiniPipLocalVideo();
 
  miniCallPip.style.display = 'flex';
  isCallMinimized = true;
});
miniPipExpand?.addEventListener('click',()=>{miniCallPip.style.display='none';activeCallScreen.style.display='flex';isCallMinimized=false;updateLocalVideoPip();});
miniCallPip?.addEventListener('click',e=>{if(e.target===miniCallPip||e.target.closest('.mini-pip-info'))miniPipExpand.click();});

function startCallTimer(){
  callSeconds=0;clearInterval(callTimer);
  callTimer=setInterval(()=>{
    callSeconds++;
    const m=String(Math.floor(callSeconds/60)).padStart(2,'0'),s=String(callSeconds%60).padStart(2,'0');
    const str=`${m}:${s}`;callDuration.textContent=str;
    const mpd=$('miniPipDur');if(mpd)mpd.textContent=str;
  },1000);
}
aCallMuteBtn?.addEventListener('click',()=>{
  isMuted=!isMuted;localStream?.getAudioTracks().forEach(t=>t.enabled=!isMuted);
  aCallMuteBtn.classList.toggle('active',isMuted);
  currentCallPeers.forEach(u=>socket.emit('toggle-media',{to:u,kind:'audio',enabled:!isMuted,roomId:currentCallRoomId}));
});
aCallVideoBtn?.addEventListener('click', () => {
  isVideoOff = !isVideoOff;
  localStream?.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
  aCallVideoBtn.classList.toggle('active', isVideoOff);
  const pip = document.getElementById('callLocalPip');
  if (pip) pip.style.display = isVideoOff ? 'none' : 'block';
  currentCallPeers.forEach(u => socket.emit('toggle-media', { to: u, kind: 'video', enabled: !isVideoOff, roomId: currentCallRoomId }));
});
aCallAddBtn?.addEventListener('click',openAddToCallModal);
function openAddToCallModal(){
  addToCallList.innerHTML='';
  for(const uname in contacts){
    if(uname===myUser?.username||currentCallPeers.includes(uname))continue;
    const u=contacts[uname];if(!u?.is_online)continue;
    const item=document.createElement('div');item.className='modal-user-item';
    item.innerHTML=`${makeAvatarHtml(u,36,14)}<span>${uname}</span>`;
    item.addEventListener('click',()=>{socket.emit('add-to-call',{to:uname,callType:currentCallType,roomId:currentCallRoomId});showToast(`Calling ${uname}...`);addToCallModal.style.display='none';});
    addToCallList.appendChild(item);
  }
  addToCallModal.style.display='flex';
}
closeAddToCallModal?.addEventListener('click',()=>{addToCallModal.style.display='none';});

/* ════════════════════════════════════════════════════════════════════════════
   WebRTC
════════════════════════════════════════════════════════════════════════════ */
function createPeerConnection(remoteUser){
  if(peerConnections[remoteUser])return peerConnections[remoteUser];
  const pc=new RTCPeerConnection({iceServers:rtcIceServers});
  if(localStream)localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
  pc.ontrack=e=>{
    if(e.streams&&e.streams[0]){
      addRemoteVideo(remoteUser,e.streams[0]);
      if(isCallMinimized){miniRemoteVideo.srcObject=e.streams[0];miniPipAvatar.style.display='none';}
    }
  };
  pc.onicecandidate=e=>{if(e.candidate)socket.emit('icecandidate',{to:remoteUser,candidate:e.candidate,roomId:currentCallRoomId});};
  pc.onconnectionstatechange=()=>{if(['disconnected','failed','closed'].includes(pc.connectionState))cleanupPeer(remoteUser);};
  peerConnections[remoteUser]=pc;iceCandidateQueue[remoteUser]=[];
  return pc;
}
async function flushIce(user){
  const pc=peerConnections[user];if(!pc?.remoteDescription?.type)return;
  const q=iceCandidateQueue[user]||[];
  while(q.length){try{await pc.addIceCandidate(new RTCIceCandidate(q.shift()));}catch{}}
}
async function sendOfferTo(user){
  await ensureIceServersLoaded();
  const pc=createPeerConnection(user);if(pc.signalingState!=='stable')return;
  const offer=await pc.createOffer({offerToReceiveAudio:true,offerToReceiveVideo:currentCallType==='video'});
  await pc.setLocalDescription(offer);socket.emit('offer',{to:user,offer:pc.localDescription,roomId:currentCallRoomId});
}
async function processOffer(from,offer){
  await ensureIceServersLoaded();
  let pc=peerConnections[from];if(pc&&pc.signalingState!=='stable'){pc.close();delete peerConnections[from];}
  pc=createPeerConnection(from);
  await pc.setRemoteDescription(new RTCSessionDescription(offer));await flushIce(from);
  const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
  socket.emit('answer',{to:from,answer:pc.localDescription,roomId:currentCallRoomId});
}
function addRemoteVideo(username,stream){
  let wrapper=$(`remote-${username}`);
  if(!wrapper){
    wrapper=document.createElement('div');wrapper.className='remote-video-wrapper';wrapper.id=`remote-${username}`;
    const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.className='remote-video-el';video.srcObject=stream;
    const label=document.createElement('div');label.className='video-label';label.textContent=username;
    const muteInd=document.createElement('div');muteInd.className='mute-indicator';muteInd.id=`mute-ind-${username}`;muteInd.style.display='none';
    muteInd.innerHTML=`<svg viewBox="0 0 24 24" width="13" height="13"><path d="M3.27 2L2 3.27l18.73 18.73 1.41-1.41L3.27 2z" fill="currentColor"/></svg>`;
    wrapper.append(video,label,muteInd);remoteVideosGrid.appendChild(wrapper);
  }else{wrapper.querySelector('video').srcObject=stream;}
  updateRemoteGrid();
}
function updateRemoteGrid(){
  const n=remoteVideosGrid.children.length;
  remoteVideosGrid.className='remote-videos-grid';
  if(n===1)remoteVideosGrid.classList.add('one');
  else if(n===2)remoteVideosGrid.classList.add('two');
  else if(n<=4)remoteVideosGrid.classList.add('four');
  else remoteVideosGrid.classList.add('many');
}
function cleanupPeer(username){
  if(peerConnections[username]){peerConnections[username].close();delete peerConnections[username];}
  delete iceCandidateQueue[username];delete pendingOffers[username];
  $(`remote-${username}`)?.remove();updateRemoteGrid();
}

/* ── Ringtone ─── */
let ringInterval=null,audioCtx=null;
function playRingtone(start){
  clearInterval(ringInterval);ringInterval=null;if(!start)return;
  function beep(){
    try{
      if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.connect(g);g.connect(audioCtx.destination);
      o.frequency.value=440;o.type='sine';
      g.gain.setValueAtTime(0.22,audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.7);
      o.start();o.stop(audioCtx.currentTime+0.7);
    }catch{}
  }
  beep();ringInterval=setInterval(beep,1600);
}

/* ── Google Maps ready callback ─── */
window.initGoogleMaps=function(){
  window.googleMapsReady=true;window.dispatchEvent(new Event('google-maps-ready'));
};

/* ── Page Visibility — FIXED: handle call on page refresh/tab switch ─── */
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)return;
  // When page becomes visible again, re-request media if in call
  if(currentCallPeers.length>0&&!localStream){
    startMedia(currentCallType==='video').then(()=>{
      // Re-add tracks to all peer connections
      currentCallPeers.forEach(peer=>{
        const pc=peerConnections[peer];
        if(pc&&localStream){
          const senders=pc.getSenders();
          localStream.getTracks().forEach(track=>{
            const sender=senders.find(s=>s.track?.kind===track.kind);
            if(sender)sender.replaceTrack(track);
            else pc.addTrack(track,localStream);
          });
        }
      });
    });
  }
});

/* ── FIXED: Before page unload, save call state to sessionStorage ─── */
window.addEventListener('beforeunload',()=>{
  if(currentCallPeers.length>0&&currentCallRoomId){
    sessionStorage.setItem('activeCallState',JSON.stringify({
      peers:currentCallPeers,
      roomId:currentCallRoomId,
      callType:currentCallType,
      isGroup:isGroupCall,
      groupId:currentGroupCallId
    }));
  }else{
    sessionStorage.removeItem('activeCallState');
  }
});

/* ── FIXED: On page load, check if we need to rejoin a call ─── */
window.addEventListener('load',()=>{
  const savedCall=sessionStorage.getItem('activeCallState');
  if(savedCall){
    try{
      const state=JSON.parse(savedCall);
      sessionStorage.removeItem('activeCallState');
      // After auth, rejoin
      const origOnAuth=onAuthSuccess;
      // Stored, will be rejoined after socket connects via 'connect' event in initSocket
      window.__pendingCallRejoin=state;
    }catch{}
  }
});

// Handle call rejoin after socket connects
const _origInitSocket=initSocket;
// The connect event in initSocket already handles rejoin-call emit
// We additionally handle the pending rejoin here
setTimeout(()=>{
  if(window.__pendingCallRejoin&&socket){
    const state=window.__pendingCallRejoin;
    delete window.__pendingCallRejoin;
    currentCallType=state.callType;
    currentCallRoomId=state.roomId;
    isGroupCall=state.isGroup;
    currentGroupCallId=state.groupId;
    currentCallPeers=state.peers;
    startMedia(state.callType==='video').then(()=>{
      state.peers.forEach(peer=>{
        showActiveCallScreen(peer,state.callType);
        socket.emit('call-peer-reconnect',{to:peer,callType:state.callType,roomId:state.roomId});
      });
    });
  }
},2000);
