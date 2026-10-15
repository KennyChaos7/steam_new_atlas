import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {BASE_PATH} from '../lib/deployment.ts';
const root=path.resolve('out');const port=Number(process.env.PORT??3000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
await stat(path.join(root,'index.html')).catch(()=>{throw new Error('Run pnpm build before pnpm start.');});
createServer(async(req,res)=>{try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/'||pathname===BASE_PATH){res.writeHead(302,{Location:BASE_PATH+'/'}).end();return;}
  if(!pathname.startsWith(BASE_PATH+'/')){res.writeHead(404).end('Not found');return;}
  let file=path.resolve(root,'.'+pathname.slice(BASE_PATH.length));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const content=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream'}).end(content);
}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}${BASE_PATH}/`));
