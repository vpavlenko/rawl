import React, { useState } from "react";
import styled from "styled-components";
import FrozenNotes from "../FrozenNotes";
import { ColoredNote } from "../parseMidi";
import path from "./path";

const PathContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const ChapterColumn = styled.div`
  width: 200px;
  flex-shrink: 0;
  background-color: #1a1a1a;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100%;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  background-color: #333333;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
`;

const ChapterButton = styled.button<{ active: boolean }>`
  width: 100%;
  padding: 10px;
  text-align: left;
  background-color: ${(props) => (props.active ? "#4a90e2" : "transparent")};
  color: white;
  border: none;
  cursor: pointer;
`;

const TopicCard = styled.div`
  background-color: #000000;
  margin: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  vertical-align: top;
  max-width: 20em;
`;

const TopicTitle = styled.h3`
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #ffffff;
  word-wrap: break-word;
  padding-left: 1em;
  text-indent: -1em;
`;

const MidiLink = styled.a`
  display: block;
  padding: 3px 0;
  font-size: 12px;
  color: #ffffff;
  text-decoration: none;
  word-wrap: break-word;
  padding-left: 1em;
  text-indent: -1em;
  &:hover {
    color: #4a90e2;
  }
`;

const MiniNotesDisplay = styled.div`
  margin: 15px 0;
  width: 100%;
`;

