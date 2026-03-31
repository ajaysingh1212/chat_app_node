// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 1 / 4
//  DOM refs · State · Helpers · Auth · Socket · Chat List
// ════════════════════════════════════════════════════════════════════════════

/* ── DOM refs ─────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

// Auth
const authScreen = $('authScreen'), loginForm = $('loginForm'), registerForm = $('registerForm');
const loginEmail = $('loginEmail'), loginPassword = $('loginPassword'), loginBtn = $('loginBtn'), loginError = $('loginError');
const regUsername = $('regUsername'), regEmail = $('regEmail'), regPassword = $('regPassword'), registerBtn = $('registerBtn'), registerError = $('registerError');

// App shell
const appContainer = $('appContainer'), myAvatarEl = $('myAvatarEl'), myUsernameLabel = $('myUsernameLabel');
const chatList = $('chatList'), searchInput = $('searchInput');

// Chat window
const chatEmptyState = $('chatEmptyState'), chatHeader = $('chatHeader');
const chatHeaderAvatar = $('chatHeaderAvatar'), chatHeaderName = $('chatHeaderName'), chatHeaderStatus = $('chatHeaderStatus');
const messagesArea = $('messagesArea'), messagesList = $('messagesList');
const typingBar = $('typingBar'), typingText = $('typingText');
const inputBar = $('inputBar'), messageInput = $('messageInput'), sendBtn = $('sendBtn');
const attachBtn = $('attachBtn'), fileInput = $('fileInput'), cameraInput = $('cameraInput'), backBtn = $('backBtn');
const inputAttachMenu = $('inputAttachMenu');
const attachFileOpt = $('attachFileOpt'), attachCameraOpt = $('attachCameraOpt');
const attachLocationOpt = $('attachLocationOpt'), attachContactOpt = $('attachContactOpt');
const chatInfoBtn = $('chatInfoBtn');

// Header call buttons
const headerAudioCallBtn = $('headerAudioCallBtn'), headerVideoCallBtn = $('headerVideoCallBtn');
const headerGroupAudioCallBtn = $('headerGroupAudioCallBtn'), headerGroupVideoCallBtn = $('headerGroupVideoCallBtn');
const addToCallBtn = $('addToCallBtn');

// Incoming call
const incomingCallScreen = $('incomingCallScreen'), incomingCallerName = $('incomingCallerName');
const incomingAvatarEl = $('incomingAvatarEl'), incomingCallType = $('incomingCallType');
const acceptCallBtn = $('acceptCallBtn'), acceptVideoCallBtn = $('acceptVideoCallBtn'), rejectCallBtn = $('rejectCallBtn');

// Incoming-on-call banner
const incomingOnCallBanner = $('incomingOnCallBanner'), iocAvatar = $('iocAvatar'), iocName = $('iocName'), iocType = $('iocType');
const iocDecline = $('iocDecline'), iocHoldAccept = $('iocHoldAccept'), iocCutAccept = $('iocCutAccept');

// Outgoing call
const outgoingCallScreen = $('outgoingCallScreen'), outgoingCallerName = $('outgoingCallerName');
const outgoingAvatarEl = $('outgoingAvatarEl'), outgoingCallTypeLabel = $('outgoingCallTypeLabel'), cancelOutgoingBtn = $('cancelOutgoingBtn');

// Active call
const activeCallScreen = $('activeCallScreen'), callVideoArea = $('callVideoArea');
const audioCallDisplay = $('audioCallDisplay'), audioCallAvatar = $('audioCallAvatar'), audioCallName = $('audioCallName');
const callDuration = $('callDuration'), remoteVideosGrid = $('remoteVideosGrid'), localVideo = $('localVideo');
const aCallMuteBtn = $('aCallMuteBtn'), aCallVideoBtn = $('aCallVideoBtn');
const aCallMinimizeBtn = $('aCallMinimizeBtn'), aCallAddBtn = $('aCallAddBtn'), activeEndCallBtn = $('activeEndCallBtn');
const camFlipBtn = $('camFlipBtn');

// Mini PIP
const miniCallPip = $('miniCallPip'), miniPipName = $('miniPipName'), miniPipDur = $('miniPipDur');
const miniPipAvatar = $('miniPipAvatar'), miniRemoteVideo = $('miniRemoteVideo');
const miniPipExpand = $('miniPipExpand'), miniPipEnd = $('miniPipEnd');

// Modals
const newGroupBtn = $('newGroupBtn'), newGroupModal = $('newGroupModal'), closeGroupModal = $('closeGroupModal');
const groupNameInput = $('groupNameInput'), groupMembersList = $('groupMembersList'), createGroupBtn = $('createGroupBtn');
const addToCallModal = $('addToCallModal'), closeAddToCallModal = $('closeAddToCallModal'), addToCallList = $('addToCallList');
const newChatBtn = $('newChatBtn'), newChatModal = $('newChatModal'), closeNewChatModal = $('closeNewChatModal');
const newChatEmailInput = $('newChatEmailInput'), newChatSearchBtn = $('newChatSearchBtn');
const userSearchResult = $('userSearchResult'), contactsListModal = $('contactsListModal');
const liveLocationModal = $('liveLocationModal'), closeLiveLocModal = $('closeLiveLocModal');
const locationMapContainer = $('locationMapContainer'), locLoadingMsg = $('locLoadingMsg');
const locInfoBar = $('locInfoBar'), locSpeed = $('locSpeed'), locHeading = $('locHeading'), locAccuracy = $('locAccuracy');
const sendLiveLocBtn = $('sendLiveLocBtn');

// Status
const panelStatus = $('panelStatus'), myStatusAvatar = $('myStatusAvatar'), myStatusSub = $('myStatusSub');
const statusAddPlusBtn = $('statusAddPlusBtn'), statusContactsList = $('statusContactsList'), statusEmptyHint = $('statusEmptyHint');
const statusViewerModal = $('statusViewerModal'), svProgressBar = $('svProgressBar'), svAvatar = $('svAvatar');
const svName = $('svName'), svTime = $('svTime'), svCloseBtn = $('svCloseBtn'), svContent = $('svContent');
const svViews = $('svViews'), svViewCount = $('svViewCount'), svReactions = $('svReactions');
const svReactBtn = $('svReactBtn'), svEmojiPicker = $('svEmojiPicker'), svTapPrev = $('svTapPrev'), svTapNext = $('svTapNext');
const createStatusModal = $('createStatusModal'), closeCreateStatus = $('closeCreateStatus');
const statusTextSection = $('statusTextSection'), statusPhotoSection = $('statusPhotoSection');
const statusTextInput = $('statusTextInput'), statusTextPreview = $('statusTextPreview');
const statusPhotoInput = $('statusPhotoInput'), statusPhotoPreview = $('statusPhotoPreview'), spuPlaceholder = $('spuPlaceholder');
const statusCaptionInput = $('statusCaptionInput'), postStatusBtn = $('postStatusBtn');
const statusViewersModal = $('statusViewersModal'), closeViewersModal = $('closeViewersModal'), statusViewersList = $('statusViewersList');

// Context menu
const contextMenu = $('contextMenu'), ctxEdit = $('ctxEdit'), ctxDeleteMe = $('ctxDeleteMe'), ctxDeleteAll = $('ctxDeleteAll');

// Settings
const settingsLogout = $('settingsLogout'), settingsProfile = $('settingsProfile');
const settingsAccount = $('settingsAccount'), settingsPrivacy = $('settingsPrivacy');
const subProfile = $('subProfile'), subAccount = $('subAccount'), subPrivacy = $('subPrivacy');
const profileBigAvatar = $('profileBigAvatar'), changePhotoBtn = $('changePhotoBtn'), profilePicInput = $('profilePicInput');
const profileNameInput = $('profileNameInput'), profileAboutInput = $('profileAboutInput'), profilePhoneInput = $('profilePhoneInput');
const saveProfileBtn = $('saveProfileBtn');
const twoStepToggle = $('twoStepToggle'), twoStepPinRow = $('twoStepPinRow'), twoStepPinInput = $('twoStepPinInput'), saveTwoStepBtn = $('saveTwoStepBtn');
const newEmailInput = $('newEmailInput'), changeEmailCurPass = $('changeEmailCurPass'), changeEmailBtn = $('changeEmailBtn');
const curPassInput = $('curPassInput'), newPassInput = $('newPassInput'), changePassBtn = $('changePassBtn');
const deleteAccountBtn = $('deleteAccountBtn');
const privLastSeen = $('privLastSeen'), privProfilePic = $('privProfilePic'), privAbout = $('privAbout');
const privGroupAdd = $('privGroupAdd'), liveLocToggle = $('liveLocToggle'), savePrivacyBtn = $('savePrivacyBtn');

// Profile info panel
const profileInfoPanel = $('profileInfoPanel'), pipCloseBtn = $('pipCloseBtn'), pipHeaderTitle = $('pipHeaderTitle');
const pipHeroAvatar = $('pipHeroAvatar'), pipHeroName = $('pipHeroName'), pipHeroStatus = $('pipHeroStatus');
const pipRowPhone = $('pipRowPhone'), pipPhoneVal = $('pipPhoneVal'), pipEmailVal = $('pipEmailVal');
const pipRowAbout = $('pipRowAbout'), pipAboutVal = $('pipAboutVal');
const pipShareContactBtn = $('pipShareContactBtn'), pipBlockBtn = $('pipBlockBtn'), pipBlockLabel = $('pipBlockLabel');
const pipMediaGrid = $('pipMediaGrid'), pipMediaCount = $('pipMediaCount'), pipNoMedia = $('pipNoMedia');
const pipGroupsCard = $('pipGroupsCard'), pipGroupsList = $('pipGroupsList');
const pipDMSelect = $('pipDMSelect'), pipDMHint = $('pipDMHint');
const pipThemeRow = $('pipThemeRow'), pipLockToggle = $('pipLockToggle'), pipLockPinWrap = $('pipLockPinWrap');
const pipLockPinInput = $('pipLockPinInput'), pipSaveLockBtn = $('pipSaveLockBtn');
const pipExportBtn = $('pipExportBtn'), pipClearBtn = $('pipClearBtn');

// Locked chat
const lockedChatScreen = $('lockedChatScreen'), lockedChatPinInput = $('lockedChatPinInput');
const lockedChatPinError = $('lockedChatPinError'), lockedChatUnlockBtn = $('lockedChatUnlockBtn');

// Nav
const desktopTabBar = $('desktopTabBar'), mobileBottomNav = $('mobileBottomNav');
const sidebarEl = $('sidebarEl'), mainArea = $('mainArea');
const panelChats = $('panelChats'), panelCalls = $('panelCalls'), panelSettings = $('panelSettings');
const callHistoryList = $('callHistoryList');

/* ── State ───────────────────────────────────────────────────────────────── */
let socket = null, myUser = null, myToken = null;
let activeChat = null;
let allUsersMap = {}, groups = {}, contacts = {}, chats = {};
let localStream = null, isMuted = false, isVideoOff = false;
let currentCallType = 'audio', currentCallPeers = [], callSeconds = 0, callTimer = null;
let currentCallRoomId = null, isGroupCall = false, currentGroupCallId = null, isCallMinimized = false;
let contextMsgId = null, typingTimer = null, isTypingSent = false;
let currentFacingMode = 'user';
let currentUserLoc = null, liveLocDuration = 0, liveLocWatchId = null;
let pendingIncomingCaller = null, pendingIncomingCallType = 'audio', pendingIncomingRoomId = null;
let activePipUser = null; // username shown in profile info panel
let statusBgColor = '#0d3d35', statusType = 'text';
let currentStatusList = [], currentStatusUserIdx = 0, currentStatusItemIdx = 0;
let statusTimer = null;
let lockedChats = {}; // chatKey → boolean (unlocked for session)

