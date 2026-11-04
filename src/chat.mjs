/** DICEBOUND supervised beta chat. No new Cloudflare bindings or third-party services.
 * All commands are authenticated by worker.mjs before calling these functions.
 * Safeguards are limited and MUST NOT be treated as production child moderation.
 */
const MAX_MESSAGES = 35;
const MAX_REPORTS = 30;
const VALID_IDS = ['one','two','three','four'];
const BLOCKED_WORDS = /\b(?:fuck(?:ing|er|ed|s)?|shit(?:ty|s)?|bitch(?:es)?|cunt(?:s)?|nigg(?:er|a|ers|as)|fagg?ot(?:s)?|retard(?:ed|s)?|wank(?:er|ers|ing)?|bastard(?:s)?|dickhead(?:s)?|cock(?:sucker)?|slut(?:s)?|whore(?:s)?)\b/i;
const HATE_THREATS = /\b(?:kill yourself|go die|i(?:'| a)?m going to kill you|i will hurt you)\b/i;
const URL_OR_CONTACT = /(?:https?:\/\/|www\.|\b(?:discord|snapchat|whatsapp|telegram)\b|\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b|\b\+?\d[\d \-()]{7,}\d\b|\b[a-z0-9-]+\.(?:com|net|org|co\.uk|gg|io|dev|app|uk)\b)/i;
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u200b-\u200d\u2060\ufeff]/g;
export function initialChat(){return {messages:[],reports:[],nextId:1,mutes:{},adminMuted:[]}}
export function ensureChat(raw){const v=raw&&typeof raw==='object'?raw:{};return {messages:Array.isArray(v.messages)?v.messages.slice(-MAX_MESSAGES):[],reports:Array.isArray(v.reports)?v.reports.slice(-MAX_REPORTS):[],nextId:Number.isSafeInteger(v.nextId)&&v.nextId>0?v.nextId:1,mutes:v.mutes&&typeof v.mutes==='object'&&!Array.isArray(v.mutes)?v.mutes:{},adminMuted:Array.isArray(v.adminMuted)?v.adminMuted.filter(id=>VALID_IDS.includes(id)):[]}}
export function validateMessage(input){
 if(typeof input!=='string')throw Error('Enter a message first.');
 const msg=input.replace(CONTROL,'').replace(/\s+/g,' ').trim();
 if(!msg)throw Error('Enter a message first.');
 if(msg.length>180)throw Error('Keep messages to 180 characters or fewer.');
 const normalized=msg.normalize('NFKC').replace(/[1!]/g,'i').replace(/[0]/g,'o').replace(/[3]/g,'e').replace(/[@]/g,'a');
 if(BLOCKED_WORDS.test(normalized)||HATE_THREATS.test(normalized))throw Error('This message cannot be sent. Please use friendly language.');
 if(URL_OR_CONTACT.test(msg))throw Error('Links and contact details are not allowed in beta chat.');
 // In case of pasted high-volume spam. More nuanced moderation requires a real moderation service.
 if(/(.)\1{14,}/u.test(msg))throw Error('Please send a normal short message.');
 return msg;
}
export function postChat(chat,{id,name,text,now=Date.now()}){
 if(!VALID_IDS.includes(id))throw Error('Unknown player.');
 if(chat.adminMuted.includes(id))throw Error('Your chat has been muted by the test organiser.');
 const clean=validateMessage(text);
 const prior=chat.messages.filter(m=>m.from===id&&now-m.at<60_000);
 if(prior.length>=12)throw Error('Chat limit reached. Try again in a minute.');
 if(prior.some(m=>now-m.at<1750))throw Error('Wait a moment before sending another message.');
 const message={id:chat.nextId++,from:id,name:String(name||'Player').slice(0,40),text:clean,at:now};
 chat.messages.push(message);chat.messages=chat.messages.slice(-MAX_MESSAGES);
 return message;
}
export function togglePersonalMute(chat,viewer,target){
 if(!VALID_IDS.includes(viewer)||!VALID_IDS.includes(target)||viewer===target)throw Error('Invalid mute target.');
 const choices=new Set(Array.isArray(chat.mutes[viewer])?chat.mutes[viewer]:[]);
 if(choices.has(target))choices.delete(target);else choices.add(target);
 chat.mutes[viewer]=[...choices];
 return choices.has(target);
}
export function reportChat(chat,reporter,messageId,reason,now=Date.now()){
 if(!VALID_IDS.includes(reporter))throw Error('Invalid reporter.');
 if(!['Unkind message','Personal information','Other concern'].includes(reason))throw Error('Choose a report reason.');
 const message=chat.messages.find(m=>m.id===messageId);
 if(!message||message.from===reporter)throw Error('That message cannot be reported.');
 if(chat.reports.some(r=>r.reporter===reporter&&r.messageId===message.id))throw Error('You have already reported this message.');
 const entry={id:now+'-'+message.id,reporter,messageId:message.id,from:message.from,reason,text:message.text,at:now};
 chat.reports.push(entry);chat.reports=chat.reports.slice(-MAX_REPORTS);
 return entry;
}
export function toggleAdminMute(chat,actor,target){
 if(actor!=='one')throw Error('Only the supervising Player 1 account can manage chat.');
 if(!VALID_IDS.includes(target)||target==='one')throw Error('Invalid player.');
 const index=chat.adminMuted.indexOf(target);
 if(index>=0)chat.adminMuted.splice(index,1);else chat.adminMuted.push(target);
 return chat.adminMuted.includes(target);
}
export function chatForViewer(chat,viewer){
 const muted=Array.isArray(chat.mutes[viewer])?chat.mutes[viewer]:[];
 return {type:'chat-state',messages:chat.messages.filter(m=>!muted.includes(m.from)),muted,adminMuted:chat.adminMuted.includes(viewer),playersMuted:viewer==='one'?[...chat.adminMuted]:[],reports:viewer==='one'?chat.reports:[]};
}
