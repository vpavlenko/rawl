# Визуальный разбор выбранных Lakh MIDI

Просмотрены 148 группы / 572 версии: полная форма и увеличенные доли 32–64. Два повреждённых файла не удалось прочитать. Аудио не прослушивалось; отрывки не выровнены по одинаковым фразам. Причины ниже — гипотезы, а не подтверждённые объяснения намерений владельца разметки. Разметка показывает наличие анализа; завершённость просмотра всех альтернатив не подтверждена отдельным флагом.

[Галерея в Chrome](http://localhost:3000/lakh-version-review/index.html) · [Сводные выводы](../../../docs/lakh-version-model.md)

Цвета нот = семейства GM, ударные серые; оранжевая звезда = наличие разметки. Количество каналов включает ударные и порты; смена патча не считается новым каналом. Незакрытые ноты продлены до конца файла для диагностики; FIFO note-off, sustain не применён. Это отличается от некоторых правил рендера/проигрывания Rawl, поэтому длинная линия сама по себе не доказывает слышимый дефект. Нативный метр может быть музыкально неверным.

51 группа имеет альтернативу с ≥98% совпадения onset/pitch после целочисленного сдвига ±8 долей. Это сравнение игнорирует длительности, velocity, тембры, bank/controllers и темп, поэтому не доказывает одинаковое звучание.

## 001 — a-ha — Take On Me

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/a-ha/Take On Me.2.mid`.

Выбрана .2: 11 партий, 3105 нот; близкая .3 имеет 10 партий и другой солирующий тембр. .4 содержит длинный пустой хвост. Основная версия заметно плотнее, но мелодия в ней окружена большим числом слоёв.

Гипотеза: Важнее читаемая мелодия, разделение ролей и отсутствие хвоста, чем максимум нот. Точный выбор между .2 и .3 требует прослушивания.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=1) · [PNG](../../../public/lakh-version-review/001.png)

## 002 — ABBA — Fernando

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/ABBA/Fernando.mid`.

Fernando.mid входит в семейство почти одинаковых 10-партийных версий. .6/.10 существенно плотнее и менее привязаны к долям; .2 беднее, .3 короче. Несколько альтернатив визуально очень близки выбранной.

Гипотеза: Полная, сравнительно чистая аранжировка; конкретный файл среди близких копий глазами не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=2) · [PNG](../../../public/lakh-version-review/002.png)

## 003 — ABBA — Honey Honey

Видимое отличие.

Размечено: `c/MIDI/ABBA/Honey Honey.mid`.

Honey Honey.mid длиннее альтернативы (492 против 404 долей), с 9 вместо 11 партий. Различаются мелодический контур, фактура и формальная длина; выбранная версия имеет меньшую долю точно квантованных атак.

Гипотеза: Полнота формы и подходящий вариант аранжировки перевешивают число партий и строгую квантизацию.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=3) · [PNG](../../../public/lakh-version-review/003.png)

## 004 — ABBA — Money, Money, Money

Видимое отличие.

Размечено: `c/MIDI/ABBA/Money, Money, Money.mid`.

Money, Money, Money.mid содержит меньше нот и партий, чем большинство альтернатив. В отрывке виден отдельный верхний контур и более разреженное сопровождение; .6 имеет тянущуюся до конца ноту. Многие остальные версии образуют другое, почти одинаковое семейство.

Гипотеза: Выбор другой аранжировки с более ясными ролями и устойчивой сеткой, а не самой насыщенной версии. Качество GM Music Box/Marimba глазами не установить.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=4) · [PNG](../../../public/lakh-version-review/004.png)

## 005 — ABBA — S.O.S

Причина не установлена.

Размечено: `c/MIDI/ABBA/S.O.S.mid`.

Все три S.O.S. имеют одинаковое число партий, нот, темп и длину. .2 отличается тембрами, .1 и основная версия почти совпадают на обзоре; в увеличении заметны небольшие временные различия.

Гипотеза: Точную причину выбора по этому виду не определяю; нужны сравнение событий и прослушивание близких копий.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=5) · [PNG](../../../public/lakh-version-review/005.png)

## 006 — ABBA — The Winner Takes It All

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/ABBA/The Winner Takes It All.mid`.

The Winner Takes It All.mid близка .2/.3/.6 по нотам и составу. .5 превращает почти всё в Piano и более чем удваивает число нот; .1/.4 — другие, менее плотные варианты.

Гипотеза: Сохранение самостоятельных инструментальных ролей предпочтительнее раздутого all-piano варианта; точный файл внутри семейства не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=6) · [PNG](../../../public/lakh-version-review/006.png)

## 007 — ABBA — Waterloo

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/ABBA/Waterloo.mid`.

Waterloo.mid относится к семейству 8-партийных версий с отчётливыми мелодией, басом и сопровождением. .2/.3 имеют 14 партий и более плотную фактуру. .5/.6 и основная версия чрезвычайно близки.

Гипотеза: Нужны содержательные отдельные роли, а не число каналов. Различие между близкими 8-партийными файлами может быть в тембрах или мелких правках.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=7) · [PNG](../../../public/lakh-version-review/007.png)

## 008 — Al Stewart — The Year of the Cat

Размечено несколько версий.

Размечено: `c/MIDI/Al Stewart/The Year of the Cat.1.mid`, `c/MIDI/Al Stewart/The Year of the Cat.2.mid`, `c/MIDI/Al Stewart/The Year of the Cat.mid`.

Размечены все три Year of the Cat: полная 14-партийная, короткая 3-партийная Clavinet и промежуточная 10-партийная версии. Это разные фактуры и длины.

Гипотеза: Нельзя считать наличие разметки однозначной меткой лучшей версии в этой группе.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=8) · [PNG](../../../public/lakh-version-review/008.png)

## 009 — Alice Cooper — Poison

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Alice Cooper/Poison.2.mid`.

Poison.2 сохраняет многослойную 13-партийную аранжировку вместо 10-партийной основной. .1 выглядит практически одинаково; точный выбор между ними не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=9) · [PNG](../../../public/lakh-version-review/009.png)

## 010 — Ambra — Aspettavo te

Причина не установлена.

Размечено: `c/MIDI/Ambra/Aspettavo te.mid`.

Все три Aspettavo te совпадают по составу, длине и числу нот; видны почти одинаковые контуры. Не вижу основания предпочесть именно основной файл.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=10) · [PNG](../../../public/lakh-version-review/010.png)

## 011 — America — A Horse With No Name

Видимое отличие.

Размечено: `c/MIDI/America/A Horse With No Name.1.mid`.

A Horse With No Name.1 имеет раздельную гитарную фактуру и ровные атаки; основная версия плотнее и заметно менее квантована. При этом выбранная сама имеет длинные завершающие ноты: отсутствие хвостов не абсолютный критерий.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=11) · [PNG](../../../public/lakh-version-review/011.png)

## 012 — Antonello Venditti — Benvenuti in paradiso

Видимое отличие.

Размечено: `c/MIDI/Venditti Antonello/Benvenuti in paradiso.mid`.

Benvenuti in paradiso.mid: 8 партий и 7413 нот вместо 15–16 партий у альтернатив. Мелодическая линия и бас читаются отдельно; родственная .2 беднее по нотам. Гипотеза — выбор компактной, но содержательной аранжировки.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=12) · [PNG](../../../public/lakh-version-review/012.png)

## 013 — Barry White — Can't Get Enough of Your Love, Babe

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/White Barry/Can't Get Enough of Your Love, Babe.mid`.

Выбран Barry White с латунными духовыми, Alto Sax и самостоятельным басом; другая короткая версия теряет часть формы. Более близкая 8-партийная альтернатива тоже полная, поэтому точную причину нужно слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=13) · [PNG](../../../public/lakh-version-review/013.png)

## 014 — Bob Marley — I shot the Sheriff

Видимое отличие.

Размечено: `c/MIDI/Bob Marley/I shot the Sheriff.mid`.

I Shot the Sheriff: выбран 98 BPM / 410 долей против 180 BPM / 832 долей. Альтернатива квантована лучше. Возможный критерий — подходящий музыкальный масштаб такта и другая аранжировка, а не процент точных атак.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=14) · [PNG](../../../public/lakh-version-review/014.png)

