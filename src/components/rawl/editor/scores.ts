export const scores: { [key: string]: string } = {
  new: `% Hello, world!
% This is a sample code: feel free to erase it or comment it out.
% Currently there's a bug: notes only show up if there are
% at least two measures of music written.

C major
4/4
bpm 120

lh  % notes below are put in the left hand, which sounds softer than the right hand
1 i 1,. qet,. qet,  % each note or chord is pitch(es)+duration
2 c 1 3 4 0  % this copies notes from measure 1 applying scale-wise shifts to 3, 4 and 0 scale degrees

rh
1 i x-q-w,e-r,t,
2 c 1 1 2  % this copies notes only in the right hand
4 i x,a_.

5 ac 1-4`,
  schubert_d365_09: `Ab major
3/4
bpm 160
sections 2 6

lh
2   i 5,wtu,wtu,
3   c 2     0 x x 0
7   c 6-6b3
7b3 i rtu,
18  i 5,rtu,rtu,
19  c 18    0 x x 0 0

4   i 5,eti,eti,
5   c 4
8   i q,
8b2 c 4b2
9   i q,eti-
20  c 8     0 0 x x 0
25  c 9


rh
1b2 i x-8'9'8=7-8-
2   i w,4,4,
3   i 4_6-5-
4   i 4,3,5-8-5,.
5   c 1
6   i e-w-4,4,
7   i 4,.r-e-w-
8   i w,q,3-5-3,.

17b2 i x-5-b5-5-
18   i 6,2,2,
19   i w,.q-7-6-
20   i 5,e,3,q,.
21b2 c 17b2-20b3 7
24b3 i e-t-i,.


9    ac 1-9
25b2 ac 17b2-25
`,
  "wima.e480-schubert_de.-tanz-d.365.25": `3/4
E major
bpm 160
sections 2 6

lh
2   i 5,rtu,rtu, q,eti,eti,
4   c 2-3 0 0
8   c 2
9   i qeti_
18  c 2-9


rh
1b3  i e,
2    i 7-y-r-w-
3    i q-i-t-e-
4    i t-f-s-u-
5    i q_
5    c 1-5

17b3 i e,
18   i y-7-w-r-
19   i a-q-e-t-
20   i s-t-u-o-
21   i d,
21   c 17-20
25   i a,


ch2
2b3 i 5'6'5-.
3   c 2     0 2 x 2 3 2
18  c 2     11 12 14
22  c 18-21 0 0 0 


9    ac 1-9
25b3 ac 17b3-25
`,
  "wima.1124-schubert_de.-tanz-d.365.26": `3/4
E major
bpm 180
sections 2 6

lh
2   i 5,rtu,rtu,
3   i q,eti,eti,
4   c 2       0 x 0 x 0
5   c 3       0 x 0
9   i qeti_
18  c 2-9


rh
1b3 i 5=t-. 
2   i bw=w-.5-,e=r-.
3   i 7=8-.5,e'r'e-.
4   i 7-w-r-y-o-u-
5   i t=g-.d-
5   c 1-4
9   i a_

17b3 i t,
18   i   4-6-9-7-5-
19   i   q-e-y-t-e-
20   c 18      7
21   i a=k=g-d-a-t-
22   c 18-20b3
24b3 i t=g-.a,


9b3  ac 1b3-9
25b3 ac 17b3-25`,
  "wima.4be9-schubert_de.-tanz-d.365.28": `A major
bpm 160
3/4
sections 2 6

lh
2 i x,et,et, x,rt,rt, x,et,et, x,rt,rt, x,wrt,wrt, x,et,e, x,wr,wr, qe,
2 i q_.      w_.      q_.      w_.      5_.        q_.     5_.      
18 c 6    0 0 x x 0
20 c 4        0 0 x 0 
24 c 8-9

rh 4
8b2  i 7-:w-:r-:
18   c 8        2 9 x x 9 8 0
20b2 i e-:t-:i-:
21   c 20 7
17b3 i q, 7,x,7-x- x_7-x- q,x,q-x- x_a-x- u,x,u-x- t,x,t-x- 5,x,5,q,

1b3 i t'y't-. q,t-a-q, 7_
3   c 1-3
5b3 i t'y't-. 7,r-s-7, q,e-a-5_x,5,q,


9    ac 1-9
25b2 ac 17b2-25
`,
  "idea-22---gibran-alcocer": `3/4
C minor

lh
99 i 7wr_.
100 c 99 0 0

1   i 6,yad,
1b3 c 1b2-1b3 0 0 0 0
3   i q,tip,
3b3 c 3b2-3b3 0 0 0 0
5   c 1-4

9   c 1 -2 x x 0
10  c 3 0 -1
13  c 9-12
17  c 16b2-16b3 0 0 0
18  i yip_.

19  c 9 2 0
21  c 10-11
23  c 19-22 0 0 0
35  c 34b2-34b3 0 0 0
36  i ruo_.

37  c 19
38  c 19b1-19b2 7
38b2 c 37b2-37b3 0 0
39  c 21
40  i t,
40b2 c 39b2-39b3 0 0
41  c 37-40 0 0
49  c 37-39
52  i t_.

53  c 9-18

64  c 19-35

81  c 19-34`,
  "idea-n.10---gibran-alcocer": `G minor
bpm 170
3/4
sections 2 6 10 14 18 22 26
phrases 1+1 18+2 36+2 54+2 72+2 90+2 116+2


rh 4
16 i a_.s_.

lh 2
2 i r,fh,fh, a,fh,fh,
4 i q,dg,dg, a,dg,gd,
6 i 7,sg,sg, 7,sg,sg,
8 c 4-5 -2

10 c 2-8
17 i y,af,af, y,gd,dg-x-dg_.

74 c 2-3
76 i 7,sf,sf, u,sf,sf,
78 i q,dg,dg, e,dg,dg,

80 c 8-9
82 c 74-79
88 ac 16-19

92 c 2-9 0 0

108 i afh+. adg+. usf+.

114 i 6qe+.

20 ac 2-19 0 0 0


rh 4
18 i d+.
36 i d+.
54 i d+.
90 i d+.
72 i d+x,a-d-

1 i x,.q-q-e-r-e-r_.
3 i x,.q-q-w-e-w-e_. 
5 i x,.q-q-e-w_x-q-q,q,.7-q+
9 i x,.q-q-e-r-e-r_
11 i x-t-r-e-q-w-e-w-e_.
13 i x,e-e-e-r-w_x-q-w-q_7-

38 i y_.x-t=y= t-r-e-r-t+x,e, w_t+ q_.x-q-w-e-r-t-
46 c 38-40
49b3 i t,u_s_d_

74 i f_.x-g-f-d-s-a-s+s-s-s-s-d_.s_.a+x-a-a-d-
82 c 74-77
86 i d_.f_g,

20 i f-a-y- f-a-y- f-a-y-
22 i d-s-t- d-s-t- d-s-t- d-s-a-
24 i s-u-t- s-u-t- s-u-t- 
28 c 20-25
33b2 i x-u-s-g-

92 c 20-33

21b2 i x-f-d-s-
25b2 i x-s-a-u-
29b2 i x-g-d-s-

56 c 20-33
108 c 56-61

26 i a+x-t-a-s-

62 i a_. x-s=d=s-a-s-d-
98 c 62-63

ch2 4
93b2 i x-f=g=f-d-
97 c 93 -3
101 c 93

106 i a+.
114 i a_.s_.d+.
`,
  "idea-20---gibran-alcocer": `C minor
3/4
bpm 170

phrases 9+2 43+2 69+2
sections 3 7 11 15 17 21 25

lh
1 i 6,yi,yi,e,yi,yi
3 i 4,yi,yi,r,yi,yi,
5 c 1-2 2 1
9 i t#u+.

11 c 1-2
13 c 5-6
15 c 7-8
17 c 3-4

rh
1 i q+x,q,r+t-y-t--r-e+r,e,w_.e_.r+.
11 i e-q-6- r-q-6- t-q-6- u-q-6-
13 i e-q-5- r-q-5- t-q-5- u-q-5-
15 i w-7-4-w-7-4-w-7-e-7-w-7-q-6-4-q-6-4-
18 c 17

19 ac 11-18

lh
27 c 1-4
31 i 5,us,us,t,us,us, 5,#us,#us, t,#us,#us,

rh
27 i t-e-q- y-e-q-
28 c 27 0 0 0
31 i t-w-7-t-w-7- 
32 c 31
33 i t-w-#7-t-w-#7-
34 c 33
42 i tw#7_.

35 ac 27-33

lh
42 c 34 0 0 0
45 c 11-14 0 x 0
49 c 31-34
57 c 39-40
59 i usg+.

61 ac 35-44
87 ac 11-18
95 ac 23-42`,
  "idea-15---gibran-alcocer": `3/4
bpm 170
Db minor

phrases 1+1 18+2 36+2 54+2 72+2 90+2 108+2
sections 2 6 10 14 18 22

lh
2 i 4r,ry,ry,q,ry,ry,
4 c 2-3 2 4 3
10 c 2-9
18 i uo+.
20 c 2-19 0 0 0 0
92 i h-d-a-h-d-a-
93 c 92 0 0 0
96 i g-d-a-g-d-a- g-d-a-g-d-a- f-s-u-f-s-u- g-s-u-g-s-u-
100 c 92-99

lh 4
108 i sh_.tg_.

rh
16 i w_.e_.y_.t_.
38 c 2-19 0 x 0
1 i x,x-8-8-7-6+ x-q-q-w-e+ x,.q-t,t,t,t,e,e-w+ 
9 i x,x-w-e-w-6+x-6-6-7-q_.t,. x-r-r-t_e_r_

20 i y-e-q- y-e-q- u-e-q- y-e-q-
22 c 20-21
24 i t-e-q- t-e-q-
25 c 21
26 c 24 -1
27 c 22 -1
28 c 20-27
36 i y_.t_.
56 c 20-37

38 i q_.y_t,
40 c 38-39
42 i e_e,e_r,w_w,w,e,w,6_.
47 c 39-43
92 c 38-55 7

74 i e,q,r,q,t,q
76 c 74-75 
86 i e,q,r,q,y,e,
78b2 i u,u,u,y,t-r,x-e,.
80b3 i x-e-y-t-r,e,q_
82b3 i x-e-y-t-r,e-e-r_
84b3 i x-e-y-t-r,e,
`,
  "der-flohwalzer": `4/4
Gb major
lh 3
60 i 1_
rh 3
1b4 i y-t-
2 c 1 0 0 x 0 
6 c 2-5
21 c 1
22 c 18-21
42 c 2-17
`,

  Gravity_Falls_Opening: `D minor
lh

1 i 1+3+5+5_5_
1 c 1-4 7
5 i 1-5-q-5-e-q-5-q-

7 c 5 2 2 5 5
11 c 5-5b4 6
11b4 i r-7-7-w-t-w-u-t-w-5-
13 i 1-5-q-5-
13b3 c 13-13b3 0 0 x 2 2 2 2 5 5 5 5 6 x 4 4 0 x 2 2 5 5 6 6 4 4

rh
1 i e-q-5-q-x_ e-7-5-7-x_ w-7-5-7-
1b3 c 1-3
4 c 3-3b3
4b3 i w,t,q_.w,e+t_r,t,7+q_x,w,e_w_r_t_r_e_

13b2 i e,e,e,t,t,r,e,x,t,t,t,r,t,r,e,
17 c 13-15
21 c 13-14
23b2 i y,y,y,r_u_t_u_

5 c 5-25 -7
27 i aq+`,
  "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano": `C minor
3/4

lh 2
1 i q,x_5,x_
3 c 1-2 0 0 0 0
11 i w,x_5,x_
13 c 11-12 0 0 0



1 c 1-77 7
221 i 1q


rh 4
5 i t_.e_w,q+q,w,e,q,e,t_y,t_.r_.
13 c 5-6 -1 x x x 0 x -1

ch2 3
1b2 i qet,
1b3 c 1b2-1b3
2 c 1 0 0 0

Eb major
rh 4 
79 i q_.q_.q,7,6,5,
95 c 79-82 2 1`,

  chopsticks: `C major
bpm 184
3/4

lh
1 i t,us,us,
3 i t,da,da,
4 c 3
2 c 1 0 x x 0 0 -4 -4
9 c 1-7
16 i q,
17 c 5-8 0 0 0 
29 c 13-16
49 i t,usf,usf,
50 c 49
51 i q,tad,tad,
52 c 51
53 c 49-52 0 0 
61 c 49-51
64 i q,
33 c 17-32 0 x 0

rh
16b3 i d,s,x,a,u,x,y,t,x+t,r,
22b3 i r,e,
16 c 16-23 -2
24 c 16-21
48 c 16-32
51b2 i t=y-:u=i-:s=d-:f=g


`,
  "the-two-happy-coons---theodore-h.-northrup-1891": `G major

rh
3 i 7,q,w,e
3 c 3 2&5



lh 2
5 i q,tad,q,yaf,
6 c 5
7 c 5-5b3


C major
93 i a


`,

  "passacaglia---handel-halvorsen": `A minor
lh
1 i 1-q-t-e-a-e-t-e-
2 c 1 0 0 3 -1 2 -2 -4 -3 0
11 c 3-10 0 0 0 0 0 0 0
74 i qa+
rh
3 i 3-e-w-e-q-e-7-e-6-e-5-e-4-e-3-e-
5 c 3-4 -1 -2
19 c 3-8 7`,
  "boogie-woogie-jump---pete-johnson": `F major
bpm 200
F major

lh


13 i 1-q-3-e-5-t-3-e-
14 c 13 3 0 0 3 3 0 0 4 4 0 0
5 c 17-24
25 c 13-23
41 c 5-35
77 c 41-60
97 c 85-96 0 0 0
133 c 13-23


rh
9b3 i x-a-s-bd- a-s-u-i-t-bt-r-be- e-t-y-i-by-r-w-be- eti-
25 c 1-12 0 0 0 0 0 0 0 0 0 0
3 i bj-:j-:k-:
3b2 c 3-3b2 0 0 0 0 0 0 0 0 0 0 0
13 i  etyi- x_  etyi,
14 i betyi- x_ betyi,
15 c 13 0 0 x x 0 0 
17 c 14 0 0
21 i rtuo-
22 c 5-5b3
22b3 i r-:bt-:t-: be-:e-:r-:
23 i q-bey-et-q-bebt-5-wr-5-qe-5-
6 c 22-23
  

145 ac 1-8
  
  `,
};