const typingUsers = new Set();
const peerConnections = {}, iceCandidateQueue = {}, pendingOffers = {};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const getInitial = n => (n||'?')[0].toUpperCase();
function getAvatarColor(name) {
  const c = ['#00A884','#1565C0','#6A1B9A','#AD1457','#00838F','#2E7D32','#E65100'];
  let h = 0; for (const ch of (name||'')) h = ch.charCodeAt(0) + ((h<<5)-h);
  return c[Math.abs(h) % c.length];
}
const nowStr = () => new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const isoToTime = iso => iso ? new Date(iso).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '';
function formatLastSeen(iso) {
  if (!iso) return 'online';
  const d = new Date(iso), diff = Date.now()-d;
  if (diff < 60000) return 'last seen just now';
  if (diff < 3600000) return 'last seen ' + Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return 'last seen today at ' + isoToTime(iso);
  return 'last seen ' + d.toLocaleDateString();
}
const chatKey = (type, id) => type==='private' ? `p:${id}` : `g:${id}`;
function ensureChat(key) { if (!chats[key]) chats[key] = {messages:[],unread:0,lastMsg:'',lastTime:''}; }
const sleep = ms => new Promise(r => setTimeout(r, ms));
function formatSize(b) {
  if (!b) return '';
  if (b<1024) return b+' B';
  if (b<1048576) return (b/1024).toFixed(1)+' KB';
  return (b/1048576).toFixed(1)+' MB';
}
const fmtDuration = s => { if (!s) return '0s'; const m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s`; };

// Avatar HTML helper
function makeAvatarHtml(u, size=48, fontSize=19) {
  const url = u?.avatar_url || u?.profile_pic || u?.avatarUrl;
  const color = u?.avatar_color || getAvatarColor(u?.username||'?');
  const bg = url ? '' : `style="background:${color}"`;
  const content = url ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : getInitial(u?.username||'?');
  return `<div class="chat-item-avatar" style="width:${size}px;height:${size}px;font-size:${fontSize}px;${url?'':'background:'+color+';'}" ${bg}>${content}</div>`;
}

function setAvatarEl(el, u) {
  const url = u?.avatar_url || u?.profile_pic || u?.avatarUrl;
  if (url) { el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`; el.style.background=''; }
  else { el.textContent = getInitial(u?.username||'?'); el.style.background = u?.avatar_color || getAvatarColor(u?.username||'?'); }
}

/* ── API helper ──────────────────────────────────────────────────────────── */
async function api(method, path, body) {
  const opts = {method, headers:{'Content-Type':'application/json'}};
  if (myToken) opts.headers['Authorization'] = 'Bearer '+myToken;
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error||'Request failed');
  return data;
}

/* ════════════════════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.auth-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loginForm.style.display    = btn.dataset.tab==='login'    ? 'block' : 'none';
    registerForm.style.display = btn.dataset.tab==='register' ? 'block' : 'none';
    loginError.textContent = registerError.textContent = '';
  });
});
loginBtn.addEventListener('click', async () => {
  loginError.textContent = '';
  try { const d = await api('POST','/api/login',{email:loginEmail.value.trim(),password:loginPassword.value}); onAuthSuccess(d.token,d.user); }
  catch(e) { loginError.textContent = e.message; }
});
registerBtn.addEventListener('click', async () => {
  registerError.textContent = '';
  try { const d = await api('POST','/api/register',{username:regUsername.value.trim(),email:regEmail.value.trim(),password:regPassword.value}); onAuthSuccess(d.token,d.user); }
  catch(e) { registerError.textContent = e.message; }
});
[loginPassword,loginEmail].forEach(el => el.addEventListener('keydown',e=>{if(e.key==='Enter')loginBtn.click();}));
[regPassword,regEmail,regUsername].forEach(el => el.addEventListener('keydown',e=>{if(e.key==='Enter')registerBtn.click();}));

settingsLogout?.addEventListener('click', doLogout);
function doLogout() { localStorage.removeItem('chatapp_token'); localStorage.removeItem('chatapp_user'); location.reload(); }

function onAuthSuccess(token, user) {
  myToken = token;
  user.avatarUrl = user.avatarUrl || user.profile_pic || user.avatar_url || null;
  myUser = user;
  localStorage.setItem('chatapp_token', token);
  localStorage.setItem('chatapp_user', JSON.stringify(user));
  authScreen.style.display   = 'none';
  appContainer.style.display = 'flex';
  setAvatarEl(myAvatarEl, user);
  myUsernameLabel.textContent = user.username;
  // profile panel prefill
  if (profileNameInput)  profileNameInput.value  = user.username||'';
  if (profileAboutInput) profileAboutInput.value  = user.about||'';
  if (profilePhoneInput) profilePhoneInput.value  = user.phone||'';
  if (profileBigAvatar)  setAvatarEl(profileBigAvatar, user);
  // sidebar status avatar
  if (myStatusAvatar) setAvatarEl(myStatusAvatar, user);
  initSocket();
  loadInitialData();
}
window.addEventListener('load', () => {
  const token = localStorage.getItem('chatapp_token'), user = localStorage.getItem('chatapp_user');
  if (token && user) { myToken = token; myUser = JSON.parse(user); onAuthSuccess(token, myUser); }
});

/* ── Load contacts + groups ─────────────────────────────────────────────── */
async function loadInitialData() {
  try {
    const [contList, grps, allUsers] = await Promise.all([
      api('GET','/api/contacts'), api('GET','/api/groups'), api('GET','/api/users')
    ]);
    allUsersMap = {}; allUsers.forEach(u => { allUsersMap[u.username]=u; });
    contacts = {}; contList.forEach(u => { contacts[u.username]=u; });
    groups = {}; grps.forEach(g => { groups[g.id]={id:g.id,name:g.name,members:g.members?g.members.split(','):[]}; });
    renderChatList();
    loadCallHistory();
    loadStatuses();
  } catch(e) { console.error('loadInitialData:', e); }
}

/* ════════════════════════════════════════════════════════════════════════════
   SOCKET INIT
════════════════════════════════════════════════════════════════════════════ */
function initSocket() {
  socket = io({auth:{token:myToken}});
  socket.on('connect_error', e => {
    console.error('Socket error:', e.message);
    if (['auth_required','invalid_token'].includes(e.message)) { localStorage.clear(); location.reload(); }
  });

  socket.on('user-status', ({userId,username,isOnline,lastSeen}) => {
    if (allUsersMap[username]) { allUsersMap[username].is_online=isOnline?1:0; if(!isOnline&&lastSeen) allUsersMap[username].last_seen=lastSeen; }
    if (contacts[username])   { contacts[username].is_online=isOnline?1:0; if(!isOnline&&lastSeen) contacts[username].last_seen=lastSeen; }
    renderChatList();
    if (activeChat?.type==='private' && activeChat.id===username) {
      chatHeaderStatus.textContent = isOnline?'online':formatLastSeen(lastSeen);
      chatHeaderStatus.style.color = isOnline?'var(--accent)':'var(--ts)';
    }
    // update open PIP
    if (activePipUser===username) updatePipStatus(isOnline, lastSeen);
  });

  socket.on('group-created', ({groupId,name,createdBy,members}) => {
    groups[groupId]={id:groupId,name,members};
    const key=chatKey('group',groupId); ensureChat(key);
    chats[key].lastMsg=`${createdBy} created this group`; chats[key].lastTime=nowStr();
    renderChatList();
    if (createdBy===myUser.username) openChat({type:'group',id:groupId,name,isGroup:true});
  });

  socket.on('message-sent', ({id,status}) => updateMsgStatus(id,status));

  socket.on('private-message', msg => {
    if (msg.from===myUser.username) return;
    const key=chatKey('private',msg.from); ensureChat(key);
    const m=normaliseMsg(msg);
    chats[key].messages.push(m);
    chats[key].lastMsg=m.content||(m.fileName?`📎 ${m.fileName}`:'');
    chats[key].lastTime=isoToTime(m.time);
    if (!contacts[msg.from] && allUsersMap[msg.from]) contacts[msg.from]=allUsersMap[msg.from];
    if (activeChat?.type==='private' && activeChat.id===msg.from) {
      appendMessageToDom(m);
      socket.emit('message-seen',{msgId:m.id,fromUser:msg.from});
      updateMsgStatus(m.id,'seen');
    } else { chats[key].unread=(chats[key].unread||0)+1; }
    renderChatList();
  });

  socket.on('group-message', msg => {
    if (msg.from===myUser.username) return;
    const key=chatKey('group',msg.groupId); ensureChat(key);
    const m=normaliseMsg(msg);
    chats[key].messages.push(m);
    chats[key].lastMsg=`${msg.from}: ${m.content||(m.fileName?`📎 ${m.fileName}`:'')}`;
    chats[key].lastTime=isoToTime(m.time);
    if (activeChat?.type==='group' && activeChat.id===msg.groupId) appendMessageToDom(m);
    else chats[key].unread=(chats[key].unread||0)+1;
    renderChatList();
  });

  socket.on('message-edited', ({msgId,newContent}) => {
    const key=activeChatKey();
    if (key && chats[key]) { const m=chats[key].messages.find(m=>m.id===msgId); if(m){m.content=newContent;m.is_edited=true;} }
    const bubble=document.querySelector(`[data-msg-id="${msgId}"] .message-bubble`);
    if (bubble) {
      const t=bubble.querySelector('.msg-text'); if(t) t.textContent=newContent;
      if (!bubble.querySelector('.edit-mark')) { const em=document.createElement('span'); em.className='edit-mark'; em.textContent=' (edited)'; bubble.querySelector('.msg-footer')?.prepend(em); }
    }
  });

  socket.on('message-deleted', ({msgId,deleteFor}) => {
    const key=activeChatKey();
    if (key&&chats[key]&&deleteFor==='everyone') { const idx=chats[key].messages.findIndex(m=>m.id===msgId); if(idx!==-1) chats[key].messages.splice(idx,1); }
    const rowEl=document.querySelector(`[data-msg-id="${msgId}"]`);
    if (rowEl) {
      if (deleteFor==='everyone') { const b=rowEl.querySelector('.message-bubble'); if(b) b.innerHTML='<span class="deleted-msg">🚫 This message was deleted</span>'; }
      else rowEl.remove();
    }
  });

  socket.on('message-seen', ({msgId}) => updateMsgStatus(msgId,'seen'));
  socket.on('message-blocked', ({to}) => showToast(`Cannot send to ${to}`));

  socket.on('typing', ({from,to,isTyping,isGroup}) => {
    if (from===myUser.username||!activeChat) return;
    const relevant = isGroup ? (activeChat.type==='group'&&activeChat.id===to) : (activeChat.type==='private'&&activeChat.id===from);
    if (!relevant) return;
    if (isTyping) typingUsers.add(from); else typingUsers.delete(from);
    typingBar.style.display = typingUsers.size?'flex':'none';
    if (typingUsers.size) typingText.textContent=[...typingUsers].join(', ')+(typingUsers.size===1?' is typing...':' are typing...');
  });

  socket.on('live-location-update', ({from,userId,lat,lng,speed,heading,accuracy,sessionId}) => {
    updateLiveLocationBubble(from,lat,lng,speed,heading,accuracy);
  });

  socket.on('status-new', () => { loadStatuses(); });

  // ── Call signaling ──────────────────────────────────────────────────────
  socket.on('call-invite', ({from,callType,isGroup,groupId,addToCall,roomId}) => {
    if (isGroup&&groupId) { handleGroupCallInvite(from,callType,groupId,roomId); return; }
    pendingIncomingCaller=from; pendingIncomingCallType=callType||'audio'; pendingIncomingRoomId=roomId||null;
    if (activeCallScreen.style.display==='flex') {
      iocAvatar.textContent=getInitial(from); iocAvatar.style.background=getAvatarColor(from);
      iocName.textContent=from; iocType.textContent=callType==='video'?'Incoming video call':'Incoming voice call';
      incomingOnCallBanner.style.display='flex'; playRingtone(true); return;
    }
    incomingCallerName.textContent=from;
    setAvatarEl(incomingAvatarEl, allUsersMap[from]||contacts[from]||{username:from});
    incomingCallType.textContent=callType==='video'?'Incoming video call':'Incoming voice call';
    acceptCallBtn.style.display=callType==='audio'?'flex':'none';
    acceptVideoCallBtn.style.display=callType==='video'?'flex':'none';
    incomingCallScreen.style.display='flex'; playRingtone(true);
  });

  socket.on('call-accepted', async ({from,callType}) => {
    hideOutgoingRing(); await showActiveCallScreen(from,callType||currentCallType); await sendOfferTo(from);
  });
  socket.on('call-rejected', ({from}) => { hideOutgoingRing(); showToast(`${from} declined the call`); });
  socket.on('call-ended', ({from}) => {
    cleanupPeer(from); currentCallPeers=currentCallPeers.filter(u=>u!==from);
    if (currentCallPeers.length===0) cleanupCall();
    if (currentCallPeers.length===0&&isCallMinimized) { miniCallPip.style.display='none'; isCallMinimized=false; }
  });
  socket.on('please-connect', async ({to}) => { await sleep(120); await sendOfferTo(to); });
  socket.on('offer', async ({from,offer}) => {
    if (incomingCallScreen.style.display==='flex') { pendingOffers[from]=offer; return; }
    processOffer(from,offer);
  });
  socket.on('answer', async ({from,answer}) => {
    const pc=peerConnections[from]; if(!pc||pc.signalingState!=='have-local-offer') return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer)); await flushIce(from);
  });
  socket.on('icecandidate', async ({from,candidate}) => {
    if (!candidate||!from) return;
    const pc=peerConnections[from];
    if (!pc?.remoteDescription?.type) { if(!iceCandidateQueue[from]) iceCandidateQueue[from]=[]; iceCandidateQueue[from].push(candidate); return; }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
  });
  socket.on('peer-toggle-media', ({from,kind,enabled}) => {
    if (kind==='audio') { const el=$(`mute-ind-${from}`); if(el) el.style.display=enabled?'none':'flex'; }
  });
}