## 015 — Bob Marley — Jammin'

Причина не установлена.

Размечено: `c/MIDI/Bob Marley/Jammin'.mid`.

Три Jammin отличаются написанием/источником файла, но совпадают по числу нот, ролям и форме. Основания для строгого отрицательного ярлыка двум альтернативам глазами нет.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=15) · [PNG](../../../public/lakh-version-review/015.png)

## 016 — Bob Marley — Waiting In Vain

Видимое отличие.

Размечено: `c/MIDI/Bob Marley/Waiting In Vain.mid`.

Waiting In Vain: выбранная версия содержит 13 партий и 8368 нот против 10 / 4939. Видно более развитое сопровождение и несколько самостоятельных верхних слоёв; это поддерживает критерий деталей, хотя квантизация хуже.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=16) · [PNG](../../../public/lakh-version-review/016.png)

## 017 — Boyzone — Picture of You

Причина не установлена.

Размечено: `c/MIDI/Boyzone/Picture of You.1.mid`.

Picture of You: все три версии имеют 8 партий / 4315 нот / 388 долей и одинаковую инструментовку. Видимые изменения фаз/длительностей мелкие; точный выбор не определяю.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=17) · [PNG](../../../public/lakh-version-review/017.png)

## 018 — Britney Spears — Oops!... I Did It Again

Одна версия повреждена.

Размечено: `c/MIDI/Britney Spears/Oops!... I Did It Again.mid`.

Oops!...: выбранная версия имеет 20 сменяющихся сочетаний канал/патч, но меньше нот, чем .1. Партии организованы иначе. .2 не читается из-за испорченного portPrefix; её сравнить нельзя.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=18) · [PNG](../../../public/lakh-version-review/018.png)

## 019 — Britney Spears — Where Are You Now

Причина не установлена.

Размечено: `c/MIDI/Britney Spears/Where Are You Now.mid`.

Where Are You Now: обе версии визуально почти совпадают, включая 10 партий, 2799 нот и темп. Выбор точного файла глазами не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=19) · [PNG](../../../public/lakh-version-review/019.png)

## 020 — Carpenters — Jambalaya (On the Bayou)

Размечено несколько версий.

Размечено: `c/MIDI/Carpenters/Jambalaya (On the Bayou).1.mid`, `c/MIDI/Carpenters/Jambalaya (On the Bayou).mid`.

Обе Jambalaya размечены: 8-партийная быстрая и 11-партийная длинная версии с разной фактурой. Однозначного победителя нет.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=20) · [PNG](../../../public/lakh-version-review/020.png)

## 021 — Cascades — Rhythm of the Rain

Видимое отличие.

Размечено: `c/MIDI/Cascades/Rhythm of the Rain.mid`.

Rhythm of the Rain: выбранная полнее по партиям и нотам (7 / 3526 против 5 / 2203), с гитарой, струнами и самостоятельными мелодическими вставками. Возможная причина — полнота аранжировки.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=21) · [PNG](../../../public/lakh-version-review/021.png)

## 022 — Celine Dion — It's All Coming Back to Me

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Celine Dion/It's All Coming Back to Me.mid`.

Celine Dion: выбранная 14-партийная версия почти совпадает с .1. .2 добавляет слои/ноты, сохраняя основной материал. Гипотеза — достаточная детализация без лишнего дублирования; точный файл внутри пары неизвестен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=22) · [PNG](../../../public/lakh-version-review/022.png)

## 023 — Chris Andrews — Pretty Belinda

Размечено несколько версий.

Размечено: `c/MIDI/Chris Andrews/Pretty Belinda.1.mid`, `c/MIDI/Chris Andrews/Pretty Belinda.mid`.

Обе Pretty Belinda размечены, но одна 2/4, другая 4/4, отличаются темп, длина и число партий. Из разметки нельзя получить единственный выбор.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=23) · [PNG](../../../public/lakh-version-review/023.png)

## 024 — Clout — Substitute

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Clout/Substitute.mid`.

Substitute: выбранная версия короче, с другой гитарной фактурой и мелодическим контуром. Не максимум длины/нот. Это выбор аранжировки; её большую верность оригиналу глазами не доказать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=24) · [PNG](../../../public/lakh-version-review/024.png)

## 025 — Creedence Clearwater Revival — Bad Moon Rising

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Creedence Clearwater Revival/Bad Moon Rising.mid`.

Bad Moon Rising.mid близка .3/.4, тогда как .2 содержит ноту до 1365-й доли. Выбранная компактна, роли различимы. Точное отличие от .3 требует слушать тембры и окончания.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=25) · [PNG](../../../public/lakh-version-review/025.png)

## 026 — Crosby Bing — White Christmas

Причина не установлена.

Размечено: `c/MIDI/Crosby Bing/White Christmas.2.mid`.

White Christmas.2 — гораздо более разреженная оркестровая версия при 200 BPM. Основная плотнее и длиннее; .1 близка выбранной по структуре, но с другим темпом/патчами. Не определяю музыкальное преимущество без прослушивания.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=26) · [PNG](../../../public/lakh-version-review/026.png)

## 027 — Cyndi Lauper — Girls Just Wanna Have Fun

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Cyndi Lauper/Girls Just Wanna Have Fun.1.mid`.

Girls Just Wanna Have Fun.1 входит в 9-партийную пару с основной; .2 имеет 27 комбинаций патчей и иную фактуру. Ясные самостоятельные партии могут быть важнее количества патчей. Точный выбор внутри пары неизвестен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=27) · [PNG](../../../public/lakh-version-review/027.png)

## 028 — Dallara — Come prima

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Dallara/Come prima.mid`.

Come prima: выбрана 6/8 версия с раздельными инструментами; .1 — all-piano 4/4 с длинным хвостом. .2 почти совпадает с выбранной. Здесь существенны музыкальный метр и роли.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=28) · [PNG](../../../public/lakh-version-review/028.png)

## 029 — Deniece Williams — Let's Hear It For The Boy

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Williams Deniece/Let's Hear It For The Boy.mid`.

Let’s Hear It for the Boy: выбранная 13-партийная аранжировка богаче 6-партийной, но темп и длина в долях существенно различаются. Поддерживает полноту ролей; правильный tactus без прослушивания не подтверждён.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=29) · [PNG](../../../public/lakh-version-review/029.png)

## 030 — Donovan — Mellow Yellow

Видимое отличие.

Размечено: `c/MIDI/Donovan/Mellow Yellow.1.mid`.

Mellow Yellow.1 короче и разреженнее, с более устойчивыми атаками и отчётливой верхней линией. Это контрпример максимуму нот/длины; возможно, выбрана более читаемая фактура.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=30) · [PNG](../../../public/lakh-version-review/030.png)

## 031 — Double — The Captain of Her Heart

Видимое отличие.

Размечено: `c/MIDI/Double/The Captain of Her Heart.mid`.

The Captain of Her Heart.mid имеет 7 партий вместо 14 и почти вдвое меньше нот. В увеличении мелодия, аккордовый слой и бас яснее разделены; много длительных удвоений у альтернативы. Гипотеза — независимость голосов.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=31) · [PNG](../../../public/lakh-version-review/031.png)

## 032 — Duke Ellington — Jeep's Blues

Идентичные MIDI.

Размечено: `c/MIDI/Duke Ellington/Jeep's Blues.mid`.

Jeep’s Blues: одинаковые контуры и сведения; манифест подтверждает byte-identical файлы из разных написаний имени артиста. Нет музыкального отрицательного примера.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=32) · [PNG](../../../public/lakh-version-review/032.png)

## 033 — Eagles — Take It to the Limit

Видимое отличие.

Размечено: `c/MIDI/Eagles/Take It to the Limit.mid`.

Take It to the Limit: выбранная 10-партийная версия богаче двух 7-партийных, с солирующим Alto Sax/Voice Oohs и полной формой. Темп 200 против 100–107 требует отдельно проверять музыкальный масштаб.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=33) · [PNG](../../../public/lakh-version-review/033.png)

