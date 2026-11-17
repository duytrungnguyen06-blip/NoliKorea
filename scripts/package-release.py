"""Create a verified full source ZIP and split delivery assets below static hosting limits."""
from pathlib import Path
import argparse, hashlib, json, zipfile
parser=argparse.ArgumentParser();parser.add_argument('--archive',required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1];dist=root/'dist';archive=Path(args.archive)
files=[]
for folder in ['dist','scripts','tests','data','.github']:
 for p in sorted((root/folder).rglob('*')):
  if p.is_file() and not (folder=='dist' and (p.name.startswith('kla-v4-') and p.suffix=='.bin' or p.name=='download.html')):files.append(p)
files += [root/n for n in ['README.md','content-corrections.json','package.json','package-lock.json','.gitignore']]
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in files:z.write(p,p.relative_to(root))
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert len([n for n in z.namelist() if n.endswith('.mp3')])==89
raw=archive.read_bytes();parts=[]
for i,start in enumerate(range(0,len(raw),16_000_000)):
 name=f'kla-v4-{i+1}.bin';(dist/name).write_bytes(raw[start:start+16_000_000]);parts.append(name)
assert b''.join((dist/n).read_bytes() for n in parts)==raw
sha=hashlib.sha256(raw).hexdigest()
page='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tải NoliKorea V5 đầy đủ</title><style>body{font:16px system-ui;background:#0b1120;color:#f9fafb;max-width:640px;margin:10vh auto;padding:24px;line-height:1.7}h1{font-size:32px}button,a{color:#c4b5fd}button{background:#4f46e5;color:white;border:0;border-radius:12px;padding:16px 24px;font:inherit;cursor:pointer}button:disabled{opacity:.6}small{overflow-wrap:anywhere;color:#b0b8c8}</style><p>NOLIKOREA V5</p><h1>Bản tối ưu, đầy đủ mã nguồn.</h1><p>Phiên học ngắn, điểm lần đầu và luyện lại riêng, tiếp tục bản nháp, bảo vệ tiến độ giữa nhiều tab. Kèm 89 tệp MP3, mã nguồn CSS và bộ kiểm thử.</p><button id="download">Tải bản full ZIP</button><p id="status" role="status"></p><p><a href="./">Mở ứng dụng</a> · <a href="README_V4.md">Hướng dẫn và ghi chú phiên bản</a></p><small>SHA-256: SHA_PLACEHOLDER</small><script>const parts=PARTS_PLACEHOLDER,expected='SHA_PLACEHOLDER';document.getElementById('download').onclick=async function(){this.disabled=true;const status=document.getElementById('status');try{const chunks=[];for(let i=0;i<parts.length;i++){status.textContent=`Đang tải ${i+1}/${parts.length}…`;const res=await fetch(parts[i],{cache:'no-store'});if(!res.ok)throw Error('Tải thất bại');chunks.push(await res.arrayBuffer());}const blob=new Blob(chunks,{type:'application/zip'});const sum=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());const hex=Array.from(new Uint8Array(sum)).map(x=>x.toString(16).padStart(2,'0')).join('');if(hex!==expected)throw Error('Tệp tải chưa đầy đủ');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='NoliKorea_V5_FULL.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Tệp ZIP đã được kiểm tra và tải xuống.';}catch(e){status.textContent='Không tải được tệp hoàn chỉnh. Vui lòng thử lại.';}finally{this.disabled=false;}};</script></html>'''
(dist/'download.html').write_text(page.replace('SHA_PLACEHOLDER',sha).replace('PARTS_PLACEHOLDER',json.dumps(parts)))
print(json.dumps({'zip_bytes':len(raw),'files':len(files),'sha256':sha,'audio_count':89}))