/* ── Normalise message ──────────────────────────────────────────────────── */
function normaliseMsg(msg) {
  return {
    id:msg.id, from:msg.from||msg.sender_name, to:msg.to, groupId:msg.groupId||msg.group_id,
    content:msg.content||null, msgType:msg.msgType||msg.msg_type||'text',
    fileUrl:msg.fileUrl||msg.file_path||null, fileName:msg.fileName||msg.file_name||null,
    fileSize:msg.fileSize||msg.file_size||null, fileType:msg.fileType||msg.file_type||null,
    time:msg.time||msg.created_at||new Date().toISOString(),
    status:msg.status||msg.msg_status||'sent', is_edited:msg.is_edited||false
  };
}
function updateMsgStatus(msgId,status) {
  const t=$(`ticks-${msgId}`); if(t) { t.innerHTML=ticksHTML(status); if(status==='seen') t.classList.add('seen'); }
}
function ticksHTML(s) { if(s==='sent') return '✓'; if(s==='delivered'||s==='seen') return '✓✓'; return ''; }
const activeChatKey = () => activeChat ? chatKey(activeChat.type,activeChat.id) : null;

/* ════════════════════════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════════════════════════ */
function switchPanel(panel) {
  ['chats','status','calls','settings'].forEach(p => {
    const el=$(`panel${p.charAt(0).toUpperCase()+p.slice(1)}`); if(el) el.classList.toggle('active',p===panel);
  });
  document.querySelectorAll('.dtab').forEach(b=>b.classList.toggle('active',b.dataset.panel===panel));
  document.querySelectorAll('.mnav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===panel));
  const sw=$('searchBarWrap'); if(sw) sw.style.display=panel==='chats'?'flex':'none';
  if (panel==='status') loadStatuses();
}
desktopTabBar?.querySelectorAll('.dtab').forEach(btn => btn.addEventListener('click',()=>switchPanel(btn.dataset.panel)));
mobileBottomNav?.querySelectorAll('.mnav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchPanel(btn.dataset.nav);
    if (btn.dataset.nav!=='chats') { showSidebar(); return; }
    showSidebar();
  });
});
backBtn?.addEventListener('click', () => { showSidebar(); closeProfilePanel(); activeChat=null; });
function showSidebar() { sidebarEl?.classList.remove('hidden'); mainArea?.classList.remove('open'); }
function showMain()    { sidebarEl?.classList.add('hidden');    mainArea?.classList.add('open');  }

/* ════════════════════════════════════════════════════════════════════════════
   CHAT LIST
════════════════════════════════════════════════════════════════════════════ */
function renderChatList(filter='') {
  chatList.innerHTML='';
  const items=[];
  for (const gid in groups) {
    const g=groups[gid]; if(filter&&!g.name.toLowerCase().includes(filter)) continue;
    const key=chatKey('group',gid), c=chats[key]||{};
    items.push({type:'group',id:gid,name:g.name,isGroup:true,lastMsg:c.lastMsg||'',lastTime:c.lastTime||'',unread:c.unread||0});
  }
  for (const uname in contacts) {
    if (uname===myUser?.username) continue;
    if (filter&&!uname.toLowerCase().includes(filter)) continue;
    const u=contacts[uname]||allUsersMap[uname]||{};
    const key=chatKey('private',uname), c=chats[key]||{};
    items.push({type:'private',id:uname,name:uname,isGroup:false,lastMsg:c.lastMsg||'',lastTime:c.lastTime||'',unread:c.unread||0,online:u.is_online,lastSeen:u.last_seen});
  }
  items.sort((a,b)=>b.lastTime>a.lastTime?1:-1);
  if (!items.length) {
    chatList.innerHTML=`<div class="empty-panel-hint"><svg viewBox="0 0 24 24" width="40" height="40" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" stroke="currentColor" stroke-width="1.5"/></svg><p>No chats yet.<br>Tap ✏ to start a new chat.</p></div>`;
    return;
  }
  items.forEach(item => {
    const key=chatKey(item.type,item.id), isActive=activeChat&&chatKey(activeChat.type,activeChat.id)===key;
    const div=document.createElement('div'); div.className='chat-item'+(isActive?' active':'');
    const u=contacts[item.id]||allUsersMap[item.id];
    const av=document.createElement('div'); av.className='chat-item-avatar'+(item.isGroup?' grp':'');
    if (!item.isGroup) setAvatarEl(av,u); else { av.textContent=getInitial(item.name); av.style.background=getAvatarColor(item.name); }
    if (!item.isGroup&&item.online) { const dot=document.createElement('div'); dot.className='online-dot'; av.appendChild(dot); }
    const body=document.createElement('div'); body.className='chat-item-body';
    body.innerHTML=`<div class="chat-item-top"><span class="chat-item-name">${item.name}${item.isGroup?' 👥':''}</span><span class="chat-item-time">${item.lastTime}</span></div><div class="chat-item-bottom"><span class="chat-item-preview">${item.lastMsg||(item.online?'online':'')}</span>${item.unread>0?`<span class="unread-count">${item.unread}</span>`:''}</div>`;
    div.appendChild(av); div.appendChild(body);
    div.addEventListener('click',()=>openChat(item));
    chatList.appendChild(div);
  });
}
searchInput?.addEventListener('input',()=>renderChatList(searchInput.value.trim().toLowerCase()));

/* ── New Chat modal ─────────────────────────────────────────────────────── */
newChatBtn?.addEventListener('click', openNewChatModal);
closeNewChatModal?.addEventListener('click',()=>{newChatModal.style.display='none';});
function openNewChatModal() {
  userSearchResult.innerHTML=''; newChatEmailInput.value='';
  contactsListModal.innerHTML='';
  Object.values(contacts).forEach(u => {
    if (u.username===myUser?.username) return;
    const item=document.createElement('div'); item.className='modal-user-item';
    const av=makeAvatarHtml(u,36,14);
    item.innerHTML=`${av}<span>${u.username}</span><small style="margin-left:auto;color:var(--ts)">${u.email}</small>`;
    item.addEventListener('click',()=>{ newChatModal.style.display='none'; openChat({type:'private',id:u.username,name:u.username,isGroup:false}); });
    contactsListModal.appendChild(item);
  });
  newChatModal.style.display='flex'; newChatEmailInput.focus();
}
newChatSearchBtn?.addEventListener('click', searchUserByEmail);
newChatEmailInput?.addEventListener('keydown',e=>{if(e.key==='Enter') searchUserByEmail();});
async function searchUserByEmail() {
  const email=newChatEmailInput.value.trim(); if(!email) return;
  userSearchResult.innerHTML=`<div class="user-search-not-found">Searching...</div>`;
  try {
    const u=await api('GET',`/api/users/search?email=${encodeURIComponent(email)}`);
    userSearchResult.innerHTML='';
    const found=document.createElement('div'); found.className='user-search-found';
    const av=makeAvatarHtml(u,40,16);
    found.innerHTML=`${av}<div><div style="font-weight:600">${u.username}</div><div style="font-size:11px;color:var(--ts)">${u.email}</div></div><div style="margin-left:auto;display:flex;gap:8px"><button class="start-chat-btn" id="searchStartChat">Message</button><button class="start-chat-btn" style="background:var(--bg3);color:var(--tp);border:1px solid var(--border)" id="searchAddOnly">Add</button></div>`;
    userSearchResult.appendChild(found);
    found.querySelector('#searchStartChat').addEventListener('click', async()=>{
      contacts[u.username]=u; await api('POST','/api/contacts',{contactId:u.id});
      allUsersMap[u.username]=u; newChatModal.style.display='none';
      openChat({type:'private',id:u.username,name:u.username,isGroup:false}); renderChatList();
    });
    found.querySelector('#searchAddOnly').addEventListener('click', async()=>{
      contacts[u.username]=u; await api('POST','/api/contacts',{contactId:u.id});
      allUsersMap[u.username]=u; renderChatList(); showToast(`${u.username} added`); newChatModal.style.display='none';
    });
  } catch { userSearchResult.innerHTML=`<div class="user-search-not-found">No user found with that email.</div>`; }
}

function updatePipStatus(isOnline, lastSeen) {
  if (!pipHeroStatus) return;
  pipHeroStatus.textContent = isOnline?'online':formatLastSeen(lastSeen);
  pipHeroStatus.style.color = isOnline?'var(--accent)':'var(--ts)';
}
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 2 / 4
//  Open Chat · Messages · Send · Files · Location · Contact · Profile Panel
// ════════════════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════════════════════════════════════
   OPEN CHAT + LOCK CHECK + HISTORY
════════════════════════════════════════════════════════════════════════════ */
async function openChat({type,id,name,isGroup}) {
  activeChat={type,id,name,isGroup};
  const key=chatKey(type,id); ensureChat(key);
  if (chats[key]) chats[key].unread=0;
  showMain(); closeProfilePanel();

  // Check lock
  const settings=await getChatSettings(key);
  if (settings.is_locked && !lockedChats[key]) {
    showLockedScreen(key); return;
  }

  showChatUI(type,id,name,isGroup,key,settings);
}

function showLockedScreen(key) {
  chatEmptyState.style.display='none';
  lockedChatScreen.style.display='flex';
  chatHeader.style.display='none';
  messagesArea.style.display='none';
  inputBar.style.display='none';
  lockedChatPinError.textContent='';
  lockedChatPinInput.value='';
  lockedChatUnlockBtn.onclick=async()=>{
    const pin=lockedChatPinInput.value;
    try {
      const r=await api('POST',`/api/chat-settings/${encodeURIComponent(key)}/verify-pin`,{pin});
      if (r.valid) { lockedChats[key]=true; lockedChatScreen.style.display='none'; if(activeChat) showChatUI(activeChat.type,activeChat.id,activeChat.name,activeChat.isGroup,key,{}); }
      else lockedChatPinError.textContent='Incorrect PIN';
    } catch { lockedChatPinError.textContent='Error verifying PIN'; }
  };
}

async function showChatUI(type,id,name,isGroup,key,settings) {
  lockedChatScreen.style.display='none';
  chatEmptyState.style.display='none';
  chatHeader.style.display='flex';
  messagesArea.style.display='flex';
  inputBar.style.display='flex';

  // Apply theme
  const theme=settings.theme||'default';
  messagesArea.dataset.chatTheme=theme==='default'?'':theme;
  if (theme!=='default') messagesArea.setAttribute('data-chat-theme',theme);
  else messagesArea.removeAttribute('data-chat-theme');

  // Header avatar
  const u=allUsersMap[id]||contacts[id];
  chatHeaderAvatar.className='chat-avatar-sm'+(isGroup?' grp':'');
  if (!isGroup && u) setAvatarEl(chatHeaderAvatar,u);
  else { chatHeaderAvatar.textContent=getInitial(name); chatHeaderAvatar.style.background=getAvatarColor(name); }
  chatHeaderName.textContent=name;

  headerAudioCallBtn.style.display=!isGroup?'flex':'none';
  headerVideoCallBtn.style.display=!isGroup?'flex':'none';
  headerGroupAudioCallBtn.style.display=isGroup?'flex':'none';
  headerGroupVideoCallBtn.style.display=isGroup?'flex':'none';
  addToCallBtn.style.display=currentCallPeers.length>0?'flex':'none';
  chatInfoBtn.style.display='flex';

  if (isGroup) {
    const g=groups[id]; chatHeaderStatus.textContent=g?`${g.members.length} members`:'group'; chatHeaderStatus.style.color='var(--ts)'; activeChat.groupId=id;
  } else {
    activeChat.targetUserId=u?.id;
    chatHeaderStatus.textContent=u?.is_online?'online':formatLastSeen(u?.last_seen);
    chatHeaderStatus.style.color=u?.is_online?'var(--accent)':'var(--ts)';
  }

  if (!chats[key]._loaded) {
    try {
      let rows;
      if (isGroup) rows=await api('GET',`/api/messages/group/${id}`);
      else {
        const uid=(allUsersMap[id]||contacts[id])?.id;
        rows=uid?await api('GET',`/api/messages/private/${uid}`) :[];
      }
      chats[key].messages=rows.map(normaliseMsg); chats[key]._loaded=true;
    } catch(e) { console.error('load history:',e); }
  }
  renderMessages(key); renderChatList(searchInput?.value?.trim()?.toLowerCase()||'');
  messageInput.focus();
}