const topicToFrozenStrings: { [key: string]: string } = {
  "I ii V7 major":
    '[[{"note":{"midiNumber":67},"id":0,"isDrum":false,"span":[0,0.24895833333333334],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":67},"id":1,"isDrum":false,"span":[0.25,0.3322916666666667],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":69},"id":2,"isDrum":false,"span":[0.33333333333333337,0.4156250000000001],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":67},"id":3,"isDrum":false,"span":[0.41666666666666674,0.49895833333333345],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":76},"id":4,"isDrum":false,"span":[0.5000000000000001,0.6239583333333335],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":67},"id":5,"isDrum":false,"span":[0.8750000000000001,0.9989583333333335],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":69},"id":6,"isDrum":false,"span":[1.0000000000000002,1.1239583333333334],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":69},"id":7,"isDrum":false,"span":[1.2500000000000002,1.3739583333333334],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":74},"id":8,"isDrum":false,"span":[1.5000000000000002,1.8739583333333334],"voiceIndex":0,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":72},"id":9,"isDrum":false,"span":[1.8750000000000002,1.9989583333333334],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":71},"id":10,"isDrum":false,"span":[2.0000000000000004,2.2489583333333334],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":71},"id":11,"isDrum":false,"span":[2.25,2.3739583333333334],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":72},"id":12,"isDrum":false,"span":[2.375,2.4989583333333334],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":74},"id":13,"isDrum":false,"span":[2.5,2.5614583333333334],"voiceIndex":0,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":76},"id":14,"isDrum":false,"span":[2.625,2.6864583333333334],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":77},"id":15,"isDrum":false,"span":[2.75,2.8114583333333334],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":79},"id":16,"isDrum":false,"span":[2.875,2.9364583333333334],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":81},"id":17,"isDrum":false,"span":[3,3.1864583333333334],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":81},"id":18,"isDrum":false,"span":[3.375,3.4364583333333334],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":79},"id":19,"isDrum":false,"span":[3.5,3.9989583333333334],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true}],[{"note":{"midiNumber":48},"id":517,"isDrum":false,"span":[0,0.24895833333333334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":55},"id":518,"isDrum":false,"span":[0.25,0.49895833333333345],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":60},"id":519,"isDrum":false,"span":[0.25,0.49895833333333345],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":520,"isDrum":false,"span":[0.25,0.49895833333333345],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":55},"id":521,"isDrum":false,"span":[0.5000000000000001,0.7489583333333335],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":60},"id":522,"isDrum":false,"span":[0.5000000000000001,0.7489583333333335],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":523,"isDrum":false,"span":[0.5000000000000001,0.7489583333333335],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":41},"id":524,"isDrum":false,"span":[1.0000000000000002,1.2489583333333334],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":53},"id":525,"isDrum":false,"span":[1.0000000000000002,1.2489583333333334],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":53},"id":526,"isDrum":false,"span":[1.2500000000000002,1.4989583333333334],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":57},"id":527,"isDrum":false,"span":[1.2500000000000002,1.4989583333333334],"voiceIndex":1,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":62},"id":528,"isDrum":false,"span":[1.2500000000000002,1.4989583333333334],"voiceIndex":1,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":53},"id":529,"isDrum":false,"span":[1.5000000000000002,1.7489583333333334],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":57},"id":530,"isDrum":false,"span":[1.5000000000000002,1.7489583333333334],"voiceIndex":1,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":62},"id":531,"isDrum":false,"span":[1.5000000000000002,1.7489583333333334],"voiceIndex":1,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":43},"id":532,"isDrum":false,"span":[2.0000000000000004,2.2489583333333334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":55},"id":533,"isDrum":false,"span":[2.0000000000000004,2.2489583333333334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":55},"id":534,"isDrum":false,"span":[2.25,2.4989583333333334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":59},"id":535,"isDrum":false,"span":[2.25,2.4989583333333334],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":65},"id":536,"isDrum":false,"span":[2.25,2.4989583333333334],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":55},"id":537,"isDrum":false,"span":[2.5,2.7489583333333334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":59},"id":538,"isDrum":false,"span":[2.5,2.7489583333333334],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":65},"id":539,"isDrum":false,"span":[2.5,2.7489583333333334],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":48},"id":540,"isDrum":false,"span":[3,3.2489583333333334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":55},"id":541,"isDrum":false,"span":[3.25,3.4989583333333334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":60},"id":542,"isDrum":false,"span":[3.25,3.4989583333333334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":543,"isDrum":false,"span":[3.25,3.4989583333333334],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":55},"id":544,"isDrum":false,"span":[3.5,3.7489583333333334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":60},"id":545,"isDrum":false,"span":[3.5,3.7489583333333334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":546,"isDrum":false,"span":[3.5,3.7489583333333334],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true}]]',
  "I vi IV V7 major":
    '[[{"note":{"midiNumber":73},"id":0,"isDrum":false,"span":[0,0.2182690125],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":75},"id":1,"isDrum":false,"span":[0.230769,0.44903801250000003],"voiceIndex":0,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":68},"id":2,"isDrum":false,"span":[0.461538,1.7759597624999999],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":73},"id":3,"isDrum":false,"span":[0.461538,1.7759597624999999],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":77},"id":4,"isDrum":false,"span":[0.461538,1.7759597624999999],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":70},"id":5,"isDrum":false,"span":[1.8461519999999998,3.5980752229166666],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":73},"id":6,"isDrum":false,"span":[1.8461519999999998,3.5980752229166666],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":80},"id":7,"isDrum":false,"span":[1.8461519999999998,3.5980752229166666],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":73},"id":8,"isDrum":false,"span":[3.691344460416666,3.909613472916666],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":75},"id":9,"isDrum":false,"span":[3.922113460416666,4.140382472916666],"voiceIndex":0,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":70},"id":10,"isDrum":false,"span":[4.152882460416666,4.590382022916667],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":73},"id":11,"isDrum":false,"span":[4.152882460416666,4.590382022916667],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":77},"id":12,"isDrum":false,"span":[4.152882460416666,4.590382022916667],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":78},"id":13,"isDrum":false,"span":[4.614420460416667,5.051920022916668],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":77},"id":14,"isDrum":false,"span":[5.075958460416667,5.513458022916668],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":68},"id":15,"isDrum":false,"span":[5.537496460416668,6.522593052083335],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":75},"id":16,"isDrum":false,"span":[5.537496460416668,6.522593052083335],"voiceIndex":0,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":72},"id":17,"isDrum":false,"span":[6.575477689583335,7.560574281250001],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true}],[{"note":{"midiNumber":49},"id":246,"isDrum":false,"span":[0.461538,1.7759597624999999],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":56},"id":247,"isDrum":false,"span":[0.461538,1.7759597624999999],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":61},"id":248,"isDrum":false,"span":[0.461538,1.7759597624999999],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":54},"id":249,"isDrum":false,"span":[1.8461519999999998,4.082690222916666],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":61},"id":250,"isDrum":false,"span":[1.8461519999999998,4.082690222916666],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":66},"id":251,"isDrum":false,"span":[1.8461519999999998,4.082690222916666],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":58},"id":252,"isDrum":false,"span":[4.152882460416666,5.467304222916668],"voiceIndex":1,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":65},"id":253,"isDrum":false,"span":[4.152882460416666,5.467304222916668],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":56},"id":254,"isDrum":false,"span":[5.537496460416668,7.508651181250001],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":63},"id":255,"isDrum":false,"span":[5.537496460416668,7.508651181250001],"voiceIndex":1,"color":"noteColor_2_colors","isActive":true}]]',
  "major with iii":
    '[[{"note":{"midiNumber":81},"id":0,"isDrum":false,"span":[0,0.7483536666666667],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":78},"id":1,"isDrum":false,"span":[0.789472,1.5378256666666665],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":81},"id":2,"isDrum":false,"span":[1.578944,2.327297666666667],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":73},"id":3,"isDrum":false,"span":[1.97368,2.347034466666667],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":69},"id":4,"isDrum":false,"span":[2.3684160000000003,2.741770466666667],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":78},"id":5,"isDrum":false,"span":[2.3684160000000003,3.1167696666666664],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":73},"id":6,"isDrum":false,"span":[2.763152,3.136506466666667],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":86},"id":7,"isDrum":false,"span":[3.157888,3.906241666666667],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":74},"id":8,"isDrum":false,"span":[3.5526240000000002,3.925978466666667],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":79},"id":9,"isDrum":false,"span":[3.94736,4.695713666666666],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":67},"id":10,"isDrum":false,"span":[3.94736,4.695713666666666],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":73},"id":11,"isDrum":false,"span":[5.131568,5.504922466666666],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":69},"id":12,"isDrum":false,"span":[5.526303999999999,5.899658466666666],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":81},"id":13,"isDrum":false,"span":[4.736832,6.235184066666665],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":73},"id":14,"isDrum":false,"span":[5.921039999999999,6.294394466666666],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":83},"id":15,"isDrum":false,"span":[6.315775999999999,6.689130466666666],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":79},"id":16,"isDrum":false,"span":[6.710511999999999,7.083866466666666],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":86},"id":17,"isDrum":false,"span":[6.710511999999999,7.083866466666666],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":74},"id":18,"isDrum":false,"span":[7.105247999999999,7.853601666666665],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":79},"id":19,"isDrum":false,"span":[7.105247999999999,7.853601666666665],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":78},"id":20,"isDrum":false,"span":[7.894719999999999,8.268074466666665],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":81},"id":21,"isDrum":false,"span":[8.289455999999998,8.662810466666667],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":74},"id":22,"isDrum":false,"span":[8.684192,9.432545666666666],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":71},"id":23,"isDrum":false,"span":[9.8684,10.241754466666665],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":74},"id":24,"isDrum":false,"span":[10.263136,10.636490466666666],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":78},"id":25,"isDrum":false,"span":[9.473664000000001,10.972016066666665],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":71},"id":26,"isDrum":false,"span":[10.657872,11.031226466666665],"voiceIndex":0,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":69},"id":27,"isDrum":false,"span":[11.447343999999998,11.820698466666665],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":76},"id":28,"isDrum":false,"span":[11.052607999999998,12.550960066666665],"voiceIndex":0,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":69},"id":29,"isDrum":false,"span":[11.842079999999997,12.590433666666664],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":73},"id":30,"isDrum":false,"span":[11.842079999999997,12.590433666666664],"voiceIndex":0,"color":"noteColor_11_colors","isActive":true}],[{"note":{"midiNumber":62},"id":586,"isDrum":false,"span":[0,0.37335446666666666],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":69},"id":587,"isDrum":false,"span":[0.394736,0.7680904666666667],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":66},"id":588,"isDrum":false,"span":[0.789472,1.5378256666666665],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":61},"id":589,"isDrum":false,"span":[1.578944,1.9522984666666667],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":69},"id":590,"isDrum":false,"span":[1.97368,2.347034466666667],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":66},"id":591,"isDrum":false,"span":[2.3684160000000003,2.741770466666667],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":69},"id":592,"isDrum":false,"span":[2.763152,3.136506466666667],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":59},"id":593,"isDrum":false,"span":[3.157888,3.531242466666667],"voiceIndex":1,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":67},"id":594,"isDrum":false,"span":[3.5526240000000002,3.925978466666667],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":62},"id":595,"isDrum":false,"span":[3.94736,4.695713666666666],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":61},"id":596,"isDrum":false,"span":[4.736832,5.110186466666666],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":69},"id":597,"isDrum":false,"span":[5.131568,5.504922466666666],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":66},"id":598,"isDrum":false,"span":[5.526303999999999,5.899658466666666],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":69},"id":599,"isDrum":false,"span":[5.921039999999999,6.294394466666666],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":62},"id":600,"isDrum":false,"span":[6.315775999999999,6.689130466666666],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":71},"id":601,"isDrum":false,"span":[6.710511999999999,7.083866466666666],"voiceIndex":1,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":67},"id":602,"isDrum":false,"span":[7.105247999999999,7.478602466666666],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":71},"id":603,"isDrum":false,"span":[7.499983999999999,7.873338466666665],"voiceIndex":1,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":61},"id":604,"isDrum":false,"span":[7.894719999999999,8.268074466666665],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":69},"id":605,"isDrum":false,"span":[8.289455999999998,8.662810466666667],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":66},"id":606,"isDrum":false,"span":[8.684192,9.057546466666667],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":61},"id":607,"isDrum":false,"span":[9.078928,9.452282466666668],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":59},"id":608,"isDrum":false,"span":[9.473664000000001,9.847018466666666],"voiceIndex":1,"color":"noteColor_9_colors","isActive":true},{"note":{"midiNumber":62},"id":609,"isDrum":false,"span":[9.8684,10.241754466666665],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":67},"id":610,"isDrum":false,"span":[10.263136,10.636490466666666],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":62},"id":611,"isDrum":false,"span":[10.657872,11.031226466666665],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":61},"id":612,"isDrum":false,"span":[11.052607999999998,11.425962466666665],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true},{"note":{"midiNumber":64},"id":613,"isDrum":false,"span":[11.447343999999998,11.820698466666665],"voiceIndex":1,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":61},"id":614,"isDrum":false,"span":[11.842079999999997,12.590433666666664],"voiceIndex":1,"color":"noteColor_11_colors","isActive":true}]]',
  "iv in major":
    '[[{"note":{"midiNumber":88},"id":30,"isDrum":false,"span":[4.285716000000001,4.624257802083333],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":81},"id":31,"isDrum":false,"span":[4.285716000000001,4.624257802083333],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":85},"id":32,"isDrum":false,"span":[4.285716000000001,4.624257802083333],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":73},"id":33,"isDrum":false,"span":[4.6428590000000005,4.811757877083333],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":69},"id":34,"isDrum":false,"span":[4.8214305,4.9903293770833335],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":71},"id":35,"isDrum":false,"span":[5.000002,5.168900877083334],"voiceIndex":0,"color":"noteColor_2_colors","isActive":true},{"note":{"midiNumber":73},"id":36,"isDrum":false,"span":[5.178573500000001,5.347472377083333],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":76},"id":37,"isDrum":false,"span":[5.357145,5.5260438770833336],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":74},"id":38,"isDrum":false,"span":[5.5357165,5.704615377083334],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":76},"id":39,"isDrum":false,"span":[5.714288000000001,5.883186877083333],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":73},"id":40,"isDrum":false,"span":[5.8928595,6.401044227083334],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":77},"id":41,"isDrum":false,"span":[6.428574,6.7671158020833335],"voiceIndex":0,"color":"noteColor_8_colors","isActive":true},{"note":{"midiNumber":69},"id":42,"isDrum":false,"span":[6.428574,6.7671158020833335],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":74},"id":43,"isDrum":false,"span":[6.428574,6.7671158020833335],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":77},"id":44,"isDrum":false,"span":[6.785717000000001,6.9546158770833335],"voiceIndex":0,"color":"noteColor_8_colors","isActive":true},{"note":{"midiNumber":69},"id":45,"isDrum":false,"span":[6.785717000000001,6.9546158770833335],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":74},"id":46,"isDrum":false,"span":[6.9642885,7.133187377083334],"voiceIndex":0,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":76},"id":47,"isDrum":false,"span":[7.142860000000001,7.311758877083333],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":77},"id":48,"isDrum":false,"span":[7.321431500000001,7.490330377083334],"voiceIndex":0,"color":"noteColor_8_colors","isActive":true},{"note":{"midiNumber":76},"id":49,"isDrum":false,"span":[7.500003,8.008187727083333],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":69},"id":50,"isDrum":false,"span":[7.500003,8.008187727083333],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":73},"id":51,"isDrum":false,"span":[7.500003,8.008187727083333],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":73},"id":52,"isDrum":false,"span":[8.0357175,8.543902227083334],"voiceIndex":0,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":64},"id":53,"isDrum":false,"span":[8.0357175,8.543902227083334],"voiceIndex":0,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":69},"id":54,"isDrum":false,"span":[8.0357175,8.543902227083334],"voiceIndex":0,"color":"noteColor_0_colors","isActive":true}],[{"note":{"midiNumber":33},"id":445,"isDrum":false,"span":[4.285716000000001,4.793900727083334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":45},"id":446,"isDrum":false,"span":[4.285716000000001,4.793900727083334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":57},"id":447,"isDrum":false,"span":[4.8214305,5.329615227083334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":448,"isDrum":false,"span":[4.8214305,5.329615227083334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":61},"id":449,"isDrum":false,"span":[5.357145,5.865329727083334],"voiceIndex":1,"color":"noteColor_4_colors","isActive":true},{"note":{"midiNumber":69},"id":450,"isDrum":false,"span":[5.357145,5.865329727083334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":57},"id":451,"isDrum":false,"span":[5.8928595,6.061758377083334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":452,"isDrum":false,"span":[5.8928595,6.061758377083334],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":57},"id":453,"isDrum":false,"span":[6.0714310000000005,6.240329877083333],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":454,"isDrum":false,"span":[6.0714310000000005,6.240329877083333],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":57},"id":455,"isDrum":false,"span":[6.250002500000001,6.418901377083333],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":64},"id":456,"isDrum":false,"span":[6.250002500000001,6.418901377083333],"voiceIndex":1,"color":"noteColor_7_colors","isActive":true},{"note":{"midiNumber":50},"id":457,"isDrum":false,"span":[6.428574,6.936758727083333],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":62},"id":458,"isDrum":false,"span":[6.428574,6.936758727083333],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":62},"id":459,"isDrum":false,"span":[6.9642885,7.472473227083333],"voiceIndex":1,"color":"noteColor_5_colors","isActive":true},{"note":{"midiNumber":45},"id":460,"isDrum":false,"span":[7.500003,8.008187727083333],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":57},"id":461,"isDrum":false,"span":[7.500003,8.008187727083333],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":33},"id":462,"isDrum":false,"span":[8.0357175,8.543902227083334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true},{"note":{"midiNumber":45},"id":463,"isDrum":false,"span":[8.0357175,8.543902227083334],"voiceIndex":1,"color":"noteColor_0_colors","isActive":true}]]',
};