## 034 — Earth, Wind & Fire — Fantasy

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Earth, Wind & Fire/Fantasy.mid`.

Fantasy.mid близка .2/.6/.7 по фактуре, но отличается некоторыми назначениями тембров. .5 лучше квантована, однако относится к другой аранжировке. Выбор семейства понятнее, чем конкретной копии.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=34) · [PNG](../../../public/lakh-version-review/034.png)

## 035 — Duke Ellington — Satin Doll

Видимое отличие.

Размечено: `c/MIDI/Ellington/Satin Doll.1.mid`.

Satin Doll.1 содержит развитую секцию саксофонов/тромбонов и больше формы (348 против 288 долей). Альтернатива ближе к маленькому клавишному ансамблю. Здесь видна ценность характерной ансамблевой оркестровки.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=35) · [PNG](../../../public/lakh-version-review/035.png)

## 036 — Elton John — Crocodile Rock

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Elton John/Crocodile Rock.mid`.

Crocodile Rock: выбранная 9-партийная версия между бедной 7-партийной и плотной 11-партийной; темп иной. Возможны дополнительные самостоятельные линии, но превосходство именно этого темпового варианта по картинке не устанавливается.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=36) · [PNG](../../../public/lakh-version-review/036.png)

## 037 — Elvis Presley — Can't Help Falling in Love

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Elvis Presley/Can't Help Falling in Love.5.mid`.

Can’t Help Falling in Love.5 — 13-партийная оркестровка, близкая .1/.3, с другим духовым солистом. Простые и более длинные альтернативы не выбраны. Точная причина внутри семейства, вероятно, требует тембрового сравнения.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=37) · [PNG](../../../public/lakh-version-review/037.png)

## 038 — Emerson, Lake & Palmer — Tarkus

Причина не установлена.

Размечено: `c/MIDI/Emerson, Lake & Palmer/Tarkus.mid`.

Tarkus: обе версии показывают одинаковую сложную форму, 39 сочетаний канал/патч и 23343 ноты. Точный выбор по обзорной картинке не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=38) · [PNG](../../../public/lakh-version-review/038.png)

## 039 — Fleetwood Mac — The Chain

Видимое отличие.

Размечено: `c/MIDI/Fleetwood Mac/The Chain.mid`.

The Chain.mid существенно короче и беднее альтернативы (292 / 2223 против 468 / 6827), зато имеет ровные атаки и раздельные гитарные/духовые линии. Это сильный контрпример простому критерию полноты; нужна проверка, не выбран ли фрагмент сознательно.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=39) · [PNG](../../../public/lakh-version-review/039.png)

## 040 — Marvin Gaye — I Heard It Through The Grapevine

Причина не установлена.

Размечено: `c/MIDI/Gaye,Marvin/I Heard It Through The Grapevine.1.mid`.

I Heard It Through the Grapevine.1 отличается темпом/масштабом, аранжировкой и имеет очень низкую долю попадания в сетку (13%). По изображению нельзя приписать выбор удобной сетке; требуется музыкальное сравнение.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=40) · [PNG](../../../public/lakh-version-review/040.png)

## 041 — Marvin Gaye — What's Goin' On

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Marvin Gaye/What's Goin' On.mid`.

What’s Goin’ On: выбранная и одна альтернативная версии визуально совпадают; .1 вдвое медленнее в MIDI-долях, с другой фактурой. Семейство с ясной мелодией и басом понятно, конкретный файл — нет.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=41) · [PNG](../../../public/lakh-version-review/041.png)

## 042 — Gene Vincent — Be Bob A-Lula

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Vincent Gene/Be Bob A-Lula.mid`.

Be Bop A-Lula: выбранная 7-партийная версия добавляет солирующий Alto Sax/духовые к более простой 5-партийной. Ещё одна 10-партийная — другая фактура. Возможен критерий достаточного состава ролей.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=42) · [PNG](../../../public/lakh-version-review/042.png)

## 043 — Humperdinck Engelbert — The Spanish Night Is Over

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Humperdinck Engelbert/The Spanish Night Is Over.mid`.

The Spanish Night Is Over: форма и число нот почти одинаковы; выбранная имеет Voice Oohs/Vibraphone вместо большей части колокольчиковых/клавишных тембров. Это кандидат на тембровую причину, проверить её нужно слухом.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=43) · [PNG](../../../public/lakh-version-review/043.png)

## 044 — J.J. Cale — Cocaine

Видимое отличие.

Размечено: `c/MIDI/J.J. Cale/Cocaine.mid`.

Cocaine.mid заметно полнее 4-партийной версии: несколько гитарных слоёв, развитые вставки и самостоятельный бас вместо очень простой повторяющейся фактуры. Здесь критерий деталей работает.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=44) · [PNG](../../../public/lakh-version-review/044.png)

## 045 — Michael Jackson — Billie Jean

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Michael Jackson/Billie Jean.5.mid`.

Billie Jean.5 — 8-партийная версия, менее раздутая, чем многие 11–16-партийные. Длинные/незакрытые окончания у основной альтернативы; но есть почти одинаковая .5 из другого написания имени артиста. Нужно сравнивать аранжировки, а не пути.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=45) · [PNG](../../../public/lakh-version-review/045.png)

## 046 — Michael Jackson — Billy Jean

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Michael Jackson/Billy Jean.mid`.

Billy Jean: выбранная полная 4-партийная версия, тогда как .1 заканчивается на 108 долях. Вторая основная копия практически совпадает. Это та же композиция, что Billie Jean в соседней группе: обнаружена ошибка объединения названий, обе группы надо соединить перед новым обучением.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=46) · [PNG](../../../public/lakh-version-review/046.png)

## 047 — Michael Jackson — Rock With You

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Michael Jackson/Rock With You.mid`.

Rock With You: выбранная близка .1/.2/.3, с ровной сеткой и раздельной мелодией. Другая основная версия короче и с другой оркестровкой. Точное предпочтение внутри почти одинакового семейства неизвестно.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=47) · [PNG](../../../public/lakh-version-review/047.png)

## 048 — John Lennon — Imagine

Видимое отличие.

Размечено: `c/MIDI/Lennon John/Imagine.4.mid`.

Imagine.4 — компактная 5-партийная аранжировка: верхняя линия Vibraphone отделена от piano/баса/струн. Одноголосная piano-версия свободно сыграна, 2-партийная смешивает роли. Близкие 6-партийные отличаются солистом; тембровую причину нужно слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=48) · [PNG](../../../public/lakh-version-review/048.png)

## 049 — Led Zeppelin — Stairway To Heaven

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Led Zeppelin/Stairway To Heaven.3.mid`.

Stairway to Heaven.3 имеет полную гитарную аранжировку с почти ровной сеткой; .7 — piano reduction, основная версия существенно отличается темпом/формой и менее ровна. .6 визуально очень близка .3, но другой темп и Harmonica: точный выбор требует прослушивания.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=49) · [PNG](../../../public/lakh-version-review/049.png)

## 050 — Lipps, Inc. — Funky Town

Размечено несколько версий.

Размечено: `c/MIDI/Lipps, Inc./Funky Town.1.mid`, `c/MIDI/Lipps, Inc./Funky Town.mid`.

Обе Funky Town размечены: 7 и 9 партий, разная длина/мелодический материал. Не выделяю одного победителя.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=50) · [PNG](../../../public/lakh-version-review/050.png)

## 051 — Lobo — I'd Love You to Want Me

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Lobo/I'd Love You to Want Me.mid`.

I’d Love You to Want Me: выбранная с nylon guitars/Accordion вместо steel guitar/Trumpet, при близкой полноте. Более ровная сетка поддерживает выбор, но главный контраст — другая инструментовка и размещение мелодии.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=51) · [PNG](../../../public/lakh-version-review/051.png)