async function getChatSettings(key) {
  try { return await api('GET',`/api/chat-settings/${encodeURIComponent(key)}`); }
  catch { return {disappearing_msgs:'off',theme:'default',is_locked:0,is_muted:0}; }
}

// Chat header info click → open profile panel
$('chatHeaderInfo')?.addEventListener('click', () => {
  if (!activeChat) return;
  openProfilePanel(activeChat.id, activeChat.isGroup);
});
chatInfoBtn?.addEventListener('click', () => {
  if (!activeChat) return;
  openProfilePanel(activeChat.id, activeChat.isGroup);
});

/* ── Render Messages ────────────────────────────────────────────────────── */
function renderMessages(key) {
  messagesList.innerHTML='';
  const chat=chats[key]; if(!chat) return;
  chat.messages.forEach(m=>appendMessageToDom(m,false));
  messagesList.scrollTop=messagesList.scrollHeight;
}

function appendMessageToDom(msg, scroll=true) {
  const isOwn=msg.from===myUser?.username;
  const row=document.createElement('div');
  row.className=`message-row ${isOwn?'out':'in'}`; row.dataset.msgId=msg.id;

  if (activeChat?.isGroup&&!isOwn) {
    const sn=document.createElement('div'); sn.className='msg-sender-name';
    sn.textContent=msg.from; sn.style.color=getAvatarColor(msg.from); row.appendChild(sn);
  }
  const bubble=document.createElement('div'); bubble.className='message-bubble';

  // Image
  if (msg.fileUrl && msg.fileType?.startsWith('image/')) {
    const img=document.createElement('img'); img.className='msg-image'; img.src=msg.fileUrl; img.loading='lazy';
    img.addEventListener('click',()=>openImageViewer(msg.fileUrl)); bubble.appendChild(img);
  }
  // Video
  else if (msg.fileUrl && msg.fileType?.startsWith('video/')) {
    const vid=document.createElement('video'); vid.className='msg-image'; vid.src=msg.fileUrl; vid.controls=true; vid.style.maxWidth='240px'; bubble.appendChild(vid);
  }
  // File
  else if (msg.fileUrl) {
    const link=document.createElement('a'); link.className='msg-file'; link.href=msg.fileUrl; link.download=msg.fileName||'file'; link.target='_blank';
    link.innerHTML=`<div class="msg-file-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="white"/></svg></div><div><div class="msg-file-name">${msg.fileName||'File'}</div><div class="msg-file-size">${formatSize(msg.fileSize)}</div></div>`;
    bubble.appendChild(link);
  }

  // Location
  if (msg.msgType==='location'&&msg.content) {
    try {
      const loc=JSON.parse(msg.content);
      const el=document.createElement('div'); el.className='msg-location'; el.dataset.sessionId=loc.sessionId||'';
      el.innerHTML=`<div class="msg-location-icon">📍</div><div><div class="msg-location-text">${loc.duration>0?'Live Location':'Location'}</div><div class="msg-location-sub"><a href="https://maps.google.com/?q=${loc.lat},${loc.lng}" target="_blank" style="color:var(--accent)">Open in Maps</a></div></div>`;
      // Embed map inline
      if (window.googleMapsReady||typeof google!=='undefined') {
        const mapDiv=document.createElement('div'); mapDiv.className='msg-location-map'; mapDiv.id=`map-${msg.id}`;
        el.prepend(mapDiv); bubble.appendChild(el);
        setTimeout(()=>initMsgMap(mapDiv,loc.lat,loc.lng),100);
      } else { bubble.appendChild(el); }
    } catch { /* fallback */ }
  }

  // Contact card
  if (msg.msgType==='contact'&&msg.content) {
    try {
      const c=JSON.parse(msg.content);
      const el=document.createElement('div'); el.className='msg-contact';
      el.innerHTML=`<div class="msg-contact-av" style="background:${getAvatarColor(c.username)}">${getInitial(c.username)}</div><div><div class="msg-contact-name">${c.username}</div><div class="msg-contact-email">${c.email}</div>${!contacts[c.username]?`<div class="msg-contact-add" data-uid="${c.id}" data-uname="${c.username}">Add to contacts</div>`:''}</div>`;
      el.querySelector('.msg-contact-add')?.addEventListener('click', async(ev)=>{
        const uid=ev.target.dataset.uid, uname=ev.target.dataset.uname;
        await api('POST','/api/contacts',{contactId:uid});
        if (allUsersMap[uname]) contacts[uname]=allUsersMap[uname];
        showToast(`${uname} added!`); ev.target.remove();
      });
      bubble.appendChild(el);
    } catch {}
  }

  // Text
  if (msg.content && msg.msgType!=='location' && msg.msgType!=='contact') {
    const t=document.createElement('div'); t.className='msg-text'; t.textContent=msg.content; bubble.appendChild(t);
  }
  if (msg.is_edited) { const em=document.createElement('span'); em.className='edit-mark'; em.textContent=' (edited)'; bubble.appendChild(em); }

  const footer=document.createElement('div'); footer.className='msg-footer';
  footer.innerHTML=`<span class="msg-time">${isoToTime(msg.time)}</span>`;
  if (isOwn) footer.innerHTML+=`<span class="msg-ticks ${msg.status==='seen'?'seen':''}" id="ticks-${msg.id}">${ticksHTML(msg.status)}</span>`;
  bubble.appendChild(footer); row.appendChild(bubble);

  if (isOwn) {
    row.addEventListener('contextmenu', e => {
      e.preventDefault(); contextMsgId=msg.id;
      ctxEdit.style.display=msg.msgType==='text'?'block':'none';
      contextMenu.style.display='block';
      contextMenu.style.left=Math.min(e.clientX,window.innerWidth-185)+'px';
      contextMenu.style.top=Math.min(e.clientY,window.innerHeight-125)+'px';
    });
  }
  messagesList.appendChild(row);
  if (scroll) messagesList.scrollTop=messagesList.scrollHeight;
}

// Inline Google map for location messages
function initMsgMap(el, lat, lng) {
  try {
    const map=new google.maps.Map(el,{zoom:14,center:{lat,lng},disableDefaultUI:true,gestureHandling:'none'});
    new google.maps.Marker({position:{lat,lng},map});
  } catch {}
}

// Update live location bubble
function updateLiveLocationBubble(from, lat, lng, speed, heading, accuracy) {
  document.querySelectorAll('.msg-location').forEach(el => {
    // Update map if exists
    const mapId=el.closest('[data-msg-id]')?.dataset.msgId;
    if (!mapId) return;
  });
}

document.addEventListener('click',()=>{contextMenu.style.display='none';});
ctxEdit?.addEventListener('click',()=>{
  const msg=chats[activeChatKey()]?.messages.find(m=>m.id===contextMsgId); if(!msg) return;
  messageInput.value=msg.content||''; messageInput.dataset.editId=contextMsgId; messageInput.focus();
});
ctxDeleteMe?.addEventListener('click',()=>deleteMessage('me'));
ctxDeleteAll?.addEventListener('click',()=>deleteMessage('everyone'));
function deleteMessage(deleteFor) {
  if (!contextMsgId||!activeChat) return;
  socket.emit('delete-message',{msgId:contextMsgId,deleteFor,to:activeChat.type==='private'?activeChat.id:undefined,groupId:activeChat.type==='group'?activeChat.id:undefined});
  const key=activeChatKey();
  if (chats[key]&&deleteFor==='everyone') { const idx=chats[key].messages.findIndex(m=>m.id===contextMsgId); if(idx!==-1) chats[key].messages.splice(idx,1); }
  contextMsgId=null;
}
function openImageViewer(src) {
  const ov=document.createElement('div'); ov.className='img-viewer-overlay';
  ov.innerHTML=`<img src="${src}" class="img-viewer-img"><button class="img-viewer-close">✕</button>`;
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.classList.contains('img-viewer-close')) ov.remove();});
  document.body.appendChild(ov);
}

/* ════════════════════════════════════════════════════════════════════════════
   SEND MESSAGE
════════════════════════════════════════════════════════════════════════════ */
function sendMessage() {
  const text=messageInput.value.trim(); if(!text||!activeChat) return;
  const editId=messageInput.dataset.editId;
  if (editId) {
    socket.emit('edit-message',{msgId:editId,newContent:text,to:activeChat.type==='private'?activeChat.id:undefined,groupId:activeChat.type==='group'?activeChat.id:undefined});
    const m=chats[activeChatKey()]?.messages.find(m=>m.id===editId);
    if (m) { m.content=text; m.is_edited=true; }
    const b=document.querySelector(`[data-msg-id="${editId}"] .message-bubble`);
    if (b) { const t=b.querySelector('.msg-text'); if(t) t.textContent=text; if(!b.querySelector('.edit-mark')){const em=document.createElement('span');em.className='edit-mark';em.textContent=' (edited)';b.querySelector('.msg-footer')?.prepend(em);} }
    messageInput.value=''; delete messageInput.dataset.editId; return;
  }
  stopTyping();
  const id=genId();
  const msg={id,from:myUser.username,content:text,msgType:'text',time:new Date().toISOString(),status:'sent'};
  if (activeChat.type==='group') { msg.groupId=activeChat.id; socket.emit('group-message',{groupId:activeChat.id,content:text,msgType:'text',msgId:id}); }
  else { msg.to=activeChat.id; socket.emit('private-message',{to:activeChat.id,content:text,msgType:'text',msgId:id}); }
  const key=activeChatKey(); ensureChat(key);
  chats[key].messages.push(msg); chats[key].lastMsg=text; chats[key].lastTime=isoToTime(msg.time);
  appendMessageToDom(msg); messageInput.value=''; messageInput.style.height='auto';
  renderChatList(searchInput?.value?.trim()?.toLowerCase()||'');
}
sendBtn?.addEventListener('click',sendMessage);
messageInput?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
messageInput?.addEventListener('input',()=>{
  messageInput.style.height='auto'; messageInput.style.height=Math.min(messageInput.scrollHeight,120)+'px';
  if (!activeChat||!socket) return;
  if (!isTypingSent) { socket.emit('typing',{to:activeChat.id,isTyping:true,isGroup:activeChat.type==='group'}); isTypingSent=true; }
  clearTimeout(typingTimer); typingTimer=setTimeout(stopTyping,1500);
});
function stopTyping() {
  if (isTypingSent&&activeChat&&socket) { socket.emit('typing',{to:activeChat.id,isTyping:false,isGroup:activeChat.type==='group'}); isTypingSent=false; }
}

/* ── Attach menu ────────────────────────────────────────────────────────── */
attachBtn?.addEventListener('click',e=>{
  e.stopPropagation();
  inputAttachMenu.style.display=(inputAttachMenu.style.display==='flex')?'none':'flex';
});
document.addEventListener('click',()=>{ if(inputAttachMenu) inputAttachMenu.style.display='none'; });
attachFileOpt?.addEventListener('click',()=>{ fileInput.click(); inputAttachMenu.style.display='none'; });
// Camera: use capture input directly
attachCameraOpt?.addEventListener('click',()=>{ cameraInput.click(); inputAttachMenu.style.display='none'; });
attachLocationOpt?.addEventListener('click',()=>{ openLiveLocationModal(); inputAttachMenu.style.display='none'; });
attachContactOpt?.addEventListener('click',()=>{ openShareContactModal(); inputAttachMenu.style.display='none'; });

