const $=id=>document.getElementById(id);let seconds=0,timer=null,code='';
function tick(){if(seconds<=0){clearInterval(timer);$('result').classList.add('hidden');$('status').textContent='Mã đã hết hạn. Nhấn Get 2FA để lấy mã mới.';code='';return;}$('countdown').textContent=`Còn ${seconds--} giây`;}
$('getForm').addEventListener('submit',async e=>{e.preventDefault();clearInterval(timer);$('result').classList.add('hidden');$('status').textContent='';$('submit').disabled=true;
  try{const r=await fetch('/api/code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access:$('access').value.trim()}),cache:'no-store'});
    const d=await r.json();if(!r.ok)throw Error(d.error||'Không thể lấy mã');if(!/^\d{6}$/.test(d.code))throw Error('Phản hồi không hợp lệ');code=d.code;seconds=Number(d.validFor)||0;$('code').textContent=code;$('result').classList.remove('hidden');tick();timer=setInterval(tick,1000);
  }catch(e){$('status').textContent=e.message||'Có lỗi xảy ra';}finally{$('submit').disabled=false;}
});
$('copy').addEventListener('click',async()=>{if(!code)return;try{await navigator.clipboard.writeText(code);$('copy').textContent='Đã sao chép';setTimeout(()=>$('copy').textContent='Sao chép mã',1300)}catch{$('status').textContent='Trình duyệt không cho phép sao chép tự động.'}});
