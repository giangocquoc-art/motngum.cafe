const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
test("short empty-review layout keeps the opening line visible and its full instruction in the notebook",()=>{
 const css=fs.readFileSync(path.join(root,"review.css"),"utf8");
 const html=fs.readFileSync(path.join(root,"ren-luyen.html"),"utf8");
 assert.match(css,/@media\(max-height:420px\)\{\s*\.review-screen:has\(\.book\.is-empty\) \.opening>p:not\(\.eyebrow\)\{display:none\}/,
  "the repeated opening explanation is hidden only when a short empty state would cover it");
 assert.match(html,/id="emptyCopy"[^>]*>Hoàn thành một cảnh HSK 1 để mở bài ôn đầu tiên/,
  "the next action remains explicit in the review sheet");
});