/* ── File upload ────────────────────────────────────────────────────────── */
async function uploadAndSendFile(file) {
  if (!file||!activeChat) return;
  if (file.size>50*1024*1024) { showToast('File too large (max 50MB)'); return; }
  const formData=new FormData(); formData.append('file',file);
  try {
    showToast('Uploading...');
    const r=await fetch('/api/upload/media',{method:'POST',headers:{'Authorization':'Bearer '+myToken},body:formData});
    if (!r.ok) throw new Error('Upload failed');
    const {url,name,size,type}=await r.json();
    const id=genId();
    const msg={id,from:myUser.username,msgType:type.startsWith('image/')?'image':type.startsWith('video/')?'video':'file',fileUrl:url,fileName:name,fileSize:size,fileType:type,time:new Date().toISOString(),status:'sent'};
    if (activeChat.type==='group') { msg.groupId=activeChat.id; socket.emit('group-message',{groupId:activeChat.id,msgType:msg.msgType,fileUrl:url,fileName:name,fileSize:size,fileType:type,msgId:id}); }
    else { msg.to=activeChat.id; socket.emit('private-message',{to:activeChat.id,msgType:msg.msgType,fileUrl:url,fileName:name,fileSize:size,fileType:type,msgId:id}); }
    const key=activeChatKey(); ensureChat(key);
    chats[key].messages.push(msg); chats[key].lastMsg=`📎 ${name}`; chats[key].lastTime=isoToTime(msg.time);
    appendMessageToDom(msg); renderChatList();
  } catch(e) { showToast('Upload failed: '+e.message); }
}
fileInput?.addEventListener('change',()=>{ if(fileInput.files[0]){uploadAndSendFile(fileInput.files[0]);fileInput.value='';} });
cameraInput?.addEventListener('change',()=>{ if(cameraInput.files[0]){uploadAndSendFile(cameraInput.files[0]);cameraInput.value='';} });

/* ── Live Location ──────────────────────────────────────────────────────── */
let liveMsgId=null, liveMapInstance=null, liveMarker=null;

function openLiveLocationModal() {
  locLoadingMsg.style.display='flex'; locInfoBar.style.display='none';
  liveLocationModal.style.display='flex';
  document.querySelectorAll('.loc-opt-btn').forEach(b=>b.classList.toggle('active',b.dataset.duration==='0'));
  liveLocDuration=0;
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude:lat,longitude:lng,speed,heading,accuracy}=pos.coords;
    currentUserLoc={lat,lng,speed,heading,accuracy};
    locLoadingMsg.style.display='none'; locInfoBar.style.display='flex';
    if (locSpeed) locSpeed.textContent=Math.round((speed||0)*3.6)+' km/h';
    if (locHeading) locHeading.textContent=Math.round(heading||0)+'°';
    if (locAccuracy) locAccuracy.textContent=Math.round(accuracy||0)+'m';
    renderLocationMap(lat,lng);
  },()=>{ locLoadingMsg.innerHTML='<span>Location access denied.</span>'; },{enableHighAccuracy:true});
}

