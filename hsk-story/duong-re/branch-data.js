/* A self-contained non-canonical narrative experiment. Main's HSK progress is never touched. */
(function(root,factory){"use strict";var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.AnBranchStory=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
function C(id,zh,py,vi,to,traits,relationships,memory,reply,aliases){return {id:id,zh:zh,py:py,vi:vi,to:to,traits:traits||{},relationships:relationships||{},memory:memory,reply:reply,aliases:aliases||[]};}
function N(id,place,title,speaker,story,options,echoes){return {id:id,kind:"choice",place:place,title:title,speaker:speaker,story:story,options:options,echoes:echoes||[]};}
function P(id,place,title,speaker,story,to,echoes){return {id:id,kind:"passage",place:place,title:title,speaker:speaker,story:story,to:to,echoes:echoes||[]};}
var scenes=[
N("arrival","station","Ngày đầu tiên, trời vừa tạnh","Mẹ","Từ cửa kính xe, những dòng chữ Hán chảy qua như con suối mà An chưa hiểu được. Thành Đô còn ẩm mùi mưa. Trong túi áo An, quyển sổ nhỏ mẹ mua trước chuyến bay vẫn còn trắng. Mẹ không bảo An phải giỏi ngay. Mẹ chỉ hỏi: “Con muốn bắt đầu bằng điều gì?”",[
C("look-around","我想看看。","Wǒ xiǎng kànkan.","Tự đi xem con phố trước khi hỏi mẹ.","arrival-street",{curiosity:2,courage:1},{mother:0},"An chọn nhìn kỹ Thành Đô trước khi bước đi.","Mẹ thả chậm bước chân: “Được, mẹ đợi con.”",["我想看一看","我想看看这里"]),
C("hold-mother","妈妈，我们一起走。","Māma, wǒmen yìqǐ zǒu.","Nắm tay mẹ và cùng khám phá.","arrival-mother",{empathy:1,courage:1},{mother:2},"An muốn bắt đầu một nơi lạ cùng mẹ.","Mẹ xiết tay An: “Mình đi cùng nhau.”",["妈妈一起走","我们一起走"])
]),
P("arrival-street","street","Chữ đầu tiên trên biển hiệu","An","An đứng trước biển quán nhỏ. Mấy nét chữ đan vào nhau như những mái nhà. An không biết đọc, nhưng đã có một câu hỏi để giữ lại trong sổ: “Ngày mai mình sẽ hiểu được bao nhiêu?”","school-gate"),
P("arrival-mother","street","Khoảng cách của một bàn tay","Mẹ","Mẹ kể về lần đầu đi xa nhà của mình. An nhận ra không phải ai lớn lên cũng tự nhiên biết cách làm người dũng cảm. Quyển sổ trong túi áo bỗng bớt nặng.","school-gate"),
N("school-gate","school","Một chỗ ngồi còn trống","王老师 · Cô Vương","Tiếng chuông đầu tiên vang lên. Cô Vương đón An bằng nụ cười chậm rãi. Trong lớp, Tiểu Vũ đã nhìn sang, nhích chiếc cặp khỏi một ghế trống. An có ba cách bước vào một ngày chưa từng sống.",[
C("ask-friend","我可以坐这里吗？","Wǒ kěyǐ zuò zhèlǐ ma?","Hỏi Tiểu Vũ liệu mình có thể ngồi cạnh không.","school-friend",{courage:2,empathy:1},{xiaoyu:2},"An tự hỏi Tiểu Vũ về chiếc ghế bên cạnh.","Tiểu Vũ dịch sách sang một nửa bàn: “当然可以！”",["我能坐这里吗","我可以坐这儿吗"]),
C("ask-teacher","老师，可以帮帮我吗？","Lǎoshī, kěyǐ bāngbang wǒ ma?","Thành thật nhờ cô Vương dẫn đến chỗ ngồi.","school-teacher",{courage:1,empathy:1},{wang:2},"An tin tưởng nhờ cô Vương giúp tìm chỗ.","Cô gật đầu: “当然。我们慢慢来。”",["老师可以帮我吗","老师帮帮我"]),
C("watch-first","我想先看看。","Wǒ xiǎng xiān kànkan.","Đứng quan sát một lúc rồi tự chọn chỗ.","school-watch",{curiosity:2},{wang:1},"An dành thời gian quan sát lớp học mới.","Cô Vương không giục. Cô chỉ chỉ vào chỗ trống gần cửa sổ.",["我先看看","我想看看"])
]),
P("school-friend","class","Bàn học hai người","小雨 · Tiểu Vũ","Tiểu Vũ vẽ một con chim sẻ vào góc vở, rồi đẩy bút về phía An. An vẽ thêm một chiếc lá. Hai người chưa hiểu hết câu nói của nhau, nhưng đã làm chung được một việc.","lost-diary"),
P("school-teacher","class","Một câu nói đủ nhỏ","王老师 · Cô Vương","Cô Vương viết tên 安 lên tờ giấy nhỏ, đặt ở góc bàn. “Em cứ hỏi khi chưa hiểu”, cô nói. Trong căn phòng ồn ào, có một người lớn biết cách nói đủ nhỏ để An nghe.","lost-diary"),
P("school-watch","class","Góc cửa sổ","An","An chọn chiếc bàn sát cửa. Nhìn cách Tiểu Vũ và các bạn mở vở, An làm theo. Một lúc sau, Tiểu Vũ quay sang mỉm cười. Không ai biết An đã phải cố gắng nhiều đến thế mới mỉm cười lại.","lost-diary"),
N("lost-diary","class","Quyển sổ biến mất","An","Giờ ra chơi, An thò tay vào cặp. Quyển sổ mẹ đưa không còn đó. Giấy nháp nằm xộc xệch, quai cặp hơi mở. An nhớ lời mẹ viết ở trang đầu: “Mỗi ngày, chỉ cần hiểu thêm một người.” Tim An đập nhanh. Nếu quyển sổ mất thật, An chưa biết nói với mẹ thế nào.",[
C("friend-search","小雨，你能帮我吗？","Xiǎoyǔ, nǐ néng bāng wǒ ma?","Rủ Tiểu Vũ cùng tìm quyển sổ.","search-friend",{empathy:2,courage:1},{xiaoyu:2},"An để Tiểu Vũ cùng chia sẻ nỗi lo mất sổ.","Tiểu Vũ cất bức vẽ chim sẻ: “我们一起找！”",["小雨帮帮我","你可以帮我吗"]),
C("teacher-search","老师，我的本子不见了。","Lǎoshī, wǒ de běnzi bú jiàn le.","Báo ngay với cô Vương rằng mình mất sổ.","search-teacher",{courage:2},{wang:2},"An nói thẳng với cô Vương khi mất sổ.","Cô cúi xuống ngang tầm An: “别着急。我们找找。”",["我的本子不见了","老师我的本子不见了"]),
C("solo-search","我想自己找找。","Wǒ xiǎng zìjǐ zhǎozhao.","Tự kiểm tra bàn, cặp và cửa lớp trước.","search-alone",{curiosity:2,courage:1},{xiaoyu:0},"An thử tự tìm bằng những dấu vết nhỏ.","An nghe tiếng giày mình trên hành lang và bắt đầu quan sát.",["我自己找","我想找找"])
],[
{if:"ask-friend",text:"An nhớ Tiểu Vũ từng đẩy sang nửa trang vở để An vẽ cùng. Lúc này, An không chắc có nên nhờ bạn lần nữa."},
{if:"ask-teacher",text:"Mảnh giấy viết tên 安 vẫn ở góc bàn, khiến An nhớ lời cô Vương: cứ hỏi khi chưa hiểu."},
{if:"watch-first",text:"Lần này An cũng muốn quan sát trước, nhưng nỗi sợ mất quyển sổ làm mọi thứ khó bình tĩnh hơn."}
]),
P("search-friend","hallway","Dấu giày bên cửa","小雨 · Tiểu Vũ","Tiểu Vũ hỏi những bạn ngồi cuối lớp. Một người nhớ đã thấy quyển sổ màu kem gần cửa. Tiểu Vũ nắm tay An chạy tới phòng trực, vừa chạy vừa nói chậm từng từ để An hiểu.","staff-office"),
P("search-teacher","hallway","Bước chân cô giáo","王老师 · Cô Vương","Cô Vương gọi lớp trưởng hỏi về vật thất lạc. Cô đi cùng An tới phòng trực, không nói “chuyện nhỏ thôi”, vì cô hiểu quyển sổ ấy không hề nhỏ với An.","staff-office"),
P("search-alone","hallway","Những dấu vết nhỏ","An","An tìm thấy một mẩu giấy màu kem mắc ở chân bàn. Người trực trường vừa nhặt được quyển sổ giống vậy. An đứng trước cửa phòng trực, chần chừ: tìm ra dấu vết là một chuyện, mở lời lại là chuyện khác.","staff-office"),
N("staff-office","office","Tại bàn trực","Cô nhân viên trực","Sau tấm kính là quyển sổ quen thuộc. Cô nhân viên hỏi: “你叫什么名字？” — Cháu tên gì? An có thể trả lời ngắn, giải thích rõ ràng, hoặc thử nói dù rất run. Cả ba cách đều đủ để cô hiểu và trả lại sổ; điều thay đổi là An học được gì về bản thân.",[
C("say-clearly","我叫安。这是我的本子。","Wǒ jiào Ān. Zhè shì wǒ de běnzi.","Bình tĩnh giới thiệu và nói đó là sổ của mình.","canteen",{courage:2,curiosity:1},{wang:1},"An nói rõ tên và nhận lại quyển sổ bằng tiếng Trung.","Cô nhân viên đưa sổ qua cửa kính: “好，拿好。”",["我叫安这是我的本子","这是我的本子我叫安"]),
C("say-simple","我叫安。","Wǒ jiào Ān.","Chỉ nói tên mình, để cô nhìn thẻ tên.","canteen",{courage:1},{mother:1},"An nhận ra một câu ngắn cũng có thể giúp mình được hiểu.","Cô nhân viên đối chiếu tên rồi mỉm cười trao trả quyển sổ.",["我是安","我叫明安"]),
C("ask-again","请再说一遍。","Qǐng zài shuō yí biàn.","Xin cô nhắc lại vì chưa nghe rõ.","canteen",{curiosity:2,courage:1},{wang:1},"An dám nói khi không nghe rõ và xin người khác nhắc lại.","Cô chậm rãi hỏi lại, nhìn thẻ tên của An rồi trả quyển sổ.",["请再说一次","请慢一点"])
],[
{if:"friend-search",text:"Tiểu Vũ đứng ngay ngoài cửa, giơ hai ngón tay làm dấu cổ vũ."},
{if:"teacher-search",text:"Cô Vương đợi ở bên cạnh, nhưng không nói thay An."},
{if:"solo-search",text:"Không có ai đứng cạnh để nhắc lời. An có thể thử theo nhịp của mình."}
]),
N("canteen","canteen","Bữa trưa và bàn tay bận rộn","刘奶奶 · Bà Lưu","Mùi nước dùng nóng kéo An về với bữa trưa. Bà Lưu phải lo một lúc nhiều khách; trên quầy có bát đũa chưa xếp, Tiểu Vũ đang vẫy từ bàn bên cửa sổ. Người chơi quyết định An sẽ dành thời gian cho ai, thay vì chỉ đến để làm một bài gọi món.",[
C("help-liu","奶奶，我来帮您。","Nǎinai, wǒ lái bāng nín.","Giúp bà Lưu xếp bát trước khi ăn.","serve-liu",{empathy:2,courage:1},{liu:3},"An nhận ra bà Lưu cần người giúp hơn là cần một lời cảm ơn.","Bà Lưu cười: “小心，碗有点热！”",["我帮您","奶奶我来帮你"]),
C("sit-friend","小雨，我们一起吃吧。","Xiǎoyǔ, wǒmen yìqǐ chī ba.","Ngồi với Tiểu Vũ, kể chuyện vừa xảy ra.","serve-friend",{empathy:1},{xiaoyu:3},"An chọn chia sẻ buổi trưa cùng Tiểu Vũ.","Tiểu Vũ đẩy ghế ra: “快来！”",["我们一起吃吧","小雨一起吃"]),
C("read-menu","我想看看菜单。","Wǒ xiǎng kànkan càidān.","Đọc thử thực đơn và những chữ chưa biết.","serve-menu",{curiosity:2},{liu:1},"An tò mò tìm hiểu thực đơn của bà Lưu.","Bà Lưu chỉ vào một hàng chữ lớn: “面条。”",["我看看菜单","我想看菜单"])
]),
P("serve-liu","canteen","Cái bát nóng","刘奶奶 · Bà Lưu","An xếp từng đôi đũa, còn bà Lưu chỉ cho An chỗ đặt bát sạch. Không phải tiếng Trung nào An nghe cũng hiểu, nhưng đôi tay đã biết giúp nhau trước.","noodle-order"),
P("serve-friend","canteen","Bàn bên cửa sổ","小雨 · Tiểu Vũ","Tiểu Vũ nghe chuyện quyển sổ mà không ngắt lời. Rồi bạn kể mình cũng từng quên bài tập vào ngày đầu chuyển lớp. An bật cười: có lẽ ai cũng từng cảm thấy lạc lõng.","noodle-order"),
P("serve-menu","canteen","Những chữ trên bảng gỗ","An","An lần theo nét chữ 面. Bên cạnh nó là hình một bát mì. Lần đầu tiên, tiếng Trung trên biển hiệu không còn chỉ là những vệt mực vô nghĩa.","noodle-order"),
N("noodle-order","canteen","Một bát mì, ba cách chọn","刘奶奶 · Bà Lưu","Bà Lưu hỏi An muốn ăn thế nào. Trong sổ, An vừa viết chữ 面条. An có thể chọn món an toàn, thử điều mới, hoặc nghĩ đến người ngồi cạnh. Không có câu trả lời nào là lựa chọn “đúng tính cách”.",[
C("mild","我想要一碗不辣的面。","Wǒ xiǎng yào yì wǎn bú là de miàn.","Gọi mì không cay, nói rõ mình thích gì.","walk-home",{courage:1},{liu:1},"An biết nói rõ sở thích thay vì cố làm vừa lòng mọi người.","Bà Lưu gật đầu: “好，不放辣椒。”",["我要不辣的面","我想吃不辣的面"]),
C("try-hot","我想试一点辣的。","Wǒ xiǎng shì yìdiǎn là de.","Thử một chút vị cay Thành Đô.","walk-home",{curiosity:2,courage:1},{liu:1},"An thử một ít vị cay mới và học cách xin nước khi cần.","Bà Lưu để sẵn nước bên cạnh: “先尝一点。”",["我想试辣的","给我一点辣的"]),
C("share-bowl","我们可以一起吃吗？","Wǒmen kěyǐ yìqǐ chī ma?","Hỏi Tiểu Vũ có muốn cùng nếm thử không.","walk-home",{empathy:2},{xiaoyu:2,liu:1},"An nghĩ đến việc chia sẻ bữa ăn cùng bạn.","Tiểu Vũ gật đầu, bà Lưu lấy thêm một đôi đũa sạch.",["可以一起吃吗","我们一起吃好吗"])
]),
N("walk-home","street","Chiều xuống bên hàng cây","小雨 · Tiểu Vũ","Tan học, bóng cây dài ra trên vỉa hè. An sờ thấy quyển sổ trong túi và nghĩ về những điều khác nhau mình đã làm hôm nay. Tối nay mẹ sẽ hỏi ngày đầu đi học thế nào. An chưa biết mình muốn kể phần nào trước.",[
C("tell-mother","妈妈，今天我有点害怕。","Māma, jīntiān wǒ yǒudiǎn hàipà.","Thừa nhận với mẹ rằng hôm nay có lúc mình sợ.","home-confide",{empathy:1,courage:2},{mother:3},"An chọn nói thật với mẹ về nỗi sợ và quyển sổ.","Mẹ kéo ghế sát lại: “Con không cần phải giấu mẹ.”",["妈妈我有点害怕","今天我害怕"]),
C("keep-secret","妈妈，我今天学会了很多。","Māma, wǒ jīntiān xuéhuì le hěn duō.","Chỉ kể những điều học được, giữ nỗi sợ cho riêng mình.","home-quiet",{curiosity:1},{mother:1},"An kể với mẹ về những điều mới, nhưng giữ lại nỗi sợ trong lòng.","Mẹ nhận ra An ngập ngừng, song không ép con kể.",["我学会了很多","今天我学了很多"]),
C("invite-friend","小雨，明天来我家吗？","Xiǎoyǔ, míngtiān lái wǒ jiā ma?","Mời Tiểu Vũ đến nhà vào hôm sau.","home-invite",{courage:2,empathy:1},{xiaoyu:3,mother:1},"An muốn nối hai thế giới của mình bằng cách mời Tiểu Vũ đến nhà.","Tiểu Vũ vui vẻ hỏi mẹ An có đồng ý không; An hứa sẽ hỏi mẹ.",["明天来我家吗","你明天来我家吗"])
],[
{if:"mild",text:"Vị nước dùng dịu khiến An nghĩ: dám nói mình không thích cay cũng là một điều đáng học."},
{if:"try-hot",text:"Đầu lưỡi còn hơi tê. An nhớ bà Lưu đưa sẵn một cốc nước trước khi mình kịp xin."},
{if:"share-bowl",text:"Tiểu Vũ vẫn cười vì hai người đã chia nhau nửa bát mì."},
{if:"friend-search",text:"Tiểu Vũ bước chậm hơn để đợi An, như lúc cả hai cùng tìm quyển sổ."},
{if:"teacher-search",text:"Từ phía cổng, cô Vương vẫy tay. An nhớ đến cảm giác có người lớn đứng bên mà không nói thay."}
]),
P("home-confide","home","Chuyện chưa kể ở trường","Mẹ","An kể từ chiếc ghế trống đến quyển sổ thất lạc. Mẹ không khen An phải luôn mạnh mẽ; mẹ chỉ hỏi: “Lúc ấy con cần điều gì nhất?” An nghĩ rất lâu trước khi trả lời.","night"),
P("home-quiet","home","Một khoảng lặng","Mẹ","An đọc lại các chữ mới trong sổ, còn mẹ gọt một quả lê. Khi mẹ hỏi thêm về buổi học, An chỉ cười. Một số câu chuyện cần thời gian mới thành lời, và mẹ cho con thời gian ấy.","night"),
P("home-invite","home","Ngày mai có thể đông vui hơn","Mẹ","An hỏi mẹ liệu Tiểu Vũ có thể ghé nhà hôm sau không. Mẹ bảo nhà còn hơi bừa, nhưng cùng nhau dọn sẽ kịp. An bỗng thấy hai thế giới của mình có thể gặp nhau ở một chiếc bàn ăn.","night"),
N("night","home","Trang cuối của ngày đầu tiên","An","Trước khi ngủ, An mở quyển sổ dưới ánh đèn vàng. Trên trang giấy, những chữ vừa học nằm cạnh dấu mực vụng về. Người chơi chọn điều An muốn giữ lại cho ngày mai. Điều này sẽ định hình lời kết của tập, không thay đổi quá khứ.",[
C("write-question","明天，我还想知道为什么。","Míngtiān, wǒ hái xiǎng zhīdào wèishénme.","Viết một câu hỏi An muốn khám phá tiếp.","epilogue",{curiosity:2},{wang:1},"An quyết định giữ lại một câu hỏi cho ngày mai.","Quyển sổ có thêm một dấu hỏi nhỏ dưới chữ 安.",["我还想知道为什么","明天我想知道"]),
C("write-people","谢谢你们。","Xièxie nǐmen.","Viết lời cảm ơn những người đã giúp An.","epilogue",{empathy:2},{xiaoyu:1,liu:1,mother:1},"An ghi tên những người làm mình thấy bớt cô đơn.","Bên cạnh lời cảm ơn là nét vẽ một chiếc bàn có nhiều chỗ ngồi.",["谢谢你","谢谢大家"]),
C("write-promise","明天我会再试一次。","Míngtiān wǒ huì zài shì yí cì.","Tự hứa sẽ thử lại điều mình còn ngại.","epilogue",{courage:2},{mother:1},"An hứa với chính mình sẽ thử lại vào ngày mai.","Ở cuối trang, An gạch dưới hai chữ 再试 — thử lần nữa.",["我会再试一次","明天再试一次"])
]),
{id:"epilogue",kind:"ending",place:"home",title:"Một trang sổ, nhiều con đường",speaker:"Minh An",story:"Thành Đô vẫn ở ngoài cửa sổ. Ngày đầu tiên đã kết thúc, nhưng không ai có thể nói chỉ có một An duy nhất bước vào ngôi trường ấy.",options:[]}
];
var byId=Object.create(null);scenes.forEach(function(s){byId[s.id]=s;});
var chapters=[{name:"Đến Thành Đô",id:"arrival"},{name:"Lớp học mới",id:"school-gate"},{name:"Quyển sổ biến mất",id:"lost-diary"},{name:"Bữa trưa",id:"canteen"},{name:"Đường về",id:"walk-home"},{name:"Trang sổ",id:"night"}];
return {version:1,storageKey:"hai-que-huong-branching-novel-v1",start:"arrival",scenes:scenes,byId:byId,chapters:chapters};
});