## 052 — Richard Marx — Hazard

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Marx Richard/Hazard.mid`.

Hazard: почти одинаковое семейство. Выбранная использует Pan Flute вместо Blown Bottle, .2 имеет длинный хвост, .3 небольшой сдвиг. Различие чистого файла и солирующего тембра вероятно, но не доказано слухом.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=52) · [PNG](../../../public/lakh-version-review/052.png)

## 053 — Peter Gabriel — Solsbury Hill

Причина не установлена.

Размечено: `c/MIDI/Peter Gabriel/Solsbury Hill.mid`.

Solsbury Hill: выбранная близка .1, .2 добавляет мелодические слои и сменяет патчи. Начальная MIDI-метка 2/4 сама по себе не подтверждает сложный музыкальный метр; нужен разбор периодичности акцентов, точный выбор не ясен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=53) · [PNG](../../../public/lakh-version-review/053.png)

## 054 — Pink Floyd — Brain Damage

Контрпример простому критерию.

Размечено: `c/MIDI/Pink Floyd/Brain Damage.mid`.

Brain Damage: выбранная версия содержит Piano почти во всех партиях, несмотря на альтернативы с гитарами/голосовыми патчами. Сетка ровная во всех вариантах. Критерий «больше хороших разных тембров» здесь не объясняет выбор; возможно, важнее сами линии.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=54) · [PNG](../../../public/lakh-version-review/054.png)

## 055 — Pink Floyd — Comfortably Numb

Причина не установлена.

Размечено: `c/MIDI/Pink Floyd/Comfortably Numb.mid`.

Comfortably Numb: выбрана разреженная версия, похожая .1, но с длинной конечной басовой линией; .2 гораздо плотнее. Это противоречит автоматическому штрафу за любой длинный хвост. Нужно различить реальные note-off и принудительное закрытие незаконченных нот, затем слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=55) · [PNG](../../../public/lakh-version-review/055.png)

## 056 — Pink Floyd — The Great Gig in the Sky

Причина не установлена.

Размечено: `c/MIDI/Pink Floyd/The Great Gig in the Sky.mid`.

The Great Gig in the Sky: выбранная похожа .1 и содержит очень длинную завершающую линию; другие версии в другом темповом масштабе. По картинке нельзя утверждать, что здесь лучше сетка или конец файла.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=56) · [PNG](../../../public/lakh-version-review/056.png)

## 057 — Pink Floyd — Time

Контрпример простому критерию.

Размечено: `c/MIDI/Pink Floyd/Time.mid`.

Time: выбрана короткая 9-партийная all-piano версия (2003 ноты), почти одинаковая .2; альтернативная аранжировка длиннее и намного богаче. Это сильный контрпример полноте/числу патчей. Возможна иная транскрипция или неполный просмотр группы.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=57) · [PNG](../../../public/lakh-version-review/057.png)

## 058 — Pink Floyd — Wish You Were Here

Размечено несколько версий.

Размечено: `c/MIDI/Pink Floyd/Wish You Were Here.2.mid`, `c/MIDI/Pink Floyd/Wish You Were Here.6.mid`, `c/MIDI/Pink Floyd/Wish You Were Here.mid`.

Wish You Were Here: размечены .2, .6 и основная версия, принадлежащие разным темповым/аранжировочным семействам. Единственный победитель не следует из аннотаций.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=58) · [PNG](../../../public/lakh-version-review/058.png)

## 059 — Radiohead — Karma Police

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Radiohead/Karma Police.mid`.

Karma Police: выбранная чуть короче, с ясными гитарами, Synth Voice и басом; альтернатива более растянута и имеет длинные конечные линии. Контуры близки, преимущества тембров нужно слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=59) · [PNG](../../../public/lakh-version-review/059.png)

## 060 — Red Hot Chili Peppers — Californication

Причина не установлена.

Размечено: `c/MIDI/Red Hot Chili Peppers/Californication.1.mid`.

Californication: все три версии имеют 6 партий, 6939 нот и одинаковую оркестровку. Незначительные различия длины/фазы не дают уверенной причины выбора .1.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=60) · [PNG](../../../public/lakh-version-review/060.png)

## 061 — Red Hot Chili Peppers — Under The Bridge

Размечено несколько версий.

Размечено: `c/MIDI/Red Hot Chili Peppers/Under The Bridge.1.mid`, `c/MIDI/Red Hot Chili Peppers/Under The Bridge.mid`.

Обе Under the Bridge размечены и визуально очень близки. Нет однозначной метки лучшей версии.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=61) · [PNG](../../../public/lakh-version-review/061.png)

## 062 — Vasco Rossi — Alba chiara

Видимое отличие.

Размечено: `c/MIDI/Vasco/Albachiara.mid`.

Albachiara.mid — другая, длинная 8-партийная аранжировка, с отчётливой мелодией и ровной сеткой; многие 12-партийные версии существенно короче, другие плохо квантованы. Здесь видна полнота при меньшем числе ролей. В сохранённой разметке есть семь вручную заданных границ тактов, так что версия потребовала выравнивания.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=62) · [PNG](../../../public/lakh-version-review/062.png)

## 063 — Seal — Crazy

Видимое отличие.

Размечено: `c/MIDI/Seal/Crazy.3.mid`.

Crazy.3 — отдельное семейство с более ровными атаками и разреженной фактурой, 11 сочетаний канал/патч вместо 17–18. Другие версии имеют длинные удерживаемые линии. Возможная причина — ясность ролей и стабильный ритм.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=63) · [PNG](../../../public/lakh-version-review/063.png)

## 064 — Simply Red — If You Don't Know Me By Now

Размечено несколько версий.

Размечено: `c/MIDI/Simply Red/If You Don't Know Me By Now.1.mid`, `c/MIDI/Simply Red/If You Don't Know Me By Now.mid`.

If You Don’t Know Me by Now: размечены два 3/4 варианта, а не более длинный 4/4. Это поддерживает важность музыкального метра, но не даёт выбрать между двумя размеченными.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=64) · [PNG](../../../public/lakh-version-review/064.png)

## 065 — T'Pau — China In Your Hand

Причина не установлена.

Размечено: `c/MIDI/T'Pau/China In Your Hand.2.mid`.

China in Your Hand.2 отличается темпом (200 против 66–70), длиной и слоистостью. Сетки у альтернатив тоже ровные. По изображению нельзя подтвердить лучший tactus или лучший вокальный голос.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=65) · [PNG](../../../public/lakh-version-review/065.png)

## 066 — T. Rex — Get It On (Bang a Gong)

Видимое отличие.

Размечено: `c/MIDI/T. Rex/Get It On (Bang a Gong).1.mid`.

Get It On.1 заметно полнее: добавлены мелодические/духовые и клавишные роли, 8496 нот против 5776 и длиннее форма. Здесь число содержательных деталей действительно поддерживает выбор.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=66) · [PNG](../../../public/lakh-version-review/066.png)

## 067 — Tag Team — Whoomp (There It Is)

Видимое отличие.

Размечено: `c/MIDI/Tag Team/Whoomp (There It Is).1.mid`.

Whoomp.1 показывает непрерывное мелодическое/сопровождающее содержание; у альтернативы большие пустые участки в увеличенном фрагменте и более разреженная форма. Вероятна полнота материала, а не только количество нот.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=67) · [PNG](../../../public/lakh-version-review/067.png)

## 068 — Tammy Wynette — Stand By Your Man

Видимое отличие.

Размечено: `c/MIDI/Tammy Wynette/Stand By Your Man.1.mid`.

Stand By Your Man.1: полная на вид компактная аранжировка с 9 ролями против очень длинной 5-партийной альтернативы. Это показывает, что длина файла и суммарные ноты могут расти от повторов, а не музыкальных деталей.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=68) · [PNG](../../../public/lakh-version-review/068.png)

## 069 — Tanita Tikaram — Twist In My Sobriety

Видимое отличие.

Размечено: `c/MIDI/Tanita Tikaram/Twist In My Sobriety.mid`.

Twist in My Sobriety: выбранная версия длиннее и полнее по ролям, с самостоятельными гитарой/клавишными/верхней линией. Сетка хороша в обеих. Полнота формы и деталей правдоподобна.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=69) · [PNG](../../../public/lakh-version-review/069.png)