function renderLocationMap(lat,lng) {
  if (typeof google!=='undefined'&&google.maps) {
    if (!liveMapInstance) {
      liveMapInstance=new google.maps.Map(locationMapContainer,{zoom:15,center:{lat,lng},disableDefaultUI:false,mapTypeId:'roadmap',styles:[{featureType:'all',elementType:'geometry',stylers:[{color:'#0d1a2a'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#051020'}]},{featureType:'road',elementType:'geometry.stroke',stylers:[{color:'#00bfa5'}]},{featureType:'road',elementType:'geometry.fill',stylers:[{color:'#1a2d3d'}]}]});
      liveMarker=new google.maps.Marker({position:{lat,lng},map:liveMapInstance,icon:{path:google.maps.SymbolPath.CIRCLE,scale:8,fillColor:'#00bfa5',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});
    } else { liveMapInstance.setCenter({lat,lng}); liveMarker.setPosition({lat,lng}); }
  } else {
    locationMapContainer.innerHTML=`<iframe src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed" width="100%" height="100%" style="border:none;display:block"></iframe>`;
    locLoadingMsg.style.display='none';
  }
}

closeLiveLocModal?.addEventListener('click',()=>{liveLocationModal.style.display='none';stopLiveLocation();});
document.querySelectorAll('.loc-opt-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.loc-opt-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); liveLocDuration=parseInt(btn.dataset.duration);
  });
});

sendLiveLocBtn?.addEventListener('click',()=>{
  if (!currentUserLoc) { showToast('Location not available'); return; }
  const {lat,lng}=currentUserLoc;
  liveMsgId=genId();
  const msg={id:liveMsgId,from:myUser.username,msgType:'location',content:JSON.stringify({lat,lng,duration:liveLocDuration,sessionId:liveMsgId}),time:new Date().toISOString(),status:'sent'};
  if (activeChat.type==='group') { msg.groupId=activeChat.id; socket.emit('group-message',{groupId:activeChat.id,content:msg.content,msgType:'location',msgId:liveMsgId}); }
  else { msg.to=activeChat.id; socket.emit('private-message',{to:activeChat.id,content:msg.content,msgType:'location',msgId:liveMsgId}); }
  const key=activeChatKey(); ensureChat(key);
  chats[key].messages.push(msg); chats[key].lastMsg='📍 Location'; chats[key].lastTime=isoToTime(msg.time);
  appendMessageToDom(msg); renderChatList();
  liveLocationModal.style.display='none';
  showToast('Location shared!');
  // Start live updates if duration>0
  if (liveLocDuration>0) startLiveLocationWatch();
  liveMapInstance=null; liveMarker=null;
});

function startLiveLocationWatch() {
  if (liveLocWatchId) navigator.geolocation.clearWatch(liveLocWatchId);
  liveLocWatchId=navigator.geolocation.watchPosition(pos=>{
    const {latitude:lat,longitude:lng,speed,heading,accuracy}=pos.coords;
    socket.emit('live-location-update',{to:activeChat?.type==='private'?activeChat.id:undefined,groupId:activeChat?.type==='group'?activeChat.id:undefined,lat,lng,speed:speed||0,heading:heading||0,accuracy:accuracy||0,sessionId:liveMsgId});
  },{enableHighAccuracy:true,maximumAge:5000});
  if (liveLocDuration>0) setTimeout(stopLiveLocation, liveLocDuration*60000);
}
function stopLiveLocation() {
  if (liveLocWatchId) { navigator.geolocation.clearWatch(liveLocWatchId); liveLocWatchId=null; }
  if (liveMsgId&&activeChat) {
    socket.emit('stop-live-location',{to:activeChat?.type==='private'?activeChat.id:undefined,groupId:activeChat?.type==='group'?activeChat.id:undefined,sessionId:liveMsgId});
  }
}

/* ── Share Contact ──────────────────────────────────────────────────────── */
function openShareContactModal() {
  // Reuse newChatModal style – build contact picker
  const picker=document.createElement('div'); picker.className='modal-overlay';
  picker.innerHTML=`<div class="modal-card"><div class="modal-header"><h3>Share Contact</h3><button class="modal-close" id="closeContactPicker">✕</button></div><div class="modal-user-list" id="contactPickerList"></div></div>`;
  document.body.appendChild(picker);
  picker.querySelector('#closeContactPicker').addEventListener('click',()=>picker.remove());
  const list=picker.querySelector('#contactPickerList');
  Object.values(contacts).forEach(u=>{
    if (u.username===myUser?.username) return;
    const item=document.createElement('div'); item.className='modal-user-item';
    item.innerHTML=`${makeAvatarHtml(u,36,14)}<div><div style="font-weight:600">${u.username}</div><div style="font-size:11px;color:var(--ts)">${u.email}</div></div>`;
    item.addEventListener('click',()=>{
      sendContactCard(u); picker.remove();
    });
    list.appendChild(item);
  });
}
function sendContactCard(u) {
  if (!activeChat) return;
  const id=genId();
  const content=JSON.stringify({id:u.id,username:u.username,email:u.email,avatarColor:u.avatar_color});
  const msg={id,from:myUser.username,msgType:'contact',content,time:new Date().toISOString(),status:'sent'};
  if (activeChat.type==='group') { msg.groupId=activeChat.id; socket.emit('group-message',{groupId:activeChat.id,content,msgType:'contact',msgId:id}); }
  else { msg.to=activeChat.id; socket.emit('private-message',{to:activeChat.id,content,msgType:'contact',msgId:id}); }
  const key=activeChatKey(); ensureChat(key);
  chats[key].messages.push(msg); appendMessageToDom(msg); renderChatList();
}

/* ════════════════════════════════════════════════════════════════════════════
   PROFILE INFO PANEL
════════════════════════════════════════════════════════════════════════════ */
pipCloseBtn?.addEventListener('click', closeProfilePanel);
function closeProfilePanel() {
  profileInfoPanel.classList.remove('open');
  activePipUser=null;
}

async function openProfilePanel(id, isGroup) {
  activePipUser=isGroup?null:id;
  profileInfoPanel.classList.add('open');
  pipHeaderTitle.textContent=isGroup?'Group Info':'Contact Info';

  if (isGroup) {
    const g=groups[id];
    pipHeroName.textContent=g?.name||id;
    pipHeroStatus.textContent=`${g?.members?.length||0} members`;
    pipHeroStatus.style.color='var(--ts)';
    pipHeroAvatar.textContent=getInitial(g?.name||id); pipHeroAvatar.style.background=getAvatarColor(g?.name||id);
    pipRowPhone.style.display='none'; pipRowAbout.style.display='none';
    pipEmailVal.textContent='Group';
    pipGroupsCard.style.display='none';
    pipQuickActionsHide();
    return;
  }

  const u=allUsersMap[id]||contacts[id];
  // load full profile
  try {
    const profile=await api('GET',`/api/users/${u?.id||0}/profile`);
    setAvatarEl(pipHeroAvatar,profile);
    pipHeroName.textContent=profile.username;
    pipHeroStatus.textContent=profile.is_online?'online':formatLastSeen(profile.last_seen);
    pipHeroStatus.style.color=profile.is_online?'var(--accent)':'var(--ts)';

    pipEmailVal.textContent=profile.email||'';
    if (profile.phone) { pipPhoneVal.textContent=profile.phone; pipRowPhone.style.display='flex'; } else pipRowPhone.style.display='none';
    if (profile.about) { pipAboutVal.textContent=profile.about; pipRowAbout.style.display='flex'; } else pipRowAbout.style.display='none';

    // Block status
    const bs=await api('GET',`/api/block/check/${profile.id}`);
    pipBlockLabel.textContent=bs.iBlockedThem?'Unblock':'Block';
    pipBlockBtn.dataset.blocked=bs.iBlockedThem?'1':'0';
    pipBlockBtn.dataset.uid=profile.id;
    pipBlockBtn.style.display='flex';

    // Common groups
    try {
      const cg=await api('GET',`/api/users/${profile.id}/common-groups`);
      if (cg.length) {
        pipGroupsCard.style.display='block'; pipGroupsList.innerHTML='';
        cg.forEach(g=>{ const row=document.createElement('div'); row.className='pip-group-row'; row.innerHTML=`<div class="pip-gr-av">${getInitial(g.name)}</div><div><div class="pip-gr-name">${g.name}</div><div class="pip-gr-count">${g.member_count} members</div></div>`; pipGroupsList.appendChild(row); });
      } else pipGroupsCard.style.display='none';
    } catch { pipGroupsCard.style.display='none'; }

    // Media
    loadPipMedia(profile.id);

    // Chat settings
    const chatK=chatKey('private',id);
    const cs=await getChatSettings(chatK);
    if (pipDMSelect) { pipDMSelect.value=cs.disappearing_msgs||'off'; updateDMHint(cs.disappearing_msgs||'off'); }
    if (pipLockToggle) { pipLockToggle.checked=!!cs.is_locked; pipLockPinWrap.style.display=cs.is_locked?'block':'none'; }
    // Theme swatch
    document.querySelectorAll('.theme-swatch').forEach(s=>s.classList.toggle('active',s.dataset.theme===(cs.theme||'default')));

  } catch(e) {
    // Fallback to local data
    setAvatarEl(pipHeroAvatar,u||{username:id});
    pipHeroName.textContent=id;
    pipHeroStatus.textContent=u?.is_online?'online':formatLastSeen(u?.last_seen);
    pipHeroStatus.style.color=u?.is_online?'var(--accent)':'var(--ts)';
    pipEmailVal.textContent=u?.email||'';
  }
}

function pipQuickActionsHide() {
  const qa=document.querySelector('.pip-quick-actions'); if(qa) qa.style.display='none';
}

async function loadPipMedia(userId) {
  try {
    const media=await api('GET',`/api/chat-media/${userId}`);
    pipMediaCount.textContent=media.length;
    pipMediaGrid.innerHTML=''; pipNoMedia.style.display='none';
    if (!media.length) { pipNoMedia.style.display='block'; return; }
    media.slice(0,9).forEach(m=>{
      const t=document.createElement('div'); t.className='pip-media-thumb';
      if (m.file_type?.startsWith('image/')) t.innerHTML=`<img src="${m.file_path}" loading="lazy">`;
      else t.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:24px">📄</div>`;
      t.addEventListener('click',()=>{ if(m.file_type?.startsWith('image/')) openImageViewer(m.file_path); else window.open(m.file_path,'_blank'); });
      pipMediaGrid.appendChild(t);
    });
  } catch {}
}

// Block btn
pipBlockBtn?.addEventListener('click', async()=>{
  const uid=pipBlockBtn.dataset.uid, blocked=pipBlockBtn.dataset.blocked==='1';
  try {
    if (blocked) { await api('DELETE',`/api/block/${uid}`); pipBlockLabel.textContent='Block'; pipBlockBtn.dataset.blocked='0'; showToast('Unblocked'); }
    else { await api('POST',`/api/block/${uid}`); pipBlockLabel.textContent='Unblock'; pipBlockBtn.dataset.blocked='1'; showToast('Blocked'); }
  } catch(e) { showToast(e.message); }
});

// Share contact from PIP
pipShareContactBtn?.addEventListener('click',()=>{
  const u=allUsersMap[activePipUser]||contacts[activePipUser]; if(!u) return;
  sendContactCard(u); closeProfilePanel(); showToast('Contact shared!');
});

// Disappearing messages
pipDMSelect?.addEventListener('change', async()=>{
  if (!activeChat) return;
  const key=activeChatKey();
  updateDMHint(pipDMSelect.value);
  try { await api('PUT',`/api/chat-settings/${encodeURIComponent(key)}`,{disappearingMsgs:pipDMSelect.value}); showToast('Disappearing messages updated'); }
  catch(e) { showToast(e.message); }
});
function updateDMHint(val) { if(pipDMHint) pipDMHint.textContent=val==='off'?'Off':val; }

// Theme swatches
pipThemeRow?.querySelectorAll('.theme-swatch').forEach(s=>{
  s.addEventListener('click', async()=>{
    if (!activeChat) return;
    const key=activeChatKey();
    document.querySelectorAll('.theme-swatch').forEach(x=>x.classList.remove('active'));
    s.classList.add('active');
    const theme=s.dataset.theme;
    // Apply to messages area
    if (theme!=='default') messagesArea.setAttribute('data-chat-theme',theme);
    else messagesArea.removeAttribute('data-chat-theme');
    try { await api('PUT',`/api/chat-settings/${encodeURIComponent(key)}`,{theme}); } catch {}
  });
});

// Lock chat
pipLockToggle?.addEventListener('change',()=>{ pipLockPinWrap.style.display=pipLockToggle.checked?'block':'none'; });
pipSaveLockBtn?.addEventListener('click', async()=>{
  if (!activeChat) return;
  const key=activeChatKey(), pin=pipLockPinInput.value;
  if (pipLockToggle.checked&&pin.length<4) { showToast('Enter at least 4 digit PIN'); return; }
  try {
    await api('PUT',`/api/chat-settings/${encodeURIComponent(key)}`,{isLocked:pipLockToggle.checked,lockPin:pin||null});
    if (pipLockToggle.checked) lockedChats[key]=true; // keep unlocked for current session
    showToast('Lock setting saved!');
  } catch(e) { showToast(e.message); }
});

// Export chat
pipExportBtn?.addEventListener('click', async()=>{
  if (!activeChat) return;
  const key=activeChatKey();
  window.open(`/api/chat/export/${encodeURIComponent(key)}?token=${myToken}`, '_blank');
});

// Clear chat
pipClearBtn?.addEventListener('click', async()=>{
  if (!activeChat||!confirm('Clear all messages? This cannot be undone.')) return;
  const key=activeChatKey();
  try {
    await api('DELETE',`/api/chat/clear/${encodeURIComponent(key)}`);
    chats[key]={messages:[],unread:0,lastMsg:'',lastTime:'',_loaded:true};
    renderMessages(key); renderChatList(); showToast('Chat cleared');
  } catch(e) { showToast(e.message); }
});

// Export needs token in query — add server-side support via header or add endpoint
// For simplicity, let's post the token in headers via form:
// (Server already has GET /api/chat/export/:chatKey with requireAuth)
// We use fetch + download:
if (pipExportBtn) {
  pipExportBtn.addEventListener('click', async e => {
    e.stopImmediatePropagation(); // override previous listener
    if (!activeChat) return;
    const key=activeChatKey();
    try {
      const r=await fetch(`/api/chat/export/${encodeURIComponent(key)}`,{headers:{'Authorization':'Bearer '+myToken}});
      const text=await r.text();
      const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
      a.download=`chat_export.txt`; a.click();
    } catch(e) { showToast('Export failed'); }
  }, {capture:true});
}
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 3 / 4
//  Groups · Settings · Status · Call History
// ════════════════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════════════════════════════════════
   GROUPS
════════════════════════════════════════════════════════════════════════════ */
newGroupBtn?.addEventListener('click',()=>{
  groupMembersList.innerHTML=''; groupNameInput.value='';
  Object.values(contacts).forEach(u=>{
    if (u.username===myUser?.username) return;
    const item=document.createElement('div'); item.className='modal-user-item'; item.dataset.username=u.username;
    item.innerHTML=`${makeAvatarHtml(u,36,14)}<span>${u.username}</span><div class="check"></div>`;
    item.addEventListener('click',()=>item.classList.toggle('selected'));
    groupMembersList.appendChild(item);
  });
  newGroupModal.style.display='flex';
});
closeGroupModal?.addEventListener('click',()=>{newGroupModal.style.display='none';});
createGroupBtn?.addEventListener('click',()=>{
  const name=groupNameInput.value.trim(); if(!name){showToast('Enter a group name');return;}
  const sel=[...groupMembersList.querySelectorAll('.modal-user-item.selected')].map(el=>el.dataset.username);
  if (!sel.length){showToast('Select at least 1 member');return;}
  socket.emit('create-group',{groupId:genId(),name,members:[myUser.username,...sel]});
  newGroupModal.style.display='none';
});

/* ════════════════════════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════════════════════════ */
settingsProfile?.addEventListener('click',()=>openSubPanel(subProfile));
settingsAccount?.addEventListener('click',()=>openSubPanel(subAccount));
settingsPrivacy?.addEventListener('click',()=>openSubPanel(subPrivacy));

function openSubPanel(panel) {
  [subProfile,subAccount,subPrivacy].forEach(p=>{if(p)p.style.display='none';});
  if (panel) panel.style.display='flex';
  showMain();
}
document.querySelectorAll('.sub-back-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    [subProfile,subAccount,subPrivacy].forEach(p=>{if(p)p.style.display='none';});
    if (window.innerWidth<=768){showSidebar();switchPanel('settings');}
    else { chatEmptyState.style.display='flex'; chatHeader.style.display='none'; messagesArea.style.display='none'; inputBar.style.display='none'; profileInfoPanel.classList.remove('open'); }
  });
});

// Profile save
saveProfileBtn?.addEventListener('click',async()=>{
  try {
    await api('PUT','/api/profile',{username:profileNameInput.value.trim(),about:profileAboutInput.value,phone:profilePhoneInput.value});
    myUser.username=profileNameInput.value.trim()||myUser.username;
    localStorage.setItem('chatapp_user',JSON.stringify(myUser));
    myUsernameLabel.textContent=myUser.username;
    showToast('Profile saved!');
  } catch(e){showToast(e.message);}
});

// Profile photo upload  → uses /api/upload which also saves profile_pic
changePhotoBtn?.addEventListener('click',()=>profilePicInput.click());
profilePicInput?.addEventListener('change', async()=>{
  const file=profilePicInput.files[0]; if(!file) return;
  const formData=new FormData(); formData.append('file',file);
  try {
    const r=await fetch('/api/upload',{method:'POST',headers:{'Authorization':'Bearer '+myToken},body:formData});
    const data=await r.json(); const url=data.url; if(!url){showToast('Upload failed');return;}
    myUser.avatarUrl=url; localStorage.setItem('chatapp_user',JSON.stringify(myUser));
    setAvatarEl(profileBigAvatar,myUser); setAvatarEl(myAvatarEl,myUser);
    if (myStatusAvatar) setAvatarEl(myStatusAvatar,myUser);
    showToast('Photo updated!');
  } catch {showToast('Upload failed');}
  profilePicInput.value='';
});

// Two-step
twoStepToggle?.addEventListener('change',()=>{twoStepPinRow.style.display=twoStepToggle.checked?'block':'none';});
saveTwoStepBtn?.addEventListener('click',async()=>{
  try{await api('PUT','/api/two-step',{pin:twoStepPinInput.value});showToast('PIN set!');}catch(e){showToast(e.message);}
});

// Change email
changeEmailBtn?.addEventListener('click',async()=>{
  try{await api('PUT','/api/change-email',{newEmail:newEmailInput.value.trim(),currentPassword:changeEmailCurPass.value});showToast('Email changed!');}catch(e){showToast(e.message);}
});

// Change password
changePassBtn?.addEventListener('click',async()=>{
  try{await api('PUT','/api/change-password',{currentPassword:curPassInput.value,newPassword:newPassInput.value});showToast('Password changed!');curPassInput.value='';newPassInput.value='';}catch(e){showToast(e.message);}
});

// Delete account
deleteAccountBtn?.addEventListener('click',async()=>{
  if(!confirm('Are you sure? This cannot be undone.')) return;
  try{await api('DELETE','/api/account');doLogout();}catch(e){showToast(e.message);}
});

// Privacy save
savePrivacyBtn?.addEventListener('click',async()=>{
  try{
    await api('PUT','/api/privacy',{privLastSeen:privLastSeen.value,privPhoto:privProfilePic.value,privAbout:privAbout.value,privGroupAdd:privGroupAdd.value,liveLocEnabled:liveLocToggle.checked});
    showToast('Privacy settings saved!');
  }catch(e){showToast(e.message);}
});

// About char counter
profileAboutInput?.addEventListener('input',()=>{
  const s=profileAboutInput.parentElement.querySelector('small'); if(s) s.textContent=`${profileAboutInput.value.length}/200`;
});

/* ════════════════════════════════════════════════════════════════════════════
   CALL HISTORY
════════════════════════════════════════════════════════════════════════════ */
async function loadCallHistory() {
  try { const calls=await api('GET','/api/calls'); renderCallHistory(calls); }
  catch(e){console.error('call history:',e);}
}
function renderCallHistory(calls) {
  callHistoryList.innerHTML='';
  if (!calls.length) {
    callHistoryList.innerHTML=`<div class="empty-panel-hint"><svg viewBox="0 0 24 24" width="40" height="40" fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" stroke-width="1.5"/></svg><p>No call history yet</p></div>`;
    return;
  }
  calls.forEach(c=>{
    const isMe=c.caller_id===myUser.id;
    const otherName=isMe?(c.callee_name||c.group_name||'?'):(c.caller_name||'?');
    const otherColor=isMe?(c.callee_color||'#00A884'):(c.caller_color||'#00A884');
    let direction, dirClass;
    if (c.status==='missed'){direction='↙ Missed';dirClass='ch-icon-miss';}
    else if (isMe){direction='↗ Outgoing';dirClass='ch-icon-out';}
    else {direction='↙ Incoming';dirClass='ch-icon-in';}
    const d=new Date(c.started_at);
    const item=document.createElement('div'); item.className='call-hist-item';
    item.innerHTML=`<div class="ch-avatar" style="background:${otherColor}">${getInitial(otherName)}</div><div class="ch-body"><div class="ch-name">${otherName}</div><div class="ch-meta"><span class="${dirClass}">${direction}</span><span>·</span><span>${c.call_type==='video'?'📹':'📞'}${c.is_group?' Group':''}</span>${c.duration_s?`<span>· ${fmtDuration(c.duration_s)}</span>`:''}</div></div><div class="ch-side"><div class="ch-time">${d.toLocaleDateString([],{day:'2-digit',month:'short'})} ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div></div>`;
    item.addEventListener('click',()=>{
      if (!c.is_group&&otherName&&contacts[otherName]){openChat({type:'private',id:otherName,name:otherName,isGroup:false});switchPanel('chats');if(window.innerWidth<=768)showMain();}
    });
    callHistoryList.appendChild(item);
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   STATUS (WhatsApp-style 24h)
════════════════════════════════════════════════════════════════════════════ */
statusAddPlusBtn?.addEventListener('click',()=>{createStatusModal.style.display='flex';});
closeCreateStatus?.addEventListener('click',()=>{createStatusModal.style.display='none';});

// Status type tabs
document.querySelectorAll('.stt-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.stt-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    statusType=btn.dataset.type;
    statusTextSection.style.display=statusType==='text'?'block':'none';
    statusPhotoSection.style.display=statusType==='image'?'block':'none';
  });
});

// BG color
document.querySelectorAll('.sbg-opt').forEach(opt=>{
  opt.addEventListener('click',()=>{
    document.querySelectorAll('.sbg-opt').forEach(o=>o.classList.remove('active')); opt.classList.add('active');
    statusBgColor=opt.dataset.bg; if(statusTextPreview) statusTextPreview.style.background=statusBgColor;
  });
});

// Photo pick
document.querySelector('.status-photo-upload')?.addEventListener('click',()=>statusPhotoInput.click());
statusPhotoInput?.addEventListener('change',()=>{
  const f=statusPhotoInput.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=e=>{statusPhotoPreview.src=e.target.result;statusPhotoPreview.style.display='block';spuPlaceholder.style.display='none';}; r.readAsDataURL(f);
});

postStatusBtn?.addEventListener('click', async()=>{
  try {
    if (statusType==='text') {
      const content=statusTextInput.value.trim(); if(!content){showToast('Enter some text');return;}
      const r=await api('POST','/api/status',{contentType:'text',content,bgColor:statusBgColor,textColor:'#ffffff',fontSize:24});
      socket.emit('status-posted',{statusId:r.id});
    } else {
      const file=statusPhotoInput.files[0]; if(!file){showToast('Select a photo');return;}
      const fd=new FormData(); fd.append('file',file);
      const ur=await fetch('/api/upload/media',{method:'POST',headers:{'Authorization':'Bearer '+myToken},body:fd});
      const {url}=await ur.json();
      const caption=statusCaptionInput.value.trim();
      const r=await api('POST','/api/status',{contentType:'image',fileUrl:url,caption:caption||null});
      socket.emit('status-posted',{statusId:r.id});
    }
    createStatusModal.style.display='none';
    statusTextInput.value=''; statusCaptionInput.value='';
    statusPhotoPreview.style.display='none'; spuPlaceholder.style.display='flex';
    statusPhotoPreview.src='';
    showToast('Status posted!');
    loadStatuses();
  } catch(e){showToast(e.message);}
});

async function loadStatuses() {
  try {
    const list=await api('GET','/api/status');
    renderStatusPanel(list);
  } catch {}
}

function renderStatusPanel(list) {
  statusContactsList.innerHTML='';
  currentStatusList=list;
  let myEntry=null;
  const others=[];
  list.forEach(u=>{ if(u.is_mine) myEntry=u; else others.push(u); });

  // My status row
  if (myStatusAvatar) setAvatarEl(myStatusAvatar,myUser);
  if (myStatusSub) {
    if (myEntry&&myEntry.statuses.length) {
      myStatusSub.textContent=`${myEntry.statuses.length} update${myEntry.statuses.length>1?'s':''}`;
      const av=document.querySelector('.my-status-avatar'); if(av) av.classList.add('has-status');
    } else {
      myStatusSub.textContent='Tap to add status update';
      const av=document.querySelector('.my-status-avatar'); if(av) av.classList.remove('has-status');
    }
  }

  // My status click → view or create
  document.querySelector('.my-status-row')?.addEventListener('click',()=>{
    if (myEntry&&myEntry.statuses.length) { openStatusViewer(list.indexOf(myEntry)); }
    else createStatusModal.style.display='flex';
  }, {once:true});

  if (!others.length) {
    if (statusEmptyHint) statusEmptyHint.style.display='flex';
    return;
  }
  if (statusEmptyHint) statusEmptyHint.style.display='none';

  others.forEach((u,i)=>{
    const allViewed=u.statuses.every(s=>s.i_viewed);
    const row=document.createElement('div'); row.className='status-contact-row';
    const ringDiv=document.createElement('div'); ringDiv.className=`status-ring-avatar ${allViewed?'all-viewed':'unviewed'}`;
    const imgDiv=document.createElement('div'); imgDiv.className='sri-img';
    setAvatarEl(imgDiv,u); ringDiv.appendChild(imgDiv);
    const info=document.createElement('div');
    info.innerHTML=`<div class="sr-name">${u.username}</div><div class="sr-time">${isoToTime(u.statuses[0]?.created_at)}</div>`;
    row.appendChild(ringDiv); row.appendChild(info);
    row.addEventListener('click',()=>openStatusViewer(list.indexOf(u)));
    statusContactsList.appendChild(row);
  });
}

/* ── Status Viewer ─────────────────────────────────────────── */
function openStatusViewer(userIdx) {
  currentStatusUserIdx=userIdx; currentStatusItemIdx=0;
  statusViewerModal.style.display='flex';
  renderStatusItem();
}

function renderStatusItem() {
  const u=currentStatusList[currentStatusUserIdx]; if(!u) { closeStatusViewer(); return; }
  const s=u.statuses[currentStatusItemIdx]; if(!s) { closeStatusViewer(); return; }

  // Avatar + name + time
  setAvatarEl(svAvatar,u);
  svName.textContent=u.username;
  svTime.textContent=isoToTime(s.created_at);
  svViewCount.textContent=s.view_count||0;

  // Progress bar
  const total=u.statuses.length;
  svProgressBar.innerHTML='';
  for(let i=0;i<total;i++){
    const seg=document.createElement('div'); seg.className='sv-progress-seg';
    const fill=document.createElement('div'); fill.className='sv-progress-seg-fill';
    if(i<currentStatusItemIdx) fill.classList.add('done');
    seg.appendChild(fill); svProgressBar.appendChild(seg);
  }

  // Content
  svContent.innerHTML='';
  if (s.content_type==='image'&&s.file_url) {
    statusViewerModal.style.background='#000';
    const wrap=document.createElement('div'); wrap.className='sv-img-content';
    wrap.innerHTML=`<img src="${s.file_url}" style="width:100%;height:100%;object-fit:contain">`;
    if(s.caption) wrap.innerHTML+=`<div class="sv-caption">${s.caption}</div>`;
    svContent.appendChild(wrap);
  } else {
    const wrap=document.createElement('div'); wrap.className='sv-text-content';
    wrap.style.background=s.bg_color||'#1a2433';
    wrap.innerHTML=`<p style="font-size:${s.font_size||24}px;color:${s.text_color||'#fff'}">${s.content||''}</p>`;
    svContent.appendChild(wrap);
    statusViewerModal.style.background='transparent';
  }

  // Reactions — only for others' statuses
  if (!u.is_mine) {
    svReactions.style.display='flex';
    svReactBtn.textContent=s.my_reaction||'❤️';
  } else { svReactions.style.display='none'; }

  // Mark viewed (non-blocking)
  if (!s.i_viewed) api('POST',`/api/status/${s.id}/view`).catch(()=>{});

  // Progress animation
  clearInterval(statusTimer);
  const fillEl=svProgressBar.children[currentStatusItemIdx]?.querySelector('.sv-progress-seg-fill');
  if (fillEl) {
    let w=0; fillEl.style.width='0%';
    statusTimer=setInterval(()=>{
      w+=100/50; fillEl.style.width=Math.min(w,100)+'%';
      if(w>=100) { clearInterval(statusTimer); advanceStatus(); }
    },100);
  }
}

function advanceStatus() {
  const u=currentStatusList[currentStatusUserIdx];
  if (u&&currentStatusItemIdx<u.statuses.length-1) { currentStatusItemIdx++; renderStatusItem(); }
  else if (currentStatusUserIdx<currentStatusList.length-1) { currentStatusUserIdx++; currentStatusItemIdx=0; renderStatusItem(); }
  else closeStatusViewer();
}
function prevStatus() {
  if (currentStatusItemIdx>0) { currentStatusItemIdx--; renderStatusItem(); }
  else if (currentStatusUserIdx>0) { currentStatusUserIdx--; const u=currentStatusList[currentStatusUserIdx]; currentStatusItemIdx=Math.max(0,u.statuses.length-1); renderStatusItem(); }
}

svTapNext?.addEventListener('click',()=>{ clearInterval(statusTimer); advanceStatus(); });
svTapPrev?.addEventListener('click',()=>{ clearInterval(statusTimer); prevStatus(); });
svCloseBtn?.addEventListener('click',closeStatusViewer);

function closeStatusViewer() {
  clearInterval(statusTimer); statusViewerModal.style.display='none';
  loadStatuses(); // refresh views
}

// Reactions
svReactBtn?.addEventListener('click',()=>{ svEmojiPicker.style.display=svEmojiPicker.style.display==='flex'?'none':'flex'; });
svEmojiPicker?.querySelectorAll('span').forEach(em=>{
  em.addEventListener('click',async()=>{
    const u=currentStatusList[currentStatusUserIdx], s=u?.statuses[currentStatusItemIdx]; if(!s) return;
    svReactBtn.textContent=em.dataset.emoji; svEmojiPicker.style.display='none';
    await api('POST',`/api/status/${s.id}/like`,{emoji:em.dataset.emoji});
  });
});

// View viewers list (own status)
svViews?.addEventListener('click',async()=>{
  const u=currentStatusList[currentStatusUserIdx], s=u?.statuses[currentStatusItemIdx];
  if (!u?.is_mine||!s) return;
  try {
    const viewers=await api('GET',`/api/status/${s.id}/viewers`);
    statusViewersList.innerHTML='';
    viewers.forEach(v=>{
      const row=document.createElement('div'); row.className='sv-viewer-row';
      row.innerHTML=`<div class="sv-viewer-av" style="background:${v.avatar_color||getAvatarColor(v.username)}">${getInitial(v.username)}${v.profile_pic?`<img src="${v.profile_pic}">`:''}</div><div><div class="sv-viewer-name">${v.username}</div><div class="sv-viewer-time">${isoToTime(v.viewed_at)}</div></div>${v.reaction?`<div class="sv-viewer-reaction">${v.reaction}</div>`:''}`;
      statusViewersList.appendChild(row);
    });
    statusViewersModal.style.display='flex';
  } catch {}
});
closeViewersModal?.addEventListener('click',()=>{statusViewersModal.style.display='none';});
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp  —  main.js   PART 4 / 4
//  Calls · WebRTC · Media · Toast · Utils
// ════════════════════════════════════════════════════════════════════════════

/* ════════════════════════════════════════════════════════════════════════════
   MEDIA (camera / mic)
════════════════════════════════════════════════════════════════════════════ */
async function startMedia(video=false) {
  if (localStream) return;
  try { localStream=await navigator.mediaDevices.getUserMedia({audio:true,video}); }
  catch { try { localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:false}); } catch {} }
  if (localVideo&&localStream) localVideo.srcObject=localStream;
}

