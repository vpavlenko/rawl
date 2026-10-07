// Assemble manually inspected observations, figures and source links; never create gold labels.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname,"../..");
const directory = path.join(ROOT,"public/lakh-version-review");
const reportDirectory = path.join(ROOT,"reports/lakh-version-model/visual-review");
const data = JSON.parse(fs.readFileSync(path.join(directory,"cases.json")));
const notes = JSON.parse(fs.readFileSync(path.join(reportDirectory,"observations.json")));
const byId = new Map(notes.map(n=>[n.id,n]));
const names = {visible:"Видимое отличие",family:"Выбор семейства; точный файл неясен",uncertain:"Причина не установлена","ambiguous-label":"Размечено несколько версий","counterexample":"Контрпример простому критерию",partial:"Одна версия повреждена","byte-copy":"Идентичные MIDI"};
const events = JSON.parse(fs.readFileSync(path.join(reportDirectory,"event-comparisons.json")));
for (const c of data.cases) {
  const review = byId.get(c.id);
  if (!review || JSON.stringify(review.selectedKeys)!==JSON.stringify(c.rows.filter(r=>r.manual).map(r=>r.key))) throw new Error(`Review labels changed: ${c.id}`);
  c.review = review;
  c.confidenceLabel = names[review.confidence];
  c.eventComparisons = events.groups.find(g=>g.id===c.id)?.comparisons || [];
  if (!fs.existsSync(path.join(directory,c.image))) throw new Error(`Missing figure: ${c.id}`);
}
if (byId.size!==data.cases.length) throw new Error("Review scope changed");
fs.writeFileSync(path.join(directory,"review.json"),JSON.stringify(data));
const count = value => data.cases.filter(c=>c.review.confidence===value).length;
const summary = {format:"rawl-version-visual-audit-1",createdAt:new Date().toISOString(),annotationHash:data.annotationHash,cases:data.cases.length,versions:data.cases.reduce((n,c)=>n+c.rows.length,0),unreadable:data.cases.flatMap(c=>c.rows).filter(r=>r.error).map(r=>({key:r.key,error:r.error})),coverage:{overview:true,excerptQuarterBeats:[32,64],allVariants:true,audioListening:false,crossVersionPhraseAlignment:false},confidenceCounts:Object.fromEntries(Object.keys(names).map(k=>[k,count(k)])),nearCopyGroups98:events.groups.filter(g=>g.comparisons.some(r=>r.onsetPitchMatch>=.98)).length,observationsHash:crypto.createHash("sha256").update(fs.readFileSync(path.join(reportDirectory,"observations.json"))).digest("hex"),noteSemantics:data.noteSemantics};
fs.writeFileSync(path.join(reportDirectory,"manifest.json"),JSON.stringify(summary,null,2)+"\n");
const intro = `# Визуальный разбор выбранных Lakh MIDI\n\nПросмотрены ${summary.cases} группы / ${summary.versions} версии: полная форма и увеличенные доли 32–64. Два повреждённых файла не удалось прочитать. Аудио не прослушивалось; отрывки не выровнены по одинаковым фразам. Причины ниже — гипотезы, а не подтверждённые объяснения намерений владельца разметки. Разметка показывает наличие анализа; завершённость просмотра всех альтернатив не подтверждена отдельным флагом.\n\n[Галерея в Chrome](http://localhost:3000/lakh-version-review/index.html) · [Сводные выводы](../../../docs/lakh-version-model.md)\n\nЦвета нот = семейства GM, ударные серые; оранжевая звезда = наличие разметки. Количество каналов включает ударные и порты; смена патча не считается новым каналом. Незакрытые ноты продлены до конца файла для диагностики; FIFO note-off, sustain не применён. Это отличается от некоторых правил рендера/проигрывания Rawl, поэтому длинная линия сама по себе не доказывает слышимый дефект. Нативный метр может быть музыкально неверным.\n\n51 группа имеет альтернативу с ≥98% совпадения onset/pitch после целочисленного сдвига ±8 долей. Это сравнение игнорирует длительности, velocity, тембры, bank/controllers и темп, поэтому не доказывает одинаковое звучание.\n`;
const body = data.cases.map(c=>`\n## ${String(c.number).padStart(3,"0")} — ${c.title}\n\n${c.confidenceLabel}.\n\nРазмечено: ${c.rows.filter(r=>r.manual).map(r=>"`"+r.key+"`").join(", ")}.\n\n${c.review.observation}${c.review.hypothesis?"\n\nГипотеза: "+c.review.hypothesis:""}\n\n[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=${c.number}) · [PNG](../../../public/lakh-version-review/${c.image})\n`).join("");
fs.writeFileSync(path.join(reportDirectory,"review.md"),intro+body);
console.log(JSON.stringify(summary));