## 070 — Tasmin Archer — Sleeping Satellite

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Tasmin Archer/Sleeping Satellite.mid`.

Sleeping Satellite: выбранная без громадного конечного хвоста, с другим набором солирующих патчей. При этом доля квантованных атак ниже. Возможная причина — пригодная форма/роли, а не глобальная точность сетки.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=70) · [PNG](../../../public/lakh-version-review/070.png)

## 071 — Tavares — Heaven Must Be Missing an Angel

Видимое отличие.

Размечено: `c/MIDI/Tavares/Heaven Must Be Missing an Angel.mid`.

Heaven Must Be Missing an Angel: выбранная сохраняет большую полную форму и разные роли, тогда как .1 all-piano и с длинными конечными нотами, .2 заметно короче и в другом темпе. Это пример содержательной ансамблевой детализации.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=71) · [PNG](../../../public/lakh-version-review/071.png)

## 072 — Taylor Dayne — Tell It to My Heart

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Taylor Dayne/Tell It to My Heart.mid`.

Tell It to My Heart: обе версии полные и хорошо квантованы; выбранная с Lead Square/Pad Halo, другая с Voice Oohs/духовыми слоями. По изображению видно различие инструментовки, но её качество нужно оценивать слухом.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=72) · [PNG](../../../public/lakh-version-review/072.png)

## 073 — Tears for Fears — Shout

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Tears for Fears/Shout.5.mid`.

Shout.5 — 12-партийное семейство с ровной сеткой, в отличие от более плотной 17-партийной версии. .4 почти та же, но с Pan Flute вместо другого солиста. Читаемость и отсутствие лишнего дублирования правдоподобны; точный тембр не установлен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=73) · [PNG](../../../public/lakh-version-review/073.png)

## 074 — Technotronic — Pump Up the Jam

Видимое отличие.

Размечено: `c/MIDI/Technotronic/Pump Up the Jam.mid`.

Pump Up the Jam: выбранная заметно полнее, .2 — короткий фрагмент, .1 — более короткая простая форма. Полнота здесь важнее идеальной квантизации .1.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=74) · [PNG](../../../public/lakh-version-review/074.png)

## 075 — Terry Jacks — Seasons in the Sun

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Terry Jacks/Seasons in the Sun.2.mid`.

Seasons in the Sun.2 имеет компактный состав, солирующий Vibraphone и более ровные атаки, чем .1. Основная близка, с Pan Flute. Возможен выбор ведущего тембра, но это слуховая гипотеза.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=75) · [PNG](../../../public/lakh-version-review/075.png)

## 076 — The Alan Parsons Project — Eye In The Sky

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Alan Parsons Project/Eye In The Sky.mid`.

Eye in the Sky: выбранная богаче 7-партийной .2 и практически совпадает с .1. Низкая доля совпадения с прямой/триольной сеткой (24%) — ещё один контрпример простому grid-score.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=76) · [PNG](../../../public/lakh-version-review/076.png)

## 077 — The Allman Brothers Band — Midnight Rider

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Allman Brothers Band/Midnight Rider.mid`.

Midnight Rider: оба файла имеют одинаковую форму/число нот; заметный контраст Steel Guitar против Nylon Guitar. Это возможное тембровое предпочтение, не установленное глазами.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=77) · [PNG](../../../public/lakh-version-review/077.png)

## 078 — The Animals — The House of the Rising Sun

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Animals/The House of the Rising Sun.5.mid`.

House of the Rising Sun.5 — 3/4 семейство с характерной органно-гитарной фактурой; варианты 4/4 принадлежат другой аранжировке. Близкие .1/.3 тоже полноценны, поэтому точный файл внутри семейства не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=78) · [PNG](../../../public/lakh-version-review/078.png)

## 079 — The Association — Never My Love

Причина не установлена.

Размечено: `c/MIDI/The Association/Never My Love.mid`.

Never My Love: число ролей/нот одинаково, выбранная смещена по времени и чуть длиннее. Возможна разница затакта/начала; превосходство без музыкального выравнивания не установлено.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=79) · [PNG](../../../public/lakh-version-review/079.png)

## 080 — The Bangles — Eternal Flame

Видимое отличие.

Размечено: `c/MIDI/The Bangles/Eternal Flame.9.mid`.

Eternal Flame.9 сочетает более полную форму (312 долей) с хорошей сеткой и самостоятельными слоями. Простые 7–8-партийные существенно короче/хуже попадают в доли; более плотные .4/.10 тоже хуже. Здесь баланс полноты и устойчивости хорошо виден.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=80) · [PNG](../../../public/lakh-version-review/080.png)

## 081 — The Beatles — A Hard Day's Night

Видимое отличие.

Размечено: `c/MIDI/The Beatles/A Hard Day's Night.5.mid`.

A Hard Day’s Night.5 добавляет отчётливый отдельный органный верхний голос к гитарному/басовому рисунку и близка .1. Другие версии проще или иначе раскладывают материал. Возможная причина — полноценная мелодическая роль при сохранённом характерном сопровождении.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=81) · [PNG](../../../public/lakh-version-review/081.png)

## 082 — The Beatles — A Taste Of Honey

Причина не установлена.

Размечено: `c/MIDI/The Beatles/A Taste Of Honey.mid`.

A Taste of Honey: обе версии имеют те же 9 партий/2770 нот/292 доли и одинаковый состав. Точный выбор по обзору не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=82) · [PNG](../../../public/lakh-version-review/082.png)

## 083 — The Beatles — All My Loving

Видимое отличие.

Размечено: `c/MIDI/The Beatles/All My Loving.4.mid`.

All My Loving.4 имеет всего 5 партий и меньше всего нот, но отчётливо разделённые верхнюю мелодию, гитарный пульс, бас и ударные. Другие версии добавляют дубляжи/духовые. Это сильный пример качества ролей вместо их количества.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=83) · [PNG](../../../public/lakh-version-review/083.png)

## 084 — The Beatles — Baby It's You

Видимое отличие.

Размечено: `c/MIDI/The Beatles/Baby It's You.mid`.

Baby It’s You: выбрана более полная 4/4 гитарно-органная версия (4131 нота); альтернатива 3/4 и беднее (1847). Здесь поддерживаются музыкальный метр и полнота сопровождения.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=84) · [PNG](../../../public/lakh-version-review/084.png)

## 085 — The Beatles — Boys

Видимое отличие.

Размечено: `c/MIDI/The Beatles/Boys.1.mid`.

Boys.1 добавляет верхнюю духовую/голосовую линию и несколько самостоятельных слоёв к более простой 5-партийной версии. Сетка ровная у обеих. Видимый критерий — содержательные мелодические детали.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=85) · [PNG](../../../public/lakh-version-review/085.png)

## 086 — The Beatles — Chains

Причина не установлена.

Размечено: `c/MIDI/The Beatles/Chains.1.mid`.

Chains: оба файла имеют одинаковые 5 партий и 4526 нот; отличаются темпом и мелкими длительностями. По изображению не выбираю между ними.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=86) · [PNG](../../../public/lakh-version-review/086.png)

## 087 — The Beatles — Do You Want to Know a Secret

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Do You Want to Know a Secret.mid`.

Do You Want to Know a Secret: выбрана более простая и короткая 7-партийная гитарно-голосовая аранжировка вместо 9-партийной с несколькими удвоениями. Сетка хуже: возможен критерий подходящей транскрипции/ясности, а не плотности.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=87) · [PNG](../../../public/lakh-version-review/087.png)

## 088 — The Beatles — Don't Bother Me

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Don't Bother Me.1.mid`.

Don’t Bother Me.1: роли гитар, органа, баса и ударных разделены; альтернативная версия сводит часть их к Piano/Synth Voice. Форма близка. Возможный критерий — различимые инструментальные роли.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=88) · [PNG](../../../public/lakh-version-review/088.png)

## 089 — The Beatles — Eleanor Rigby

Видимое отличие.

Размечено: `c/MIDI/The Beatles/Eleanor Rigby.4.mid`.

Eleanor Rigby.4 — компактный 4-партийный струнный ансамбль с ровной сеткой. Альтернативы содержат piano reduction, голосовые/эффектные патчи, удвоения, разные формы и хвосты. Возможная причина — характерная камерная фактура и достаточное число независимых линий, а не максимум партий. Наличие вокальной роли отдельно пока не доказано.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=89) · [PNG](../../../public/lakh-version-review/089.png)