// Camera flip (front ↔ back)
camFlipBtn?.addEventListener('click', async()=>{
  currentFacingMode=currentFacingMode==='user'?'environment':'user';
  if (!localStream) return;
  localStream.getVideoTracks().forEach(t=>t.stop());
  try {
    const ns=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:currentFacingMode}});
    const nvt=ns.getVideoTracks()[0];
    localStream.getVideoTracks().forEach(t=>localStream.removeTrack(t));
    localStream.addTrack(nvt);
    if (localVideo) localVideo.srcObject=localStream;
    for (const pc of Object.values(peerConnections)) {
      const sender=pc.getSenders().find(s=>s.track?.kind==='video'); if(sender) sender.replaceTrack(nvt);
    }
  } catch { showToast('Cannot flip camera'); }
});

/* ════════════════════════════════════════════════════════════════════════════
   CALL FLOW
════════════════════════════════════════════════════════════════════════════ */
headerAudioCallBtn?.addEventListener('click',      ()=>initiateCall('audio',false));
headerVideoCallBtn?.addEventListener('click',      ()=>initiateCall('video',false));
headerGroupAudioCallBtn?.addEventListener('click', ()=>initiateCall('audio',true));
headerGroupVideoCallBtn?.addEventListener('click', ()=>initiateCall('video',true));
addToCallBtn?.addEventListener('click', openAddToCallModal);

async function initiateCall(callType, isGroup) {
  if (!activeChat) return;
  currentCallType=callType; currentCallRoomId=genId(); isGroupCall=isGroup; currentGroupCallId=isGroup?activeChat.id:null;
  await startMedia(callType==='video');
  showOutgoingRing(activeChat.name, callType);
  socket.emit('call-invite',{to:!isGroup?activeChat.id:undefined,callType,isGroup,groupId:isGroup?activeChat.id:undefined,roomId:currentCallRoomId});
}

