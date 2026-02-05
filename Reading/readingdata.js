const READINGS_DATA = [
  {
    "code": 1010,
    "year": "A",
    "reading1": "Is 2,1-5",
    "psalm": "Tv 122,1-2.3-4.45.6-7.8-9",
    "gospel": "Mt 24,37-44",
    "reading2": "Rm 13,11-14"
  },
  {
    "code": 1010,
    "year": "B",
    "reading1": "Is 63,16-17.19;  64,2-7",
    "psalm": "Tv 80,2-3.15-16.18-19",
    "gospel": "Mc 13,33-37",
    "reading2": "1 Cr 1,3-9"
  },
  {
    "code": 1010,
    "year": "C",
    "reading1": "Hc 33,14-16",
    "psalm": "Tv 25,4-5.8-9.10.14",
    "gospel": "Lc 21,25-28.34-36",
    "reading2": "1 Tx  3,12-13; 4,2"
  },
  {
    "code": 1011,
    "year": "0",
    "reading1": "Is 2,1-5 (hat Is 4,2-6)",
    "psalm": "Tv 122,1-2.3-4.4-5.6-7.8-9",
    "gospel": "Mt 8,5-11"
  },
  {
    "code": 1012,
    "year": "0",
    "reading1": "Is 11,1-10",
    "psalm": "Tv 72,1.7-8.12-13.17",
    "gospel": "Lc 10,21-24"
  },
  {
    "code": 1013,
    "year": "0",
    "reading1": "Is 25,6-10",
    "psalm": "Tv 23,1-3.3-4.5.6",
    "gospel": "Mt 15,29-37"
  },
  {
    "code": 1014,
    "year": "0",
    "reading1": "Is 26,1-6",
    "psalm": "Tv 118,1.8-9.19-21.25-27",
    "gospel": "Mt 7,21.24-27"
  },
  {
    "code": 1015,
    "year": "0",
    "reading1": "Is 29,17-24",
    "psalm": "Tv 27,1.4.13-14",
    "gospel": "Mt 9,27-31"
  },
  {
    "code": 1016,
    "year": "0",
    "reading1": "Is 30,19-21.23-26",
    "psalm": "Tv 147,1-2.3-4.5-6",
    "gospel": "Mt 9,35; 10,1.6-8"
  },
  {
    "code": 1020,
    "year": "A",
    "reading1": "Is 11,1-10",
    "psalm": "Tv 72,1-2.7-8.12-13.17",
    "gospel": "Mt 3,1-12",
    "reading2": "Rm 15,4-9"
  },
  {
    "code": 1020,
    "year": "B",
    "reading1": "Is 40,1-5.9-11",
    "psalm": "Tv 85,9-10.11-12.13-14",
    "gospel": "Mc 1,1-8",
    "reading2": "2 Pr 3,8-14"
  },
  {
    "code": 1020,
    "year": "C",
    "reading1": "Br 5,1-9",
    "psalm": "Tv 126,1-2.23.4-5.6",
    "gospel": "Lc 3,1-6",
    "reading2": "Pl 1,4-6.8-11"
  },
  {
    "code": 1021,
    "year": "0",
    "reading1": "Is 35,1-10",
    "psalm": "Tv 85,9-10.11-12.13-14",
    "gospel": "Lc 5,17-26"
  },
  {
    "code": 1022,
    "year": "0",
    "reading1": "Is 40,1-11",
    "psalm": "Tv 96,1-2.3.10.11-12.13",
    "gospel": "Mt 18,12-14"
  },
  {
    "code": 1023,
    "year": "0",
    "reading1": "Is 40,25-31",
    "psalm": "Tv 103,1-2.3-4.8.10",
    "gospel": "Mt 11,28-30"
  },
  {
    "code": 1024,
    "year": "0",
    "reading1": "Is 41,13-20",
    "psalm": "Tv 145,1.9.10-11.12-13",
    "gospel": "Mt 11,11-15"
  },
  {
    "code": 1025,
    "year": "0",
    "reading1": "Is 48,17-19",
    "psalm": "Tv 1,1-2.3.4.6",
    "gospel": "Mt 11,16-19"
  },
  {
    "code": 1026,
    "year": "0",
    "reading1": "Hc 48,1-4.9-11",
    "psalm": "Tv 80,2-3.15-16.18-19",
    "gospel": "Mt 17,10-13"
  },
  {
    "code": 1030,
    "year": "A",
    "reading1": "Is 35,1-6.10",
    "psalm": "Tv 146,6-7.8-9.9-10",
    "gospel": "Mt 11,2-11",
    "reading2": "Gc 5,7-10"
  },
  {
    "code": 1030,
    "year": "B",
    "reading1": "Is 61,1-2.10-11",
    "psalm": "Lc 1,46-48.49-50.53-54",
    "gospel": "Ga 1,6-8.19-28",
    "reading2": "1 Tx  5,16-24"
  },
  {
    "code": 1030,
    "year": "C",
    "reading1": "Xp 3,14-18",
    "psalm": "Is 12,2-3.4.5-6",
    "gospel": "Lc 3,10-18",
    "reading2": "Pl 4,4-7"
  },
  {
    "code": 1031,
    "year": "0",
    "reading1": "Ds 24,2-7.15-17",
    "psalm": "Tv 25,4-5.6-7.8-9",
    "gospel": "Mt 21,23-27"
  },
  {
    "code": 1032,
    "year": "0",
    "reading1": "Xp 3,1-2.9-13",
    "psalm": "Tv 34,2-3.6-8.17-18.19.23",
    "gospel": "Mt 21,28-32"
  },
  {
    "code": 1033,
    "year": "0",
    "reading1": "Is 45,6-8.18.21-25",
    "psalm": "Tv 85,9-10.11-12.13-14",
    "gospel": "Lc 7,18-23"
  },
  {
    "code": 1034,
    "year": "0",
    "reading1": "Is 54,1-10",
    "psalm": "Tv 30,2.4.5-6.11-12.13",
    "gospel": "Lc 7,24-30"
  },
  {
    "code": 1035,
    "year": "0",
    "reading1": "Is 56,1-3.6-8",
    "psalm": "Tv 67,2-3.5.7-8",
    "gospel": "Ga 5,33-36"
  },
  {
    "code": 1040,
    "year": "A",
    "reading1": "Is 7,10-14",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Mt 1,18-24",
    "reading2": "Rm 1,1-7"
  },
  {
    "code": 1040,
    "year": "B",
    "reading1": "2 Sm 7,1-5.8-12.14.16",
    "psalm": "Tv 89,2-3.4-5.27.29",
    "gospel": "Lc 1,26-38",
    "reading2": "Rm 16,25-27"
  },
  {
    "code": 1040,
    "year": "C",
    "reading1": "Mk 5,1-4",
    "psalm": "Tv 80,2-3.15-16.18-19",
    "gospel": "Lc 1,39-45",
    "reading2": "Dt 10,5-10"
  },
  {
    "code": 2003,
    "year": "0",
    "reading1": "1 Ga 4,11-18",
    "psalm": "Tv 72,1-2.10.12-13",
    "gospel": "Mc 6,45-52"
  },
  {
    "code": 2010,
    "year": "A",
    "reading1": "Hc 3,3-7.14-17",
    "psalm": "Tv 128,1-2.3.4-5",
    "gospel": "Mt 2,13-15.19-23",
    "reading2": "Cl 3,12-21; 3,12-17"
  },
  {
    "code": 2010,
    "year": "B",
    "reading1": "St 15,1-6; 21,1-3",
    "psalm": "Tv 105,1-2.3-4.5-6.8-9",
    "gospel": "Lc 2,22-40 (hay Lc 2,22.39-40)",
    "reading2": "Dt 11,8.11-12.17-19"
  },
  {
    "code": 2010,
    "year": "C",
    "reading1": "1 Sm 1,20-22.24-28",
    "psalm": "Tv 84,2-3.5-6.9-10",
    "gospel": "Lc 2,41-52",
    "reading2": "1 Ga 3,1-2.21-24"
  },
  {
    "code": 2030,
    "year": "0",
    "reading1": "Is 60,1-6; Ep 3,2-3.5-6",
    "psalm": "Tv 72,1-2.7-8.10-11.12-13",
    "gospel": "Mt 2,1-12"
  },
  {
    "code": 3010,
    "year": "A",
    "reading1": "St 2,7-9; 3,1-7",
    "psalm": "Tv 51,3-4.5-6.12-13.14.17",
    "gospel": "Mt 4,1-11",
    "reading2": "Rm 5,12-19; 5,12.17-19"
  },
  {
    "code": 3010,
    "year": "B",
    "reading1": "St 9,8-15",
    "psalm": "Tv 25,4-5.6-7.8-9",
    "gospel": "Mc 1,12-15",
    "reading2": "1 Pr 3,18-22"
  },
  {
    "code": 3010,
    "year": "C",
    "reading1": "Đnl 26,4-10",
    "psalm": "Tv 91,1-2.10-11.12-13.14-15",
    "gospel": "Lc 4,1-13",
    "reading2": "Rm 10,8-13"
  },
  {
    "code": 3011,
    "year": "0",
    "reading1": "Lv 19,1-2.11-18",
    "psalm": "Tv 19,8.9.10.15",
    "gospel": "Mt 25,31-46"
  },
  {
    "code": 3012,
    "year": "0",
    "reading1": "Is 55,10-11",
    "psalm": "Tv 34,4-5.6-7.16-17.18-19",
    "gospel": "Mt 6,7-15"
  },
  {
    "code": 3013,
    "year": "0",
    "reading1": "Gn 3,1-10",
    "psalm": "Tv 51,3-4.12-13.18-19",
    "gospel": "Lc 11,29-32"
  },
  {
    "code": 3014,
    "year": "0",
    "reading1": "Et 9,12.14-16.23-25",
    "psalm": "Tv 138,1-2.2-3.7-8",
    "gospel": "Mt 7,7-12"
  },
  {
    "code": 3015,
    "year": "0",
    "reading1": "Ed 18,21-28",
    "psalm": "Tv 130,1-2.3-4.4-6.7-8",
    "gospel": "Mt 5,20-26"
  },
  {
    "code": 3016,
    "year": "0",
    "reading1": "Đnl 26,16-19",
    "psalm": "Tv 119,1-2.4-5.7-8",
    "gospel": "Mt 5,43-48"
  },
  {
    "code": 3020,
    "year": "A",
    "reading1": "St 12,1-4",
    "psalm": "Tv 33,4-5.18-19.20.22",
    "gospel": "Mt 17,1-9",
    "reading2": "2 Tm 1,8-10"
  },
  {
    "code": 3020,
    "year": "B",
    "reading1": "St 22,1-2.9.10-13.15-18",
    "psalm": "Tv 116,10.15.16-17.18-19",
    "gospel": "Mc 9,2-10",
    "reading2": "Rm 8,31-34"
  },
  {
    "code": 3020,
    "year": "C",
    "reading1": "St 15,5-12.17-18",
    "psalm": "Tv 27,1.7-8.89.13-14",
    "gospel": "Lc 9,28-36",
    "reading2": "Pl 3,17-21; 4,1 ( hay Pl 3,20-21; 4,1)"
  },
  {
    "code": 3021,
    "year": "0",
    "reading1": "Đn 9,4-10",
    "psalm": "Tv 79,8.9.11.13",
    "gospel": "Lc 6,36-38"
  },
  {
    "code": 3022,
    "year": "0",
    "reading1": "Is 1,10.16-20",
    "psalm": "Tv 50,8-9.16-17.21.23",
    "gospel": "Mt 23,1-12"
  },
  {
    "code": 3023,
    "year": "0",
    "reading1": "Hc 18,18-20",
    "psalm": "Tv 31,5-6.14.15-16",
    "gospel": "Mt 20,17-28"
  },
  {
    "code": 3024,
    "year": "0",
    "reading1": "Hc 17,5-10",
    "psalm": "Tv 1,1-2.3.4.6",
    "gospel": "Lc 16,19-31"
  },
  {
    "code": 3025,
    "year": "0",
    "reading1": "St 37,3-4.12-13.17-28",
    "psalm": "Tv 105,16-17.18-19.20-21",
    "gospel": "Mt 21,33-43.45-46"
  },
  {
    "code": 3026,
    "year": "0",
    "reading1": "Mk 7,14-15.18-20",
    "psalm": "Tv 103,1-2.3-4.9-10.11-12",
    "gospel": "Lc 15,1-3.11-32"
  },
  {
    "code": 3030,
    "year": "A",
    "reading1": "Xh 17,3-7",
    "psalm": "Tv 95,1-2.6-7.8-9",
    "gospel": "Ga 4,5-42 ( hay Ga 4,5-15.19-26.39.40-42)",
    "reading2": "Rm 5,1-2.5-8"
  },
  {
    "code": 3030,
    "year": "B",
    "reading1": "Xh 20,1-17; 20,1-3.7-8.12-17",
    "psalm": "Tv 19,8.9.10.11",
    "gospel": "Ga 2,13-25",
    "reading2": "1 Cr 1,22-25"
  },
  {
    "code": 3030,
    "year": "C",
    "reading1": "Xh 3,1-8.13-15",
    "psalm": "Tv 103,1-2.3-4.6-7.8.11",
    "gospel": "Lc 13,1-9",
    "reading2": "1 Cr 10,1-6.10-12"
  },
  {
    "code": 3031,
    "year": "0",
    "reading1": "2 V 5,1-15",
    "psalm": "Tv 42,2-3; 43,3-4",
    "gospel": "Lc 4,24-30"
  },
  {
    "code": 3032,
    "year": "0",
    "reading1": "Đn 3,25.34-43",
    "psalm": "Tv 25,4-5.6-7.8-9",
    "gospel": "Mt 18,21-35"
  },
  {
    "code": 3033,
    "year": "0",
    "reading1": "Đnl 4,1.5-9",
    "psalm": "Tv 147,12-13.15-16.19-20",
    "gospel": "Mt 5,17-19"
  },
  {
    "code": 3034,
    "year": "0",
    "reading1": "Hc 7,23-28",
    "psalm": "Tv 95,1-2.6-7.8-9",
    "gospel": "Lc 11,14-23"
  },
  {
    "code": 3035,
    "year": "0",
    "reading1": "Hs 14,2-10",
    "psalm": "Tv 81,6-8.8-9.10-11.14.17",
    "gospel": "Mc 12,28-34"
  },
  {
    "code": 3036,
    "year": "0",
    "reading1": "Hs 6,1-6",
    "psalm": "Tv 51,3-4.18-19.20-21",
    "gospel": "Lc 18,9-14"
  },
  {
    "code": 3037,
    "year": "0",
    "reading1": "Xh 17,1-7",
    "psalm": "Tv 95,1-2.6-7.8-9",
    "gospel": "Ga 4,5-42"
  },
  {
    "code": 3040,
    "year": "A",
    "reading1": "1 Sm 16,1.6-7.10-13",
    "psalm": "Tv 23,1-3.34.5.6",
    "gospel": "Ga 9,1-41 (hay Ga 9,1.6-9.13-17.34-38)",
    "reading2": "Ep 5,8-14"
  },
  {
    "code": 3040,
    "year": "B",
    "reading1": "2 Sb36,14-16.19-23",
    "psalm": "Tv 137,1-2.3.4-5.6",
    "gospel": "Ga 3,14-21",
    "reading2": "Ep 2,4-10"
  },
  {
    "code": 3040,
    "year": "C",
    "reading1": "Gs 5,9.10-12",
    "psalm": "Tv 34,2-3.4-5.6-7",
    "gospel": "Lc 15,1-3.11-32",
    "reading2": "2 Cr 5,17-21"
  },
  {
    "code": 3041,
    "year": "0",
    "reading1": "Is 65,17-21",
    "psalm": "Tv 30,2.4.5-6.11-13",
    "gospel": "Ga 4,43-54"
  },
  {
    "code": 3042,
    "year": "0",
    "reading1": "Ed 47,1-9.12",
    "psalm": "Tv 46,2-3.5-6.8-9",
    "gospel": "Ga 5,1-3.5-16"
  },
  {
    "code": 3043,
    "year": "0",
    "reading1": "Is 49,8-15",
    "psalm": "Tv 145,8-9.13-14.17-18",
    "gospel": "Ga 5,17-30"
  },
  {
    "code": 3044,
    "year": "0",
    "reading1": "Xh 32,7-14",
    "psalm": "Tv 106,19-20.21-22.23",
    "gospel": "Ga 5,31-47"
  },
  {
    "code": 3045,
    "year": "0",
    "reading1": "Kn 2,1.12-22",
    "psalm": "Tv 34,17-18.19-20.21.23",
    "gospel": "Ga 7,1-2.10.25-30"
  },
  {
    "code": 3046,
    "year": "0",
    "reading1": "Hc 11,18-20",
    "psalm": "Tv 7,2-3.9-10.11-12",
    "gospel": "Ga 7,40-53"
  },
  {
    "code": 3047,
    "year": "0",
    "reading1": "Mk 7,7-9",
    "psalm": "Tv 27,1.7-8.8-9.13-14",
    "gospel": "Ga 9,1-41"
  },
  {
    "code": 3050,
    "year": "A",
    "reading1": "Ed 37,12-14",
    "psalm": "Tv 130,1-2.3-4.5-6.7-8",
    "gospel": "Ga 11,1-45; 3-7.17.20-27.33-45",
    "reading2": "Rm 8,8-11"
  },
  {
    "code": 3050,
    "year": "B",
    "reading1": "Hc 31,31-34",
    "psalm": "Tv 51,3-4.12-13.14-15",
    "gospel": "Ga 12,20-33",
    "reading2": "Dt 5,7-9"
  },
  {
    "code": 3050,
    "year": "C",
    "reading1": "Is 43,16-21",
    "psalm": "Tv 126,1-2.23.4-5.6",
    "gospel": "Ga 8,1-11",
    "reading2": "Pl 3,8-14"
  },
  {
    "code": 3051,
    "year": "0",
    "reading1": "Đn 13,1-9.15-17.19-30.33-62; (hay Đn 13,41-62)",
    "psalm": "Tv 23,1-3.3-4.5.6",
    "gospel": "Ga 8,1-11; (hay Ga 8,12-20)"
  },
  {
    "code": 3052,
    "year": "0",
    "reading1": "Ds 21,4-9",
    "psalm": "Tv 102,2-3.16-18.19-21",
    "gospel": "Ga 8,21-30"
  },
  {
    "code": 3053,
    "year": "0",
    "reading1": "Đn 3,14-20.91-92.95",
    "psalm": "Đn 3,52.53.54.55.56",
    "gospel": "Ga 8,31-42"
  },
  {
    "code": 3054,
    "year": "0",
    "reading1": "St 17,3-9",
    "psalm": "Tv 105,4-5.6-7.8-9",
    "gospel": "Ga 8,51-59"
  },
  {
    "code": 3055,
    "year": "0",
    "reading1": "Hc 20,10-13",
    "psalm": "Tv 18,2-3.3-4.5-6.7",
    "gospel": "Ga 10,31-42"
  },
  {
    "code": 3056,
    "year": "0",
    "reading1": "Ed 37,21-28",
    "psalm": "Hc 31,10.11-12.13",
    "gospel": "Ga 11,45-57"
  },
  {
    "code": 3057,
    "year": "0",
    "reading1": "2 V 4,18-21.32-37",
    "psalm": "Tv 17,1.6-7.8.15",
    "gospel": "Ga 11,1-45"
  },
  {
    "code": 3060,
    "year": "A",
    "reading1": "Is 50,4-7",
    "psalm": "Tv 22,8-9.17-18.19-20.23-24",
    "gospel": "Mt 26,14; 27,66; ( hay Mt 27,11-54)",
    "reading2": "Pl 2,6-11"
  },
  {
    "code": 3060,
    "year": "B",
    "reading1": "Is 50,4-7",
    "psalm": "Tv 22,8-9.17-18.19-20.23-24",
    "gospel": "Mc 14,1; 15,47; (hay Mc 15,1-39 )",
    "reading2": "Pl 2,6-11"
  },
  {
    "code": 3060,
    "year": "C",
    "reading1": "Is 50,4-7",
    "psalm": "Tv 22,8-9.17-18.19-20.23-24",
    "gospel": "Lc 22,14 - 23,56; (hay Lc 23,1-49)",
    "reading2": "Pl 2,6-11"
  },
  {
    "code": 3061,
    "year": "0",
    "reading1": "Is 42,1-7",
    "psalm": "Tv 27,1.2.3.13-14",
    "gospel": "Ga 12,1-11"
  },
  {
    "code": 3062,
    "year": "0",
    "reading1": "Is 49,1-6",
    "psalm": "Tv 71,1-2.3-4.5-6.15.17",
    "gospel": "Ga 13,21-33.36-38"
  },
  {
    "code": 3063,
    "year": "0",
    "reading1": "Is 50,4-9",
    "psalm": "Tv 69,8-10.21-22.31.33-34",
    "gospel": "Mt 26,14-25"
  },
  {
    "code": 3064,
    "year": "0",
    "reading1": "Xh 12,1-8.11-14",
    "psalm": "Tv 116,12-13.15-16.17-18",
    "gospel": "Ga 13,1-15",
    "reading2": "1 Cr 11,23-26"
  },
  {
    "code": 3064,
    "year": "0",
    "reading1": "Is 61,1-3.6.89",
    "psalm": "Tv 89,21-22.25.27",
    "gospel": "Lc 4,16-21",
    "reading2": "Kh 1,5-8"
  },
  {
    "code": 3065,
    "year": "0",
    "reading1": "Is 52,13; 53,12",
    "psalm": "Tv 31,2.6.12-13.15-16.17.25",
    "gospel": "Ga 18,1; 19,42",
    "reading2": "Dt 4,14-16; 5,7-9"
  },
  {
    "code": 3066,
    "year": "0",
    "reading1": "(tùy chọn )",
    "psalm": "(tùy chọn)",
    "gospel": "Lc 24, 1-12",
    "reading2": "Rm 6,3-11"
  },
  {
    "code": 4010,
    "year": "A",
    "reading1": "Cv 10,34.37-43",
    "psalm": "Tv 118,1-2.16-17.22-23",
    "gospel": "Ga 20,1-9",
    "reading2": "Cl 3,1-4; (1 Cr 5,68;)"
  },
  {
    "code": 4010,
    "year": "B",
    "reading1": "Cv 10,34.37-43",
    "psalm": "Tv 118,1-2.16-17.22-23",
    "gospel": "Ga 20,1-9",
    "reading2": "Cl 3,1-4; (1 Cr 5,68;)"
  },
  {
    "code": 4010,
    "year": "A",
    "reading1": "Cv 10,34.37-43",
    "psalm": "Tv 118,1-2.16-17.22-23",
    "gospel": "Ga 20,1-9",
    "reading2": "Cl 3,1-4; (1 Cr 5,68;)"
  },

  {
    "code": 4011,
    "year": "C",
    "reading1": "Cv 2,14.22-32",
    "psalm": "Tv 16,1-2.5.7-8.9-10.11",
    "gospel": "Mt 28,8-15"
  },
  {
    "code": 4012,
    "year": "0",
    "reading1": "Cv 2,36-41",
    "psalm": "Tv 33,4-5.18-19.20.22",
    "gospel": "Ga 20,11-18"
  },
  {
    "code": 4013,
    "year": "0",
    "reading1": "Cv 3,1-10",
    "psalm": "Tv 105,1-2.3-4.6-7.8-9",
    "gospel": "Lc 24,13-35"
  },
  {
    "code": 4014,
    "year": "0",
    "reading1": "Cv 3,11-26",
    "psalm": "Tv 8,2.5.6-7.8-9",
    "gospel": "Lc 24,35-48"
  },
  {
    "code": 4015,
    "year": "0",
    "reading1": "Cv 4,1-12",
    "psalm": "Tv 118,1-2.4.22-24.25-27",
    "gospel": "Ga 21,1-14"
  },
  {
    "code": 4016,
    "year": "0",
    "reading1": "Cv 4,13-21",
    "psalm": "Tv 118,1.14-15.16-18.19-21",
    "gospel": "Mc 16,9-15"
  },
  {
    "code": 4020,
    "year": "A",
    "reading1": "Cv 2,42-47",
    "psalm": "Tv 118,2-4.13-15.22-24",
    "gospel": "Ga 20,19-31",
    "reading2": "1 Pr 1,3-9"
  },
  {
    "code": 4020,
    "year": "B",
    "reading1": "Cv 4,32-35",
    "psalm": "Tv 118,2-4.13-15.22-24",
    "gospel": "Ga 20,19-31",
    "reading2": "1 Ga 5,1-6"
  },
  {
    "code": 4020,
    "year": "C",
    "reading1": "Cv 5,12-16",
    "psalm": "Tv 118,2-4.13-15.22-24",
    "gospel": "Ga 20,19-31",
    "reading2": "Kh 1,9-11.12-13.17-19"
  },
  {
    "code": 4021,
    "year": "0",
    "reading1": "Cv 4,23-31",
    "psalm": "Tv 2,1-3.4-6.7-9",
    "gospel": "Ga 3,1-8"
  },
  {
    "code": 4022,
    "year": "0",
    "reading1": "Cv 4,32-37",
    "psalm": "Tv 93,1.1-2.5",
    "gospel": "Ga 3,7-15"
  },
  {
    "code": 4023,
    "year": "0",
    "reading1": "Cv 5,17-26",
    "psalm": "Tv 34,2-3.4-5.6-7.8-9",
    "gospel": "Ga 3,16-21"
  },
  {
    "code": 4024,
    "year": "0",
    "reading1": "Cv 5,27-33",
    "psalm": "Tv 34,2.9.17-18.19-20",
    "gospel": "Ga 3,31-36"
  },
  {
    "code": 4025,
    "year": "0",
    "reading1": "Cv 5,34-42",
    "psalm": "Tv 27,1.4.13-14",
    "gospel": "Ga 6,1-15"
  },
  {
    "code": 4026,
    "year": "0",
    "reading1": "Cv 6,1-7",
    "psalm": "Tv 33,1-2.4-5.18-19",
    "gospel": "Ga 6,16-21"
  },
  {
    "code": 4030,
    "year": "A",
    "reading1": "Cv 2,14.22-33",
    "psalm": "Tv 16,1-2.5.7-8.9-10.11",
    "gospel": "Lc 24,13-35",
    "reading2": "1 Pr 1,17-21"
  },
  {
    "code": 4030,
    "year": "B",
    "reading1": "Cv 3,13-15.17-19",
    "psalm": "Tv 4,2.4.7-8.9",
    "gospel": "Lc 24,35-48",
    "reading2": "1 Ga 2,1-5"
  },
  {
    "code": 4030,
    "year": "C",
    "reading1": "Cv 5,27-32.40-41",
    "psalm": "Tv 30,2.4.5-6.11-12.13",
    "gospel": "Ga 21,1-19 ( hay Ga 21,1-14)",
    "reading2": "Kh 5,11-14"
  },
  {
    "code": 4031,
    "year": "0",
    "reading1": "Cv 6,8-15",
    "psalm": "Tv 119,23-24.26-27.29-30",
    "gospel": "Ga 6,22-29"
  },
  {
    "code": 4032,
    "year": "0",
    "reading1": "Cv 7,51; 8,1",
    "psalm": "Tv 31,3-4.6-7.8.17.21",
    "gospel": "Ga 6,30-35"
  },
  {
    "code": 4033,
    "year": "0",
    "reading1": "Cv 8,1-8",
    "psalm": "Tv 66,1-3.4-5.6-7",
    "gospel": "Ga 6,35-40"
  },
  {
    "code": 4034,
    "year": "0",
    "reading1": "Cv 8,26-40",
    "psalm": "Tv 66,8-9.16-17.20",
    "gospel": "Ga 6,44-51"
  },
  {
    "code": 4035,
    "year": "0",
    "reading1": "Cv 9,1-20",
    "psalm": "Tv 117,1.2",
    "gospel": "Ga 6,52-59"
  },
  {
    "code": 4036,
    "year": "0",
    "reading1": "Cv 9,31-42",
    "psalm": "Tv 116,12-13.14-15.16-17",
    "gospel": "Ga 6,60-69"
  },
  {
    "code": 4040,
    "year": "A",
    "reading1": "Cv 2,14.36-41",
    "psalm": "Tv 23,1-3.34.5.6",
    "gospel": "Ga 10,1-10",
    "reading2": "1 Pr 2,20-25"
  },
  {
    "code": 4040,
    "year": "B",
    "reading1": "Cv 4,8-12",
    "psalm": "Tv 118,1.8-9.21-23.26.21.29",
    "gospel": "Ga 10,11-18",
    "reading2": "1 Ga 3,1-2"
  },
  {
    "code": 4040,
    "year": "C",
    "reading1": "Cv 13,14.43-52",
    "psalm": "Tv 100,1-2.3.5",
    "gospel": "Ga 10,27-30",
    "reading2": "Kh 7,9.14-17"
  },
  {
    "code": 4041,
    "year": "0",
    "reading1": "Cv 11,1-18",
    "psalm": "Tv 42,2-3; 43,3-4",
    "gospel": "Ga 10,1-10"
  },
  {
    "code": 4042,
    "year": "0",
    "reading1": "Cv 11,19-26",
    "psalm": "Tv 87,1-3.4-5.6-7",
    "gospel": "Ga 10,22-30"
  },
  {
    "code": 4043,
    "year": "0",
    "reading1": "Cv 12,24; 13,5",
    "psalm": "Tv 67,2-3.5.6.8",
    "gospel": "Ga 12,44-50"
  },
  {
    "code": 4044,
    "year": "0",
    "reading1": "Cv 13,13-25",
    "psalm": "Tv 89,2-3.21-22.25.27",
    "gospel": "Ga 13,16-20"
  },
  {
    "code": 4045,
    "year": "0",
    "reading1": "Cv 13,26-33",
    "psalm": "Tv 2,6-7.8-9.10-11",
    "gospel": "Ga 14,1-6"
  },
  {
    "code": 4046,
    "year": "0",
    "reading1": "Cv 13,44-52",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Ga 14,7-14"
  },
  {
    "code": 4050,
    "year": "A",
    "reading1": "Cv 6,1-7",
    "psalm": "Tv 33,1-2.4-5.18-19",
    "gospel": "Ga 14,1-12",
    "reading2": "1 Pr 2,4-9"
  },
  {
    "code": 4050,
    "year": "B",
    "reading1": "Cv 9,26-31",
    "psalm": "Tv 22,26-27.28.30.31-32",
    "gospel": "Ga 15,1-8",
    "reading2": "1 Ga 3,18-24"
  },
  {
    "code": 4050,
    "year": "C",
    "reading1": "Cv 14,21-27",
    "psalm": "Tv 145,8-9.10-11.12-13",
    "gospel": "Ga 13,31-33.34-35",
    "reading2": "Kh 21,1-5"
  },
  {
    "code": 4051,
    "year": "0",
    "reading1": "Cv 14,5-18",
    "psalm": "Tv 115,1-2.3-4.15-16",
    "gospel": "Ga 14,21-26"
  },
  {
    "code": 4052,
    "year": "0",
    "reading1": "Cv 14,19-28",
    "psalm": "Tv 145,10-11.12-13.21",
    "gospel": "Ga 14,27-31"
  },
  {
    "code": 4053,
    "year": "0",
    "reading1": "Cv 15,1-6",
    "psalm": "Tv 122,1-2.3-4.4-5",
    "gospel": "Ga 15,1-8"
  },
  {
    "code": 4054,
    "year": "0",
    "reading1": "Cv 15,7-21",
    "psalm": "Tv 96,1-2.2-3.10",
    "gospel": "Ga 15,9-11"
  },
  {
    "code": 4055,
    "year": "0",
    "reading1": "Cv 15,22-31",
    "psalm": "Tv 57,8-9.10-12",
    "gospel": "Ga 15,12-17"
  },
  {
    "code": 4056,
    "year": "0",
    "reading1": "Cv 16,1-10",
    "psalm": "Tv 100,1-2.3.5",
    "gospel": "Ga 15,18-21"
  },
  {
    "code": 4060,
    "year": "A",
    "reading1": "Cv 8,5-8.14-17",
    "psalm": "Tv 66,1-3.4-5.6-7.16.20",
    "gospel": "Ga 14,15-21",
    "reading2": "1 Pr 3,15-18"
  },
  {
    "code": 4060,
    "year": "B",
    "reading1": "Cv 10,25-26.34-35.44-48",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Ga 15,9-17",
    "reading2": "1 Ga 4,7-10"
  },
  {
    "code": 4060,
    "year": "C",
    "reading1": "Cv 15,1-2.22-29",
    "psalm": "Tv 67,2-3.5.6.8",
    "gospel": "Ga 14,23-29",
    "reading2": "Kh 21,10-14.22-23"
  },
  {
    "code": 4061,
    "year": "0",
    "reading1": "Cv 16,11-15",
    "psalm": "Tv 149,1-2.3-4.5-6.9",
    "gospel": "Ga 15,26; 16,4"
  },
  {
    "code": 4062,
    "year": "0",
    "reading1": "Cv 16,22-34",
    "psalm": "Tv 138,1-2.2-3.7-8",
    "gospel": "Ga 16,5-11"
  },
  {
    "code": 4063,
    "year": "0",
    "reading1": "Cv 17,15.22; 18,1",
    "psalm": "Tv 148,1-2.11-12.12-14.14",
    "gospel": "Ga 16,12-15"
  },
  {
    "code": 4064,
    "year": "0",
    "reading1": "Cv 18,1-8",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Ga 16,16-20"
  },
  {
    "code": 4065,
    "year": "0",
    "reading1": "Cv 18,9-18",
    "psalm": "Tv 47,2-3.4-5.6-7",
    "gospel": "Ga 16,20-23"
  },
  {
    "code": 4066,
    "year": "0",
    "reading1": "Cv 18,23-28",
    "psalm": "Tv 47,2-3.8-9.10",
    "gospel": "Ga 16,23-28"
  },
  {
    "code": 4070,
    "year": "A",
    "reading1": "Cv 1,12-14",
    "psalm": "Tv 27,1.4.7-8",
    "gospel": "Ga 17,1-11",
    "reading2": "1 Pr 4,13-16"
  },
  {
    "code": 4070,
    "year": "B",
    "reading1": "Cv 1,15-17.20.20-26",
    "psalm": "Tv 103,1-2.11-12.19-20",
    "gospel": "Ga 17,11-19",
    "reading2": "1 Ga 4,11-16"
  },
  {
    "code": 4070,
    "year": "C",
    "reading1": "Cv 7,55-60",
    "psalm": "Tv 97,1-2.6-7.9",
    "gospel": "Ga 17,20-26",
    "reading2": "Kh 22,12-14.16-17.20"
  },
  {
    "code": 4071,
    "year": "0",
    "reading1": "Cv 19,1-8",
    "psalm": "Tv 68,2-3.4-5.6-7",
    "gospel": "Ga 16,29-33"
  },
  {
    "code": 4072,
    "year": "0",
    "reading1": "Cv 20,17-27",
    "psalm": "Tv 68,10-11.20-21",
    "gospel": "Ga 17,1-11"
  },
  {
    "code": 4073,
    "year": "0",
    "reading1": "Cv 20,28-38",
    "psalm": "Tv 68,29-30.33-35.35-36",
    "gospel": "Ga 17,11-19"
  },
  {
    "code": 4074,
    "year": "0",
    "reading1": "Cv 22,30; 23,6-11",
    "psalm": "Tv 16,1-2.5.7-8.9-10.11",
    "gospel": "Ga 17,20-26"
  },
  {
    "code": 4075,
    "year": "0",
    "reading1": "Cv 25,13-21",
    "psalm": "Tv 103,1-2.11-12.19-20",
    "gospel": "Ga 21,15-19"
  },
  {
    "code": 4076,
    "year": "0",
    "reading1": "Cv 28,16-20.30-31",
    "psalm": "Tv 11,4.5.7",
    "gospel": "Ga 21,20-25"
  },
  {
    "code": 4080,
    "year": "A",
    "reading1": "Cv 1,1-11",
    "psalm": "Tv 47,2-3.6-7.8-9",
    "gospel": "Mt 28,16-20",
    "reading2": "Ep 1,17-23"
  },
  {
    "code": 4080,
    "year": "B",
    "reading1": "Cv 1,1-11",
    "psalm": "Tv 47,2-3.6-7.8-9",
    "gospel": "Mc 16,15-20",
    "reading2": "Ep 4,1-13; 4,1-7.11-13"
  },
  {
    "code": 4080,
    "year": "C",
    "reading1": "Cv 1,1-11",
    "psalm": "Tv 47,2-3.6-7.8-9",
    "gospel": "Lc 24,46-53",
    "reading2": "Dt 9,24-28; 10,19-23"
  },
  {
    "code": 4089,
    "year": "0",
    "reading1": "St 11,1-9  (hay Xh 19,3-8.16-20; hay Ed 37,1-14; hay Ge 3,1-5)",
    "psalm": "Tv 104,1-2.24.35.27-28.2930",
    "gospel": "Ga 7,37-39",
    "reading2": "Rm 8,22-27"
  },
  {
    "code": 5001,
    "year": "A",
    "reading1": "Cv 2,1-11",
    "psalm": "Tv 104",
    "gospel": "Ga 20,19-23",
    "reading2": "1 Cr 12,3b-7.12-13"
  },
  {
    "code": 5001,
    "year": "B",
    "reading1": "Cv 2,1-11",
    "psalm": "Tv 104",
    "gospel": "Ga 15,26-27; 16,12-15",
    "reading2": "Gl 5,16-25"
  },
  {
    "code": 5001,
    "year": "C",
    "reading1": "Cv 2,1-11",
    "psalm": "Tv 104",
    "gospel": "Ga 14,15-16.23b-26",
    "reading2": "Rm 8,8-17"
  },
  {
    "code": 5002,
    "year": "A",
    "reading1": "Xh 34,4b-6.8-9",
    "psalm": "Đn 3",
    "gospel": "Ga 3,16-18",
    "reading2": "2 Cr 13,11-13"
  },
  {
    "code": 5002,
    "year": "B",
    "reading1": "Đnl 4,32-34.39-40",
    "psalm": "Tv 33",
    "gospel": "Mt 28,16-20",
    "reading2": "Rm 8,14-17"
  },
  {
    "code": 5002,
    "year": "C",
    "reading1": "Cn 8,22-31",
    "psalm": "Tv 8",
    "gospel": "Ga 16,12-15",
    "reading2": "Rm 5,1-5"
  },
  {
    "code": 5003,
    "year": "A",
    "reading1": "Đnl 8,2-3.14b-16a",
    "psalm": "Tv 147",
    "gospel": "Ga 6,51-58",
    "reading2": "1 Cr 10,16-17"
  },
  {
    "code": 5003,
    "year": "B",
    "reading1": "Xh 24,3-8",
    "psalm": "Tv 116",
    "gospel": "Mc 14,12-16.22-26",
    "reading2": "Dt 9,11-15"
  },
  {
    "code": 5003,
    "year": "C",
    "reading1": "St 14,18-20",
    "psalm": "Tv 110",
    "gospel": "Lc 9,11b-17",
    "reading2": "1 Cr 11,23-26"
  },
  {
    "code": 5004,
    "year": "A",
    "reading1": "Đnl 7,6-11",
    "psalm": "Tv 103",
    "gospel": "Mt 11,25-30",
    "reading2": "1 Ga 4,7-16"
  },
  {
    "code": 5004,
    "year": "B",
    "reading1": "Hs 11,1.3-4.8c-9",
    "psalm": "Is 12",
    "gospel": "Ga 19,31-37",
    "reading2": "Ep 3,8-12.14-19"
  },
  {
    "code": 5004,
    "year": "C",
    "reading1": "Ed 34,11-16",
    "psalm": "Tv 23",
    "gospel": "Lc 15,3-7",
    "reading2": "Rm 5,5b-11"
  },
  {
    "code": 5010,
    "year": "A",
    "reading1": "Is 42,1-4.6-7",
    "psalm": "Tv 29,1-2.3-4.3.910",
    "gospel": "Mt 3,13-17",
    "reading2": "Cv 10,34-38"
  },
  {
    "code": 5010,
    "year": "B",
    "reading1": "Is 55,1-11",
    "psalm": "Is 12,2-3.4.5-6",
    "gospel": "Mc 1,7-11",
    "reading2": "1 Ga 5,1-9"
  },
  {
    "code": 5010,
    "year": "C",
    "reading1": "Is 40,1-5.9-11",
    "psalm": "Tv 104,12.3-4.24-25.27-28.2930",
    "gospel": "Lc 3,15-16.21-22",
    "reading2": "Tt 2,11-14; 3,4-7"
  },
  {
    "code": 5011,
    "year": "1",
    "reading1": "Dt 1,1-6",
    "psalm": "Tv 97,1-2.6-7.9",
    "gospel": "Mc 1,14-20"
  },
  {
    "code": 5011,
    "year": "2",
    "reading1": "1 Sm 1,1-8",
    "psalm": "Tv 116,12-13.14-17.18-19",
    "gospel": "Mc 1,14-20"
  },
  {
    "code": 5012,
    "year": "1",
    "reading1": "Dt 2,5-12",
    "psalm": "Tv 8,2.5.6-7.8-9",
    "gospel": "Mc 1,21-28"
  },
  {
    "code": 5012,
    "year": "2",
    "reading1": "1 Sm 1,9-20",
    "psalm": "1 Sm 2,1.4-5.6-7.8",
    "gospel": "Mc 1,21-28"
  },
  {
    "code": 5013,
    "year": "1",
    "reading1": "Dt 2,14-18",
    "psalm": "Tv 105,1-2.3-4.6-7.8-9",
    "gospel": "Mc 1,29-39"
  },
  {
    "code": 5013,
    "year": "2",
    "reading1": "1 Sm 3,1-10.19-20",
    "psalm": "Tv 40,2-5.7-8.8-9.10",
    "gospel": "Mc 1,29-39"
  },
  {
    "code": 5014,
    "year": "1",
    "reading1": "Dt 3,7-14",
    "psalm": "Tv 95,6-7.8-9.10-11",
    "gospel": "Mc 1,40-45"
  },
  {
    "code": 5014,
    "year": "2",
    "reading1": "1 Sm 4,1-11",
    "psalm": "Tv 44,10-11.14-15.25-26",
    "gospel": "Mc 1,40-45"
  },
  {
    "code": 5015,
    "year": "1",
    "reading1": "Dt 4,1-5.11",
    "psalm": "Tv 78,3.4.6-7.8",
    "gospel": "Mc 2,1-12"
  },
  {
    "code": 5015,
    "year": "2",
    "reading1": "1 Sm 8,4-7.10-22",
    "psalm": "Tv 89,16-17.18-19",
    "gospel": "Mc 2,1-12"
  },
  {
    "code": 5016,
    "year": "1",
    "reading1": "Dt 4,12-16",
    "psalm": "Tv 19,8.910.15",
    "gospel": "Mc 2,13-17"
  },
  {
    "code": 5016,
    "year": "2",
    "reading1": "1 Sm 9,1-4.17-19; 10,1",
    "psalm": "Tv 21,2-3.4-5.6-7",
    "gospel": "Mc 2,13-17"
  },
  {
    "code": 5020,
    "year": "A",
    "reading1": "Is 49,3.5-6",
    "psalm": "Tv 40,2.4.7-8.89.10",
    "gospel": "Ga 1,29-34",
    "reading2": "1 Cr 1,1-3"
  },
  {
    "code": 5020,
    "year": "B",
    "reading1": "1 Sm 3,3-10.19",
    "psalm": "Tv 40,2.4.7-8.89.10",
    "gospel": "Ga 1,35-42",
    "reading2": "1 Cr 6,1315.17-20"
  },
  {
    "code": 5020,
    "year": "C",
    "reading1": "Is 62,1-5",
    "psalm": "Tv 96,1-2.23.7-8.9-10",
    "gospel": "Ga 2,1-11",
    "reading2": "1 Cr 12,4-11"
  },
  {
    "code": 5021,
    "year": "1",
    "reading1": "Dt 5,1-10",
    "psalm": "Tv 110,1.2.3.4",
    "gospel": "Mc 2,18-22"
  },
  {
    "code": 5021,
    "year": "2",
    "reading1": "1 Sm 15,16-23",
    "psalm": "Tv 50,8-9.16-17.21.23",
    "gospel": "Mc 2,18-22"
  },
  {
    "code": 5022,
    "year": "1",
    "reading1": "Dt 6,10-20",
    "psalm": "Tv 111,1-2.4-5.9-10",
    "gospel": "Mc 2,23-28"
  },
  {
    "code": 5022,
    "year": "2",
    "reading1": "1 Sm 16,1-13",
    "psalm": "Tv 89,20.21-22.27-28",
    "gospel": "Mc 2,23-28"
  },
  {
    "code": 5023,
    "year": "1",
    "reading1": "Dt 7,1-3.15-17",
    "psalm": "Tv 110,1.2.3.4",
    "gospel": "Mc 3,1-6"
  },
  {
    "code": 5023,
    "year": "2",
    "reading1": "1 Sm 17,32-33.37.40-51",
    "psalm": "Tv 144,1.2.9-10",
    "gospel": "Mc 3,1-6"
  },
  {
    "code": 5024,
    "year": "1",
    "reading1": "Dt 7,25–8,6",
    "psalm": "Tv 40,7-8.8-9.10.17",
    "gospel": "Mc 3,7-12"
  },
  {
    "code": 5024,
    "year": "2",
    "reading1": "1 Sm 18,6-9; 19,1-7",
    "psalm": "Tv 56,2-3.9-10.10-12.13-14",
    "gospel": "Mc 3,7-12"
  },
  {
    "code": 5025,
    "year": "1",
    "reading1": "Dt 8,6-13",
    "psalm": "Tv 85,8.10.11-12.13-14",
    "gospel": "Mc 3,13-19"
  },
  {
    "code": 5025,
    "year": "2",
    "reading1": "1 Sm 24,3-21",
    "psalm": "Tv 57,2.3-4.6.11",
    "gospel": "Mc 3,13-19"
  },
  {
    "code": 5026,
    "year": "1",
    "reading1": "Dt 9,2-3.11-14",
    "psalm": "Tv 47,2-3.6-7.8-9",
    "gospel": "Mc 3,20-21"
  },
  {
    "code": 5026,
    "year": "2",
    "reading1": "2 Sm 1,1-4.11-12.19.23-27",
    "psalm": "Tv 80,2-3.5-7",
    "gospel": "Mc 3,20-21"
  },
  {
    "code": 5030,
    "year": "A",
    "reading1": "Is 8,23; 9,3",
    "psalm": "Tv 27,1.4.13-14",
    "gospel": "Mt 4,12-23; 4,12-17",
    "reading2": "1 Cr 1,10-13.17"
  },
  {
    "code": 5030,
    "year": "B",
    "reading1": "Gn 3,1-5.10",
    "psalm": "Tv 25,4-5.6-7.8-9",
    "gospel": "Mc 1,14-20",
    "reading2": "1 Cr 7,29-31"
  },
  {
    "code": 5030,
    "year": "C",
    "reading1": "Nkm 8,2-4.5-6.8-10",
    "psalm": "Tv 19,8.9.10.15",
    "gospel": "Lc 1,1-4; 4,14-21",
    "reading2": "1 Cr 12,12-30 ( hay 1 Cr 12,12-14.27)"
  },
  {
    "code": 5031,
    "year": "1",
    "reading1": "Dt 9,15.24-28",
    "psalm": "Tv 98,1.2-3.3-4.5-6",
    "gospel": "Mc 3,22-30"
  },
  {
    "code": 5031,
    "year": "2",
    "reading1": "2 Sm 5,1-7.10",
    "psalm": "Tv 89,20.21-22.25-26",
    "gospel": "Mc 3,22-30"
  },
  {
    "code": 5032,
    "year": "1",
    "reading1": "Dt 10,1-10",
    "psalm": "Tv 40,2.4.7-8.10.11",
    "gospel": "Mc 3,31-35"
  },
  {
    "code": 5032,
    "year": "2",
    "reading1": "2 Sm 6,12-15.17-19",
    "psalm": "Tv 24,7.8.9.10",
    "gospel": "Mc 3,31-35"
  },
  {
    "code": 5033,
    "year": "1",
    "reading1": "Dt 10,11-18",
    "psalm": "Tv 110,1.2.3.4",
    "gospel": "Mc 4,1-20"
  },
  {
    "code": 5033,
    "year": "2",
    "reading1": "2 Sm 7,4-17",
    "psalm": "Tv 89,4-5.27-28.29-30",
    "gospel": "Mc 4,1-20"
  },
  {
    "code": 5034,
    "year": "1",
    "reading1": "Dt 10,19-25",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Mc 4,21-25"
  },
  {
    "code": 5034,
    "year": "2",
    "reading1": "2 Sm 7,18-19.24-29",
    "psalm": "Tv 132,1-2.3-5.11.12.13-14",
    "gospel": "Mc 4,21-25"
  },
  {
    "code": 5035,
    "year": "1",
    "reading1": "Dt 10,32-39",
    "psalm": "Tv 37,3-4.5-6.23-24.39-40",
    "gospel": "Mc 4,26-34"
  },
  {
    "code": 5035,
    "year": "2",
    "reading1": "2 Sm 11,1-4.5-10.13-17",
    "psalm": "Tv 51,3-4.5-6.6-7.10-11",
    "gospel": "Mc 4,26-34"
  },
  {
    "code": 5036,
    "year": "1",
    "reading1": "Dt 11,32-40",
    "psalm": "Lc 1,69-70.71-72.73-75",
    "gospel": "Mc 4,35-41"
  },
  {
    "code": 5036,
    "year": "2",
    "reading1": "2 Sm 12,1-7.10-17",
    "psalm": "Tv 51,12-13.14-15.16-17",
    "gospel": "Mc 4,35-41"
  },
  {
    "code": 5040,
    "year": "A",
    "reading1": "Xp 2,3.3,12-13",
    "psalm": "Tv 146,6-7.8-9.910",
    "gospel": "Mt 5,1-12",
    "reading2": "1 Cr 1,26-31"
  },
  {
    "code": 5040,
    "year": "B",
    "reading1": "Đnl 18,15-20",
    "psalm": "Tv 95,1-2.6-7.79",
    "gospel": "Mc 1,21-28",
    "reading2": "1 Cr 7,32-35"
  },
  {
    "code": 5040,
    "year": "C",
    "reading1": "Hc 1,4-5.17-19",
    "psalm": "Tv 71,1-2.3-4.5-6.15.17",
    "gospel": "Lc 4,21-30",
    "reading2": "1 Cr 12,31; 13,13 ( hay 1 Cr13,4-13)"
  },
  {
    "code": 5041,
    "year": "1",
    "reading1": "Dt 11,32-40; 9",
    "psalm": "Tv 31,20.21.22.23.24",
    "gospel": "Mc 5,1-20"
  },
  {
    "code": 5041,
    "year": "2",
    "reading1": "2 Sm 15,13-14.30; 16,5-13",
    "psalm": "Tv 3,2-3.4-5.6-7",
    "gospel": "Mc 5,1-20"
  },
  {
    "code": 5042,
    "year": "1",
    "reading1": "Dt 12,1-4",
    "psalm": "Tv 22,26-27.28.30.31-32",
    "gospel": "Mc 5,21-43"
  },
  {
    "code": 5042,
    "year": "2",
    "reading1": "2 Sm 18,9-10.14.24-25.30; 2 Sm ,19,3",
    "psalm": "Tv 86,1-2.3-4.5-6",
    "gospel": "Mc 5,21-43"
  },
  {
    "code": 5043,
    "year": "1",
    "reading1": "Dt 12,4-7.11-15",
    "psalm": "Tv 103,1-2.13-14.17-18",
    "gospel": "Mc 6,1-6"
  },
  {
    "code": 5043,
    "year": "2",
    "reading1": "2 Sm 24,2.9-17",
    "psalm": "Tv 32,1-2.5.6.7",
    "gospel": "Mc 6,1-6"
  },
  {
    "code": 5044,
    "year": "1",
    "reading1": "Dt 12,18-19.21-24",
    "psalm": "Tv 48,2-3.3-4.9.10-11",
    "gospel": "Mc 6,7-13"
  },
  {
    "code": 5044,
    "year": "2",
    "reading1": "1 V 2,1-4.10-12",
    "psalm": "1 Sb29,10.11.11-12.12",
    "gospel": "Mc 6,7-13"
  },
  {
    "code": 5045,
    "year": "1",
    "reading1": "Dt 13,1-8",
    "psalm": "Tv 27,1.3.5.8-9",
    "gospel": "Mc 6,14-29"
  },
  {
    "code": 5045,
    "year": "2",
    "reading1": "Hc 47,2-11",
    "psalm": "Tv 18,31.47.50.51",
    "gospel": "Mc 6,14-29"
  },
  {
    "code": 5046,
    "year": "1",
    "reading1": "Dt 13,15-17.20-21",
    "psalm": "Tv 23,1-3.3-4.5.6",
    "gospel": "Mc 6,30-34"
  },
  {
    "code": 5046,
    "year": "2",
    "reading1": "1 V 3,4-13",
    "psalm": "Tv 119,9.10.11.12.13.14",
    "gospel": "Mc 6,30-34"
  },
  {
    "code": 5050,
    "year": "A",
    "reading1": "Is 58,7-10",
    "psalm": "Tv 112,4-5.6-7.8-9",
    "gospel": "Mt 5,13-16",
    "reading2": "1 Cr 2,1-5"
  },
  {
    "code": 5050,
    "year": "B",
    "reading1": "G 7,1-4.6-7",
    "psalm": "Tv 147,1-2.3-4.5-6",
    "gospel": "Mc 1,29-39",
    "reading2": "1 Cr 9,16-19.22-23"
  },
  {
    "code": 5050,
    "year": "C",
    "reading1": "Is 6,1-2.3-8",
    "psalm": "Tv 138,1-2.23.4-5.7-8",
    "gospel": "Lc 5,1-11",
    "reading2": "1 Cr 15,1-11 ( hay 1 Cr 15,3-8.11)"
  },
  {
    "code": 5051,
    "year": "1",
    "reading1": "St 1,1-19",
    "psalm": "Tv 104,1-2.5-6.10.12.24.35",
    "gospel": "Mc 6,53-56"
  },
  {
    "code": 5051,
    "year": "2",
    "reading1": "1 V 8,1-7.9-13",
    "psalm": "Tv 132,6-7.8-10",
    "gospel": "Mc 6,53-56"
  },
  {
    "code": 5052,
    "year": "1",
    "reading1": "St 1,20–2,4",
    "psalm": "Tv 8,4-5.6-7.8-9",
    "gospel": "Mc 7,1-13"
  },
  {
    "code": 5052,
    "year": "2",
    "reading1": "1 V 8,22-23.27-30",
    "psalm": "Tv 84,3-4.5.10.11",
    "gospel": "Mc 7,1-13"
  },
  {
    "code": 5053,
    "year": "1",
    "reading1": "St 2,5-9.15-17",
    "psalm": "Tv 104,1-2.27-28.29-30",
    "gospel": "Mc 7,14-23"
  },
  {
    "code": 5053,
    "year": "2",
    "reading1": "1 V 10,1-10",
    "psalm": "Tv 37,5-6.30-31.39-40",
    "gospel": "Mc 7,14-23"
  },
  {
    "code": 5054,
    "year": "1",
    "reading1": "St 2,18-25",
    "psalm": "Tv 128,1-2.3.4-5",
    "gospel": "Mc 7,24-30"
  },
  {
    "code": 5054,
    "year": "2",
    "reading1": "1 V 11,4-13",
    "psalm": "Tv 106,3-4.35-3.37.40",
    "gospel": "Mc 7,24-30"
  },
  {
    "code": 5055,
    "year": "1",
    "reading1": "St 3,1-8",
    "psalm": "Tv 32,1-2.5.6.7",
    "gospel": "Mc 7,31-37"
  },
  {
    "code": 5055,
    "year": "2",
    "reading1": "1 V 11,29-32; 12,19",
    "psalm": "Tv 81,10-11.12-13.14-15",
    "gospel": "Mc 7,31-37"
  },
  {
    "code": 5056,
    "year": "1",
    "reading1": "St 3,9-24",
    "psalm": "Tv 90,2.3-4.5-6.12-13",
    "gospel": "Mc 8,1-10"
  },
  {
    "code": 5056,
    "year": "2",
    "reading1": "1 V 12,26-32; 13,33-34",
    "psalm": "Tv 106,6-7.19-20.21-22",
    "gospel": "Mc 8,1-10"
  },
  {
    "code": 5060,
    "year": "A",
    "reading1": "Hc 15,16-21",
    "psalm": "Tv 119,1-2.4-5.17-18.33-34",
    "gospel": "Mt 5,17-37 (hay Mt  5,20-22.27-28.33-34.37)",
    "reading2": "1 Cr 2,6-10"
  },
  {
    "code": 5060,
    "year": "B",
    "reading1": "Lv 13,1-2.44-46",
    "psalm": "Tv 32,1-2.5.11",
    "gospel": "Mc 1,40-45",
    "reading2": "1 Cr 10,31-33; 11,1"
  },
  {
    "code": 5060,
    "year": "C",
    "reading1": "Hc 17,5-8",
    "psalm": "Tv 1,1-2.3.4.6",
    "gospel": "Lc 6,17.20-26",
    "reading2": "1 Cr 15,12.16-20"
  },
  {
    "code": 5061,
    "year": "1",
    "reading1": "St 4,1-15.25",
    "psalm": "Tv 50,1.8.16-17.20-21",
    "gospel": "Mc 8,11-13"
  },
  {
    "code": 5061,
    "year": "2",
    "reading1": "Gc 1,1-11",
    "psalm": "Tv 119,67.68.71.72.75.76",
    "gospel": "Mc 8,11-13"
  },
  {
    "code": 5062,
    "year": "1",
    "reading1": "St 6,5-8; 7,1-5.10",
    "psalm": "Tv 29,1-2.3-4.3.9-10",
    "gospel": "Mc 8,14-21"
  },
  {
    "code": 5062,
    "year": "2",
    "reading1": "Gc 1,12-18",
    "psalm": "Tv 94,12-13.14-15.18-19",
    "gospel": "Mc 8,14-21"
  },
  {
    "code": 5063,
    "year": "1",
    "reading1": "St 8,6-13.20-22",
    "psalm": "Tv 116,12-13.14-15.18-19",
    "gospel": "Mc 8,22-26"
  },
  {
    "code": 5063,
    "year": "2",
    "reading1": "Gc 1,19-27",
    "psalm": "Tv 15,2-3.3-4.5",
    "gospel": "Mc 8,22-26"
  },
  {
    "code": 5064,
    "year": "1",
    "reading1": "St 9,1-13",
    "psalm": "Tv 102,16-18.19-21.29.22-23",
    "gospel": "Mc 8,27-33"
  },
  {
    "code": 5064,
    "year": "2",
    "reading1": "Gc 2,1-9",
    "psalm": "Tv 34,2-3.4-5.6-7",
    "gospel": "Mc 8,27-33"
  },
  {
    "code": 5065,
    "year": "1",
    "reading1": "St 11,1-9",
    "psalm": "Tv 33,10-11.12-13.14-15",
    "gospel": "Mc 8,34–9,1"
  },
  {
    "code": 5065,
    "year": "2",
    "reading1": "Gc 2,14-24.26",
    "psalm": "Tv 112,1-2.3-4.5-6",
    "gospel": "Mc 8,34–9,1"
  },
  {
    "code": 5066,
    "year": "1",
    "reading1": "Dt 11,1-7",
    "psalm": "Tv 145,2-3.4-5.10-11",
    "gospel": "Mc 9,2-13"
  },
  {
    "code": 5066,
    "year": "2",
    "reading1": "Gc 3,1-10",
    "psalm": "Tv 12,2-3.4-5.7-8",
    "gospel": "Mc 9,2-13"
  },
  {
    "code": 5070,
    "year": "A",
    "reading1": "Lv 19,1-2.17-18",
    "psalm": "Tv 103,1-2.3-4.8.10.12-13",
    "gospel": "Mt 5,38-48",
    "reading2": "1 Cr 3,16-23"
  },
  {
    "code": 5070,
    "year": "B",
    "reading1": "Is 43,18-19.21-22.24.25",
    "psalm": "Tv 41,2-3.4-5.13-14",
    "gospel": "Mc 2,1-12",
    "reading2": "2 Cr 1,18-22"
  },
  {
    "code": 5070,
    "year": "C",
    "reading1": "1 Sm 26,2.7-9.12-13.22-23",
    "psalm": "Tv 103,1-2.3-4.8.10.12-13",
    "gospel": "Lc 6,27-38",
    "reading2": "1 Cr 15,45-49"
  },
  {
    "code": 5071,
    "year": "1",
    "reading1": "Hc 1,1-10",
    "psalm": "Tv 93,1.1-2.5",
    "gospel": "Mc 9,14-29"
  },
  {
    "code": 5071,
    "year": "2",
    "reading1": "Gc 3,13-18",
    "psalm": "Tv 19,8.9.10.15",
    "gospel": "Mc 9,14-29"
  },
  {
    "code": 5072,
    "year": "1",
    "reading1": "Hc 2,1-11",
    "psalm": "Tv 37,3-4.18-19.27-28.39-40",
    "gospel": "Mc 9,30-37"
  },
  {
    "code": 5072,
    "year": "2",
    "reading1": "Gc 4,1-10",
    "psalm": "Tv 55,7-8.9-10.10-11.23",
    "gospel": "Mc 9,30-37"
  },
  {
    "code": 5073,
    "year": "1",
    "reading1": "Hc 4,11-19",
    "psalm": "Tv 119,165.168.171.172.174.175",
    "gospel": "Mc 9,38-40"
  },
  {
    "code": 5073,
    "year": "2",
    "reading1": "Gc 4,13-17",
    "psalm": "Tv 49,14-15.15-16.17-18.19-20",
    "gospel": "Mc 9,38-40"
  },
  {
    "code": 5074,
    "year": "1",
    "reading1": "Hc 5,1-8",
    "psalm": "Tv 1,1-2.3.4.6",
    "gospel": "Mc 9,41-50"
  },
  {
    "code": 5074,
    "year": "2",
    "reading1": "Gc 5,1-6",
    "psalm": "Tv 49,14-15.15-16.17-18.19-20",
    "gospel": "Mc 9,41-50"
  },
  {
    "code": 5075,
    "year": "1",
    "reading1": "Hc 6,5-17",
    "psalm": "Tv 119,12.16.18.27.34.35",
    "gospel": "Mc 10,1-12"
  },
  {
    "code": 5075,
    "year": "2",
    "reading1": "Gc 5,9-12",
    "psalm": "Tv 103,1-2.3-4.8-9.11-12",
    "gospel": "Mc 10,1-12"
  },
  {
    "code": 5076,
    "year": "1",
    "reading1": "Hc 17,1-15",
    "psalm": "Tv 103,13-14.15-16.17-18",
    "gospel": "Mc 10,13-16"
  },
  {
    "code": 5076,
    "year": "2",
    "reading1": "Gc 5,13-20",
    "psalm": "Tv 141,1-2.3.8",
    "gospel": "Mc 10,13-16"
  },
  {
    "code": 5080,
    "year": "A",
    "reading1": "Is 49,14-15",
    "psalm": "Tv 62,2-3.6-7.8-9",
    "gospel": "Mt 6,24-34",
    "reading2": "1 Cr 4,1-5"
  },
  {
    "code": 5080,
    "year": "B",
    "reading1": "Hs 2,16.17.21-22",
    "psalm": "Tv 103,1-2.3-4.8.10.12-13",
    "gospel": "Mc 2,18-22",
    "reading2": "2 Cr 3,16"
  },
  {
    "code": 5080,
    "year": "C",
    "reading1": "Hc 27,5-8",
    "psalm": "Tv 92,2-3.13-14.15-16",
    "gospel": "Lc 6,39-45",
    "reading2": "1 Cr 15,54-58"
  },
  {
    "code": 5081,
    "year": "1",
    "reading1": "Hc 17,19-27",
    "psalm": "Tv 32,1-2.5.6.7",
    "gospel": "Mc 10,17-27"
  },
  {
    "code": 5081,
    "year": "2",
    "reading1": "1 Pr 1,3-9",
    "psalm": "Tv 111,1-2.5-6.9.10",
    "gospel": "Mc 10,17-27"
  },
  {
    "code": 5082,
    "year": "1",
    "reading1": "Hc 35,1-12",
    "psalm": "Tv 50,5-6.7-8.14.23",
    "gospel": "Mc 10,28-31"
  },
  {
    "code": 5082,
    "year": "2",
    "reading1": "1 Pr 1,10-16",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Mc 10,28-31"
  },
  {
    "code": 5083,
    "year": "1",
    "reading1": "Hc 36,1.5-6.10-17",
    "psalm": "Tv 79,8.9.11.13",
    "gospel": "Mc 10,32-45"
  },
  {
    "code": 5083,
    "year": "2",
    "reading1": "1 Pr 1,18-25",
    "psalm": "Tv 147,12-13.14-15.19-20",
    "gospel": "Mc 10,32-45"
  },
  {
    "code": 5084,
    "year": "1",
    "reading1": "Hc 42,15-25",
    "psalm": "Tv 33,2-3.4-5.6-7.8-9",
    "gospel": "Mc 10,46-52"
  },
  {
    "code": 5084,
    "year": "2",
    "reading1": "1 Pr 2,2-5.9-12",
    "psalm": "Tv 100,2.3.4.5",
    "gospel": "Mc 10,46-52"
  },
  {
    "code": 5085,
    "year": "1",
    "reading1": "Hc 44,1.9-13",
    "psalm": "Tv 149,1-2.3-4.5-6.9",
    "gospel": "Mc 11,11-26"
  },
  {
    "code": 5085,
    "year": "2",
    "reading1": "1 Pr 4,7-13",
    "psalm": "Tv 96,10.11-12.13",
    "gospel": "Mc 11,11-26"
  },
  {
    "code": 5086,
    "year": "1",
    "reading1": "Hc 51,12-20",
    "psalm": "Tv 19,8.9.10.11",
    "gospel": "Mc 11,27-33"
  },
  {
    "code": 5086,
    "year": "2",
    "reading1": "Gđ 17.20-25",
    "psalm": "Tv 63,2.3-4.5-6",
    "gospel": "Mc 11,27-33"
  },
  {
    "code": 5090,
    "year": "A",
    "reading1": "Đnl 11,18.26-28.32",
    "psalm": "Tv 31,2-3.34.17.25",
    "gospel": "Mt 7,21-27",
    "reading2": "Rm 3,21-25.28"
  },
  {
    "code": 5090,
    "year": "B",
    "reading1": "Đnl 5,12-15",
    "psalm": "Tv 81,3-4.5-6.7-8.10-11",
    "gospel": "Mc 2,23-28; 3,6 (hay Mc2,23-28)",
    "reading2": "2 Cr 4,6-11"
  },
  {
    "code": 5090,
    "year": "C",
    "reading1": "1 V 8,41-43",
    "psalm": "Tv 117,1-2",
    "gospel": "Lc 7,1-10",
    "reading2": "Gl 1,1-2.6-10"
  },
  {
    "code": 5091,
    "year": "1",
    "reading1": "Tb 1,1-2; 2,1-9",
    "psalm": "Tv 112,1-2.34.5-6",
    "gospel": "Mc 12,1-12"
  },
  {
    "code": 5091,
    "year": "2",
    "reading1": "2 Pr 1,2-7",
    "psalm": "Tv 91,1-2.14-15.15-16",
    "gospel": "Mc 12,1-12"
  },
  {
    "code": 5092,
    "year": "1",
    "reading1": "Tb 2,9-14",
    "psalm": "Tv 112,1-2.7-8.9",
    "gospel": "Mc 12,13-17"
  },
  {
    "code": 5092,
    "year": "2",
    "reading1": "2 Pr 3,12-15.17-18",
    "psalm": "Tv 90,2.3-4.10.14.16",
    "gospel": "Mc 12,13-17"
  },
  {
    "code": 5093,
    "year": "1",
    "reading1": "Tb 3,1-11.16",
    "psalm": "Tv 25,2-4.4-5.6-7.8-9",
    "gospel": "Mc 12,18-27"
  },
  {
    "code": 5093,
    "year": "2",
    "reading1": "2 Tm 1,1-3.6-12",
    "psalm": "Tv 123,1-2.2",
    "gospel": "Mc 12,18-27"
  },
  {
    "code": 5094,
    "year": "1",
    "reading1": "Tb 6,11; 7,1.9-14; 8,4-7",
    "psalm": "Tv 128,1-2.3.4-5",
    "gospel": "Mc 12,28-34"
  },
  {
    "code": 5094,
    "year": "2",
    "reading1": "2 Tm 2,8-15",
    "psalm": "Tv 25,2-5.8-9.10.14",
    "gospel": "Mc 12,28-34"
  },
  {
    "code": 5095,
    "year": "1",
    "reading1": "Tb 11,5-15",
    "psalm": "Tv 146,2.7.8-9.9-10",
    "gospel": "Mc 12,35-37"
  },
  {
    "code": 5095,
    "year": "2",
    "reading1": "2 Tm 3,10-17",
    "psalm": "Tv 119,157.160.161.165.166.168",
    "gospel": "Mc 12,35-37"
  },
  {
    "code": 5096,
    "year": "1",
    "reading1": "Tb 12,1.5-15.20",
    "psalm": "Tb 13,2.6",
    "gospel": "Mc 12,38-44"
  },
  {
    "code": 5096,
    "year": "2",
    "reading1": "2 Tm 4,1-8",
    "psalm": "Tv 71,8-9.14-15.16-17.22",
    "gospel": "Mc 12,38-44"
  },
  {
    "code": 5100,
    "year": "A",
    "reading1": "Hs 6,3-6",
    "psalm": "Tv 50,1.8.12-13.14-15",
    "gospel": "Mt 9,9-13",
    "reading2": "Rm 4,18-25"
  },
  {
    "code": 5100,
    "year": "B",
    "reading1": "St 3,9-15",
    "psalm": "Tv 130,1-2.3-4.5-6.7-8",
    "gospel": "Mc 3,20-35",
    "reading2": "2 Cr 4,13-21; 5,1"
  },
  {
    "code": 5100,
    "year": "C",
    "reading1": "1 V 17,17-24",
    "psalm": "Tv 30,2.4.5-6.11-12.13",
    "gospel": "Lc 7,11-17",
    "reading2": "Gl 1,11-19"
  },
  {
    "code": 5101,
    "year": "1",
    "reading1": "2 Cr 1,1-7",
    "psalm": "Tv 34,2-3.4-5.6-7.8-9",
    "gospel": "Mt 5,1-12"
  },
  {
    "code": 5101,
    "year": "2",
    "reading1": "1 V 17,1-6",
    "psalm": "Tv 121,1-2.3-4.5-6.7-8",
    "gospel": "Mt 5,1-12"
  },
  {
    "code": 5102,
    "year": "1",
    "reading1": "2 Cr 1,18-22",
    "psalm": "Tv 119,129.130.131.132.133.135",
    "gospel": "Mt 5,13-16"
  },
  {
    "code": 5102,
    "year": "2",
    "reading1": "1 V 17,7-16",
    "psalm": "Tv 4,2-3.4-5.7-8",
    "gospel": "Mt 5,13-16"
  },
  {
    "code": 5103,
    "year": "1",
    "reading1": "2 Cr 3,4-11",
    "psalm": "Tv 99,5.6.7.8.9",
    "gospel": "Mt 5,17-19"
  },
  {
    "code": 5103,
    "year": "2",
    "reading1": "1 V 18,20-39",
    "psalm": "Tv 16,1-2.4.5.8.11",
    "gospel": "Mt 5,17-19"
  },
  {
    "code": 5104,
    "year": "1",
    "reading1": "2 Cr 3,15-18; 4,1.3-6",
    "psalm": "Tv 85,9-10.11-12.12-13",
    "gospel": "Mt 5,20-26"
  },
  {
    "code": 5104,
    "year": "2",
    "reading1": "1 V 18,41-46",
    "psalm": "Tv 65,10.10-11.12-13",
    "gospel": "Mt 5,20-26"
  },
  {
    "code": 5105,
    "year": "1",
    "reading1": "2 Cr 4,7-15",
    "psalm": "Tv 116,10-11.15-16.17-18",
    "gospel": "Mt 5,27-32"
  },
  {
    "code": 5105,
    "year": "2",
    "reading1": "1 V 19,9.11-16",
    "psalm": "Tv 27,7-8.8-9.13-14",
    "gospel": "Mt 5,27-32"
  },
  {
    "code": 5106,
    "year": "1",
    "reading1": "2 Cr 5,14-21",
    "psalm": "Tv 103,1-2.3-4.8-9.11-12",
    "gospel": "Mt 5,33-37"
  },
  {
    "code": 5106,
    "year": "2",
    "reading1": "1 V 19,19-21",
    "psalm": "Tv 16,1-2.5.7-8.9-10",
    "gospel": "Mt 5,33-37"
  },
  {
    "code": 5110,
    "year": "A",
    "reading1": "Xh 19,2-6",
    "psalm": "Tv 100,1-2.3.5",
    "gospel": "Mt 9,36-38; 10,8",
    "reading2": "Rm 5,6-11"
  },
  {
    "code": 5110,
    "year": "B",
    "reading1": "Ed 17,22-24",
    "psalm": "Tv 92,2-3.13-14.15-16",
    "gospel": "Mc 4,26-34",
    "reading2": "2 Cr 5,6-10"
  },
  {
    "code": 5110,
    "year": "C",
    "reading1": "2 Sm 12,7-10.13",
    "psalm": "Tv 32,1-2.5.7.11",
    "gospel": "Lc 7,36-50; 8,3 ( hay Lc 7,36-50)",
    "reading2": "Gl 2,16.19-21"
  },
  {
    "code": 5111,
    "year": "1",
    "reading1": "2 Cr 6,1-10",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Mt 5,38-42"
  },
  {
    "code": 5111,
    "year": "2",
    "reading1": "1 V 21,1-16",
    "psalm": "Tv 5,2-3.5-6.7",
    "gospel": "Mt 5,38-42"
  },
  {
    "code": 5112,
    "year": "1",
    "reading1": "2 Cr 8,1-9",
    "psalm": "Tv 146,2.5-6.7.8-9",
    "gospel": "Mt 5,43-48"
  },
  {
    "code": 5112,
    "year": "2",
    "reading1": "1 V 21,17-29",
    "psalm": "Tv 51,3-4.5-6.11.16",
    "gospel": "Mt 5,43-48"
  },
  {
    "code": 5113,
    "year": "1",
    "reading1": "2 Cr 9,6-11",
    "psalm": "Tv 112,1-2.3-4.9",
    "gospel": "Mt 6,1-6.16-18"
  },
  {
    "code": 5113,
    "year": "2",
    "reading1": "2 V 2,1.6-14",
    "psalm": "Tv 31,20.21.24",
    "gospel": "Mt 6,1-6.16-18"
  },
  {
    "code": 5114,
    "year": "1",
    "reading1": "2 Cr 11,1-11",
    "psalm": "Tv 111,1-2.3-4.7-8",
    "gospel": "Mt 6,7-15"
  },
  {
    "code": 5114,
    "year": "2",
    "reading1": "Hc 48,1-14",
    "psalm": "Tv 97,1-2.3-4.5-6.7",
    "gospel": "Mt 6,7-15"
  },
  {
    "code": 5115,
    "year": "1",
    "reading1": "2 Cr 11,18.21-30",
    "psalm": "Tv 34,2-3.4-5.6-7",
    "gospel": "Mt 6,19-23"
  },
  {
    "code": 5115,
    "year": "2",
    "reading1": "2 V 11,1-4.9-18.20",
    "psalm": "Tv 132,11.12.13-14.17-18",
    "gospel": "Mt 6,19-23"
  },
  {
    "code": 5116,
    "year": "1",
    "reading1": "2 Cr 12,1-10",
    "psalm": "Tv 34,8-9.10-11.12-13",
    "gospel": "Mt 6,24-34"
  },
  {
    "code": 5116,
    "year": "2",
    "reading1": "2 Sb24,17-25",
    "psalm": "Tv 89,4-5.29-30.31-32.33-34",
    "gospel": "Mt 6,24-34"
  },
  {
    "code": 5120,
    "year": "A",
    "reading1": "Hc 20,10-13",
    "psalm": "Tv 69,8-10.14.17.33-35",
    "gospel": "Mt 10,26-33",
    "reading2": "Rm 5,12-15"
  },
  {
    "code": 5120,
    "year": "B",
    "reading1": "G 38,1.8-11",
    "psalm": "Tv 107,23-24.25-26.28-29.30-31",
    "gospel": "Mc 4,35-41",
    "reading2": "2 Cr 5,14-17"
  },
  {
    "code": 5120,
    "year": "C",
    "reading1": "Dcr 12,10-11; 13,1",
    "psalm": "Tv 63,2.3-4.5-6.8-9",
    "gospel": "Lc 9,18-24",
    "reading2": "Gl 3,26-29"
  },
  {
    "code": 5121,
    "year": "1",
    "reading1": "St 12,1-9",
    "psalm": "Tv 33,12-13.18-19.20.22",
    "gospel": "Mt 7,1-5"
  },
  {
    "code": 5121,
    "year": "2",
    "reading1": "2 V 17,5-8.13-15.18",
    "psalm": "Tv 60,3.4-5.12-13",
    "gospel": "Mt 7,1-5"
  },
  {
    "code": 5122,
    "year": "1",
    "reading1": "St 13,2.5-18",
    "psalm": "Tv 15,2-3.3-4.5",
    "gospel": "Mt 7,6.12-14"
  },
  {
    "code": 5122,
    "year": "2",
    "reading1": "2 V 19,9-11.14-21.31-36",
    "psalm": "Tv 48,2-3.3-4.10-11",
    "gospel": "Mt 7,6.12-14"
  },
  {
    "code": 5123,
    "year": "1",
    "reading1": "St 15,1-12.17-18",
    "psalm": "Tv 105,1-2.3-4.6-7.8-9",
    "gospel": "Mt 7,15-20"
  },
  {
    "code": 5123,
    "year": "2",
    "reading1": "2 V 22,8-13; 23,1-3",
    "psalm": "Tv 119,33.34.35.36.37.40",
    "gospel": "Mt 7,15-20"
  },
  {
    "code": 5124,
    "year": "1",
    "reading1": "St 16,1-12.15-16",
    "psalm": "Tv 106, 1-2.3-4.4-5",
    "gospel": "Mt 7,21-29"
  },
  {
    "code": 5124,
    "year": "2",
    "reading1": "2 V 24,8-17",
    "psalm": "Tv 79,1-2.3-5.8.9",
    "gospel": "Mt 7,21-29"
  },
  {
    "code": 5125,
    "year": "1",
    "reading1": "St 17,1.9-10.15-22",
    "psalm": "Tv 128,1-2.3.4-5",
    "gospel": "Mt 8,1-4"
  },
  {
    "code": 5125,
    "year": "2",
    "reading1": "2 V 25,1-12",
    "psalm": "Tv 137,1-2.3.4-5.6",
    "gospel": "Mt 8,1-4"
  },
  {
    "code": 5126,
    "year": "1",
    "reading1": "St 18,1-15",
    "psalm": "Lc 1,46-47.48-49.50.53.54-55",
    "gospel": "Mt 8,5-17"
  },
  {
    "code": 5126,
    "year": "2",
    "reading1": "Ac 2,2.10-14.18-19",
    "psalm": "Tv 74,1-2.3-5.5-7.20-21",
    "gospel": "Mt 8,5-17"
  },
  {
    "code": 5130,
    "year": "A",
    "reading1": "2 V 4,8-11.14-16",
    "psalm": "Tv 89,2-3.16-17.18-19",
    "gospel": "Mt 10,37-42",
    "reading2": "Rm 6,3-4.8-11"
  },
  {
    "code": 5130,
    "year": "B",
    "reading1": "Kn 1,13-15.2,23-24",
    "psalm": "Tv 30,2.4.5-6.11-12.13",
    "gospel": "(Mc 5,21-43;) Mc 5,21-24.35-43",
    "reading2": "2 Cr 8,7.9.13-15"
  },
  {
    "code": 5130,
    "year": "C",
    "reading1": "1 V 19,16.19-21",
    "psalm": "Tv 16,1-2.5.7-8.9-10.11",
    "gospel": "Lc 9,51-62",
    "reading2": "Gl 5,1.13-18"
  },
  {
    "code": 5131,
    "year": "1",
    "reading1": "St 18,16-33",
    "psalm": "Tv 103,1-2.3-4.8-9.10-11",
    "gospel": "Mt 8,18-22"
  },
  {
    "code": 5131,
    "year": "2",
    "reading1": "Am 2,6-10.13-16",
    "psalm": "Tv 50,16-17.18-19.20-21.22-23",
    "gospel": "Mt 8,18-22"
  },
  {
    "code": 5132,
    "year": "1",
    "reading1": "St 19,15-29",
    "psalm": "Tv 26,2-3.9-10.11-12",
    "gospel": "Mt 8,23-27"
  },
  {
    "code": 5132,
    "year": "2",
    "reading1": "Am 3,1-8; 4,11-12",
    "psalm": "Tv 5,4-6.6-7.8",
    "gospel": "Mt 8,23-27"
  },
  {
    "code": 5133,
    "year": "1",
    "reading1": "St 21,5.8-20",
    "psalm": "Tv 34,7-8.10-11.12-13",
    "gospel": "Mt 8,28-34"
  },
  {
    "code": 5133,
    "year": "2",
    "reading1": "Am 5,14-15.21-24",
    "psalm": "Tv 50,7.8-9.10-11.12-12.16-17",
    "gospel": "Mt 8,28-34"
  },
  {
    "code": 5134,
    "year": "1",
    "reading1": "St 22,1-19",
    "psalm": "Tv 115,1-2.3-4.5-6.8-9",
    "gospel": "Mt 9,1-8"
  },
  {
    "code": 5134,
    "year": "2",
    "reading1": "Am 7,10-17",
    "psalm": "Tv 19,8.9.10.11",
    "gospel": "Mt 9,1-8"
  },
  {
    "code": 5135,
    "year": "1",
    "reading1": "St 23,1-4.19; 24,1-8.62-67",
    "psalm": "Tv 106,1-2.3-4.4-5",
    "gospel": "Mt 9,9-13"
  },
  {
    "code": 5135,
    "year": "2",
    "reading1": "Am 8,4-6.9-12",
    "psalm": "Tv 119,2.10.20.30.40.131",
    "gospel": "Mt 9,9-13"
  },
  {
    "code": 5136,
    "year": "1",
    "reading1": "St 27,1-5.15-29",
    "psalm": "Tv 135,1-2.3-4.5-6",
    "gospel": "Mt 9,14-17"
  },
  {
    "code": 5136,
    "year": "2",
    "reading1": "Am 9,11-15",
    "psalm": "Tv 85,9.11-12.13-14",
    "gospel": "Mt 9,14-17"
  },
  {
    "code": 5140,
    "year": "A",
    "reading1": "Dcr 9,9-10",
    "psalm": "Tv 145,1-2.8-9.10-11.13-14",
    "gospel": "Mt 11,25-30",
    "reading2": "Rm 8,9.11-13"
  },
  {
    "code": 5140,
    "year": "B",
    "reading1": "Ed 2,2-5",
    "psalm": "Tv 123,1-2.2.3-4",
    "gospel": "Mc 6,1-6",
    "reading2": "2 Cr 12,7-10"
  },
  {
    "code": 5140,
    "year": "C",
    "reading1": "Is 66,10-14",
    "psalm": "Tv 66,1-3.4-5.6-7.16.20",
    "gospel": "Lc 10,1-12.17-20 (hay Lc 10,1-9)",
    "reading2": "Gl 6,14-18"
  },
  {
    "code": 5141,
    "year": "1",
    "reading1": "St 28,10-22",
    "psalm": "Tv 91,1-2.3-4.14-15",
    "gospel": "Mt 9,18-26"
  },
  {
    "code": 5141,
    "year": "2",
    "reading1": "Hs 2,16-18.21-22",
    "psalm": "Tv 145,2-3.4-5.6-7.8-9",
    "gospel": "Mt 9,18-26"
  },
  {
    "code": 5142,
    "year": "1",
    "reading1": "St 32,23-33",
    "psalm": "Tv 17,1.2-3.6-7.8.15",
    "gospel": "Mt 9,32-38"
  },
  {
    "code": 5142,
    "year": "2",
    "reading1": "Hs 8,4-7.11-13",
    "psalm": "Tv 115,3-4.5-6.7-8.9-10",
    "gospel": "Mt 9,32-38"
  },
  {
    "code": 5143,
    "year": "1",
    "reading1": "St 41,55-57; 42,5-7.17-24",
    "psalm": "Tv 33,2-3.10-11.18-19",
    "gospel": "Mt 10,1-7"
  },
  {
    "code": 5143,
    "year": "2",
    "reading1": "Hs 10,1-3.7-8.12",
    "psalm": "Tv 105,2-3.4-5.6-7",
    "gospel": "Mt 10,1-7"
  },
  {
    "code": 5144,
    "year": "1",
    "reading1": "St 44,18-21.23-29; 45,1-5",
    "psalm": "Tv 105,16-17.18-19.20-21",
    "gospel": "Mt 10,7-15"
  },
  {
    "code": 5144,
    "year": "2",
    "reading1": "Hs 11,1.3-4.8-9",
    "psalm": "Tv 80,2.3.15-16",
    "gospel": "Mt 10,7-15"
  },
  {
    "code": 5145,
    "year": "1",
    "reading1": "St 46,1-7.28-30",
    "psalm": "Tv 37,3-4.18-19.27-28.39-40",
    "gospel": "Mt 10,16-23"
  },
  {
    "code": 5145,
    "year": "2",
    "reading1": "Hs 14,2-10",
    "psalm": "Tv 51,3-4.8-9.12-13.14.17",
    "gospel": "Mt 10,16-23"
  },
  {
    "code": 5146,
    "year": "1",
    "reading1": "St 49,29-33; 50,15-24",
    "psalm": "Tv 105,1-2.3-4.6-7",
    "gospel": "Mt 10,24-33"
  },
  {
    "code": 5146,
    "year": "2",
    "reading1": "Is 6,1-8",
    "psalm": "Tv 93,1.1-2.5",
    "gospel": "Mt 10,24-33"
  },
  {
    "code": 5150,
    "year": "A",
    "reading1": "Is 55,10-11",
    "psalm": "Tv 65,10.11.12-13.14",
    "gospel": "Mt 13,1-23 ( hay Mt 13,1-9)",
    "reading2": "Rm 8,18-23"
  },
  {
    "code": 5150,
    "year": "B",
    "reading1": "Am 7,12-15",
    "psalm": "Tv 85,9-10.11-12.13-14",
    "gospel": "Mc 6,7-13",
    "reading2": "Ep 1,3-14; (hay Ep 1,3-10)"
  },
  {
    "code": 5150,
    "year": "C",
    "reading1": "Đnl 30,10-14",
    "psalm": "Tv 69,14.17.30-31.33-34.36.37 ( hay Tv 19,8.9.10.11)",
    "gospel": "Lc 10,25-37",
    "reading2": "Cl 1,15-20"
  },
  {
    "code": 5151,
    "year": "1",
    "reading1": "Xh 1,8-14.22",
    "psalm": "Tv 124,1-3.4-6.7-8",
    "gospel": "Mt 10,34–11,1"
  },
  {
    "code": 5151,
    "year": "2",
    "reading1": "Is 1,10-17",
    "psalm": "Tv 50,8-9.16-17.21.23",
    "gospel": "Mt 10,34–11,1"
  },
  {
    "code": 5152,
    "year": "1",
    "reading1": "Xh 2,1-15",
    "psalm": "Tv 69,3.14.30-31.33-34",
    "gospel": "Mt 11,20-24"
  },
  {
    "code": 5152,
    "year": "2",
    "reading1": "Is 7,1-9",
    "psalm": "Tv 48,2-3.3-4.5-6.7-8",
    "gospel": "Mt 11,20-24"
  },
  {
    "code": 5153,
    "year": "1",
    "reading1": "Xh 3,1-6.9-12",
    "psalm": "Tv 103, 1-2.3-4.6-7",
    "gospel": "Mt 11,25-27"
  },
  {
    "code": 5153,
    "year": "2",
    "reading1": "Is 10,5-7.13-16",
    "psalm": "Tv 94,5-6.7-8.9-10.14-15",
    "gospel": "Mt 11,25-27"
  },
  {
    "code": 5154,
    "year": "1",
    "reading1": "Xh 3,11-20",
    "psalm": "Tv 105,1.5.8-9.24-25.26-27",
    "gospel": "Mt 11,28-30"
  },
  {
    "code": 5154,
    "year": "2",
    "reading1": "Is 26,7-9.12.16-19",
    "psalm": "Tv 102,13-14.15.16-18.19-21",
    "gospel": "Mt 11,28-30"
  },
  {
    "code": 5155,
    "year": "1",
    "reading1": "Xh 11,10–12,14",
    "psalm": "Tv 116,12-13.15-16.17-18",
    "gospel": "Mt 12,1-8"
  },
  {
    "code": 5155,
    "year": "2",
    "reading1": "Is 38,1-8.21-22",
    "psalm": "Is 38,10-11.12.16",
    "gospel": "Mt 12,1-8"
  },
  {
    "code": 5156,
    "year": "1",
    "reading1": "Xh 12,37-42",
    "psalm": "Tv 136,1.23-24.10-12.13-15",
    "gospel": "Mt 12,14-21"
  },
  {
    "code": 5156,
    "year": "2",
    "reading1": "Mk 2,1-5",
    "psalm": "Tv 10,1-2.3-4.7-8.14",
    "gospel": "Mt 12,14-21"
  },
  {
    "code": 5160,
    "year": "A",
    "reading1": "Kn 12,13.16-19",
    "psalm": "Tv 86,5-6.9-10.15-16",
    "gospel": "Mt 13,24-43 ( hay Mt 13,24-30)",
    "reading2": "Rm 8,26-27"
  },
  {
    "code": 5160,
    "year": "B",
    "reading1": "Gr 23,1-6",
    "psalm": "Tv 23,1-3.34.5.6",
    "gospel": "Mc 6,30-34",
    "reading2": "Ep 2,13-18"
  },
  {
    "code": 5160,
    "year": "C",
    "reading1": "St 18,1-10",
    "psalm": "Tv 15,2-3.34.5",
    "gospel": "Lc 10,38-42",
    "reading2": "Cl 1,24-28"
  },
  {
    "code": 5161,
    "year": "1",
    "reading1": "Xh 14,5-18",
    "psalm": "Xh 15,1-2.3-4.5-6",
    "gospel": "Mt 12,38-42"
  },
  {
    "code": 5161,
    "year": "2",
    "reading1": "Mk 6,1-4.6-8",
    "psalm": "Tv 50,5-6.8-9.16-17.21.23",
    "gospel": "Mt 12,38-42"
  },
  {
    "code": 5162,
    "year": "1",
    "reading1": "Xh 14,21–15,1",
    "psalm": "Xh 15,8-9.10.12.17",
    "gospel": "Mt 12,46-50"
  },
  {
    "code": 5162,
    "year": "2",
    "reading1": "Mk 7,14-15.18-20",
    "psalm": "Tv 85,2-4.5-6.7-8",
    "gospel": "Mt 12,46-50"
  },
  {
    "code": 5163,
    "year": "1",
    "reading1": "Xh 16,1-5.9-15",
    "psalm": "Tv 78,18-19.23-24.25-26.27-28",
    "gospel": "Mt 13,1-9"
  },
  {
    "code": 5163,
    "year": "2",
    "reading1": "Gr 1,1.4-10",
    "psalm": "Tv 71,1-2.3-4.5-6.15.17",
    "gospel": "Mt 13,1-9"
  },
  {
    "code": 5164,
    "year": "1",
    "reading1": "Xh 19,1-2.9-11.16-20",
    "psalm": "Đn 3,52.53.54.55.56",
    "gospel": "Mt 13,10-17"
  },
  {
    "code": 5164,
    "year": "2",
    "reading1": "Gr 2,1-3.7-8.12-13",
    "psalm": "Tv 36,6-7.8-9.10-11",
    "gospel": "Mt 13,10-17"
  },
  {
    "code": 5165,
    "year": "1",
    "reading1": "Xh 20,1-17",
    "psalm": "Tv 19,8.9.10.11",
    "gospel": "Mt 13,18-23"
  },
  {
    "code": 5165,
    "year": "2",
    "reading1": "Gr 3,14-17",
    "psalm": "Hc 31,10.11-12.13",
    "gospel": "Mt 13,18-23"
  },
  {
    "code": 5166,
    "year": "1",
    "reading1": "Xh 24,3-8",
    "psalm": "Tv 50,1-2.5-6.14-15",
    "gospel": "Mt 13,24-30"
  },
  {
    "code": 5166,
    "year": "2",
    "reading1": "Gr 7,1-11",
    "psalm": "Tv 84,3.4.5-6.8.11",
    "gospel": "Mt 13,24-30"
  },
  {
    "code": 5170,
    "year": "A",
    "reading1": "1 V 3,5.7-12",
    "psalm": "Tv 119,57.72.76-77.127-128.129-130",
    "gospel": "Mt 13,44-52 ( hay Mt 13,44-46)",
    "reading2": "Rm 8,28-30"
  },
  {
    "code": 5170,
    "year": "B",
    "reading1": "2 V 4,42-44",
    "psalm": "Tv 145,10-11.15-16.17-18",
    "gospel": "Ga 6,1-15",
    "reading2": "Ep 4,1-6"
  },
  {
    "code": 5170,
    "year": "C",
    "reading1": "St 18,20-32",
    "psalm": "Tv 138,1-2.23.6-7.78",
    "gospel": "Lc 11,1-13",
    "reading2": "Cl 2,12-14"
  },
  {
    "code": 5171,
    "year": "1",
    "reading1": "Xh 32,15-24.30-34",
    "psalm": "Tv 106,19-20.21-22.23",
    "gospel": "Mt 13,31-35"
  },
  {
    "code": 5171,
    "year": "2",
    "reading1": "Gr 13,1-11",
    "psalm": "Đnl 32,18-19.20.21",
    "gospel": "Mt 13,31-35"
  },
  {
    "code": 5172,
    "year": "1",
    "reading1": "Xh 33,7-11; 34,5-9.28",
    "psalm": "Tv 103,6-7.8-9.10-11.12-13",
    "gospel": "Mt 13,35-43"
  },
  {
    "code": 5172,
    "year": "2",
    "reading1": "Gr 14,17-22",
    "psalm": "Tv 79,8.9.11.13",
    "gospel": "Mt 13,35-43"
  },
  {
    "code": 5173,
    "year": "1",
    "reading1": "Xh 34,29-35",
    "psalm": "Tv 99,5.6.7.9",
    "gospel": "Mt 13,44-46"
  },
  {
    "code": 5173,
    "year": "2",
    "reading1": "Gr 15,10.16-21",
    "psalm": "Tv 59,2-3.4.10-11.17.18",
    "gospel": "Mt 13,44-46"
  },
  {
    "code": 5174,
    "year": "1",
    "reading1": "Xh 40,16-21.34-38",
    "psalm": "Tv 84,3.4.5-6.8.11",
    "gospel": "Mt 13,47-53"
  },
  {
    "code": 5174,
    "year": "2",
    "reading1": "Gr 18,1-6",
    "psalm": "Tv 146,1-2.2-4.5-6",
    "gospel": "Mt 13,47-53"
  },
  {
    "code": 5175,
    "year": "1",
    "reading1": "Lv 23,1.4-11.15-16.27.34-37",
    "psalm": "Tv 81,3-4.5-6.10-11",
    "gospel": "Mt 13,54-58"
  },
  {
    "code": 5175,
    "year": "2",
    "reading1": "Gr 26,1-9",
    "psalm": "Tv 69,5.8-10.14",
    "gospel": "Mt 13,54-58"
  },
  {
    "code": 5176,
    "year": "1",
    "reading1": "Lv 25,1.8-17",
    "psalm": "Tv 67,2-3.5.7-8",
    "gospel": "Mt 14,1-12"
  },
  {
    "code": 5176,
    "year": "2",
    "reading1": "Gr 26,11-16.24",
    "psalm": "Tv 69,15-16.30-31.33-34",
    "gospel": "Mt 14,1-12"
  },
  {
    "code": 5180,
    "year": "A",
    "reading1": "Is 55,1-3",
    "psalm": "Tv 145,8-9.15-16.17-18",
    "gospel": "Mt 14,13-21",
    "reading2": "Rm 8,35.37-39"
  },
  {
    "code": 5180,
    "year": "B",
    "reading1": "Xh 16,2-4.12-15",
    "psalm": "Tv 78,3-4.23-24.25.54",
    "gospel": "Ga 6,24-35",
    "reading2": "Ep 4,17.20-24"
  },
  {
    "code": 5180,
    "year": "C",
    "reading1": "Gv 1,2.2,21-23",
    "psalm": "Tv 90,3-4.5-6.12-14.17",
    "gospel": "Lc 12,13-21",
    "reading2": "Cl 3,1-5.9-11"
  },
  {
    "code": 5181,
    "year": "1",
    "reading1": "Ds 11,4-15",
    "psalm": "Tv 81,12-13.14-15.16-17",
    "gospel": "Mt 14,13-21"
  },
  {
    "code": 5181,
    "year": "2",
    "reading1": "Gr 28,1-17",
    "psalm": "Tv 119,29.43.79.80.95.102",
    "gospel": "Mt 14,13-21"
  },
  {
    "code": 5182,
    "year": "1",
    "reading1": "Ds 12,1-13",
    "psalm": "Tv 51,3-4.5-6.6-7.12-13",
    "gospel": "Mt 14,22-36"
  },
  {
    "code": 5182,
    "year": "2",
    "reading1": "Gr 30,1-2.12-15.18-22",
    "psalm": "Tv 102,16-18.19-1.29.22-23",
    "gospel": "Mt 14,22-36"
  },
  {
    "code": 5183,
    "year": "1",
    "reading1": "Ds 13,1-2.25–14,1.26-29.34-35",
    "psalm": "Tv 106,6-7.13-14.21-22.23",
    "gospel": "Mt 15,21-28"
  },
  {
    "code": 5183,
    "year": "2",
    "reading1": "Gr 31,1-7",
    "psalm": "Hc 31,10.11-12.13",
    "gospel": "Mt 15,21-28"
  },
  {
    "code": 5184,
    "year": "1",
    "reading1": "Ds 20,1-13",
    "psalm": "Tv 95,1-2.6-7.8-9",
    "gospel": "Mt 16,13-23"
  },
  {
    "code": 5184,
    "year": "2",
    "reading1": "Gr 31,31-34",
    "psalm": "Tv 51,12-13.14-15.18-19",
    "gospel": "Mt 16,13-23"
  },
  {
    "code": 5185,
    "year": "1",
    "reading1": "Đnl 4,32-40",
    "psalm": "Tv 77,12-13.14-15.16.21",
    "gospel": "Mt 16,24-28"
  },
  {
    "code": 5185,
    "year": "2",
    "reading1": "Nk 2,1.3; 3,1-3.6-7",
    "psalm": "Đnl 32,35-36.39.41",
    "gospel": "Mt 16,24-28"
  },
  {
    "code": 5186,
    "year": "1",
    "reading1": "Đnl 6,4-13",
    "psalm": "Tv 18,2-3.3-4.47.51",
    "gospel": "Mt 17,14-20"
  },
  {
    "code": 5186,
    "year": "2",
    "reading1": "Kb 1,12–2,4",
    "psalm": "Tv 9,8-9.10-11.12-13",
    "gospel": "Mt 17,14-20"
  },
  {
    "code": 5190,
    "year": "A",
    "reading1": "1 V 19,9.11-13",
    "psalm": "Tv 85,9.10.11-12.13-14",
    "gospel": "Mt 14,22-33",
    "reading2": "Rm 9,1-5"
  },
  {
    "code": 5190,
    "year": "B",
    "reading1": "1 V 19,4-8",
    "psalm": "Tv 34,2-3.4-5.6-7.8-9",
    "gospel": "Ga 6,41-51",
    "reading2": "Ep 4,30-32; 5,2"
  },
  {
    "code": 5190,
    "year": "C",
    "reading1": "Kn 18,6-9",
    "psalm": "Tv 33,1.12.18-19.20-22",
    "gospel": "Lc 12,32-48 ( hay Lc 12,35-40)",
    "reading2": "Dt 11,1-2.8-19 ( hay Dt 11,1-2.8-12)"
  },
  {
    "code": 5191,
    "year": "1",
    "reading1": "Đnl 10,12-22",
    "psalm": "Tv 147,12-13.14-15.19-20",
    "gospel": "Mt 17,22-27"
  },
  {
    "code": 5191,
    "year": "2",
    "reading1": "Ed 1,2-5.24-28",
    "psalm": "Tv 148,1-2.11-12.12-14.14",
    "gospel": "Mt 17,22-27"
  },
  {
    "code": 5192,
    "year": "1",
    "reading1": "Đnl 31,1-8",
    "psalm": "Đnl 32,3-4.7.8.9.12",
    "gospel": "Mt 18,1-5.10.12-14"
  },
  {
    "code": 5192,
    "year": "2",
    "reading1": "Ed 2,8–3,4",
    "psalm": "Tv 119,14.24.72.103.111.131",
    "gospel": "Mt 18,1-5.10.12-14"
  },
  {
    "code": 5193,
    "year": "1",
    "reading1": "Đnl 34,1-12",
    "psalm": "Tv 661-3.5.8.16-17",
    "gospel": "Mt 18,15-20"
  },
  {
    "code": 5193,
    "year": "2",
    "reading1": "Ed 9,1-7; 10,18-22",
    "psalm": "Tv 113,1-2.3-4.5-6",
    "gospel": "Mt 18,15-20"
  },
  {
    "code": 5194,
    "year": "1",
    "reading1": "Gs 3,7-11.13-17",
    "psalm": "Tv 114,1-2.3-4.5-6",
    "gospel": "Mt 18,21-19,1"
  },
  {
    "code": 5194,
    "year": "2",
    "reading1": "Ed 12,1-2",
    "psalm": "Tv 78,56-57.58-59.61-62",
    "gospel": "Mt 18,21-19,1"
  },
  {
    "code": 5195,
    "year": "1",
    "reading1": "Gs 24,1-13",
    "psalm": "Tv 136,1-3.16-18.21-22.24",
    "gospel": "Mt 19,3-12"
  },
  {
    "code": 5195,
    "year": "2",
    "reading1": "Ed 16,1-15.60.63; 16,59-63",
    "psalm": "Is 12,2-3.4.5-6",
    "gospel": "Mt 19,3-12"
  },
  {
    "code": 5196,
    "year": "1",
    "reading1": "Gs 24,14-29",
    "psalm": "Tv 16,1-2.5.7-8.11",
    "gospel": "Mt 19,13-15"
  },
  {
    "code": 5196,
    "year": "2",
    "reading1": "Ed 18,1-10.13.30-32",
    "psalm": "Tv 51,12-13.14-15.18-19",
    "gospel": "Mt 19,13-15"
  },
  {
    "code": 5200,
    "year": "A",
    "reading1": "Is 56,1.6-7",
    "psalm": "Tv 67,2-3.5.6.8",
    "gospel": "Mt 15,21-28",
    "reading2": "Rm 11,13-15.29-32"
  },
  {
    "code": 5200,
    "year": "B",
    "reading1": "Cn 9,1-6",
    "psalm": "Tv 34,2-3.4-5.6-7",
    "gospel": "Ga 6,51-58",
    "reading2": "Ep 5,15-20"
  },
  {
    "code": 5200,
    "year": "C",
    "reading1": "Hc 38,4-6.8-10",
    "psalm": "Tv 40,2.3.4.18",
    "gospel": "Lc 12,49-53",
    "reading2": "Dt 12,1-4"
  },
  {
    "code": 5201,
    "year": "1",
    "reading1": "Tl 2,11-19",
    "psalm": "Tv 106,34-35.36-37.39-40.43.44",
    "gospel": "Mt 19,16-22"
  },
  {
    "code": 5201,
    "year": "2",
    "reading1": "Ed 24,15-24",
    "psalm": "Đnl 32,18-19.20.21",
    "gospel": "Mt 19,16-22"
  },
  {
    "code": 5202,
    "year": "1",
    "reading1": "Tl 6,11-24",
    "psalm": "Tv 85,9.11-12.13-14",
    "gospel": "Mt 19,23-30"
  },
  {
    "code": 5202,
    "year": "2",
    "reading1": "Ed 28,1-10",
    "psalm": "Đnl 32,26-27.27-28.30.35-36",
    "gospel": "Mt 19,23-30"
  },
  {
    "code": 5203,
    "year": "1",
    "reading1": "Tl 9,6-15",
    "psalm": "Tv 21,2-3.4-5.6-7",
    "gospel": "Mt 20,1-16"
  },
  {
    "code": 5203,
    "year": "2",
    "reading1": "Ed 34,1-11",
    "psalm": "Tv 23,1-3.3-4.5.6",
    "gospel": "Mt 20,1-16"
  },
  {
    "code": 5204,
    "year": "1",
    "reading1": "Tl 11,29-39",
    "psalm": "Tv 40,5.7-8.8-9.10",
    "gospel": "Mt 22,1-14"
  },
  {
    "code": 5204,
    "year": "2",
    "reading1": "Ed 36,23-28",
    "psalm": "Tv 51,12-13.14-15.18-19",
    "gospel": "Mt 22,1-14"
  },
  {
    "code": 5205,
    "year": "1",
    "reading1": "R 1,1.3-6.14-16.22",
    "psalm": "Tv 146,5-6.7.8-9.9.10",
    "gospel": "Mt 22,34-40"
  },
  {
    "code": 5205,
    "year": "2",
    "reading1": "Ed 37,1-14",
    "psalm": "Tv 107,2-3.4-5.6-7.8-9",
    "gospel": "Mt 22,34-40"
  },
  {
    "code": 5206,
    "year": "1",
    "reading1": "R 2,1-3.8-11; 4,13-17",
    "psalm": "Tv 128,1-2.3.4.5",
    "gospel": "Mt 23,1-12"
  },
  {
    "code": 5206,
    "year": "2",
    "reading1": "Ed 43,1-7",
    "psalm": "Tv 85,9-10.11-12.13-14",
    "gospel": "Mt 23,1-12"
  },
  {
    "code": 5210,
    "year": "A",
    "reading1": "Is 22,19-23",
    "psalm": "Tv 138,1-2.23.6.8",
    "gospel": "Mt 16,13-20",
    "reading2": "Rm 11,33-36"
  },
  {
    "code": 5210,
    "year": "B",
    "reading1": "Gs 24,1-2.15-17.18",
    "psalm": "Tv 34,2-3.16-17.18-19.20-21",
    "gospel": "Ga 6,60-69",
    "reading2": "Ep 5,21-32; 5,2.25-32"
  },
  {
    "code": 5210,
    "year": "C",
    "reading1": "Is 66,18-21",
    "psalm": "Tv 117,1.2",
    "gospel": "Lc 13,22-30",
    "reading2": "Dt 12,5-7.11-13"
  },
  {
    "code": 5211,
    "year": "1",
    "reading1": "1 Tx  1,2-5.8-10",
    "psalm": "Tv 149,1-2.3-4.5-6.9",
    "gospel": "Mt 23,13-22"
  },
  {
    "code": 5211,
    "year": "2",
    "reading1": "2 Tx  1,1-5.11-12",
    "psalm": "Tv 96,1-2.2-3.4-5",
    "gospel": "Mt 23,13-22"
  },
  {
    "code": 5212,
    "year": "1",
    "reading1": "1 Tx  2,1-8",
    "psalm": "Tv 139,1-3.4-6",
    "gospel": "Mt 23,23-26"
  },
  {
    "code": 5212,
    "year": "2",
    "reading1": "2 Tx  2,1-3.14-16",
    "psalm": "Tv 96,10.11-12.13",
    "gospel": "Mt 23,23-26"
  },
  {
    "code": 5213,
    "year": "1",
    "reading1": "1 Tx  2,9-13",
    "psalm": "Tv 139,7-8.9-10.11-12",
    "gospel": "Mt 23,27-32"
  },
  {
    "code": 5213,
    "year": "2",
    "reading1": "2 Tx  3,6-10.16-18",
    "psalm": "Tv 128,1-2.4-5",
    "gospel": "Mt 23,27-32"
  },
  {
    "code": 5214,
    "year": "1",
    "reading1": "1 Tx  3,7-13",
    "psalm": "Tv 90,3-4.12-13.14.17",
    "gospel": "Mt 24,42-51"
  },
  {
    "code": 5214,
    "year": "2",
    "reading1": "1 Cr 1,1-9",
    "psalm": "Tv 145,2-3.4-5.6-7",
    "gospel": "Mt 24,42-51"
  },
  {
    "code": 5215,
    "year": "1",
    "reading1": "1 Tx  4,1-8",
    "psalm": "Tv 97,1.2.5-6.10.11-12",
    "gospel": "Mt 25,1-13"
  },
  {
    "code": 5215,
    "year": "2",
    "reading1": "1 Cr 1,17-25",
    "psalm": "Tv 33,1-2.4-5.10.11",
    "gospel": "Mt 25,1-13"
  },
  {
    "code": 5216,
    "year": "1",
    "reading1": "1 Tx  4,9-12",
    "psalm": "Tv 98,1.7-8.9",
    "gospel": "Mt 25,14-30"
  },
  {
    "code": 5216,
    "year": "2",
    "reading1": "1 Cr 1,26-31",
    "psalm": "Tv 33,12-13.18-19.20-21",
    "gospel": "Mt 25,14-30"
  },
  {
    "code": 5220,
    "year": "A",
    "reading1": "Hc 20,7-9",
    "psalm": "Tv 63,2.3-4.5-6.8-9",
    "gospel": "Mt 16,21-27",
    "reading2": "Rm 12,1-2"
  },
  {
    "code": 5220,
    "year": "B",
    "reading1": "Đnl 4,1-2.6-8",
    "psalm": "Tv 15,2-3.34.45",
    "gospel": "Mc 7,1-8.14-15.21-23",
    "reading2": "Gc 1,17-18.21.22.27"
  },
  {
    "code": 5220,
    "year": "C",
    "reading1": "Hc 3,17-18.20.28-29",
    "psalm": "Tv 68,4-5.6-7.10-11",
    "gospel": "Lc 14,1.7-14",
    "reading2": "Dt 12,18-19.22-24"
  },
  {
    "code": 5221,
    "year": "1",
    "reading1": "1 Tx  4,13-18",
    "psalm": "Tv 96,1.3.4-5.11-12.13",
    "gospel": "Lc 4,16-30"
  },
  {
    "code": 5221,
    "year": "2",
    "reading1": "1 Cr 2,1-5",
    "psalm": "Tv 119,97.98.99.100.101.102",
    "gospel": "Lc 4,16-30"
  },
  {
    "code": 5222,
    "year": "1",
    "reading1": "1 Tx  5,1-6.9-11",
    "psalm": "Tv 27,1.4.13-14",
    "gospel": "Lc 4,31-37"
  },
  {
    "code": 5222,
    "year": "2",
    "reading1": "1 Cr 2,10-16",
    "psalm": "Tv 145,8-9.10-11.12-13.13-14",
    "gospel": "Lc 4,31-37"
  },
  {
    "code": 5223,
    "year": "1",
    "reading1": "Cl 1,1-8",
    "psalm": "Tv 52,10.11",
    "gospel": "Lc 4,38-44"
  },
  {
    "code": 5223,
    "year": "2",
    "reading1": "1 Cr 3,1-9",
    "psalm": "Tv 33,12-13.14-15.20-21",
    "gospel": "Lc 4,38-44"
  },
  {
    "code": 5224,
    "year": "1",
    "reading1": "Cl 1,9-14",
    "psalm": "Tv 98,2-3.3-4.5-6",
    "gospel": "Lc 5,1-11"
  },
  {
    "code": 5224,
    "year": "2",
    "reading1": "1 Cr 3,18-23",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Lc 5,1-11"
  },
  {
    "code": 5225,
    "year": "1",
    "reading1": "Cl 1,15-20",
    "psalm": "Tv 100,1.2.3.4.5",
    "gospel": "Lc 5,33-39"
  },
  {
    "code": 5225,
    "year": "2",
    "reading1": "1 Cr 4,1-5",
    "psalm": "Tv 37,3-4.5-6.27-28.39-40",
    "gospel": "Lc 5,33-39"
  },
  {
    "code": 5226,
    "year": "1",
    "reading1": "Cl 1,21-23",
    "psalm": "Tv 54,3-4.6.8",
    "gospel": "Lc 6,1-5"
  },
  {
    "code": 5226,
    "year": "2",
    "reading1": "1 Cr 4,9-15",
    "psalm": "Tv 145,17-18.19-20.21",
    "gospel": "Lc 6,1-5"
  },
  {
    "code": 5230,
    "year": "A",
    "reading1": "Ed 33,7-9",
    "psalm": "Tv 95,1-2.6-7.8-9",
    "gospel": "Mt 18,15-20",
    "reading2": "Rm 13,8-10"
  },
  {
    "code": 5230,
    "year": "B",
    "reading1": "Is 35,4-7",
    "psalm": "Tv 146,7.8-9.910",
    "gospel": "Mc 7,31-37",
    "reading2": "Gc 2,1-5"
  },
  {
    "code": 5230,
    "year": "C",
    "reading1": "Kn 9,13-18",
    "psalm": "Tv 90,3-4.5-6.12-13.14.17",
    "gospel": "Lc 14,25-33",
    "reading2": "Plm 9-10.12-17"
  },
  {
    "code": 5231,
    "year": "1",
    "reading1": "Cl 1,24–2,3",
    "psalm": "Tv 62,6-7.9",
    "gospel": "Lc 6,6-11"
  },
  {
    "code": 5231,
    "year": "2",
    "reading1": "1 Cr 5,1-8",
    "psalm": "Tv 5,5-6.7.12",
    "gospel": "Lc 6,6-11"
  },
  {
    "code": 5232,
    "year": "1",
    "reading1": "Cl 2,6-15",
    "psalm": "Tv 145,1-2.8-9.10-11",
    "gospel": "Lc 6,12-19"
  },
  {
    "code": 5232,
    "year": "2",
    "reading1": "1 Cr 6,1-11",
    "psalm": "Tv 149,1-2.3-4.5-6.9",
    "gospel": "Lc 6,12-19"
  },
  {
    "code": 5233,
    "year": "1",
    "reading1": "Cl 3,1-11",
    "psalm": "Tv 145,2-3.10-11.12-13",
    "gospel": "Lc 6,20-26"
  },
  {
    "code": 5233,
    "year": "2",
    "reading1": "1 Cr 7,25-31",
    "psalm": "Tv 45,11-12.14-15.16-17",
    "gospel": "Lc 6,20-26"
  },
  {
    "code": 5234,
    "year": "1",
    "reading1": "Cl 3,12-17",
    "psalm": "Tv 150,1-2.3-4.5-6",
    "gospel": "Lc 6,27-38"
  },
  {
    "code": 5234,
    "year": "2",
    "reading1": "1 Cr 8,1-7.11-13",
    "psalm": "Tv 139,1-3.13-14.23-24",
    "gospel": "Lc 6,27-38"
  },
  {
    "code": 5235,
    "year": "1",
    "reading1": "1 Tm 1,1-2.12-14",
    "psalm": "Tv 16,1-2.5.7-8.11",
    "gospel": "Lc 6,39-42"
  },
  {
    "code": 5235,
    "year": "2",
    "reading1": "1 Cr 9,16-19.22-27",
    "psalm": "Tv 84,3.4.5-6.8.12",
    "gospel": "Lc 6,39-42"
  },
  {
    "code": 5236,
    "year": "1",
    "reading1": "1 Tm 1,15-17",
    "psalm": "Tv 113,1-2.3-4.5.6-7",
    "gospel": "Lc 6,43-49"
  },
  {
    "code": 5236,
    "year": "2",
    "reading1": "1 Cr 10,14-22",
    "psalm": "Tv 116,12-13.17-18",
    "gospel": "Lc 6,43-49"
  },
  {
    "code": 5240,
    "year": "A",
    "reading1": "Hc 27,30-28,7",
    "psalm": "Tv 103,1-2.3-4.9-10.11-12",
    "gospel": "Mt 18,21-35",
    "reading2": "Rm 14,7-9"
  },
  {
    "code": 5240,
    "year": "B",
    "reading1": "Is 50,4-9",
    "psalm": "Tv 116,1-2.3-4.5-6.8-9",
    "gospel": "Mc 8,27-35",
    "reading2": "Gc 2,14-18"
  },
  {
    "code": 5240,
    "year": "C",
    "reading1": "Xh 32,7-11.13-14",
    "psalm": "Tv 51,3-4.12-13.17.19",
    "gospel": "Lc 15,1-32 (hay Lc 15,1-10)",
    "reading2": "1 Tm 1,12-17"
  },
  {
    "code": 5241,
    "year": "1",
    "reading1": "1 Tm 2,1-8",
    "psalm": "Tv 28,2.7.8-9",
    "gospel": "Lc 7,1-10"
  },
  {
    "code": 5241,
    "year": "2",
    "reading1": "1 Cr 11,17-26.33",
    "psalm": "Tv 40,7-8.8-9.10.17",
    "gospel": "Lc 7,1-10"
  },
  {
    "code": 5242,
    "year": "1",
    "reading1": "1 Tm 3,1-13",
    "psalm": "Tv 101,1-2.2-3.5.6",
    "gospel": "Lc 7,11-17"
  },
  {
    "code": 5242,
    "year": "2",
    "reading1": "1 Cr 12,12-14.27-31",
    "psalm": "Tv 100,1-2.3.4.5",
    "gospel": "Lc 7,11-17"
  },
  {
    "code": 5243,
    "year": "1",
    "reading1": "1 Tm 3,14-16",
    "psalm": "Tv 111,1-2.3-4.5-6",
    "gospel": "Lc 7,31-35"
  },
  {
    "code": 5243,
    "year": "2",
    "reading1": "1 Cr 12,31–13,13",
    "psalm": "Tv 33,2-3.4-5.12.22",
    "gospel": "Lc 7,31-35"
  },
  {
    "code": 5244,
    "year": "1",
    "reading1": "1 Tm 4,12-16",
    "psalm": "Tv 111,7-8.9.10",
    "gospel": "Lc 7,36-50"
  },
  {
    "code": 5244,
    "year": "2",
    "reading1": "1 Cr 15,1-11",
    "psalm": "Tv 118,1-2.16-17.28",
    "gospel": "Lc 7,36-50"
  },
  {
    "code": 5245,
    "year": "1",
    "reading1": "1 Tm 6,2-12",
    "psalm": "Tv 49,6-7.8-10.17-18.19-20",
    "gospel": "Lc 8,1-3"
  },
  {
    "code": 5245,
    "year": "2",
    "reading1": "1 Cr 15,12-20",
    "psalm": "Tv 17,1.6-7.8.15",
    "gospel": "Lc 8,1-3"
  },
  {
    "code": 5246,
    "year": "1",
    "reading1": "1 Tm 6,13-16",
    "psalm": "Tv 100,2.3.4.5",
    "gospel": "Lc 8,4-15"
  },
  {
    "code": 5246,
    "year": "2",
    "reading1": "1 Cr 15,35-37.42-49",
    "psalm": "Tv 56,10-12.13-14",
    "gospel": "Lc 8,4-15"
  },
  {
    "code": 5250,
    "year": "A",
    "reading1": "Is 55,6-9",
    "psalm": "Tv 145,2-3.8-9.17-18",
    "gospel": "Mt 20,1-16",
    "reading2": "Pl 1,20-24.27"
  },
  {
    "code": 5250,
    "year": "B",
    "reading1": "Kn 2,12.17-20",
    "psalm": "Tv 54,3-4.5.6-8",
    "gospel": "Mc 9,30-37",
    "reading2": "Gc 3,16-18; 4,3"
  },
  {
    "code": 5250,
    "year": "C",
    "reading1": "Am 8,4-7",
    "psalm": "Tv 113,1-2.4-6.7-8",
    "gospel": "Lc 16,1-13 (hay Lc 16,10-13)",
    "reading2": "1 Tm 2,1-8"
  },
  {
    "code": 5251,
    "year": "1",
    "reading1": "Er 1,1-6",
    "psalm": "Tv 126,1-2.2-3.4-5.6",
    "gospel": "Lc 8,16-18"
  },
  {
    "code": 5251,
    "year": "2",
    "reading1": "Cn 3,27-34",
    "psalm": "Tv 15,2-3.3-4.5",
    "gospel": "Lc 8,16-18"
  },
  {
    "code": 5252,
    "year": "1",
    "reading1": "Er 6,7-8.12.14-20",
    "psalm": "Tv 122,1-2.3-4.4-5",
    "gospel": "Lc 8,19-21"
  },
  {
    "code": 5252,
    "year": "2",
    "reading1": "Cn 21,1-6.10-13",
    "psalm": "Tv 119,1.27.20.34.35.44",
    "gospel": "Lc 8,19-21"
  },
  {
    "code": 5253,
    "year": "1",
    "reading1": "Er 9,5-9",
    "psalm": "Tb 13,2.3-4.6.7-8.6fg",
    "gospel": "Lc 9,1-6"
  },
  {
    "code": 5253,
    "year": "2",
    "reading1": "Cn 30,5-9",
    "psalm": "Tv 119,29.72.89.101.104.163",
    "gospel": "Lc 9,1-6"
  },
  {
    "code": 5254,
    "year": "1",
    "reading1": "Kg 1,1-8",
    "psalm": "Tv 149,1-2.3-4.5-6.9",
    "gospel": "Lc 9,7-9"
  },
  {
    "code": 5254,
    "year": "2",
    "reading1": "Gv 1,2-11",
    "psalm": "Tv 90,3-4.5-6.12-13.14.17",
    "gospel": "Lc 9,7-9"
  },
  {
    "code": 5255,
    "year": "1",
    "reading1": "Kg 1,15–2,9",
    "psalm": "Tv 43,1.2.3.4",
    "gospel": "Lc 9,18-22"
  },
  {
    "code": 5255,
    "year": "2",
    "reading1": "Gv 3,1-11",
    "psalm": "Tv 144,1-2.3-4",
    "gospel": "Lc 9,18-22"
  },
  {
    "code": 5256,
    "year": "1",
    "reading1": "Dcr 2,5-9.14-15",
    "psalm": "Hc 31,10.11-12.13",
    "gospel": "Lc 9,43-45"
  },
  {
    "code": 5256,
    "year": "2",
    "reading1": "Gv 11,9-12,8",
    "psalm": "Tv 90,3-4.5-6.12-13.14.17",
    "gospel": "Lc 9,43-45"
  },
  {
    "code": 5260,
    "year": "A",
    "reading1": "Ed 18,25-28",
    "psalm": "Tv 25,4-5.6-7.8-9",
    "gospel": "Mt 21,28-32",
    "reading2": "Pl 2,1-11; 1-5"
  },
  {
    "code": 5260,
    "year": "B",
    "reading1": "Ds 11,25-29",
    "psalm": "Tv 19,8.10.12-13.14",
    "gospel": "Mc 9,38-43.45.47-48",
    "reading2": "Gc 5,1-6"
  },
  {
    "code": 5260,
    "year": "C",
    "reading1": "Am 6,1.4-7",
    "psalm": "Tv 146,7.8-9.910",
    "gospel": "Lc 16,19-31",
    "reading2": "1 Tm 6,11-16"
  },
  {
    "code": 5261,
    "year": "1",
    "reading1": "Dcr 8,1-8",
    "psalm": "Tv 102,16-18.19-21.29.22-23",
    "gospel": "Lc 9,46-50"
  },
  {
    "code": 5261,
    "year": "2",
    "reading1": "G 1,6-22",
    "psalm": "Tv 17,1.2-3.6-7",
    "gospel": "Lc 9,46-50"
  },
  {
    "code": 5262,
    "year": "1",
    "reading1": "Dcr 8,20-23",
    "psalm": "Tv 87,1-3.4-5.6-7",
    "gospel": "Lc 9,51-56"
  },
  {
    "code": 5262,
    "year": "2",
    "reading1": "G 3,1-3.11-17.20-23",
    "psalm": "Tv 88,2-3.4-5.6.7-8",
    "gospel": "Lc 9,51-56"
  },
  {
    "code": 5263,
    "year": "1",
    "reading1": "Nkm 2,1-8",
    "psalm": "Tv 137,1-2.3.4-5.6",
    "gospel": "Lc 9,57-62"
  },
  {
    "code": 5263,
    "year": "2",
    "reading1": "G 9,1-12.14-16",
    "psalm": "Tv 88,10-11.12-13.14-15",
    "gospel": "Lc 9,57-62"
  },
  {
    "code": 5264,
    "year": "1",
    "reading1": "Nkm 8,1-4.5-6.7-12",
    "psalm": "Tv 19,8.9.10.11",
    "gospel": "Lc 10,1-12"
  },
  {
    "code": 5264,
    "year": "2",
    "reading1": "G 19,21-27",
    "psalm": "Tv 27,7-8.8-9.13-14",
    "gospel": "Lc 10,1-12"
  },
  {
    "code": 5265,
    "year": "1",
    "reading1": "Br 1,15-22",
    "psalm": "Tv 79,1-2.3-5.8.9",
    "gospel": "Lc 10,13-16"
  },
  {
    "code": 5265,
    "year": "2",
    "reading1": "G 38,1.12-21; 40,3-5",
    "psalm": "Tv 139,1-3.78.9-10.13-14",
    "gospel": "Lc 10,13-16"
  },
  {
    "code": 5266,
    "year": "1",
    "reading1": "Br 4,5-12.27-29",
    "psalm": "Tv 69,33-35.36-37",
    "gospel": "Lc 10,17-24"
  },
  {
    "code": 5266,
    "year": "2",
    "reading1": "G 42,1-3.5-6.12-16",
    "psalm": "Tv 119,66.71.75.91.125.130",
    "gospel": "Lc 10,17-24"
  },
  {
    "code": 5270,
    "year": "A",
    "reading1": "Is 5,1-7",
    "psalm": "Tv 80,9.12.13-14.15-16.19-20",
    "gospel": "Mt 21,33-43",
    "reading2": "Pl 4,6-9"
  },
  {
    "code": 5270,
    "year": "B",
    "reading1": "St 2,18-24",
    "psalm": "Tv 128,1-2.3.4-5.6",
    "gospel": "Mc 10,2-16 ( hay Mc10,2-12)",
    "reading2": "Dt 2,9-11"
  },
  {
    "code": 5270,
    "year": "C",
    "reading1": "Kb 1,2-3.2,2-4",
    "psalm": "Tv 95,1-2.6-7.8-9",
    "gospel": "Lc 17,5-10",
    "reading2": "2 Tm 1,6-8.13-14"
  },
  {
    "code": 5271,
    "year": "1",
    "reading1": "Gn 1,1–2,1.11",
    "psalm": "Gn 2,2.3.4.5.8",
    "gospel": "Lc 10,25-37"
  },
  {
    "code": 5271,
    "year": "2",
    "reading1": "Gl 1,6-12",
    "psalm": "Tv 111,1-2.7-8.9.10",
    "gospel": "Lc 10,25-37"
  },
  {
    "code": 5272,
    "year": "1",
    "reading1": "Gn 3,1-10",
    "psalm": "Tv 130,1-2.3-4.7-8",
    "gospel": "Lc 10,38-42"
  },
  {
    "code": 5272,
    "year": "2",
    "reading1": "Gl 1,13-24",
    "psalm": "Tv 139,1-3.13-14.14-15",
    "gospel": "Lc 10,38-42"
  },
  {
    "code": 5273,
    "year": "1",
    "reading1": "Gn 4,1-11",
    "psalm": "Tv 86,3-4.5-6.9-10",
    "gospel": "Lc 11,1-4"
  },
  {
    "code": 5273,
    "year": "2",
    "reading1": "Gl 2,1-2.7-14",
    "psalm": "Tv 117,1.2",
    "gospel": "Lc 11,1-4"
  },
  {
    "code": 5274,
    "year": "1",
    "reading1": "Ml 3,13-20",
    "psalm": "Tv 1,1.1-2.3.4.6",
    "gospel": "Lc 11,5-13"
  },
  {
    "code": 5274,
    "year": "2",
    "reading1": "Gl 3,1-5",
    "psalm": "Lc 1,69-70.71-72.73-75",
    "gospel": "Lc 11,5-13"
  },
  {
    "code": 5275,
    "year": "1",
    "reading1": "Ge 1,13-15; 2,1-2",
    "psalm": "Tv 9,2-3.6.16.8-9",
    "gospel": "Lc 11,15-26"
  },
  {
    "code": 5275,
    "year": "2",
    "reading1": "Gl 3,7-14",
    "psalm": "Tv 111,1-2.3-4.5-6",
    "gospel": "Lc 11,15-26"
  },
  {
    "code": 5276,
    "year": "1",
    "reading1": "Ge 4,12-21",
    "psalm": "Tv 97,1-2.5-6.11-12",
    "gospel": "Lc 11,27-28"
  },
  {
    "code": 5276,
    "year": "2",
    "reading1": "Gl 3,22-29",
    "psalm": "Tv 105,2-3.4-5.6-7",
    "gospel": "Lc 11,27-28"
  },
  {
    "code": 5280,
    "year": "A",
    "reading1": "Is 25,6-10",
    "psalm": "Tv 23,1-3.34.5.6",
    "gospel": "Mt 22,1-14 ( hay Mt 22,1-10)",
    "reading2": "Pl 4,12-14.19-20"
  },
  {
    "code": 5280,
    "year": "B",
    "reading1": "Kn 7,7-11",
    "psalm": "Tv 90,12-13.14-15.16-17",
    "gospel": "Mc 10,17-30 ( hay Mc 10,17-27)",
    "reading2": "Dt 4,12-13"
  },
  {
    "code": 5280,
    "year": "C",
    "reading1": "2 V 5,14-17",
    "psalm": "Tv 98,1.2-3.34",
    "gospel": "Lc 17,11-19",
    "reading2": "2 Tm 2,8-13"
  },
  {
    "code": 5281,
    "year": "1",
    "reading1": "Rm 1,1-7",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Lc 11,29-32"
  },
  {
    "code": 5281,
    "year": "2",
    "reading1": "Gl 4,22-24.26-27.31 - 5,1",
    "psalm": "Tv 113,1-2.3-4.5.6-7",
    "gospel": "Lc 11,29-32"
  },
  {
    "code": 5282,
    "year": "1",
    "reading1": "Rm 1,16-25",
    "psalm": "Tv 19,2-3.4-5",
    "gospel": "Lc 11,37-41"
  },
  {
    "code": 5282,
    "year": "2",
    "reading1": "Gl 5,1-6",
    "psalm": "Tv 119,41.43.44.45.47.48",
    "gospel": "Lc 11,37-41"
  },
  {
    "code": 5283,
    "year": "1",
    "reading1": "Rm 2,1-11",
    "psalm": "Tv 62,2-3.6-7.9",
    "gospel": "Lc 11,42-46"
  },
  {
    "code": 5283,
    "year": "2",
    "reading1": "Gl 5,18-25",
    "psalm": "Tv 1,1.1-2.3.4.6",
    "gospel": "Lc 11,42-46"
  },
  {
    "code": 5284,
    "year": "1",
    "reading1": "Rm 3,21-29",
    "psalm": "Tv 130,1-2.3-4.5-6",
    "gospel": "Lc 11,47-54"
  },
  {
    "code": 5284,
    "year": "2",
    "reading1": "Ep 1,3-10",
    "psalm": "Tv 98,1.2-3.3-4.5-6",
    "gospel": "Lc 11,47-54"
  },
  {
    "code": 5285,
    "year": "1",
    "reading1": "Rm 4,1-8",
    "psalm": "Tv 32,1-2.5.11",
    "gospel": "Lc 12,1-7"
  },
  {
    "code": 5285,
    "year": "2",
    "reading1": "Ep 1,11-14",
    "psalm": "Tv 33,1-2.4-5.12-13",
    "gospel": "Lc 12,1-7"
  },
  {
    "code": 5286,
    "year": "1",
    "reading1": "Rm 4,13.16-18",
    "psalm": "Tv 105,6-7.8-9.42-43",
    "gospel": "Lc 12,8-12"
  },
  {
    "code": 5286,
    "year": "2",
    "reading1": "Ep 1,15-23",
    "psalm": "Tv 8,2-3.4-5.6-7",
    "gospel": "Lc 12,8-12"
  },
  {
    "code": 5290,
    "year": "A",
    "reading1": "Is 45,1.4-6",
    "psalm": "Tv 96,1.3.4-5.7-8.9-10",
    "gospel": "Mt 22,15-21",
    "reading2": "1 Tx  1,1-5"
  },
  {
    "code": 5290,
    "year": "B",
    "reading1": "Is 53,10-11",
    "psalm": "Tv 33,4-5.18-19.20.22",
    "gospel": "Mc 10,35-45 ( hay Mc 10,42-45)",
    "reading2": "Dt 4,14-16"
  },
  {
    "code": 5290,
    "year": "C",
    "reading1": "Xh 17,8-13",
    "psalm": "Tv 121,1-2.3-4.5-6.7-8",
    "gospel": "Lc 18,1-8",
    "reading2": "2 Tm 3,14-17; 4,2"
  },
  {
    "code": 5291,
    "year": "1",
    "reading1": "Rm 4,20-25",
    "psalm": "Lc 1,69-70.71-72.73.75",
    "gospel": "Lc 12,13-21"
  },
  {
    "code": 5291,
    "year": "2",
    "reading1": "Ep 2,1-10",
    "psalm": "Tv 100,2.3.4.5",
    "gospel": "Lc 12,13-21"
  },
  {
    "code": 5292,
    "year": "1",
    "reading1": "Rm 5,12.15.17-19.20-21",
    "psalm": "Tv 40,7-8.89.10.17",
    "gospel": "Lc 12,35-38"
  },
  {
    "code": 5292,
    "year": "2",
    "reading1": "Ep 2,12-22",
    "psalm": "Tv 85,9-10.11-12.13-14",
    "gospel": "Lc 12,35-38"
  },
  {
    "code": 5293,
    "year": "1",
    "reading1": "Rm 6,12-18",
    "psalm": "Tv 124,1-3.4-6.7-8",
    "gospel": "Lc 12,39-48"
  },
  {
    "code": 5293,
    "year": "2",
    "reading1": "Ep 3,2-12",
    "psalm": "Is 12,2-3.4.5-6",
    "gospel": "Lc 12,39-48"
  },
  {
    "code": 5294,
    "year": "1",
    "reading1": "Rm 6,19-23",
    "psalm": "Tv 1,1-2.3.4.6",
    "gospel": "Lc 12,49-53"
  },
  {
    "code": 5294,
    "year": "2",
    "reading1": "Ep 3,14-21",
    "psalm": "Tv 33,1-2.4-5.11-12.18-19",
    "gospel": "Lc 12,49-53"
  },
  {
    "code": 5295,
    "year": "1",
    "reading1": "Rm 7,18-25",
    "psalm": "Tv 119,66.68.76.77.93.94",
    "gospel": "Lc 12,54-59"
  },
  {
    "code": 5295,
    "year": "2",
    "reading1": "Ep 4,1-6",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Lc 12,54-59"
  },
  {
    "code": 5296,
    "year": "1",
    "reading1": "Rm 8,1-11",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Lc 13,1-9"
  },
  {
    "code": 5296,
    "year": "2",
    "reading1": "Ep 4,7-16",
    "psalm": "Tv 122,1-2.3-4.4-5",
    "gospel": "Lc 13,1-9"
  },
  {
    "code": 5300,
    "year": "A",
    "reading1": "Xh 22,20-26",
    "psalm": "Tv 18,2-3.34.47.51",
    "gospel": "Mt 22,34-40",
    "reading2": "1 Tx  1,5-10"
  },
  {
    "code": 5300,
    "year": "B",
    "reading1": "Hc 31,7-9",
    "psalm": "Tv 126,1-2.23.4-5.6",
    "gospel": "Mc 10,46-52",
    "reading2": "Dt 5,1-6"
  },
  {
    "code": 5300,
    "year": "C",
    "reading1": "Hc 35,12-14.16-18",
    "psalm": "Tv 34,2-3.17-18.19.23",
    "gospel": "Lc 18,9-14",
    "reading2": "2 Tm 4,6-8.16-18"
  },
  {
    "code": 5301,
    "year": "1",
    "reading1": "Rm 8,12-17",
    "psalm": "Tv 68,2.4.6-7.20-21",
    "gospel": "Lc 13,10-17"
  },
  {
    "code": 5301,
    "year": "2",
    "reading1": "Ep 4,32-5,8",
    "psalm": "Tv 1,1-2.2-3.4-5.6",
    "gospel": "Lc 13,10-17"
  },
  {
    "code": 5302,
    "year": "1",
    "reading1": "Rm 8,18-25",
    "psalm": "Tv 126,1-2.2-3.4-5.6",
    "gospel": "Lc 13,18-21"
  },
  {
    "code": 5302,
    "year": "2",
    "reading1": "Ep 5,21-33",
    "psalm": "Tv 128,1-2.3.4-5",
    "gospel": "Lc 13,18-21"
  },
  {
    "code": 5303,
    "year": "1",
    "reading1": "Rm 8,26-30",
    "psalm": "Tv 13,4-5.6",
    "gospel": "Lc 13,22-30"
  },
  {
    "code": 5303,
    "year": "2",
    "reading1": "Ep 6,1-9",
    "psalm": "Tv 145,10-11.12-13.13-14",
    "gospel": "Lc 13,22-30"
  },
  {
    "code": 5304,
    "year": "1",
    "reading1": "Rm 8,31-39",
    "psalm": "Tv 109,21-22.26-27.30-31",
    "gospel": "Lc 13,31-35"
  },
  {
    "code": 5304,
    "year": "2",
    "reading1": "Ep 6,10-20",
    "psalm": "Tv 144,1.2.9-10",
    "gospel": "Lc 13,31-35"
  },
  {
    "code": 5305,
    "year": "1",
    "reading1": "Rm 9,1-5",
    "psalm": "Tv 147,12-13.14-15.19-20",
    "gospel": "Lc 14,1-6"
  },
  {
    "code": 5305,
    "year": "2",
    "reading1": "Pl 1,1-11",
    "psalm": "Tv 111,1-2.3-4.5-6",
    "gospel": "Lc 14,1-6"
  },
  {
    "code": 5306,
    "year": "1",
    "reading1": "Rm 11,1-2.11-12.25-29",
    "psalm": "Tv 94,12-13.14-15.17-18",
    "gospel": "Lc 14,1.7-11"
  },
  {
    "code": 5306,
    "year": "2",
    "reading1": "Pl 1,18-26",
    "psalm": "Tv 42,2.3.5",
    "gospel": "Lc 14,1.7-11"
  },
  {
    "code": 5310,
    "year": "A",
    "reading1": "Ml 1,14; 2,2.8-10",
    "psalm": "Tv 131,1.2.3",
    "gospel": "Mt 23,1-12",
    "reading2": "1 Tx  2,7-9.13"
  },
  {
    "code": 5310,
    "year": "B",
    "reading1": "Đnl 6,2-6",
    "psalm": "Tv 18,2-3.34.47.51",
    "gospel": "Mc 12,2834",
    "reading2": "Dt 7,23-28"
  },
  {
    "code": 5310,
    "year": "C",
    "reading1": "Kn 11,22-12,2",
    "psalm": "Tv 145,1-2.8-9.10-11.1314",
    "gospel": "Lc 19,1-10",
    "reading2": "2 Tx  1,11-12; 2,2"
  },
  {
    "code": 5311,
    "year": "1",
    "reading1": "Rm 11,29-36",
    "psalm": "Tv 69,30-31.33-34.36-37",
    "gospel": "Lc 14,12-14"
  },
  {
    "code": 5311,
    "year": "2",
    "reading1": "Pl 2,1-4",
    "psalm": "Tv 131,1.2.3",
    "gospel": "Lc 14,12-14"
  },
  {
    "code": 5312,
    "year": "1",
    "reading1": "Rm 12,5-16",
    "psalm": "Tv 131, 1.2.3",
    "gospel": "Lc 14,15-24"
  },
  {
    "code": 5312,
    "year": "2",
    "reading1": "Pl 2,5-11",
    "psalm": "Tv 22,26-27.28-30.31-32",
    "gospel": "Lc 14,15-24"
  },
  {
    "code": 5313,
    "year": "1",
    "reading1": "Rm 13,8-10",
    "psalm": "Tv 112,1-2.4-5.9",
    "gospel": "Lc 14,25-33"
  },
  {
    "code": 5313,
    "year": "2",
    "reading1": "Pl 2,12-18",
    "psalm": "Tv 27,1.4.13-14",
    "gospel": "Lc 14,25-33"
  },
  {
    "code": 5314,
    "year": "1",
    "reading1": "Rm 14,7-12",
    "psalm": "Tv 27,1.4.13-14",
    "gospel": "Lc 15,1-10"
  },
  {
    "code": 5314,
    "year": "2",
    "reading1": "Pl 3,3-8",
    "psalm": "Tv 105,2-3.4-5.6-7",
    "gospel": "Lc 15,1-10"
  },
  {
    "code": 5315,
    "year": "1",
    "reading1": "Rm 15,14-21",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Lc 16,1-8"
  },
  {
    "code": 5315,
    "year": "2",
    "reading1": "Pl 3,17–4,1",
    "psalm": "Tv 122,1-2.3-4.4-5",
    "gospel": "Lc 16,1-8"
  },
  {
    "code": 5316,
    "year": "1",
    "reading1": "Rm 16,3-9.16.22-27",
    "psalm": "Tv 145,2-3.4-5.10-11",
    "gospel": "Lc 16,9-15"
  },
  {
    "code": 5316,
    "year": "2",
    "reading1": "Pl 4,10-19",
    "psalm": "Tv 112,1-2.5-6.8.9",
    "gospel": "Lc 16,9-15"
  },
  {
    "code": 5320,
    "year": "A",
    "reading1": "Kn 6,12-16",
    "psalm": "Tv 63,2.3-4.5-6.7-8",
    "gospel": "Mt 25,1-13",
    "reading2": "1 Tx  4,13-18. 13-14;"
  },
  {
    "code": 5320,
    "year": "B",
    "reading1": "1 V 17,10-16",
    "psalm": "Tv 146,7.8-9.910",
    "gospel": "Mc 12,38-44 ( hay Mc 12,41-44)",
    "reading2": "Dt 9,24-28"
  },
  {
    "code": 5320,
    "year": "C",
    "reading1": "2 Mcb 7,1-2.9-14",
    "psalm": "Tv 17,1.5-6.8.15",
    "gospel": "Lc 20,27-38 (hay Lc 20,27.34-38)",
    "reading2": "2 Tx  2,16-17; 3,5"
  },
  {
    "code": 5321,
    "year": "1",
    "reading1": "Kn 1,1-7",
    "psalm": "Tv 139,1-3.4-6.7-8.9-10",
    "gospel": "Lc 17,1-6"
  },
  {
    "code": 5321,
    "year": "2",
    "reading1": "Tt 1,1-9",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Lc 17,1-6"
  },
  {
    "code": 5322,
    "year": "1",
    "reading1": "Kn 2,23–3,9",
    "psalm": "Tv 34,2-3.16-17.18-19",
    "gospel": "Lc 17,7-10"
  },
  {
    "code": 5322,
    "year": "2",
    "reading1": "Tt 2,1-8.11-14",
    "psalm": "Tv 37,3-4.18.23.27.29",
    "gospel": "Lc 17,7-10"
  },
  {
    "code": 5323,
    "year": "1",
    "reading1": "Kn 6,2-11",
    "psalm": "Tv 82,3-4.6-7",
    "gospel": "Lc 17,11-19"
  },
  {
    "code": 5323,
    "year": "2",
    "reading1": "Tt 3,1-7",
    "psalm": "Tv 23,1-3.3-4.5.6",
    "gospel": "Lc 17,11-19"
  },
  {
    "code": 5324,
    "year": "1",
    "reading1": "Kn 7,22–8,1",
    "psalm": "Tv 119,89.90.91.130.135.175",
    "gospel": "Lc 17,20-25"
  },
  {
    "code": 5324,
    "year": "2",
    "reading1": "Plm 7-20",
    "psalm": "Tv 146,7.8-9.9-10",
    "gospel": "Lc 17,20-25"
  },
  {
    "code": 5325,
    "year": "1",
    "reading1": "Kn 13,1-9",
    "psalm": "Tv 19,2-3.4-5",
    "gospel": "Lc 17,26-37"
  },
  {
    "code": 5325,
    "year": "2",
    "reading1": "2 Ga 4-9",
    "psalm": "Tv 119,1.2.10.11.17.18",
    "gospel": "Lc 17,26-37"
  },
  {
    "code": 5326,
    "year": "1",
    "reading1": "Kn 18,14-16; 19,6-9",
    "psalm": "Tv 105,2-3.36-37.42-43",
    "gospel": "Lc 18,1-8"
  },
  {
    "code": 5326,
    "year": "2",
    "reading1": "3 Ga 5-8",
    "psalm": "Tv 112,1-2.3-4.5-6",
    "gospel": "Lc 18,1-8"
  },
  {
    "code": 5330,
    "year": "A",
    "reading1": "Cn 31,10-13.19-20.30-31",
    "psalm": "Tv 128,1-2.3.4-5",
    "gospel": "Mt 25,14-30 ( hay Mt 25,14-15.19-21)",
    "reading2": "1 Tx  5,1-6"
  },
  {
    "code": 5330,
    "year": "B",
    "reading1": "Đn 12,1-3",
    "psalm": "Tv 16,5.8.9-10.11",
    "gospel": "Mc 13,24-32",
    "reading2": "Dt 10,11-14.18"
  },
  {
    "code": 5330,
    "year": "C",
    "reading1": "Ml 3,19-20",
    "psalm": "Tv 98,5-6.7-8.9",
    "gospel": "Lc 21,5-19",
    "reading2": "2 Tx  3,7-12"
  },
  {
    "code": 5331,
    "year": "1",
    "reading1": "1 Mcb 1,10-15.41-43.54-57.62-63",
    "psalm": "Tv 119,53.61.134.150.155.158",
    "gospel": "Lc 18,35-43"
  },
  {
    "code": 5331,
    "year": "2",
    "reading1": "Kh 1,1-4; 2,1-5",
    "psalm": "Tv 1,1-2.3.4.6",
    "gospel": "Lc 18,35-43"
  },
  {
    "code": 5332,
    "year": "1",
    "reading1": "2 Mcb 6,18-31",
    "psalm": "Tv 3,2-3.4-5.6-8",
    "gospel": "Lc 19,1-10"
  },
  {
    "code": 5332,
    "year": "2",
    "reading1": "Kh 3,1-6.14-22",
    "psalm": "Tv 15,2-3.3-4.5",
    "gospel": "Lc 19,1-10"
  },
  {
    "code": 5333,
    "year": "1",
    "reading1": "2 Mcb 7,1.20-31",
    "psalm": "Tv 17,1.5-6.8.15",
    "gospel": "Lc 19,11-28"
  },
  {
    "code": 5333,
    "year": "2",
    "reading1": "Kh 4,1-11",
    "psalm": "Tv 150,1-2.3-4.5-6",
    "gospel": "Lc 19,11-28"
  },
  {
    "code": 5334,
    "year": "1",
    "reading1": "1 Mcb 2,15-29",
    "psalm": "Tv 50,1-2.5-6.14-15",
    "gospel": "Lc 19,41-44"
  },
  {
    "code": 5334,
    "year": "2",
    "reading1": "Kh 5,1-10",
    "psalm": "Tv 149,1-2.3-4.5-6.9",
    "gospel": "Lc 19,41-44"
  },
  {
    "code": 5335,
    "year": "1",
    "reading1": "1 Mcb 4,36-37.52-59",
    "psalm": "1 Sb29,10.11.11-12.12",
    "gospel": "Lc 19,45-48"
  },
  {
    "code": 5335,
    "year": "2",
    "reading1": "Kh 10,8-11",
    "psalm": "Tv 11914.24.72.103.111.131",
    "gospel": "Lc 19,45-48"
  },
  {
    "code": 5336,
    "year": "1",
    "reading1": "1 Mcb 6,1-13",
    "psalm": "Tv 9,2-3.4.6.16.19",
    "gospel": "Lc 20,27-40"
  },
  {
    "code": 5336,
    "year": "2",
    "reading1": "Kh 11,4-12",
    "psalm": "Tv 144,1.2.9-10",
    "gospel": "Lc 20,27-40"
  },
  {
    "code": 5340,
    "year": "A",
    "reading1": "Ed 34,11-12.15-17",
    "psalm": "Tv 23,1-3.34.5-6",
    "gospel": "Mt 25,31-46",
    "reading2": "1 Cr 15,20-26.28"
  },
  {
    "code": 5340,
    "year": "B",
    "reading1": "Đn 7,13-14",
    "psalm": "Tv 93,1.12.5",
    "gospel": "Ga 18,33-37",
    "reading2": "Kh 1,5-8"
  },
  {
    "code": 5340,
    "year": "C",
    "reading1": "2 Sm 5,1-3",
    "psalm": "Tv 122,1-2.3-4.45",
    "gospel": "Lc 23,35-43",
    "reading2": "Cl 1,12-20"
  },
  {
    "code": 5341,
    "year": "1",
    "reading1": "Đn 1,1-6.8-20",
    "psalm": "Đn 3,52.53.54.55.56",
    "gospel": "Lc 21,1-4"
  },
  {
    "code": 5341,
    "year": "2",
    "reading1": "Kh 14,1-3.4-5",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Lc 21,1-4"
  },
  {
    "code": 5342,
    "year": "1",
    "reading1": "Đn 2,31-45",
    "psalm": "Đn 3,57.58.59.60.61",
    "gospel": "Lc 21,5-11"
  },
  {
    "code": 5342,
    "year": "2",
    "reading1": "Kh 14,14-19",
    "psalm": "Tv 96,10.11-12.13",
    "gospel": "Lc 21,5-11"
  },
  {
    "code": 5343,
    "year": "1",
    "reading1": "Đn 5,1-6.13-14.16-17.23-28",
    "psalm": "Đn 3,62.63.64.65.66.67",
    "gospel": "Lc 21,12-19"
  },
  {
    "code": 5343,
    "year": "2",
    "reading1": "Kh 15,1-4",
    "psalm": "Tv 98,1.2-3.7-8.9",
    "gospel": "Lc 21,12-19"
  },
  {
    "code": 5344,
    "year": "1",
    "reading1": "Đn 6,12-28",
    "psalm": "Đn 3,68.69.70.71.72.73.74",
    "gospel": "Lc 21,20-28"
  },
  {
    "code": 5344,
    "year": "2",
    "reading1": "Kh 18,1-2.21-23; 19,1-3.9",
    "psalm": "Tv 100,2.3.4.5",
    "gospel": "Lc 21,20-28"
  },
  {
    "code": 5345,
    "year": "1",
    "reading1": "Đn 7,2-14",
    "psalm": "Đn 3,75.76.77.78.79.80.81",
    "gospel": "Lc 21,29-33"
  },
  {
    "code": 5345,
    "year": "2",
    "reading1": "Kh 20,1-4.11–21,2",
    "psalm": "Tv 84,3.4.5-6.8",
    "gospel": "Lc 21,29-33"
  },
  {
    "code": 5346,
    "year": "1",
    "reading1": "Đn 7,15-27",
    "psalm": "Đn 3,82.83.84.85.86.87",
    "gospel": "Lc 21,34-36"
  },
  {
    "code": 5346,
    "year": "2",
    "reading1": "Kh 22,1-7",
    "psalm": "Tv 95,1-2.3-5.6-7",
    "gospel": "Lc 21,34-36"
  },
  {
    "code": 6000,
    "year": "0",
    "reading1": "Is 60,1-6",
    "psalm": "Tv 72,1-2.7-8.10-11.12-13",
    "gospel": "Mt 2,1-12",
    "reading2": "Ep 3,2-3.5-6"
  },
  {
    "code": 6001,
    "year": "0",
    "reading1": "1 Ga 3,22–4,6",
    "psalm": "Tv 2,7-8.10-11",
    "gospel": "Mt 4,12-17.23-25"
  },
  {
    "code": 6002,
    "year": "0",
    "reading1": "1 Ga 4,7-10",
    "psalm": "Tv 72,1-2.3-4.7-8",
    "gospel": "Mc 6,34-44"
  },
  {
    "code": 6003,
    "year": "0",
    "reading1": "1 Ga 4, 11-18",
    "psalm": "Tv 71, 2. 10. 12-13",
    "gospel": "Mc 6, 45-52"
  },
  {
    "code": 6004,
    "year": "0",
    "reading1": "1 Ga 4,19–5,4",
    "psalm": "Tv 72,1-2.14-15.17",
    "gospel": "Lc 4,14-22"
  },
  {
    "code": 6005,
    "year": "0",
    "reading1": "1 Ga 5,5-13",
    "psalm": "Tv 147,12-13.14-15.19-20",
    "gospel": "Lc 5,12-16"
  },
  {
    "code": 6006,
    "year": "0",
    "reading1": "1 Ga 5,14-21",
    "psalm": "Tv 149,1-2.3-4.5-6.9",
    "gospel": "Ga 3,22-30"
  },
  {
    "code": 20101,
    "year": "0",
    "reading1": "Ds 6,22-27",
    "psalm": "Tv 67,2-3.5.6.8",
    "gospel": "Lc 2,16-21",
    "reading2": "Gl 4,4-7"
  },
  {
    "code": 20201,
    "year": "0",
    "reading1": "1 Ga 2,22-28",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Ga 1,19-28"
  },
  {
    "code": 20301,
    "year": "0",
    "reading1": "1 Ga 2,29–3,6",
    "psalm": "Tv 98,1.3-4.5-6",
    "gospel": "Ga 1,29-34"
  },
  {
    "code": 20401,
    "year": "0",
    "reading1": "1 Ga 3,7-10",
    "psalm": "Tv 98,1.7-8.9",
    "gospel": "Ga 1,35-42"
  },
  {
    "code": 20501,
    "year": "0",
    "reading1": "1 Ga 3,11-21",
    "psalm": "Tv 100,1-2.3.4.5",
    "gospel": "Ga 1,43-51"
  },
  {
    "code": 20601,
    "year": "0",
    "reading1": "1 Ga 5,5-13",
    "psalm": "Tv 147,12-13.14-15.19-20",
    "gospel": "Mc 1,7-11"
  },
  {
    "code": 20701,
    "year": "0",
    "reading1": "1 Ga 5,14-21",
    "psalm": "Tv 149,1-2.3-4.5.6.9",
    "gospel": "Ga 2,1-12"
  },
  {
    "code": 21712,
    "year": "0",
    "reading1": "St 49,2.8-10",
    "psalm": "Tv 72,3-4.7-8.17",
    "gospel": "Mt 1,1-17"
  },
  {
    "code": 21812,
    "year": "0",
    "reading1": "Hc 23,5-8",
    "psalm": "Tv 72,1.12-13.18-19",
    "gospel": "Mt 1,18-24"
  },
  {
    "code": 21912,
    "year": "0",
    "reading1": "Tl 13,2-7.24-25",
    "psalm": "Tv 71,3-4.5-6.16-17",
    "gospel": "Lc 1,5-25"
  },
  {
    "code": 22012,
    "year": "0",
    "reading1": "Is 7,10-14",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Lc 1,26-38"
  },
  {
    "code": 22112,
    "year": "0",
    "reading1": "Dc 2,8-14; Xp 3,14-18",
    "psalm": "Tv 33,2-3.11-12.20-21",
    "gospel": "Lc 1,39-45"
  },
  {
    "code": 22212,
    "year": "0",
    "reading1": "1 Sm 1,24-28",
    "psalm": "1 Sm 2,1.4-5.6-7.8",
    "gospel": "Lc 1,46-56"
  },
  {
    "code": 22312,
    "year": "0",
    "reading1": "Ml 3,1-4.23-24",
    "psalm": "Tv 25,4-5.8-9.10.14",
    "gospel": "Lc 1,57-66"
  },
  {
    "code": 22412,
    "year": "0",
    "reading1": "2 Sm 7,1-5.8-11.16",
    "psalm": "Tv 89,2-3.4-5.27.29",
    "gospel": "Lc 1,67-79"
  },
  {
    "code": 224122,
    "year": "V",
    "reading1": "Is 62,1-5",
    "psalm": "Tv 89,4-5.16-17.27.29",
    "gospel": "Mt 1,1-25 (hay  Mt 1,18-25)",
    "reading2": "Cv 13,16-17.22-25"
  },
  {
    "code": 22512,
    "year": "B",
    "reading1": "Is 62,11-12",
    "psalm": "Tv 96,1 và 6.11-12",
    "gospel": "Lc 2,15-20",
    "reading2": "Tt 3,4-7"
  },
  {
    "code": 22512,
    "year": "D",
    "reading1": "Is 9,2-4.6-7 (Hr 1-3.5-6)",
    "psalm": "Tv 95,1-2a.2b-3.11-12.13",
    "gospel": "Lc 2,1-14",
    "reading2": "Tt 2,11-14"
  },
  {
    "code": 22512,
    "year": "R",
    "reading1": "Is 52,7-10",
    "psalm": "Tv 97,1.2-3ab.3cd-4.5-6",
    "gospel": "Ga 1,1-18 (bài ngắn 1,1-5.9-14)",
    "reading2": "Dt 1,1-6"
  },
  {
    "code": 22612,
    "year": "0",
    "reading1": "Cv 6,8-10; 7,54-59",
    "psalm": "Tv 31,3-4.6.7.8.17.21",
    "gospel": "Mt 10,17-22"
  },
  {
    "code": 22712,
    "year": "0",
    "reading1": "1 Ga 1,1-4",
    "psalm": "Tv 97,1-2.5-6.11-12",
    "gospel": "Ga 20,2-8"
  },
  {
    "code": 22812,
    "year": "0",
    "reading1": "1 Ga 1,5–2,2",
    "psalm": "Tv 124,2-3.4-5.7-8",
    "gospel": "Mt 2,13-18"
  },
  {
    "code": 22912,
    "year": "0",
    "reading1": "1 Ga 2,3-11",
    "psalm": "Tv 96,1-2.2-3.5-6",
    "gospel": "Lc 2,22-35"
  },
  {
    "code": 23012,
    "year": "0",
    "reading1": "1 Ga 2,12-17",
    "psalm": "Tv 96,7-8.8-9.10",
    "gospel": "Lc 2,36-40"
  },
  {
    "code": 23112,
    "year": "0",
    "reading1": "1 Ga 2,18-21",
    "psalm": "Tv 96,1-2.11-12.13",
    "gospel": "Ga 1,1-18"
  },
  {
    "code": 3004,
    "year": "0",
    "reading1": "Ge 2,12-18; 2 Cr 5,20–6,2",
    "psalm": "Tv 51,3-4.5-6.12-13.14.17",
    "gospel": "Mt 6,1-6.16-18",
    "reading2": "2 Cr,5.20-6.2"
  },
  {
    "code": 3005,
    "year": "0",
    "reading1": "Đnl 30,15-20",
    "psalm": "Tv 1,1-2.3.4.6",
    "gospel": "Lc 9,22-25"
  },
  {
    "code": 3006,
    "year": "0",
    "reading1": "Is 58,1-9",
    "psalm": "Tv 51,3-4.5-6.18-19",
    "gospel": "Mt 9,14-15"
  },
  {
    "code": 3007,
    "year": "0",
    "reading1": "Is 58,9-14",
    "psalm": "Tv 86,1-2.3-4.5-6",
    "gospel": "Lc 5,27-32"
  },
  {
    "code": 70110,
    "year": "0",
    "reading1": "Is 66, 10-14c",
    "psalm": "Tv 130, 1. 2. 3",
    "gospel": "Mt 18, 1-4"
  },
  {
    "code": 70111,
    "year": "0",
    "reading1": "Kh 7,2-4.9-14",
    "psalm": "Tv 24,1-2.3-4.5-6",
    "gospel": "Mt 5,1-12",
    "reading2": "1 Ga 3,1-3"
  },
  {
    "code": 70202,
    "year": "0",
    "reading1": "Ml 3,1-4 (hay Dt 2,14-18)",
    "psalm": "Tv 24,7.8.9.10",
    "gospel": "Lc 2,22-40 (hay Lc 2,22-32)"
  },
  {
    "code": 70211,
    "year": "0",
    "reading1": "Rm 6, 3-9",
    "psalm": "Tv 22, 1-3a. 3b-4. 5. 6",
    "gospel": "Ga 6, 51-59"
  },
  {
    "code": 70305,
    "year": "0",
    "reading1": "1 Cr 15, 1-8",
    "psalm": "Tv 18, 2-3. 4-5",
    "gospel": "Ga 14, 6-14"
  },
  {
    "code": 70307,
    "year": "0",
    "reading1": "Ep 2, 19-22",
    "psalm": "Tv 116, 1. 2",
    "gospel": "Ga 20, 24-29"
  },
  {
    "code": 70312,
    "year": "0",
    "reading1": "1 Cr 9,16-19.22-23",
    "psalm": "Tv 116,1.2 (Đ. Mc 16,15)",
    "gospel": "Mc 16,15-20"
  },
  {
    "code": 70608,
    "year": "0",
    "reading1": "Đn 7,9-10.13-14",
    "psalm": "Tv 97,1-2.5-6.9",
    "gospel": "Mt 17,1-9",
    "reading2": "2 Pr 1,16-19"
  },
  {
    "code": 5450,
    "year": "A",
    "reading1": "Đn 7,9-10.13-14",
    "psalm": "Tv 97,1-2.5-6.9",
    "gospel": "Mt 17,1-9",
    "reading2": "2 Pr 1,16-19"
  },
  {
    "code": 5450,
    "year": "B",
    "reading1": "Đn 7,9-10.13-14",
    "psalm": "Tv 97,1-2.5-6.9",
    "gospel": "Mc 9,2-10",
    "reading2": "2 Pr 1,16-19"
  },
  {
    "code": 5450,
    "year": "C",
    "reading1": "Đn 7,9-10.13-14",
    "psalm": "Tv 97,1-2.5-6.9",
    "gospel": "Lc 9,28-36",
    "reading2": "2 Pr 1,16-19"
  },
  {
    "code": 70809,
    "year": "0",
    "reading1": "Mk 5, 2-5a ( hay Rm 8, 28-30)",
    "psalm": "Tv 12, 6ab. 6cd",
    "gospel": "Mt 1, 1-16. 18-23"
  },
  {
    "code": 70812,
    "year": "0",
    "reading1": "St 3,9-15.20",
    "psalm": "Tv 98,1.2-3.3-4",
    "gospel": "Lc 1,26-38",
    "reading2": "Ep 1,3-6.11-12"
  },
  {
    "code": 70911,
    "year": "0",
    "reading1": "Ed 47,1-2.8-9.12 ( hay 1 Cr 3,9-11.16-17)",
    "psalm": "Tv 46,2-3.5-6.8-9",
    "gospel": "Ga 2,13-22"
  },
  {
    "code": 71008,
    "year": "0",
    "reading1": "2 Cr 9, 6-10",
    "psalm": "Tv 111, 1-2. 5-6. 7-8. 9",
    "gospel": "Ga 12, 24-26"
  },
  {
    "code": 71405,
    "year": "0",
    "reading1": "Cv 1, 15-17. 20-26",
    "psalm": "Tv 112, 1-2. 3-4. 5-6. 7-8",
    "gospel": "Ga 15, 9-17"
  },
  {
    "code": 71408,
    "year": "0",
    "reading1": "1 Sb15,3-4.15-16; 16,1-2",
    "psalm": "Tv 132,6-7.9-10.13-14",
    "gospel": "Lc 11,27-28",
    "reading2": "1 Cr 15,54-57"
  },
  {
    "code": 71409,
    "year": "0",
    "reading1": "Ds 21,49 ( hay Pl 2,6-11)",
    "psalm": "Tv 78,1-2.34-35.36-37.38",
    "gospel": "Ga 3,13-17"
  },
  {
    "code": 71508,
    "year": "0",
    "reading1": "Kh 11,19; 12,1-6; 10",
    "psalm": "Tv 45,10.11.12.16",
    "gospel": "Lc 1,39-56",
    "reading2": "1 Cr 15,20-27"
  },
  {
    "code": 71810,
    "year": "0",
    "reading1": "2 Tm 4, 9-17a",
    "psalm": "Tv 144, 10-11. 12-13ab. 17-18",
    "gospel": "Lc 10, 1-9"
  },
  {
    "code": 71903,
    "year": "0",
    "reading1": "2 Sm 7,4-5.12-14.16",
    "psalm": "Tv 89,2-3.4-5. 27. 29",
    "gospel": "Mt 1,16.18-21.24 (hay Lc 2,41-51)",
    "reading2": "Rm 4,13.16-18.22"
  },
  {
    "code": 72109,
    "year": "0",
    "reading1": "Ep 4, 1-7. 11-13",
    "psalm": "Tv 18, 2-3. 4-5",
    "gospel": "Mt 9, 9-13"
  },
  {
    "code": 72202,
    "year": "0",
    "reading1": "1 Pr 5, 1-4",
    "psalm": "Tv 22, 1-3. 4. 5. 6",
    "gospel": "Mt 16,13-23"
  },
  {
    "code": 72207,
    "year": "0",
    "reading1": "Dc 3, 1-4a (hay 2 Cr 5, 14-17)",
    "psalm": "Tv 62, 2. 3-4. 5-6. 8-9",
    "gospel": "Ga 20, 1. 11-18"
  },
  {
    "code": 72306,
    "year": "0",
    "reading1": "Hc 1,4-10",
    "psalm": "Tv 71,1-2.3-4.5-6.15.17",
    "gospel": "Lc 1,5-17",
    "reading2": "1 Pr 1,8-12"
  },
  {
    "code": 72406,
    "year": "0",
    "reading1": "Is 49,1-6",
    "psalm": "Tv 139,1-3.13-14.14-15",
    "gospel": "Lc 1,57-66.80",
    "reading2": "Cv 13,22-26"
  },
  {
    "code": 72408,
    "year": "0",
    "reading1": "Kh 21, 9b-14",
    "psalm": "Tv 144, 10-11. 12-13ab. 17-18",
    "gospel": "Ga 1, 45-51"
  },
  {
    "code": 72411,
    "year": "0",
    "reading1": "2 Mcb 7, 1.20-23.27b-29 (hay Kn 3, 1-9)",
    "psalm": "Tv 125, 1-2ab. 2cd-3. 4-5. 6",
    "gospel": "Lc 9,23-26",
    "reading2": "1 Cr 1, 17-25"
  },
  {
    "code": 72501,
    "year": "0",
    "reading1": "Cv 22,3-16; 9,1-22",
    "psalm": "Tv 117,1-2",
    "gospel": "Mc 16,15-18"
  },
  {
    "code": 72503,
    "year": "0",
    "reading1": "Is 7,10-14; 8,10",
    "psalm": "Tv 40,7-8.8-9.10.11",
    "gospel": "Lc 1,26-38",
    "reading2": "Dt 10,4-10"
  },
  {
    "code": 72504,
    "year": "0",
    "reading1": "1 Pr 5, 5b-14",
    "psalm": "Tv 88, 2-3. 6-7. 16-17",
    "gospel": "Mc 16, 15-20"
  },
  {
    "code": 72507,
    "year": "0",
    "reading1": "2 Cr 4, 7-15",
    "psalm": "Tv 125, 1-2ab. 2cd-3. 4-5. 6",
    "gospel": "Mt 20, 20-28"
  },
  {
    "code": 72810,
    "year": "0",
    "reading1": "Ep 2, 19-22",
    "psalm": "Tv 18, 2-3. 4-5",
    "gospel": "Lc 6, 12-19"
  },
  {
    "code": 72906,
    "year": "0",
    "reading1": "Cv 12,1-11",
    "psalm": "Tv 34,2-3.4-5.6-7.8-9",
    "gospel": "Mt 16,13-19",
    "reading2": "2 Tm 4,6-8.17-18"
  },
  {
    "code": 72806,
    "year": "0",
    "reading1": "Cv 3,1-10",
    "psalm": "Tv 19,2-3.4-5",
    "gospel": "Ga 21,15-19",
    "reading2": "Gl 1,11-20"
  },
  {
    "code": 72909,
    "year": "0",
    "reading1": "Ðn 7, 9-10. 13-14 (hay Kh 12, 7-12)",
    "psalm": "Tv 137, 1-2a. 2bc-3. 4-5",
    "gospel": "Ga 1, 47-51"
  },
  {
    "code": 73011,
    "year": "0",
    "reading1": "Rm 10, 9-18",
    "psalm": "Tv 18, 2-3. 4-5",
    "gospel": "Mt 4, 18-22"
  },
  {
    "code": 73105,
    "year": "0",
    "reading1": "Xp 3, 14-18a (hay Rm 12, 9-16)",
    "psalm": "Is 12, 2-3. 4bcd. 5-6",
    "gospel": "Lc 1,39-56"
  },
  {
    "code": 70001,
    "year": "0",
    "reading1": "Ds 6,22-27",
    "psalm": "Tv 120,1-2.3-4.5-6.7-8 (Đ. x. c.2)",
    "gospel": "Mt 5,1-10",
    "reading2": "1 Tx 5,16-26.28"
  },
  {
    "code": 70002,
    "year": "0",
    "reading1": "Hc 44,1.10-15",
    "psalm": "Tv 127,1-2.3.4-5a.5b-6 (Đ. c.1)",
    "gospel": "Mt 15,1-6",
    "reading2": "Ep 6,1-4.18-23"
  },
  {
    "code": 70003,
    "year": "0",
    "reading1": "St 2,4b-9.15",
    "psalm": "Tv 103,1bc và 14a.14b-15.20-21.22-23.24 (Đ. c.1bc)",
    "gospel": "Mt 25,14-30",
    "reading2": "Cv 20,32-35"
  },
  {
    "code": 8441,
    "year": "0",
    "reading1": "Is 61, 9-11",
    "psalm": "Tv 44, 10bc. 11. 12ab. 16",
    "gospel": "Lc 2, 41-51"
  }
];