## 090 — The Beatles — Good Night

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Good Night.mid`.

Good Night: выбрана короткая оркестровая версия со струнами/арфой, а не длинная гитарная. Goodnight.mid тоже оркестровая, но другой темп/voicing. Характерная фактура правдоподобна, точную музыкальную причину между ними не определяю.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=90) · [PNG](../../../public/lakh-version-review/090.png)

## 091 — The Beatles — Help!

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Help!.mid`.

Help!: выбранная имеет отдельные голосовые/мелодические слои и гитарный рисунок, вместо плотной духовой или более простой 5-партийной версии. Глобальная квантизация хуже ряда альтернатив, поэтому важнее может быть правильная транскрипция/роли.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=91) · [PNG](../../../public/lakh-version-review/091.png)

## 092 — The Beatles — I Saw Her Standing There

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/I Saw Her Standing There.mid`.

I Saw Her Standing There: выбранная 8-партийная версия с Synth Voice и независимыми слоями, альтернатива .3 заметно короткая; несколько полных версий проще или существенно иначе оркестрованы. Вокальную идентичность Synth Voice по названию патча не подтверждаю.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=92) · [PNG](../../../public/lakh-version-review/092.png)

## 093 — The Beatles — It Won't Be Long

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/It Won't Be Long.mid`.

It Won’t Be Long: выбранная беднее по нотам, но содержит отдельные Voice Oohs/Choir Aahs и органный мелодический слой поверх гитарного рисунка. Возможная причина — мелодия/вокальные гармонии без лишней плотности.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=93) · [PNG](../../../public/lakh-version-review/093.png)

## 094 — The Beatles — Love Me Do

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Love Me Do.1.mid`.

Love Me Do.1 — полная 6-партийная гитарно-органная версия с Harmonica и ровными атаками; .7 фрагмент, .6 более простая piano reduction. .2/.5 почти совпадают с .1, точный файл внутри семьи неизвестен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=94) · [PNG](../../../public/lakh-version-review/094.png)

## 095 — The Beatles — Misery

Видимое отличие.

Размечено: `c/MIDI/The Beatles/Misery.2.mid`.

Misery.2 — самая полная гитарно-органная версия по форме/нотам, с самостоятельной верхней линией. .1 заметно беднее, основная короче. Детали и форма перевешивают лучшую квантизацию основной.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=95) · [PNG](../../../public/lakh-version-review/095.png)

## 096 — The Beatles — Norwegian Wood

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Norwegian Wood.3.mid`.

Norwegian Wood.3 — 6/8 и компактная полная форма с Sitar и отдельными духовыми линиями. .4 — простое двухслойное сокращение; остальные по-другому кодируют метр/темп. Музыкальная сетка/характерный материал вероятны, качество необычных ведущих тембров нужно слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=96) · [PNG](../../../public/lakh-version-review/096.png)

## 097 — The Beatles — Penny Lane

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Penny Lane.mid`.

Penny Lane: выбранная содержит развитые клавишные и духовые детали; .4 визуально очень близка. .3 имеет большой хвост, .5 проще. Семейство с характерными вставками понятно; точное предпочтение основной копии — нет.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=97) · [PNG](../../../public/lakh-version-review/097.png)

## 098 — The Beatles — Please Please Me

Видимое отличие.

Размечено: `c/MIDI/The Beatles/Please Please Me.mid`.

Please Please Me: выбранная имеет дополнительные мелодические/голосовые роли и 3337 нот против 2126–2287, при одинаковой длине. Внятный пример более полного ансамбля.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=98) · [PNG](../../../public/lakh-version-review/098.png)

## 099 — The Beatles — She's a Woman

Причина не установлена.

Размечено: `c/MIDI/The Beatles/She's a Woman.mid`.

She’s a Woman: выбранная вдвое короче в долях и с половинным темпом, с другой строкой мелодии/струн. Другие версии тоже имеют хорошую сетку. Без выравнивания и прослушивания нельзя установить, что именно предпочтительно.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=99) · [PNG](../../../public/lakh-version-review/099.png)

## 100 — The Beatles — Strawberry Fields Forever

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Strawberry Fields Forever.3.mid`.

Strawberry Fields Forever.3 содержит Synth Voice и более полный материал, чем .1/основная; .4 с длинными незакрытыми линиями. .2 практически совпадает с выбранной. Возможная причина — сохранённая ведущая линия, но точный файл требует сравнить MIDI metadata/звучание.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=100) · [PNG](../../../public/lakh-version-review/100.png)

## 101 — The Beatles — Twist And Shout

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Twist And Shout.4.mid`.

Twist and Shout.4 — семейство с несколькими голосовыми слоями/органом и полной формой, в отличие от простых гитарных вариантов. .5/.6 почти одинаковы. Возможная причина — вокальные гармонии/самостоятельные линии, не строгий номер файла.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=101) · [PNG](../../../public/lakh-version-review/101.png)

## 102 — The Beatles — Yellow Submarine

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/Yellow Submarine.2.mid`.

Yellow Submarine.2 — более полная версия, чем короткая .3 и сокращённая основная, но не самая длинная .1. Видны голосовые/духовые слои. Низкая доля точных атак не поддерживает простой штраф за сетку.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=102) · [PNG](../../../public/lakh-version-review/102.png)

## 103 — The Beatles — You Like Me Too Much

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Beatles/You Like Me Too Much.1.mid`.

You Like Me Too Much.1 имеет Tenor Sax и чуть иную пианистическую/гитарную фактуру, при близкой длине/сетке. Возможен выбор отчётливого солиста; меньше нот не мешает, точный тембр нужно слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=103) · [PNG](../../../public/lakh-version-review/103.png)

## 104 — The Bluebells — Young At Heart

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Bluebells/Young At Heart.mid`.

Young at Heart: выбранная имеет ровные атаки, дополнительные сольные/голосовые роли, но другой темповый масштаб (200 против 115). Детали/сетку видно, корректный musical tactus пока не подтверждён.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=104) · [PNG](../../../public/lakh-version-review/104.png)

## 105 — The Boomtown Rats — I Don't Like Monday's

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Boomtown Rats/I Don't Like Monday's.mid`.

I Don’t Like Mondays: выбранная менее плотная, без отдельного Alto Sax/Choir Aahs альтернативы, но сохраняет piano/strings и форму. Возможно, предпочтительна характерная клавишно-струнная фактура; это контрпример автоматическому бонусу за любое добавление ролей.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=105) · [PNG](../../../public/lakh-version-review/105.png)

## 106 — The Byrds — Turn! Turn! Turn!

Видимое отличие.

Размечено: `c/MIDI/The Byrds/Turn! Turn! Turn!.1.mid`.

Turn! Turn! Turn!.1 — полная гитарная аранжировка с дополнительной верхней линией/Harmonica; .2 проще, основная короче и оркестрована иначе. Критерий полноты самостоятельных деталей правдоподобен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=106) · [PNG](../../../public/lakh-version-review/106.png)