function showOutgoingRing(name, type) {
  outgoingCallerName.textContent=name;
  const u=allUsersMap[name]||contacts[name]; setAvatarEl(outgoingAvatarEl,u||{username:name});
  outgoingCallTypeLabel.textContent=(type==='video'?'Video':'Voice')+' calling...';
  outgoingCallScreen.style.display='flex'; playRingtone(true);
}
function hideOutgoingRing() { outgoingCallScreen.style.display='none'; playRingtone(false); }

cancelOutgoingBtn?.addEventListener('click',()=>{
  socket.emit('call-rejected',{to:outgoingCallerName.textContent}); hideOutgoingRing(); cleanupCall();
});

// Accept incoming
acceptCallBtn?.addEventListener('click',      ()=>acceptIncomingCall('audio'));
acceptVideoCallBtn?.addEventListener('click', ()=>acceptIncomingCall('video'));

async function acceptIncomingCall(type) {
  if (!pendingIncomingCaller) return;
  currentCallType=pendingIncomingCallType||type;
  const from=pendingIncomingCaller;
  playRingtone(false); incomingCallScreen.style.display='none';
  await startMedia(currentCallType==='video');
  socket.emit('call-accepted',{to:from,callType:currentCallType,roomId:pendingIncomingRoomId});
  await showActiveCallScreen(from,currentCallType);
  if (pendingOffers[from]) { processOffer(from,pendingOffers[from]); delete pendingOffers[from]; }
  pendingIncomingCaller=null; pendingIncomingRoomId=null;
}

rejectCallBtn?.addEventListener('click',()=>{
  if (!pendingIncomingCaller) return;
  socket.emit('call-rejected',{to:pendingIncomingCaller,roomId:pendingIncomingRoomId});
  delete pendingOffers[pendingIncomingCaller]; pendingIncomingCaller=null;
  incomingCallScreen.style.display='none'; playRingtone(false);
});

// Incoming-on-call banner
iocDecline?.addEventListener('click',()=>{
  socket.emit('call-rejected',{to:pendingIncomingCaller,roomId:pendingIncomingRoomId});
  delete pendingOffers[pendingIncomingCaller]; pendingIncomingCaller=null;
  incomingOnCallBanner.style.display='none'; playRingtone(false);
});
iocHoldAccept?.addEventListener('click', async()=>{
  localStream?.getTracks().forEach(t=>t.enabled=false);
  incomingOnCallBanner.style.display='none';
  activeCallScreen.style.display='none'; clearInterval(callTimer); callDuration.textContent='00:00'; currentCallPeers=[];
  await acceptBannerCall();
});
iocCutAccept?.addEventListener('click', async()=>{
  endAllCalls(); incomingOnCallBanner.style.display='none'; await sleep(300); await acceptBannerCall();
});

async function acceptBannerCall() {
  if (!pendingIncomingCaller) return;
  currentCallType=pendingIncomingCallType; const from=pendingIncomingCaller; playRingtone(false);
  if (!localStream) await startMedia(currentCallType==='video');
  else localStream.getTracks().forEach(t=>t.enabled=true);
  socket.emit('call-accepted',{to:from,callType:currentCallType,roomId:pendingIncomingRoomId});
  await showActiveCallScreen(from,currentCallType);
  if (pendingOffers[from]) { processOffer(from,pendingOffers[from]); delete pendingOffers[from]; }
  pendingIncomingCaller=null; pendingIncomingRoomId=null;
}

// Group call auto-join
async function handleGroupCallInvite(from,callType,groupId,roomId) {
  currentCallType=callType; currentCallRoomId=roomId; isGroupCall=true; currentGroupCallId=groupId;
  await startMedia(callType==='video');
  socket.emit('call-accepted',{to:from,callType,roomId});
  await showActiveCallScreen(from,callType);
}

async function showActiveCallScreen(peerName, callType) {
  currentCallPeers.push(peerName);
  activeCallScreen.style.display='flex';
  const u=allUsersMap[peerName]||contacts[peerName];
  setAvatarEl(audioCallAvatar,u||{username:peerName});
  audioCallName.textContent=peerName;
  setAvatarEl(miniPipAvatar,u||{username:peerName}); miniPipName.textContent=peerName;

  if (callType==='video') {
    callVideoArea.style.display='block'; audioCallDisplay.style.display='none'; aCallVideoBtn.style.display='flex';
  } else {
    callVideoArea.style.display='none'; audioCallDisplay.style.display='flex'; aCallVideoBtn.style.display='none';
  }
  aCallAddBtn.style.display='flex'; addToCallBtn.style.display='flex';
  startCallTimer();
}

activeEndCallBtn?.addEventListener('click', endAllCalls);
miniPipEnd?.addEventListener('click', endAllCalls);

function endAllCalls() {
  const dur=callSeconds;
  currentCallPeers.forEach(u=>socket.emit('call-ended',{to:u,isGroup:isGroupCall,groupId:currentGroupCallId,roomId:currentCallRoomId,durationSeconds:dur}));
  Object.keys(peerConnections).forEach(cleanupPeer);
  cleanupCall();
  setTimeout(loadCallHistory,600);
}

function cleanupCall() {
  activeCallScreen.style.display='none'; miniCallPip.style.display='none'; isCallMinimized=false;
  callVideoArea.style.display='none'; audioCallDisplay.style.display='flex';
  clearInterval(callTimer); callDuration.textContent='00:00';
  currentCallPeers=[]; isMuted=isVideoOff=false;
  aCallMuteBtn.classList.remove('active'); aCallVideoBtn.classList.remove('active');
  aCallAddBtn.style.display='none'; addToCallBtn.style.display='none';
  isGroupCall=false; currentGroupCallId=null; currentCallRoomId=null;
  if (localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}
  remoteVideosGrid.innerHTML='';
}

// Minimize
aCallMinimizeBtn?.addEventListener('click',()=>{
  activeCallScreen.style.display='none';
  const fv=remoteVideosGrid.querySelector('video');
  if (fv){miniRemoteVideo.srcObject=fv.srcObject;miniPipAvatar.style.display='none';}
  else miniPipAvatar.style.display='flex';
  miniCallPip.style.display='flex'; isCallMinimized=true;
});
miniPipExpand?.addEventListener('click',()=>{miniCallPip.style.display='none';activeCallScreen.style.display='flex';isCallMinimized=false;});
miniCallPip?.addEventListener('click',e=>{if(e.target===miniCallPip||e.target.closest('.mini-pip-info')){miniPipExpand.click();}});

function startCallTimer() {
  callSeconds=0; clearInterval(callTimer);
  callTimer=setInterval(()=>{
    callSeconds++;
    const m=String(Math.floor(callSeconds/60)).padStart(2,'0'), s=String(callSeconds%60).padStart(2,'0');
    const str=`${m}:${s}`; callDuration.textContent=str; miniPipDur.textContent=str;
  },1000);
}

aCallMuteBtn?.addEventListener('click',()=>{
  isMuted=!isMuted; localStream?.getAudioTracks().forEach(t=>t.enabled=!isMuted);
  aCallMuteBtn.classList.toggle('active',isMuted);
  currentCallPeers.forEach(u=>socket.emit('toggle-media',{to:u,kind:'audio',enabled:!isMuted}));
});
aCallVideoBtn?.addEventListener('click',()=>{
  isVideoOff=!isVideoOff; localStream?.getVideoTracks().forEach(t=>t.enabled=!isVideoOff);
  aCallVideoBtn.classList.toggle('active',isVideoOff);
  currentCallPeers.forEach(u=>socket.emit('toggle-media',{to:u,kind:'video',enabled:!isVideoOff}));
});
aCallAddBtn?.addEventListener('click', openAddToCallModal);

function openAddToCallModal() {
  addToCallList.innerHTML='';
  for (const uname in contacts) {
    if (uname===myUser?.username||currentCallPeers.includes(uname)) continue;
    const u=contacts[uname]; if(!u?.is_online) continue;
    const item=document.createElement('div'); item.className='modal-user-item';
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
function createPeerConnection(remoteUser) {
  if (peerConnections[remoteUser]) return peerConnections[remoteUser];
  const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun2.l.google.com:19302'}]});
  if (localStream) localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
  pc.ontrack=e=>{
    if(e.streams&&e.streams[0]){
      addRemoteVideo(remoteUser,e.streams[0]);
      if(isCallMinimized){miniRemoteVideo.srcObject=e.streams[0];miniPipAvatar.style.display='none';}
    }
  };
  pc.onicecandidate=e=>{if(e.candidate) socket.emit('icecandidate',{to:remoteUser,candidate:e.candidate});};
  pc.onconnectionstatechange=()=>{if(['disconnected','failed','closed'].includes(pc.connectionState)) cleanupPeer(remoteUser);};
  peerConnections[remoteUser]=pc; iceCandidateQueue[remoteUser]=[];
  return pc;
}

async function flushIce(user) {
  const pc=peerConnections[user]; if(!pc?.remoteDescription?.type) return;
  const q=iceCandidateQueue[user]||[];
  while(q.length){try{await pc.addIceCandidate(new RTCIceCandidate(q.shift()));}catch{}}
}

async function sendOfferTo(user) {
  const pc=createPeerConnection(user); if(pc.signalingState!=='stable') return;
  const offer=await pc.createOffer({offerToReceiveAudio:true,offerToReceiveVideo:currentCallType==='video'});
  await pc.setLocalDescription(offer); socket.emit('offer',{to:user,offer:pc.localDescription});
}

async function processOffer(from,offer) {
  let pc=peerConnections[from]; if(pc&&pc.signalingState!=='stable'){pc.close();delete peerConnections[from];}
  pc=createPeerConnection(from);
  await pc.setRemoteDescription(new RTCSessionDescription(offer)); await flushIce(from);
  const answer=await pc.createAnswer(); await pc.setLocalDescription(answer);
  socket.emit('answer',{to:from,answer:pc.localDescription});
}

function addRemoteVideo(username,stream) {
  let wrapper=$(`remote-${username}`);
  if (!wrapper) {
    wrapper=document.createElement('div'); wrapper.className='remote-video-wrapper'; wrapper.id=`remote-${username}`;
    const video=document.createElement('video'); video.autoplay=true; video.playsInline=true; video.className='remote-video-el'; video.srcObject=stream;
    const label=document.createElement('div'); label.className='video-label'; label.textContent=username;
    const muteInd=document.createElement('div'); muteInd.className='mute-indicator'; muteInd.id=`mute-ind-${username}`; muteInd.style.display='none';
    muteInd.innerHTML=`<svg viewBox="0 0 24 24" width="13" height="13"><path d="M3.27 2L2 3.27l18.73 18.73 1.41-1.41L3.27 2z" fill="currentColor"/></svg>`;
    wrapper.append(video,label,muteInd); remoteVideosGrid.appendChild(wrapper);
  } else { wrapper.querySelector('video').srcObject=stream; }
  updateRemoteGrid();
}

function updateRemoteGrid() {
  const n=remoteVideosGrid.children.length;
  remoteVideosGrid.className='remote-videos-grid';
  if(n===1) remoteVideosGrid.classList.add('one');
  else if(n===2) remoteVideosGrid.classList.add('two');
  else if(n<=4) remoteVideosGrid.classList.add('four');
  else remoteVideosGrid.classList.add('many');
}

function cleanupPeer(username) {
  if(peerConnections[username]){peerConnections[username].close();delete peerConnections[username];}
  delete iceCandidateQueue[username]; delete pendingOffers[username];
  $(`remote-${username}`)?.remove(); updateRemoteGrid();
}

/* ────── Ringtone ─────────────────────────────────────────── */
let ringInterval=null, audioCtx=null;
function playRingtone(start) {
  clearInterval(ringInterval); ringInterval=null; if(!start) return;
  function beep() {
    try {
      if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value=440; o.type='sine';
      g.gain.setValueAtTime(0.22,audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.7);
      o.start(); o.stop(audioCtx.currentTime+0.7);
    } catch {}
  }
  beep(); ringInterval=setInterval(beep,1600);
}

/* ────── Toast ──────────────────────────────────────────────── */
function showToast(msg) {
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add('show'),10);
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300);},3000);
}

/* ── Google Maps ready callback ─────────────────────────────── */
window.initGoogleMaps=function() {
  window.googleMapsReady=true; window.dispatchEvent(new Event('google-maps-ready'));
};

/* ── Modal close on overlay click ─────────────────────────── */
[newGroupModal, addToCallModal, newChatModal, liveLocationModal, createStatusModal, statusViewersModal].forEach(modal=>{
  modal?.addEventListener('click',e=>{if(e.target===modal) modal.style.display='none';});
});

/* ── Export endpoint token fix (open via fetch) ─────────────── */
// Already handled in Part 2 pipExportBtn listener with capture:true