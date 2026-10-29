/* Optional Pre-HSK immersion prologue — not an official HSK grade. Content kept separate for editorial review. */
var HSKIntroContent=(function(){"use strict";
var stages=[
 {id:"prologue",label:"Lần đầu nhìn chữ",hanzi:"字",pinyin:"zì",scene:"Đêm trước buổi học đầu tiên",narrative:"An mở quyển sổ mẹ tặng. Ngoài cửa sổ, chú sẻ xanh nghiêng đầu: “Chữ này cũng làm cậu bối rối à?” An giật mình — lần đầu nghe chim nói. Chỉ mình An nghe thấy thôi.",tip:"Không cần biết nói tiếng Trung. Hãy nhìn mặt chữ, chạm để khám phá rồi nghe nếu muốn.",kind:"discover"},
 {id:"strokes",label:"Ba nét, ba con số",hanzi:"一 二 三",pinyin:"yī · èr · sān",scene:"Một góc trang sổ",narrative:"Mẹ lấy bút vẽ một nét ngang. Thêm một nét, rồi thêm một nét nữa. An bật cười: “Ủa, hóa ra ba chữ đầu tiên đơn giản vậy sao?”",tip:"Nhìn ba chữ 一, 二, 三. Nhấn từng nút để xem cách các nét ngang xuất hiện từ trên xuống.",kind:"strokes"},
 {id:"forest",label:"Một cây thành một khu rừng",hanzi:"木 林 森",pinyin:"mù · lín · sēn",scene:"Nhìn ra những hàng cây",narrative:"Qua cửa sổ là một thân cây, rồi nhiều cây nối nhau. An lấy một chữ 木 và thử đặt cạnh những chữ giống hệt. Cả khu rừng nhỏ xuất hiện ngay trên trang giấy.",tip:"Chạm số lượng cây. Một cây 木, hai cây 林, ba cây 森. Đây là ví dụ dễ nhớ về cách một số chữ kết hợp ý nghĩa.",kind:"forest"},
 {id:"people",label:"Một người, một nhóm bạn",hanzi:"人 从 众",pinyin:"rén · cóng · zhòng",scene:"Tưởng tượng về sân trường ngày mai",narrative:"An tưởng tượng một người đang đi. Một người khác đi theo. Rồi sân trường đông dần lên. Thì ra một nét có thể dẫn đến cả câu chuyện về con người.",tip:"Chạm 1, 2 hoặc 3 người. 从 thường mang nghĩa theo; 众 nghĩa là đông người (dạng giản thể; phồn thể: 眾).",kind:"people"},
 {id:"light",label:"Mặt trời gặp mặt trăng",hanzi:"日 月 明",pinyin:"rì · yuè · míng",scene:"Bên cửa sổ lúc hoàng hôn",narrative:"Trên trang sổ, mẹ viết 日 rồi 月. An ghép hai hình lại, thấy một chữ mới như sáng lên. Mẹ nói: “Mẹo nhớ này khá đẹp, nhưng nguồn gốc chữ Hán đôi khi có nhiều lối giải thích lịch sử hơn con tưởng.”",tip:"日 là mặt trời, 月 là mặt trăng, 明 là sáng. Cách ghép này hữu ích để nhớ dạng chữ hiện đại; đừng xem mọi câu chuyện hình ảnh là nguồn gốc lịch sử duy nhất.",kind:"light"},
 {id:"mother",label:"Chữ mẹ có bí mật âm thanh",hanzi:"女 马 妈",pinyin:"nǚ · mǎ · mā",scene:"Mẹ và quyển sổ",narrative:"An hỏi: “Sao chữ chỉ mẹ lại có hình giống chữ ngựa?” Mẹ bật cười: “Vì không phải mảnh nào trong một chữ cũng kể ý nghĩa. Có mảnh giúp đoán âm đọc nữa!”",tip:"妈 (mā) gồm 女 (gợi ý nghĩa liên quan đến người nữ) và 马 (mǎ, gợi âm ma). Hai âm có thanh điệu khác nhau. Không phải cứ cộng nghĩa các mảnh là đoán đúng một chữ.",kind:"mother"},
 {id:"legend",label:"Một chữ trong tên An",hanzi:"安",pinyin:"Ān",scene:"Mẹ chỉ vào tên An trong quyển sổ",narrative:"Mẹ viết 安 bên cạnh tên An trong quyển sổ. “Đây là chữ mẹ dùng để viết tên con,” mẹ nói. An nhận ra mình đã nhìn thấy chữ ấy trên trang giấy suốt buổi tối, giờ lại gặp nó ở cổng trường. Một chữ quen có thể nối quyển sổ với câu chuyện ngày mai.",tip:"安 (Ān) là chữ trong tên An; chữ này thường mang nghĩa yên, bình an. Hãy nhận mặt chữ trong tên, không cần học thêm quy tắc nào để tiếp tục.",kind:"legend"},
 {id:"guess",label:"Thử đoán bằng mắt",hanzi:"林",pinyin:"lín",scene:"Trang cuối của buổi tối",narrative:"Mẹ đóng quyển sổ, rồi lại mở ra. An chưa biết nói nhiều câu tiếng Trung, nhưng những hình vuông trên giấy không còn vô nghĩa. “Đố con: mình nhận ra được bao nhiêu chữ rồi?”",tip:"Chọn nghĩa bạn đoán được. Sai cũng không sao: đây là trò quan sát, không phải bài kiểm tra HSK.",kind:"guess"},
 {id:"ending",label:"Ngày mai gặp nhé",hanzi:"明天见！",pinyin:"Míngtiān jiàn!",scene:"Đặt sổ vào cặp",narrative:"An gấp quyển sổ lại và đặt vào cặp. Sáng mai là ngày đầu đi học. An chưa biết nói chuyện thật giỏi, nhưng đã quen mặt vài chữ. Có lẽ như vậy đã là một khởi đầu đẹp rồi.",tip:"Bạn đã đi qua tập nhập môn. Khi sẵn sàng, hãy bước sang HSK 1 để thực sự dùng tiếng Trung nói chuyện với các nhân vật.",kind:"ending"}
];
var discovery=[
{zi:"人",py:"rén",meaning:"người",note:"Hãy tưởng tượng dáng một người đang đứng."},
{zi:"木",py:"mù",meaning:"cây, gỗ",note:"Một thân cây với cành và rễ trong mẹo hình dung."},
{zi:"日",py:"rì",meaning:"mặt trời, ngày",note:"Mặt trời được viết thành hình ô vuông trong chữ hiện đại."},
{zi:"月",py:"yuè",meaning:"mặt trăng, tháng",note:"Mặt trăng là một hình ảnh quen thuộc trong chữ Hán."}
];
var quizzes=[
{id:"forest",zi:"林",py:"lín",question:"Nhìn 林 — bạn đoán chữ này là gì?",options:["Mặt trời","Rừng cây / lùm cây","Người"],answer:1,explain:"林 (lín) gồm hai 木: gợi những cây đứng cạnh nhau."},
{id:"crowd",zi:"众",py:"zhòng",question:"Nhìn 众 — chữ này gợi điều gì?",options:["Đông người","Một cái cây","Mặt trăng"],answer:0,explain:"众 (zhòng) là cách viết giản thể của 眾, mang nghĩa số đông."},
{id:"mother",zi:"妈",py:"mā",question:"Trong 妈, phần 马 giúp gợi điều gì?",options:["Con vật là mẹ","Âm đọc ma","Số ba"],answer:1,explain:"妈 (mā) là chữ hình thanh: 女 gợi nghĩa, 马 gợi âm."},
{id:"bright",zi:"明",py:"míng",question:"日 + 月 = 明. Nghĩa phổ biến của 明?",options:["Sáng, rõ","Một cái chợ","Một người"],answer:0,explain:"明 (míng) thường có nghĩa sáng hoặc rõ ràng."}
];
var curiosity={
 title:"Mẹo chữ và câu đùa",
 lead:"Mẹ rủ An tra từ điển: câu đùa về ghép chữ có đúng nghĩa thật không?",
 examples:[
  {zi:"女",py:"nǚ",vi:"người nữ, phụ nữ",note:"Bộ phận gợi nghĩa trong 妈."},
  {zi:"奻",py:"nuán",vi:"chữ cổ, hiếm: tranh cãi",note:"奻 là chữ cổ, hiếm, nghĩa là tranh cãi."},
  {zi:"姦",py:"jiān",vi:"nghĩa cổ tiêu cực",note:"Nghĩa cổ mang định kiến; không dùng để nói về phụ nữ hôm nay."}
 ],
 closing:"Ghép chữ không phải lúc nào cũng thành nghĩa thật: có chữ gợi nghĩa, có chữ gợi âm."
};
var sources=[
{title:"Open University — cấu tạo 木/林/森, 人/从/众",url:"https://stadium.open.ac.uk/berrill/documents/20220717_2022_06_01_Yan_Tong_edited_transcript_5_.pdf"},
{title:"Nguồn ngôn ngữ học — chữ hình thanh 女 + 马 → 妈",url:"https://library.oapen.org/bitstream/handle/20.500.12657/93394/external_content.pdf?isAllowed=y&sequence=1"},
{title:"Academia Sinica — lịch sử chữ 姦",url:"https://chardb.iis.sinica.edu.tw/evolution.jsp?cid=9711"},
{title:"汉典 — 奻, nghĩa cổ tranh cãi (訟也)",url:"https://zdic.net/hans/%E5%A5%BB"},
{title:"Bộ Giáo dục Đài Loan — nghĩa của 姦 trong từ điển",url:"https://dict.concised.moe.edu.tw/dictView.jsp?ID=22771&la=0&powerMode=0"},
{title:"Chinese Text Project — 媽 và chữ giản thể 妈",url:"https://ctext.org/dictionary.pl?char=%E5%AA%BD&if=en"}
];
function validate(){
 var err=[],knownKinds=new Set(["discover","strokes","forest","people","light","mother","legend","guess","ending"]),seen=new Set();
 stages.forEach(s=>{if(!s.id||seen.has(s.id)||!knownKinds.has(s.kind))err.push("stage "+s.id);seen.add(s.id);for(const key of ["label","hanzi","pinyin","scene","narrative","tip"])if(!s[key])err.push("missing "+s.id+" "+key)});
 quizzes.forEach(q=>{if(!q.zi||!q.py||!q.options[q.answer]||q.options.length!==3)err.push("Invalid quiz "+q.id)});
 if(stages.length!==9||discovery.length!==4||quizzes.length!==4)err.push("Content count mismatch");
 if(!curiosity.examples||curiosity.examples.length!==3||!curiosity.title)err.push("Missing optional lore data");
 return err;
}
var api={version:"intro-v1",stages:stages,discovery:discovery,quizzes:quizzes,curiosity:curiosity,sources:sources,validate:validate};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