## 107 — The Cardigans — My Favorite Game

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Cardigans/My Favorite Game.mid`.

My Favorite Game: выбранная и .1 имеют те же ноты/форму, но .1 использует больше комбинаций канал/патч. Возможная причина — назначения тембров; больше смен патчей не равно больше голосов.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=107) · [PNG](../../../public/lakh-version-review/107.png)

## 108 — The Cars — Drive

Причина не установлена.

Размечено: `c/MIDI/The Cars/Drive.1.mid`.

Drive.1 входит в почти одинаковое 10-партийное семейство, но имеет длинный пустой конец файла; .2/.5 короче и визуально не беднее. Выбор конкретного файла глазами не объясняется и противоречит жёсткому штрафу за пустой конец.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=108) · [PNG](../../../public/lakh-version-review/108.png)

## 109 — The Doors — Light My Fire

Размечено несколько версий.

Размечено: `c/MIDI/The Doors/Light My Fire.1.mid`, `c/MIDI/The Doors/Light My Fire.4.mid`.

Light My Fire: размечены .1 и .4 — две разные по длине/фактуре органно-гитарные версии. Видно много сокращённых/all-piano альтернатив, но нет единственного положительного файла.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=109) · [PNG](../../../public/lakh-version-review/109.png)

## 110 — The Doors — People Are Strange

Видимое отличие.

Размечено: `c/MIDI/The Doors/People Are Strange.1.mid`.

People Are Strange.1 — более длинная версия с самостоятельными organ/guitar/piano ролями и ровными атаками; другая — piano reduction, основная короче. Здесь пригодная сетка и состав ансамбля поддерживают выбор.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=110) · [PNG](../../../public/lakh-version-review/110.png)

## 111 — The Offspring — Self Esteem

Видимое отличие.

Размечено: `c/MIDI/The Offspring/Self Esteem.mid`.

Self Esteem: выбранная содержит отдельную верхнюю мелодическую линию Lead Sawtooth поверх гитар/баса/ударных, при всего 5 каналах; альтернативная с 7 каналами в отрывке в основном гитарные блоки. Это хороший кандидат на решающую роль сохранённой мелодии, её вокальный источник нужно подтвердить слухом.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=111) · [PNG](../../../public/lakh-version-review/111.png)

## 112 — The Police — Roxanne

Контрпример простому критерию.

Размечено: `c/MIDI/The Police/Roxanne.mid`.

Roxanne: выбрана короткая клавишно-струнная версия (1679 нот / 233 доли), вместо 6–7-партийных гитарных на 423–448 долей. Не объясняется максимумом полноты/сеткой; возможны другая транскрипция, слышимость мелодии или неполный просмотр.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=112) · [PNG](../../../public/lakh-version-review/112.png)

## 113 — The Righteous Brothers — Unchained Melody

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/The Righteous Brothers/Unchained Melody.1.mid`.

Unchained Melody.1 — длинная версия с отдельной мелодией, разреженным сопровождением и хорошей сеткой; .5 практически та же, но иной темп. Несколько альтернатив существенно короче или иначе организованы. Точный выбор внутри пары требует слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=113) · [PNG](../../../public/lakh-version-review/113.png)

## 114 — The Ventures — Walk Don't Run

Видимое отличие.

Размечено: `c/MIDI/Ventures/Walk Don't Run.mid`.

Walk Don’t Run: выбранная самая полная по форме и деталям, с верхним голосом поверх нескольких гитарных линий. .1 из другого источника короткая/с необычными drum patches; остальные проще. Вокал для инструментальной композиции нельзя требовать универсально.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=114) · [PNG](../../../public/lakh-version-review/114.png)

## 115 — Umberto Tozzi — Gloria

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Umberto Tozzi/Gloria.mid`.

Gloria: выбранная близка .2/.3/другой основной версии, с отдельной голосовой/духовой линией и ровной сеткой. .4 длиннее, но хуже попадает в доли. Выбор семейства понятнее, чем конкретного пути.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=115) · [PNG](../../../public/lakh-version-review/115.png)

## 116 — Tyner Mccoy — Old Devil Moon

Причина не установлена.

Размечено: `c/MIDI/Tyner Mccoy/Old Devil Moon.mid`.

Old Devil Moon: одинаковый состав Piano/Drums/Bass и число нот, но темп 170 против 120, слегка разная длина и атаки. Квантизация плохая у обеих. Не устанавливаю причину предпочтения без музыкального сравнения.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=116) · [PNG](../../../public/lakh-version-review/116.png)

## 117 — U.S.A. for Africa — We Are the World

Видимое отличие.

Размечено: `c/MIDI/U.S.A. for Africa/We Are the World.mid`.

We Are the World: выбранная длиннее и имеет больше самостоятельных мелодических/ансамблевых событий. Другие версии имеют множество смен патчей на каналах, что раздувает список тембров. Важно считать независимые роли, а не program changes.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=117) · [PNG](../../../public/lakh-version-review/117.png)

## 118 — U2 — With or Without You

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/U2/With or Without You.1.mid`.

With or Without You.1 — полная аранжировка с характерным повторяющимся рисунком и верхними слоями; .3 двухпартийное сокращение, .4/.6 all-piano. .2/.5 близки выбранной. Точная копия не объясняется по обзору.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=118) · [PNG](../../../public/lakh-version-review/118.png)

## 119 — UB40 — (I Can't Help) Falling In Love With You

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/UB40/(I Can't Help) Falling In Love With You.mid`.

UB40: выбранная полнее по форме/нотам с развитыми ансамблевыми деталями; .1 по данным и картинке напоминает совсем другое семейство Can’t Help Falling in Love из Elvis-группы. До обучения нужна проверка идентичности исполнения/аранжировки, а не только одинакового заголовка.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=119) · [PNG](../../../public/lakh-version-review/119.png)

## 120 — Urban Cookie Collective — The Key, the Secret

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Urban Cookie Collective/The Key, the Secret.mid`.

The Key, the Secret: обе версии очень близки, выбранная немного длиннее и с немного большим числом нот, но существенно другой темп и роль солирующего патча. Тембровое/темповое преимущество по картинке не доказано.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=120) · [PNG](../../../public/lakh-version-review/120.png)

## 121 — Us3 — Cantaloop

Причина не установлена.

Размечено: `c/MIDI/Us3/Cantaloop.mid`.

Cantaloop: обе версии почти совпадают по фактуре, составу и числу нот; есть небольшой сдвиг/длина. Не объясняю предпочтение одного точного файла.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=121) · [PNG](../../../public/lakh-version-review/121.png)

## 122 — Usher — My Way

Размечено несколько версий.

Размечено: `c/MIDI/Usher/My Way.1.mid`, `c/MIDI/Usher/My Way.mid`.

My Way: размечены .1 и основная, разные по форме и фактуре; однозначного победителя нет. .2 нельзя автоматически считать негативом только за отсутствие аннотации.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=122) · [PNG](../../../public/lakh-version-review/122.png)

## 123 — Valens Ritchie — La Bamba

Видимое отличие.

Размечено: `c/MIDI/Valens Ritchie/La Bamba.mid`.

La Bamba: выбранная содержит отдельную верхнюю мелодическую линию и более развитые ансамблевые слои, намного полнее и ровнее квантована, чем гитарная .1. Детали/сохранение мелодии правдоподобны.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=123) · [PNG](../../../public/lakh-version-review/123.png)

## 124 — Van McCoy — The Hustle

Видимое отличие.

Размечено: `c/MIDI/Van McCoy/The Hustle.mid`.

The Hustle: выбранная существенно длиннее и детальнее, с полноценными струнами/духовыми и басом; .1/.2 имеют менее устойчивые атаки, .3 короче. Здесь полнота формы и характерные роли поддерживают выбор.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=124) · [PNG](../../../public/lakh-version-review/124.png)

## 125 — Van Morrison — Brown Eyed Girl

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Van Morrison/Brown Eyed Girl.mid`.

Brown Eyed Girl: выбранная близка .4, с органной верхней линией/духовыми и ровной сеткой; .2/.3 simpler guitar/piano, .1 другой состав. Нотные роли правдоподобны, точный выбор внутри семейства не установлен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=125) · [PNG](../../../public/lakh-version-review/125.png)

## 126 — Vanessa Williams — Colors of the Wind

Контрпример простому критерию.

Размечено: `c/MIDI/Vanessa Williams/Colors of the Wind.mid`.

Colors of the Wind: выбрана 3-партийная версия Rhodes/Strings/Pan Flute вместо 16-партийной. Верхняя линия отделена от сопровождения, сетка гораздо ровнее. Явный пример того, что сохранённая мелодия и читаемость могут перевешивать детализацию.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=126) · [PNG](../../../public/lakh-version-review/126.png)

## 127 — Vangelis — 1492: Conquest of Paradise

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Vangelis/1492: Conquest of Paradise.mid`.

1492: выбранная полная слоистая струнно-хоровая аранжировка, почти одинаковая .3; .1 существенно проще/в другом темпе, .4 в другом метре. Точный файл внутри близкой пары не определяется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=127) · [PNG](../../../public/lakh-version-review/127.png)

## 128 — Vanilla Ice — Ice Ice Baby

Видимое отличие.

Размечено: `c/MIDI/Vanilla Ice/Ice Ice Baby.1.mid`.

Ice Ice Baby.1 — полный файл на 452 доли, тогда как основная заканчивается на 96; число нот сильно больше. Наглядный критерий целой композиции вместо фрагмента.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=128) · [PNG](../../../public/lakh-version-review/128.png)

## 129 — Vega — Tom's Diner (reprise)

Контрпример простому критерию.

Размечено: `c/MIDI/Vega/Tom's Diner (reprise).2.mid`.

