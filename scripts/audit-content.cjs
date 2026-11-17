const fs=require('node:fs'),assert=require('node:assert/strict');
const db=JSON.parse(fs.readFileSync('dist/curriculum.json')),bundled=require('../dist/curriculum-data.js'),{AUDIO_MAP}=require('../dist/audio-map.js');assert.deepEqual(db,bundled);
const lessons=db.stages.flatMap(s=>s.books.flatMap(b=>b.lessons)).filter(l=>l.items.length);
const result=lessons.map(l=>{assert.ok(l.items.every(i=>i.korean&&i.vi));const tracks=AUDIO_MAP[l.id]?.tracks||[];tracks.forEach(t=>assert.ok(fs.existsSync('dist/'+t.file),t.file));return {lesson:l.id,items:l.items.length,acceptedVariants:l.items.filter(i=>i.acceptedAnswers?.length).length,referencedTracks:tracks.length};});
console.log(JSON.stringify({scope:'Text and file structure only; audio has not been listened to or independently verified',lessons:result,totalItems:result.reduce((n,l)=>n+l.items,0),audioFiles:fs.readdirSync('dist/audio/snu1a').filter(f=>f.endsWith('.mp3')).length},null,2));