const topicToFrozenNotes: { [key: string]: ColoredNote[][] } =
  Object.fromEntries(
    Object.entries(topicToFrozenStrings).map(([key, value]) => [
      key,
      JSON.parse(value),
    ]),
  );

const PathView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);

  const handleChapterSelect = (index: number) => {
    setActiveChapter(index);
  };

  const measureWidth = 100;
  const midiNumberToY = (midiNumber: number) => (127 - midiNumber) * 4;
  const scale = 0.5; // Define scale factor

  return (
    <PathContainer>
      <ChapterColumn>
        {path.map((chapter, index) => (
          <ChapterButton
            key={chapter.chapter}
            active={index === activeChapter}
            onClick={() => handleChapterSelect(index)}
            onMouseEnter={() => handleChapterSelect(index)}
          >
            {chapter.chapter}
          </ChapterButton>
        ))}
      </ChapterColumn>
      <ContentArea>
        {path[activeChapter].topics.map((topic) => (
          <TopicCard key={topic.topic}>
            <TopicTitle>{topic.topic}</TopicTitle>
            {topicToFrozenNotes[topic.topic] && (
              <MiniNotesDisplay>
                <FrozenNotes
                  notes={topicToFrozenNotes[topic.topic]}
                  measureWidth={measureWidth}
                  midiNumberToY={midiNumberToY}
                  scale={scale} // Pass scale to FrozenNotes
                  maxWidth={20 * 16} // 20em * 16px (assuming 1em = 16px)
                />
              </MiniNotesDisplay>
            )}
            {topic.midis.map((midi, index) => (
              <MidiLink
                key={index}
                href={`/f/${midi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {midi.replace(/---/g, " – ").replace(/-/g, " ")}
              </MidiLink>
            ))}
          </TopicCard>
        ))}
      </ContentArea>
    </PathContainer>
  );
};

export default PathView;