Tom’s Diner.2: выбрана all-piano версия с начальным 8/8 и полной формой; короткая основная теряет форму, .1 тоже полная и более ансамблевая. Приоритет хороших разных тембров не объясняет этот выбор.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=129) · [PNG](../../../public/lakh-version-review/129.png)

## 130 — Veruca Salt — Seether

Причина не установлена.

Размечено: `c/MIDI/Veruca Salt/Seether.mid`.

Seether: версии практически одинаковы по ролям, нотам, длине и сетке. По рисунку точный выбор не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=130) · [PNG](../../../public/lakh-version-review/130.png)

## 131 — War — Low Rider

Причина не установлена.

Размечено: `c/MIDI/War/Low Rider.mid`.

Low Rider: близкая фактура, обе MIDI показывают 5/4 и похожую низкую долю точных атак. Выбранная имеет меньше ролей/нот и другой саксофонный патч. Нативная метка метра сама по себе не свидетельствует о пригодной музыкальной сетке.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=131) · [PNG](../../../public/lakh-version-review/131.png)

## 132 — Wayne Jeff — The Eve of the War

Видимое отличие.

Размечено: `c/MIDI/Wayne Jeff/The Eve of the War.mid`.

The Eve of the War: выбранная более полная по форме и нотам, с дополнительными независимыми вставками/голосами при такой же ровной сетке. Здесь работает критерий деталей.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=132) · [PNG](../../../public/lakh-version-review/132.png)

## 133 — Weather Report — Palladium

Контрпример простому критерию.

Размечено: `c/MIDI/Weather Report/Palladium.mid`.

Palladium: выбранная версия содержит более развитый музыкальный материал. Исходный признак даёт только 4% атак у прямой/триольной сетки, против 99% альтернативы. Но после единого сдвига на 0,148 четвертной доли доля близких атак вырастает до 91,4%: это в основном ошибка начала координат, а не ритмический беспорядок. Такой сдвиг ещё не устанавливает музыкально правильные такты.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=133) · [PNG](../../../public/lakh-version-review/133.png)

## 134 — Weezer — Buddy Holly

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Weezer/Buddy Holly.mid`.

Buddy Holly: выбранная содержит больше деталей/мелодических слоёв, чем .1; обе полные и с хорошей сеткой. Возможна полнота вокальной/сольной линии, её источник не доказан по патчу.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=134) · [PNG](../../../public/lakh-version-review/134.png)

## 135 — Wham! — Careless Whisper

Причина не установлена.

Размечено: `c/MIDI/Wham!/Careless Whisper.mid`.

Careless Whisper: все три почти одинаковы по форме, составу, числу нот и темпу. Выбор конкретного файла глазами не объясняется.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=135) · [PNG](../../../public/lakh-version-review/135.png)

## 136 — Whigfield — Another Day

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Whigfield/Another Day.mid`.

Another Day: выбранная менее плотная, с другой клавишно-духовой фактурой и самостоятельной верхней линией. Более квантованная .1 и более плотная .2 не выбраны; возможно, важнее правильный вариант транскрипции/мелодии.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=136) · [PNG](../../../public/lakh-version-review/136.png)

## 137 — White Lion — When the Children Cry

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/White Lion/When the Children Cry.mid`.

When the Children Cry: те же ноты/форма, но выбранная заменяет Lead Sawtooth на Flute и другой струнный слой. Тембровое предпочтение правдоподобно, его качество нужно слушать.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=137) · [PNG](../../../public/lakh-version-review/137.png)

## 138 — White Town — Your Woman

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/White Town/Your Woman.mid`.

Your Woman: выбранная меньше по нотам, с другой оркестровкой и похожей полной формой. Некоторые альтернативы плотнее/лучше квантованы; видна важность конкретных ролей, но точный музыкальный мотив неизвестен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=138) · [PNG](../../../public/lakh-version-review/138.png)

## 139 — Whitesnake — Here I Go Again

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Whitesnake/Here I Go Again.mid`.

Here I Go Again: выбранная имеет меньше нот/каналов, сохраняя раздельные strings/guitar/flute/bass и полную форму. Обе сетки хорошие. Возможна читаемость/подходящий тембр вместо максимальной плотности.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=139) · [PNG](../../../public/lakh-version-review/139.png)

## 140 — Whitney Houston — 1 Moment in Time

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Whitney Houston/1 Moment in Time.mid`.

1 Moment in Time: выбранная относится к полноценному 10-партийному семейству .1/.2, отличается Voice Oohs/Vibraphone. .5 — простое 3-партийное сокращение; другие — другая аранжировка. Точный тембровый выбор не установлен.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=140) · [PNG](../../../public/lakh-version-review/140.png)

## 141 — Wild Cherry — Play That Funky Music

Видимое отличие.

Размечено: `c/MIDI/Wild Cherry/Play That Funky Music.mid`.

Play That Funky Music: выбранная полнее короткой 5-партийной, но менее раздута, чем .1, и с ровными атаками/самостоятельными guitar/bass/духовыми. Вероятен баланс ясных ролей и достаточной формы.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=141) · [PNG](../../../public/lakh-version-review/141.png)

## 142 — Willie Nelson — Always on My Mind

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Willie Nelson/Always on My Mind.mid`.

Always on My Mind: близкое семейство; выбранная содержит Synth Voice вместо одной Accordion, при почти тех же нотах/форме. Возможен тембровый/мелодический мотив, не доказанный глазами.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=142) · [PNG](../../../public/lakh-version-review/142.png)

## 143 — Yanni — The Rain Must Fall

Одна версия повреждена.

Размечено: `c/MIDI/Yanni/The Rain Must Fall.mid`.

The Rain Must Fall: выбранная читается и имеет полную разнообразную аранжировку; .1 повреждена в структуре MTrk. Показать сравнение музыкального содержания двух файлов невозможно.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=143) · [PNG](../../../public/lakh-version-review/143.png)

## 144 — Yes — And You and I

Причина не установлена.

Размечено: `c/MIDI/Yes/And You and I.1.mid`.

And You and I: обе версии имеют те же ноты и инструментовку, отличаются немного длиной/фазой. 19 сочетаний канал/патч не означают 19 одновременных голосов. Точный выбор не определяю.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=144) · [PNG](../../../public/lakh-version-review/144.png)

## 145 — Yes — Roundabout

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Yes/Roundabout.1.mid`.

Roundabout.1 почти совпадает с .2; основная меняет солирующие Voice Oohs/Calliope и чуть более плотная. Выбор семейства самостоятельных rock-ролей понятен, конкретная копия — нет.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=145) · [PNG](../../../public/lakh-version-review/145.png)

## 146 — Zero — Amando amando

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Zero/Amando amando.mid`.

Amando amando: одинаковое число нот/форма; выбранная меняет Gunshot-подобные назначения на Piano. Возможна причина в пригодности инструментовки, но нужно проверять bank/program и слышать результат.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=146) · [PNG](../../../public/lakh-version-review/146.png)

## 147 — Zucchero — Senza Una Donna

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/Zucchero/Senza Una Donna.7.mid`.

Senza Una Donna.7 — другая аранжировка с самостоятельными voice/choir/Alto Sax ролями и большей нотной детализацией, чем основное 11-канальное семейство. .6 ещё плотнее; не просто максимум нот. Подлинность вокальной роли надо подтвердить музыкальным сопоставлением.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=147) · [PNG](../../../public/lakh-version-review/147.png)

## 148 — ZZ Top — Sharp Dressed Man

Выбор семейства; точный файл неясен.

Размечено: `c/MIDI/ZZ Top/Sharp Dressed Man.3.mid`.

Sharp Dressed Man.3 близка .1, но меняет басовый патч/небольшие события. .2 имеет больше гитарных удвоений, основная другую органную мелодическую линию и лучше квантована. Возможна читаемость/тембр, точный выбор по рисунку не устанавливается.

[Сравнение всех версий](http://localhost:3000/lakh-version-review/index.html?case=148) · [PNG](../../../public/lakh-version-review/148.png)
