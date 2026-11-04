import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const classes=['knight','outlaw','warlock','tinker'];
for(const klass of classes){
  test(`${klass} class image is a complete embedded RGBA PNG`,()=>{
    const match=app.match(new RegExp(`\\b${klass}: 'data:image/png;base64,([A-Za-z0-9+/=]+)'`));
    assert.ok(match,`Missing embedded ${klass} PNG`);
    const bytes=Buffer.from(match[1],'base64');
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16),320);
    assert.equal(bytes.readUInt32BE(20),320);
    assert.equal(bytes[25],6);
  });
}
test('all three piece usages — setup, HUD, battlefield — rely on shared embedded image paths',()=>{
  assert.match(app,/const paths=\{\.\.\.CLASS_PIECE_URIS,/);
  assert.match(app,/\$\('classPreview'\)\.src=paths\[klass\]\|\|paths\.knight/);
  assert.match(app,/\$\('heroPortrait'\)\.src=paths\[me\.klass\]\|\|paths\.knight/);
  assert.match(app,/images\[kind==='enemy'\?'d8':\(p\.klass\|\|'knight'\)\]/);
  assert.match(app,/pic\.src=paths\[p\.klass\]\|\|paths\.knight/);
  assert.match(html,/id="classPreview"/);
});
