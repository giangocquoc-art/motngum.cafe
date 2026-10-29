/* Original imperfect ink character icons for UI, NOT final reference-sheet sprites.
 * SVG is built only from authored constants, never raw user text. */
(function(root,factory){"use strict";var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.AnBranchPortraits=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
var characters={
 an:{name:"Minh An",outfit:"#D99256",hair:"#303839",skin:"#E8B79A",style:"fringe"},
 mother:{name:"Mẹ",outfit:"#A78C77",hair:"#303D37",skin:"#E9C0A2",style:"bun"},
 xiaoyu:{name:"Tiểu Vũ",outfit:"#A5C4C8",hair:"#313A3E",skin:"#EFC5A5",style:"short"},
 wang:{name:"Cô Vương",outfit:"#93A38B",hair:"#303B3A",skin:"#EAC2A8",style:"bob"},
 liu:{name:"Bà Lưu",outfit:"#688FA0",hair:"#58615D",skin:"#E9BDA0",style:"white-bun"}
};
var moods={
 calm:{label:"Bình tĩnh",eyebrow:"M24 43q5-4 10 0 M53 43q5-3 10 0",mouth:"M37 65q9 5 18 0"},
 happy:{label:"Vui vẻ",eyebrow:"M24 42q5-5 10-1 M53 41q5-5 10 0",mouth:"M35 62q12 13 23 0"},
 shy:{label:"Ngại ngùng",eyebrow:"M24 43q5 0 10 1 M53 43q5 0 10 1",mouth:"M39 65q6 3 12 0"},
 worried:{label:"Lo lắng",eyebrow:"M24 42l10-5 M53 37l10 5",mouth:"M40 68q6-6 12 0"},
 curious:{label:"Hiếu kỳ",eyebrow:"M24 39q5-7 10-2 M53 42q5-3 10-1",mouth:"M43 65q6-4 10 0"},
 excited:{label:"Háo hức",eyebrow:"M24 39q5-6 10-1 M53 38q5-5 10-1",mouth:"M36 62q11 16 21 0"},
 relieved:{label:"Nhẹ nhõm",eyebrow:"M24 42q5-1 10 1 M53 42q5 0 10-1",mouth:"M35 63q11 9 22 0"},
 vulnerable:{label:"Bối rối",eyebrow:"M25 43l9-3 M53 41l9 4",mouth:"M39 68q6 1 12-2"},
 determined:{label:"Quyết tâm",eyebrow:"M24 42l10 1 M53 43l10-2",mouth:"M38 66l16 0"}
};
function actor(speaker){var t=String(speaker||"");if(/小雨|Tiểu Vũ/.test(t))return "xiaoyu";if(/王老师|Vương/.test(t))return "wang";if(/刘奶奶|Bà Lưu/.test(t))return "liu";if(/Mẹ/.test(t))return "mother";return "an";}
function mood(scene,state){
 var id=scene&&scene.id||"",flags=state&&state.flags||{};
 if(/lost-diary/.test(id))return "worried";
 if(/search-alone|staff-office/.test(id))return "vulnerable";
 if(/search-friend|search-teacher|noodle-order|day2-bird-team/.test(id))return "determined";
 if(/canteen|day2-liu|serve-|day2-liu-help/.test(id))return "happy";
 if(/day2-bird|day2-bird-quiet|day2-bird-teacher/.test(id))return "curious";
 if(/day2-confession|home-confide|home-quiet|day2-morning/.test(id))return "vulnerable";
 if(/epilogue|night/.test(id))return flags["tell-mother"]?"relieved":"calm";
 if(/day2-guest|home-invite/.test(id))return "excited";
 if(/school|arrival/.test(id))return "shy";
 return "calm";
}
function portrait(character,moodName){
 var c=characters[character]||characters.an,m=moods[moodName]||moods.calm,stroke="#4A3E35";
 var hair=c.style==="fringe"?"M19 43Q11 9 44 11Q76 6 73 45L69 77Q62 77 63 60L65 33Q56 36 52 30Q40 40 25 37L25 78L18 75Z":
 c.style==="bun"?"M15 43Q15 10 42 10Q73 5 75 42L71 69Q60 64 64 31Q43 24 26 37L22 66Z":
 c.style==="short"?"M16 42Q13 14 39 12Q62 6 74 37L64 33L56 28L47 35L37 30L25 40Z":
 c.style==="bob"?"M16 47Q11 15 43 10Q75 9 75 47L78 83Q61 89 63 70L68 34Q45 29 24 38L24 77Q20 87 15 80Z":
 "M17 47Q13 14 43 13Q75 13 74 46L69 61Q63 62 64 36L25 38L21 63Z";
 var blush=moodName==="shy"||moodName==="happy"||moodName==="excited"?
 "<ellipse cx='24' cy='57' rx='8' ry='4' fill='#D78C81' opacity='.48'/><ellipse cx='65' cy='57' rx='8' ry='4' fill='#D78C81' opacity='.48'/>":"";
 var tear=moodName==="worried"?"<path d='M68 56q6 5 0 10q-5-5 0-10' fill='#A9C8C9' stroke='none'/>":"";
 var outfit=c.style==="white-bun"?"<path d='M19 90q27-12 51 0l10 45H10Z' fill='"+c.outfit+"' stroke='"+stroke+"' stroke-width='2'/><path d='M28 93l5 45h30l4-45' fill='#E9DFCB' stroke='"+stroke+"' stroke-width='1.7'/>":"<path d='M17 93Q44 81 72 93L82 135H9Z' fill='"+c.outfit+"' stroke='"+stroke+"' stroke-width='2'/>";
 var eye=moodName==="excited"?"M28 51q5-6 10 0 M55 51q5-6 10 0":"M31 50q2 3 4 0 M57 50q2 3 4 0";
 return "<svg xmlns='http://www.w3.org/2000/svg' role='img' aria-label='"+c.name+" — "+m.label+"' viewBox='0 0 92 139' width='92' height='139'>"+
 "<path d='M0 136Q5 0 92 10L92 139Z' fill='#F5EBD9'/>"+outfit+
 "<path d='M37 80v12 M56 79v12' stroke='"+c.skin+"' stroke-width='11' stroke-linecap='round'/>"+
 "<ellipse cx='46' cy='49' rx='27' ry='35' fill='"+c.skin+"' stroke='"+stroke+"' stroke-width='2'/>"+
 "<path d='"+hair+"' fill='"+c.hair+"' stroke='"+stroke+"' stroke-width='2.2' stroke-linejoin='round'/>"+(c.style==="bun"||c.style==="white-bun"?"<circle cx='75' cy='22' r='15' fill='"+c.hair+"' stroke='"+stroke+"' stroke-width='2'/>":"")+blush+
 "<path d='"+m.eyebrow+"' fill='none' stroke='"+stroke+"' stroke-width='2.2' stroke-linecap='round'/>"+
 "<path d='"+eye+"' fill='none' stroke='"+stroke+"' stroke-width='2.7' stroke-linecap='round'/>"+
 "<path d='M44 55q-2 4 3 5' fill='none' stroke='#8F6E5C' stroke-width='1.3'/>"+
 "<path d='"+m.mouth+"' fill='none' stroke='"+stroke+"' stroke-width='2.4' stroke-linecap='round'/>"+tear+
 (character==="wang"?"<path d='M24 48q9-6 18 0q8-6 19 0 M22 45q0 17 19 8q6-2 6-10 M47 43q0 18 19 9q3-5 1-9' fill='none' stroke='"+stroke+"' stroke-width='1.3'/>":"")+
 "<path d='M11 129q15 5 19-2 M65 132q10-4 16 2' fill='none' stroke='"+stroke+"' stroke-width='1.2' opacity='.8'/>"+
 "</svg>";
}
var api={characters:characters,moods:moods,actor:actor,mood:mood,portrait:portrait};if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
});