/* Chapter 00 progress on homepage. Read-only; never mutate HSK1 or Intro saves. */
(function(){"use strict";
 var status=document.getElementById("introEntryStatus"),hero=document.getElementById("introHeroButton");
 if(!status||!hero)return;
 try{
  var raw=localStorage.getItem("hai-que-huong-intro-v1");
  if(!raw)return;
  var p=JSON.parse(raw);
  if(!p||typeof p!=="object")return;
  var max=Number.isInteger(p.maxReached)?Math.max(0,Math.min(8,p.maxReached)):0;
  var step=Number.isInteger(p.step)?Math.max(0,Math.min(max,p.step)):0;
  if(p.finished===true&&max===8){status.textContent="Đã đọc hết Nhập môn · Có thể xem lại bất cứ lúc nào · Không ảnh hưởng HSK 1";hero.textContent="Xem lại sổ tay Nhập môn ✳"}
  else if(step>0){status.textContent="Đang đọc: trang "+(step+1)+"/9 · Tiếp tục đúng nơi đã dừng · Tiến độ HSK 1 được giữ nguyên";hero.textContent="Tiếp tục Nhập môn ↗"}
 }catch(e){/* Private browsing or an unavailable store must not break the homepage. */}
})();