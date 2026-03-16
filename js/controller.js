// --- 1. DATA SOURCES ---

// ============================================================================
// CACHE SYSTEM - Lưu trữ dữ liệu để tăng tốc độ
// ============================================================================

const CACHE = {
    // Memory cache cho liturgical data
    liturgicalData: new Map(),
    // Memory cache cho day info
    dayInfo: new Map(),
    // Memory cache cho lunar dates
    lunarDates: new Map(),
    // Memory cache cho readings
    readings: new Map(),
    // LocalStorage key prefix
    STORAGE_PREFIX: 'liturgical_cache_',
    // Cache version để invalidate khi có update
    VERSION: '1.0.0',

    // Lấy từ memory cache
    get(type, key) {
        const cache = this[type];
        if (cache instanceof Map) {
            return cache.get(key);
        }
        return null;
    },

    // Lưu vào memory cache
    set(type, key, value) {
        const cache = this[type];
        if (cache instanceof Map) {
            // Giới hạn cache size để tránh memory leak (giữ tối đa 500)
            if (!cache.has(key) && cache.size >= 500) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
            cache.set(key, value);
        }
    },

    // Lấy từ localStorage
    getFromStorage(key) {
        try {
            const stored = localStorage.getItem(this.STORAGE_PREFIX + key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.version === this.VERSION && parsed.expires > Date.now()) {
                    return parsed.data;
                }
                // Expired hoặc version cũ - xóa
                localStorage.removeItem(this.STORAGE_PREFIX + key);
            }
        } catch (e) {
            console.warn('Cache read error:', e);
        }
        return null;
    },

    // Lưu vào localStorage (với expiry)
    setToStorage(key, value, expiryMs = 24 * 60 * 60 * 1000) { // Default 24 hours
        try {
            const data = {
                version: this.VERSION,
                data: value,
                expires: Date.now() + expiryMs,
                created: Date.now()
            };
            localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(data));
        } catch (e) {
            console.warn('Cache write error:', e);
            // Nếu localStorage đầy, xóa cache cũ
            this.clearOldStorage();
        }
    },

    // Xóa cache cũ trong localStorage
    clearOldStorage() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.STORAGE_PREFIX)) {
                    keys.push(key);
                }
            }
            // Xóa 50% cache cũ nhất
            keys.slice(0, Math.floor(keys.length / 2)).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (e) {
            console.warn('Cache clear error:', e);
        }
    },

    // Xóa toàn bộ cache
    clearAll() {
        this.liturgicalData.clear();
        this.dayInfo.clear();
        this.lunarDates.clear();
        this.readings.clear();

        // Clear localStorage
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.STORAGE_PREFIX)) {
                    keys.push(key);
                }
            }
            keys.forEach(key => localStorage.removeItem(key));
            console.log('✅ Cache đã được xóa');
        } catch (e) {
            console.warn('Cache clear error:', e);
        }
    },

    // Thống kê cache
    getStats() {
        let storageSize = 0;
        let storageCount = 0;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.STORAGE_PREFIX)) {
                    storageCount++;
                    storageSize += localStorage.getItem(key).length * 2; // UTF-16
                }
            }
        } catch (e) { }

        return {
            memory: {
                liturgicalData: this.liturgicalData.size,
                dayInfo: this.dayInfo.size,
                lunarDates: this.lunarDates.size,
                readings: this.readings.size
            },
            storage: {
                count: storageCount,
                sizeKB: Math.round(storageSize / 1024)
            }
        };
    }
};

// Expose cache management to global scope
window.LiturgicalCache = CACHE;

// ============================================================================
// VIETNAMESE LUNAR CALENDAR (ÂM LỊCH VIỆT NAM)
// Thuật toán chuyển đổi từ Dương lịch sang Âm lịch Việt Nam
// ============================================================================

const LUNAR_CALENDAR = (function () {
    // Số ngày Julius của ngày 1/1/4713 TCN (Julius Day Number)
    const PI = Math.PI;

    // Tính số ngày Julius từ ngày dương lịch
    function jdFromDate(dd, mm, yy) {
        const a = Math.floor((14 - mm) / 12);
        const y = yy + 4800 - a;
        const m = mm + 12 * a - 3;
        let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        if (jd < 2299161) {
            jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
        }
        return jd;
    }

    // Chuyển từ số ngày Julius sang ngày dương lịch
    function jdToDate(jd) {
        let a, b, c, d, e, m, day, month, year;
        if (jd > 2299160) {
            a = jd + 32044;
            b = Math.floor((4 * a + 3) / 146097);
            c = a - Math.floor((b * 146097) / 4);
        } else {
            b = 0;
            c = jd + 32082;
        }
        d = Math.floor((4 * c + 3) / 1461);
        e = c - Math.floor((1461 * d) / 4);
        m = Math.floor((5 * e + 2) / 153);
        day = e - Math.floor((153 * m + 2) / 5) + 1;
        month = m + 3 - 12 * Math.floor(m / 10);
        year = b * 100 + d - 4800 + Math.floor(m / 10);
        return [day, month, year];
    }

    // Tính thời điểm Sóc (New Moon) thứ k kể từ ngày 1/1/1900
    function getNewMoonDay(k, timeZone) {
        const T = k / 1236.85; // Time in Julian centuries from 1900 January 0.5
        const T2 = T * T;
        const T3 = T2 * T;
        const dr = PI / 180;
        let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
        Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
        const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
        const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
        const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
        let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
        C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
        C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
        C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
        C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
        C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
        C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
        let deltat;
        if (T < -11) {
            deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
        } else {
            deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
        }
        const JdNew = Jd1 + C1 - deltat;
        return Math.floor(JdNew + 0.5 + timeZone / 24);
    }

    // Tính tọa độ mặt trời (Sun longitude) tại thời điểm JD
    function getSunLongitude(jdn, timeZone) {
        const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
        const T2 = T * T;
        const dr = PI / 180;
        const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
        const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
        let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
        DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
        let L = L0 + DL;
        L = L * dr;
        L = L - PI * 2 * (Math.floor(L / (PI * 2)));
        return Math.floor(L / PI * 6);
    }

    // Tính ngày bắt đầu tháng âm lịch thứ k
    function getLunarMonth11(yy, timeZone) {
        const off = jdFromDate(31, 12, yy) - 2415021;
        const k = Math.floor(off / 29.530588853);
        let nm = getNewMoonDay(k, timeZone);
        const sunLong = getSunLongitude(nm, timeZone);
        if (sunLong >= 9) {
            nm = getNewMoonDay(k - 1, timeZone);
        }
        return nm;
    }

    // Xác định tháng nhuận
    function getLeapMonthOffset(a11, timeZone) {
        const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
        let last = 0;
        let i = 1;
        let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
        do {
            last = arc;
            i++;
            arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
        } while (arc !== last && i < 14);
        return i - 1;
    }

    // Chuyển đổi từ Dương lịch sang Âm lịch Việt Nam (múi giờ +7)
    function solarToLunar(dd, mm, yy, timeZone = 7) {
        const dayNumber = jdFromDate(dd, mm, yy);
        const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
        let monthStart = getNewMoonDay(k + 1, timeZone);
        if (monthStart > dayNumber) {
            monthStart = getNewMoonDay(k, timeZone);
        }
        let a11 = getLunarMonth11(yy, timeZone);
        let b11 = a11;
        let lunarYear;
        if (a11 >= monthStart) {
            lunarYear = yy;
            a11 = getLunarMonth11(yy - 1, timeZone);
        } else {
            lunarYear = yy + 1;
            b11 = getLunarMonth11(yy + 1, timeZone);
        }
        const lunarDay = dayNumber - monthStart + 1;
        const diff = Math.floor((monthStart - a11) / 29);
        let lunarLeap = 0;
        let lunarMonth = diff + 11;
        if (b11 - a11 > 365) {
            const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
            if (diff >= leapMonthDiff) {
                lunarMonth = diff + 10;
                if (diff === leapMonthDiff) {
                    lunarLeap = 1;
                }
            }
        }
        if (lunarMonth > 12) {
            lunarMonth = lunarMonth - 12;
        }
        if (lunarMonth >= 11 && diff < 4) {
            lunarYear -= 1;
        }
        return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
    }

    // API công khai
    return {
        solarToLunar: solarToLunar,

        // Lấy ngày âm lịch từ Date object (có cache)
        getLunarDate: function (date) {
            const cacheKey = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
            const cached = CACHE.get('lunarDates', cacheKey);
            if (cached) return cached;

            const result = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
            CACHE.set('lunarDates', cacheKey, result);
            return result;
        },

        // Format ngày âm lịch
        formatLunarDay: function (date) {
            const lunar = this.getLunarDate(date);
            return lunar.day;
        },

        // Format đầy đủ ngày âm lịch (ngày/tháng)
        formatLunarFull: function (date) {
            const lunar = this.getLunarDate(date);
            const monthStr = lunar.leap ? `${lunar.month}N` : lunar.month;
            return `${lunar.day}/${monthStr}`;
        },

        // Kiểm tra có phải ngày mùng 1 âm lịch không
        isFirstDayOfLunarMonth: function (date) {
            const lunar = this.getLunarDate(date);
            return lunar.day === 1;
        },

        // Lấy tên tháng âm lịch
        getLunarMonthName: function (month, leap) {
            const names = ["Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "M.Một", "Chạp"];
            return (leap ? "Nhuận " : "") + names[month - 1];
        },

        // Kiểm tra có phải ngày Tết Việt Nam không (Mùng 1, 2, 3 tháng Giêng)
        isTetDay: function (date) {
            const lunar = this.getLunarDate(date);
            // Tháng Giêng (tháng 1) và không phải tháng nhuận
            if (lunar.month === 1 && !lunar.leap && lunar.day >= 1 && lunar.day <= 3) {
                return lunar.day;
            }
            return 0;
        },

        // Kiểm tra có phải ngày 30 Tết (Giao thừa) không
        isNewYearEve: function (date) {
            const lunar = this.getLunarDate(date);
            // Ngày cuối tháng Chạp (tháng 12 âm lịch)
            if (lunar.month === 12 && !lunar.leap) {
                // Kiểm tra ngày mai có phải mùng 1 tháng Giêng không
                const tomorrow = new Date(date);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowLunar = this.getLunarDate(tomorrow);
                if (tomorrowLunar.month === 1 && tomorrowLunar.day === 1 && !tomorrowLunar.leap) {
                    return true;
                }
            }
            return false;
        }
    };
})();

// ============================================================================
// TẾT VIỆT NAM - Vietnamese Lunar New Year Celebrations
// Theo quy định của HĐGMVN (Vietnamese Bishops Conference)
// ============================================================================

const TET_CELEBRATIONS = {
    // Mùng 1 Tết: Tân Niên - Cầu bình an năm mới
    1: {
        name: "MÙNG MỘT TẾT - Tân Niên",
        fullName: "Thánh Lễ Tân Niên - Cầu Bình An Năm Mới",
        rank: 3, // Tương đương Lễ Trọng (SOLEMNITY)
        rankCode: "TRONG",
        color: "red",
        category: "LORD",
        grade: "TRỌNG",
        isTet: true,
        readingCode: "70001", // Mã bài đọc Tết Mùng 1
        note: "Theo phép HĐGMVN: Thánh lễ Tân Niên cầu bình an."
    },
    // Mùng 2 Tết: Kính nhớ Tổ Tiên và Ông Bà Cha Mẹ
    2: {
        name: "MÙNG HAI TẾT - Kính Nhớ Tổ Tiên",
        fullName: "Thánh Lễ Kính Nhớ Tổ Tiên và Ông Bà Cha Mẹ",
        rank: 3, // Tương đương Lễ Trọng
        rankCode: "TRONG",
        color: "white",
        category: "OTHER",
        grade: "TRỌNG",
        isTet: true,
        readingCode: "70002", // Mã bài đọc Tết Mùng 2
        note: "Theo phép HĐGMVN: Thánh lễ kính nhớ Tổ Tiên."
    },
    // Mùng 3 Tết: Thánh hóa công ăn việc làm
    3: {
        name: "MÙNG BA TẾT - Thánh Hóa Công Việc",
        fullName: "Thánh Lễ Thánh Hóa Công Ăn Việc Làm",
        rank: 3, // Tương đương Lễ Trọng
        rankCode: "TRONG",
        color: "white",
        category: "OTHER",
        grade: "TRỌNG",
        isTet: true,
        readingCode: "70003", // Mã bài đọc Tết Mùng 3
        note: "Theo phép HĐGMVN: Thánh lễ thánh hóa công việc."
    },
    // Đêm Giao thừa
    0: {
        name: "ĐÊM GIAO THỪA",
        fullName: "Thánh Lễ Đêm Giao Thừa - Tạ Ơn Cuối Năm",
        rank: 6, // Lễ Kính
        rankCode: "KINH",
        color: "white",
        category: "OTHER",
        grade: "KÍNH",
        isTet: true,
        isEve: true,
        readingCode: null, // Giao thừa dùng bài đọc của ngày
        note: "Theo phép HĐGMVN: Thánh lễ Giao thừa tạ ơn cuối năm."
    }
};

// ============================================================================
// KỶ LUẬT PHỤNG VỤ - Liturgical Discipline (Ăn chay, kiêng thịt, lễ buộc)
// ============================================================================

const LITURGICAL_DISCIPLINE = {
    // Ngày ăn chay và kiêng thịt (Fast and Abstinence)
    FAST_ABSTINENCE: {
        // Lễ Tro
        ashWednesday: {
            fast: true,
            abstinence: true,
            label: "Ăn chay và kiêng thịt",
            note: "Ngày Lễ Tro: Buộc ăn chay và kiêng thịt (người từ 18-59 tuổi)"
        },
        // Thứ Sáu Tuần Thánh
        goodFriday: {
            fast: true,
            abstinence: true,
            label: "Ăn chay và kiêng thịt",
            note: "Thứ Sáu Tuần Thánh: Buộc ăn chay và kiêng thịt"
        }
    },
    // Ngày kiêng thịt (Abstinence only - các thứ Sáu Mùa Chay)
    ABSTINENCE_ONLY: {
        lentFridays: {
            abstinence: true,
            label: "Kiêng thịt",
            note: "Thứ Sáu Mùa Chay: Buộc kiêng thịt (người từ 14 tuổi trở lên)"
        }
    },
    // Lễ buộc tại Việt Nam (Holy Days of Obligation)
    HOLY_DAYS_VN: [
        { month: 0, day: 1, name: "Đức Maria Mẹ Thiên Chúa", obligation: true },
        { month: 11, day: 25, name: "Lễ Giáng Sinh", obligation: true },
        // Các lễ di động
        { movable: "easter", name: "Đại Lễ Phục Sinh", obligation: true },
        { movable: "ascension", name: "Lễ Thăng Thiên", obligation: true },
        { movable: "assumption", month: 7, day: 15, name: "Đức Mẹ Hồn Xác Lên Trời", obligation: true },
        { movable: "allSaints", month: 10, day: 1, name: "Lễ Các Thánh", obligation: true }
    ]
};

// Lấy thông tin kỷ luật phụng vụ cho ngày
function getLiturgicalDiscipline(date, litData) {
    const disciplines = [];
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const day = date.getDate();

    // Kiểm tra Lễ Tro
    const ashTime = litData.ashWednesdayTransferred ? t(litData.ashWednesdayCelebration) : t(litData.ashWednesday);
    if (dTime === ashTime) {
        disciplines.push({
            type: 'fast',
            icon: '🍽️',
            label: 'Ăn chay',
            class: 'discipline-fast'
        });
        disciplines.push({
            type: 'abstinence',
            icon: '🥬',
            label: 'Kiêng thịt',
            class: 'discipline-abstinence'
        });
    }

    // Kiểm tra Thứ Sáu Tuần Thánh
    if (dTime === t(litData.goodFriday)) {
        disciplines.push({
            type: 'fast',
            icon: '🍽️',
            label: 'Ăn chay',
            class: 'discipline-fast'
        });
        disciplines.push({
            type: 'abstinence',
            icon: '🥬',
            label: 'Kiêng thịt',
            class: 'discipline-abstinence'
        });
    }

    // Kiểm tra các Thứ Sáu Mùa Chay
    if (dayOfWeek === 5 && dTime >= t(litData.ashWednesday) && dTime < t(litData.easter)) {
        if (!disciplines.some(d => d.type === 'abstinence')) {
            disciplines.push({
                type: 'abstinence',
                icon: '🥬',
                label: 'Kiêng thịt',
                class: 'discipline-abstinence'
            });
        }
    }

    // Kiểm tra Lễ Buộc
    const isHolyDay = LITURGICAL_DISCIPLINE.HOLY_DAYS_VN.some(hd => {
        if (hd.movable) {
            if (hd.movable === 'easter' && dTime === t(litData.easter)) return true;
            if (hd.movable === 'ascension' && dTime === t(litData.ascension)) return true;
            if (hd.month !== undefined && month === hd.month && day === hd.day) return true;
        } else {
            return month === hd.month && day === hd.day;
        }
        return false;
    });

    // Chúa Nhật cũng là lễ buộc
    if (dayOfWeek === 0 || isHolyDay) {
        disciplines.push({
            type: 'obligation',
            icon: '⛪',
            label: 'Lễ buộc',
            class: 'discipline-obligation'
        });
    }

    // Ghi chú đặc biệt cho Tam Nhật Vượt Qua
    if (dTime >= t(addDays(litData.easter, -3)) && dTime <= t(litData.easter)) {
        disciplines.push({
            type: 'special',
            icon: '✝️',
            label: 'Tam Nhật Vượt Qua',
            class: 'discipline-special'
        });
    }

    return disciplines;
}

// Lấy mã bài đọc Tết
function getTetReadingCode(date) {
    const tetDay = LUNAR_CALENDAR.isTetDay(date);
    if (tetDay > 0 && TET_CELEBRATIONS[tetDay]) {
        return TET_CELEBRATIONS[tetDay].readingCode;
    }
    return null;
}

// Helper: YYYY-MM-DD theo ngày địa phương (tránh lệch UTC)
function toISODateLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper: lấy link suy niệm nếu có (từ map hoặc dữ liệu bài đọc)
function getMeditationLinkForDate(date, dayInfo, cycle, weekdayCycle) {
    const iso = toISODateLocal(date);
    if (typeof MEDITATION_LINKS !== 'undefined' && MEDITATION_LINKS[iso]) {
        return MEDITATION_LINKS[iso];
    }
    if (typeof MEDITATION_BY_CODE !== 'undefined' && dayInfo?.dayCode && MEDITATION_BY_CODE[dayInfo.dayCode]) {
        return MEDITATION_BY_CODE[dayInfo.dayCode];
    }
    if (typeof READINGS_SPECIAL !== 'undefined' && dayInfo?.dayCode && READINGS_SPECIAL[dayInfo.dayCode]?.meditationUrl) {
        return READINGS_SPECIAL[dayInfo.dayCode].meditationUrl;
    }
    if (typeof READINGS_DATA !== 'undefined' && dayInfo?.dayCode) {
        const ref = READINGS_DATA.find(r => {
            if (r.code != dayInfo.dayCode) return false;
            if (date.getDay() === 0) return r.year === cycle;
            return r.year === weekdayCycle || r.year === "0";
        });
        if (ref && ref.meditationUrl) return ref.meditationUrl;
    }
    return null;
}

// Lấy thông tin Tết cho một ngày
function getTetEvent(date) {
    const tetDay = LUNAR_CALENDAR.isTetDay(date);
    if (tetDay > 0 && TET_CELEBRATIONS[tetDay]) {
        const lunar = LUNAR_CALENDAR.getLunarDate(date);
        return {
            ...TET_CELEBRATIONS[tetDay],
            lunar: lunar
        };
    }

    // Kiểm tra đêm Giao thừa
    if (LUNAR_CALENDAR.isNewYearEve(date) && TET_CELEBRATIONS[0]) {
        const lunar = LUNAR_CALENDAR.getLunarDate(date);
        return {
            ...TET_CELEBRATIONS[0],
            lunar: lunar
        };
    }

    return null;
}

// Xử lý xung đột Tết với phụng vụ
function resolveTetConflict(tetEvent, temporalInfo, date, litData) {
    if (!tetEvent) return null;

    const dayOfWeek = date.getDay();
    const season = temporalInfo.season;
    const specialDayType = getSpecialDayType(date, litData);

    // Quy tắc xung đột Tết theo HĐGMVN:
    // 1. Nếu Tết trùng Chúa Nhật Thường Niên: có thể cử hành lễ Tết (ưu tiên Tết)
    // 2. Nếu trùng Mùa Chay/Tuần Thánh: giữ phụng vụ mùa; thêm ghi chú về Tết

    const isOrdinarySunday = (season === "Mùa Thường Niên" && dayOfWeek === 0);
    let result = {
        celebrate: true,
        note: tetEvent.note,
        rank: tetEvent.rank
    };

    if (isOrdinarySunday) {
        // Chúa Nhật Thường Niên: Tết được ưu tiên
        result.note = "Theo phép HĐGMVN: khi Tết trùng Chúa Nhật Thường Niên, có thể cử hành Thánh lễ Tết.";
        result.rank = 3; // Keep SOLEMNITY level
    }

    return result;
}

// Các ngày lễ được khai báo VÀ xử lý dời lễ duy nhất trong getLiturgicalData.
// Không đưa vào FIXED_DATA_LOOKUP để tránh trùng: St Joseph (19/3), Truyền Tin (25/3), Đức Mẹ Vô Nhiễm (8/12).
const FEASTS_ONLY_IN_LITDATA = { '3-19': true, '3-25': true, '12-8': true };

// Các ngày cố định trong SAINTS trùng với lễ di động (litData). Khi đúng ngày movable, bỏ qua FIXED để tránh trùng.
// 11-24: Các Thánh Tử Đạo VN (fixed) vs vietnameseMartyrs (Chúa Nhật trước Chúa Kitô Vua).
// 10-7: Đức Mẹ Mân Côi 7/10 (fixed) vs rosarySunday (Chúa Nhật đầu tháng 10).
const MOVABLE_OVERRIDES_FIXED = { '11-24': 'vietnameseMartyrs', '10-7': 'rosarySunday' };

// Sử dụng object thuần thay vì mảng để làm lookup map
const FIXED_DATA_LOOKUP = {};
SAINTS_DATA.forEach(item => {
    const parts = item.date.includes('/') ? item.date.split('/') : item.date.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const key = `${month}-${day}`;
    if (FEASTS_ONLY_IN_LITDATA[key]) return; // Bỏ qua, đã xử lý trong getLiturgicalData
    let rank = 'NHOKB';
    if (item.type === 'S') rank = 'TRONG';
    else if (item.type === 'F') rank = 'KINH';
    else if (item.type === 'M') rank = 'NHO';
    let color = 'white';
    if (item.chasuble === 'Đ') color = 'red';
    else if (item.chasuble === 'T') color = 'purple';
    else if (item.chasuble === 'X') color = 'green';
    else if (item.chasuble === 'H') color = 'rose';
    FIXED_DATA_LOOKUP[key] = { name: item.feast, rank: rank, color: color };
});

const MONTHS_VI = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const DAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DAYS_FULL_VI = ["Chúa Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
let currentYear = new Date().getFullYear();
let headerFocusDate = null;

function getHeaderBaseDate() {
    return headerFocusDate ? new Date(headerFocusDate) : new Date();
}

function shiftHeaderDate(offsetDays) {
    const base = getHeaderBaseDate();
    base.setDate(base.getDate() + offsetDays);
    headerFocusDate = new Date(base);
    updateHeaderTodayInfo(headerFocusDate);
}

// --- CORE FUNCTIONS ---
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function toRoman(num) {
    const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (let i of Object.keys(roman)) {
        let q = Math.floor(num / roman[i]);
        num -= q * roman[i];
        str += i.repeat(q);
    }
    return str;
}

function getSanctoralDayCode(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `7${day}${month}`;
}
function getSpecialFeastCode(date, litData) {
    // Trả về mã 8DDMM để tìm bài đọc tùy chọn trong Optionsaint.js
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `8${day}${month}`;
}

// --- LITURGICAL CALCULATION LOGIC ---
function getEasterDate(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function getLiturgicalData(year) {
    // Kiểm tra cache trước
    const cacheKey = `litData_${year}`;
    const cached = CACHE.get('liturgicalData', cacheKey);
    if (cached) {
        return cached;
    }

    const easter = getEasterDate(year);
    const ashWednesday = addDays(easter, -46); // Ngày Lễ Tro theo phụng vụ (bắt đầu Mùa Chay)
    const palmSunday = addDays(easter, -7);
    const goodFriday = addDays(easter, -2);
    // Lễ Thăng Thiên tại Việt Nam thường được cử hành vào Chúa Nhật VII Phục Sinh
    // (Easter + 42 ngày), theo quyền ấn định của HĐGM.
    const ascension = addDays(easter, 42);
    const pentecost = addDays(easter, 49);
    const christmas = new Date(year, 11, 25);

    const christmasDay = christmas.getDay();
    let daysToSubstract = christmasDay === 0 ? 7 : christmasDay;
    const fourthSundayAdvent = addDays(christmas, -daysToSubstract);
    const adventStart = addDays(fourthSundayAdvent, -21);
    const christKing = addDays(adventStart, -7);

    const jan1 = new Date(year, 0, 1);
    const firstSundayJan = new Date(year, 0, 1 + (7 - jan1.getDay()) % 7);
    let epiphany = firstSundayJan.getDate() === 1 ? new Date(year, 0, 8) : firstSundayJan;
    let baptismLord = addDays(epiphany, epiphany.getDate() >= 7 ? 1 : 7);
    if (epiphany.getDate() === 7 || epiphany.getDate() === 8) baptismLord = addDays(epiphany, 1);

    const vietnameseMartyrs = addDays(christKing, -7);
    const oct31 = new Date(year, 9, 31);
    const lastSundayOct = addDays(oct31, -oct31.getDay());
    const missionSunday = addDays(lastSundayOct, -7);
    const oct1 = new Date(year, 9, 1);
    const rosarySunday = new Date(year, 9, 1 + (7 - oct1.getDay()) % 7);

    let annunciation = new Date(year, 2, 25);
    const palmSunTime = palmSunday.getTime();
    const divineMercyTime = addDays(easter, 7).getTime();
    const annunTime = annunciation.getTime();
    if (annunTime >= palmSunTime && annunTime <= divineMercyTime) {
        annunciation = addDays(easter, 8);
    } else if (annunciation.getDay() === 0 && annunTime < palmSunTime) {
        annunciation = addDays(annunciation, 1);
    }

    let stJoseph = new Date(year, 2, 19);
    if (stJoseph.getTime() >= palmSunTime && stJoseph.getTime() < easter.getTime()) {
        stJoseph = addDays(palmSunday, -1);
    } else if (stJoseph.getDay() === 0 && stJoseph.getTime() < palmSunTime) {
        stJoseph = addDays(stJoseph, 1);
    }

    let immConception = new Date(year, 11, 8);
    if (immConception.getDay() === 0) {
        immConception = addDays(immConception, 1);
    }

    // ============================================================================
    // QUY LUẬT DỜI LỄ TRO TẠI VIỆT NAM (Theo HĐGMVN)
    // Nếu Lễ Tro trùng với Tết (Mùng 1, 2, 3), việc cử hành và ăn chay kiêng thịt
    // được dời sang Mùng 4 Tết. Tuy nhiên, Mùa Chay vẫn bắt đầu từ Thứ Tư Lễ Tro
    // ban đầu (không hát/đọc Alleluia từ ngày đó).
    // ============================================================================
    let ashWednesdayCelebration = ashWednesday; // Ngày cử hành Lễ Tro thực tế
    let ashWednesdayTransferred = false;
    let ashWednesdayTransferNote = null;

    // Kiểm tra xem Lễ Tro có trùng Tết không
    const ashLunar = LUNAR_CALENDAR.getLunarDate(ashWednesday);
    if (ashLunar.month === 1 && !ashLunar.leap && ashLunar.day >= 1 && ashLunar.day <= 3) {
        // Lễ Tro trùng với Mùng 1, 2 hoặc 3 Tết
        // Dời cử hành sang Mùng 4 Tết
        const daysToMung4 = 4 - ashLunar.day;
        ashWednesdayCelebration = addDays(ashWednesday, daysToMung4);
        ashWednesdayTransferred = true;
        ashWednesdayTransferNote = `Theo HĐGMVN: Lễ Tro (${ashWednesday.getDate()}/${ashWednesday.getMonth() + 1}) trùng Mùng ${ashLunar.day} Tết, việc cử hành và ăn chay kiêng thịt được dời sang Mùng 4 Tết (${ashWednesdayCelebration.getDate()}/${ashWednesdayCelebration.getMonth() + 1}). Mùa Chay vẫn bắt đầu từ ${ashWednesday.getDate()}/${ashWednesday.getMonth() + 1}.`;
    }

    // ============================================================================
    // CÁC LỄ SAU HIỆN XUỐNG
    // ============================================================================
    const trinity = addDays(pentecost, 7);      // Chúa Nhật sau Hiện Xuống - Lễ Chúa Ba Ngôi
    const corpusChristi = addDays(trinity, 7);  // Chúa Nhật sau Ba Ngôi - Lễ Mình Máu Thánh Chúa
    const sacredHeart = addDays(corpusChristi, 5); // Thứ Sáu sau Mình Máu - Lễ Thánh Tâm
    const immaculateHeart = addDays(sacredHeart, 1); // Thứ Bảy sau Thánh Tâm - Trái Tim Vô Nhiễm Mẹ

    const result = {
        easter, ashWednesday, palmSunday, goodFriday, ascension, pentecost,
        adventStart, christKing, christmas, epiphany, baptismLord,
        vietnameseMartyrs, missionSunday, rosarySunday, annunciation, stJoseph, immConception,
        // Các lễ sau Hiện Xuống
        trinity, corpusChristi, sacredHeart, immaculateHeart,
        // Thông tin dời Lễ Tro
        ashWednesdayCelebration,
        ashWednesdayTransferred,
        ashWednesdayTransferNote
    };

    // Lưu vào cache
    CACHE.set('liturgicalData', cacheKey, result);

    return result;
}

function getLiturgicalDayCode(date, litData, options = {}) {
    const includeSanctoral = options.includeSanctoral !== false;
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const getSunday = (d) => { const c = new Date(d); c.setHours(0, 0, 0, 0); c.setDate(c.getDate() - c.getDay()); return c; }
    const prevSunday = (d) => getSunday(d);
    const currentSun = getSunday(date);
    const dayOfWeek = date.getDay(); // 0=CN, 1=T2, ..., 6=T7
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // ===== ƯU TIÊN 1: Tết Nguyên Đán (7000D) =====
    const tetDay = typeof LUNAR_CALENDAR !== 'undefined' ? LUNAR_CALENDAR.isTetDay(date) : 0;
    if (tetDay > 0 && tetDay <= 3) {
        return `7000${tetDay}`;
    }

    // ===== ƯU TIÊN 2: Các lễ di động đặc biệt liên quan đến Giáng Sinh =====

    // 2030: Lễ Hiển Linh (quy ước riêng) - PHẢI ưu tiên trước 2DDMM
    if (litData.epiphany && dTime === t(litData.epiphany)) {
        return "2030";
    }

    // 6001-6006: Các ngày sau lễ Hiển Linh (trước Chúa Giêsu Chịu Phép Rửa)
    // PHẢI ưu tiên trước 2DDMM
    if (litData.epiphany && litData.baptismLord &&
        dTime > t(litData.epiphany) && dTime < t(litData.baptismLord)) {
        const daysAfterEpiphany = Math.floor((dTime - t(litData.epiphany)) / (24 * 60 * 60 * 1000));
        if (daysAfterEpiphany >= 1 && daysAfterEpiphany <= 6) {
            return `600${daysAfterEpiphany}`;
        }
        // Nếu quá 6 ngày, fallback về 2DDMM (chỉ khi rơi vào 17/12-01/01)
        if ((date.getMonth() === 11 && date.getDate() >= 17) ||
            (date.getMonth() === 0 && date.getDate() <= 1)) {
            return `2${day}${month}`;
        }
    }

    // ===== ƯU TIÊN 3: Mùa Giáng Sinh & Cuối Mùa Vọng (2DDMM) =====
    // 17/12 đến trước lễ Hiển Linh: Tuần chuẩn bị Giáng Sinh + Bát Nhật + các ngày đầu tháng 1
    // Phải ưu tiên TRƯỚC Sanctoral để tránh bị ghi đè
    // Lưu ý: Lễ Hiển Linh (2030) và các ngày sau (6001-6006) đã được xử lý ở trên
    if (date.getMonth() === 11) {
        // 25-31/12: Bát nhật Giáng Sinh, luôn dùng 2DDMM (kể cả Chúa Nhật)
        if (date.getDate() >= 25) {
            return `2${day}${month}`;
        }
        // 17-24/12: ngày thường dùng 2DDMM, Chúa Nhật vẫn là Chúa Nhật Mùa Vọng
        if (date.getDate() >= 17) {
            if (dayOfWeek !== 0) {
                return `2${day}${month}`;
            }
        }
    }
    if (date.getMonth() === 0) {
        // Trước lễ Hiển Linh thì vẫn dùng mã 2DDMM
        if (litData.epiphany && dTime < t(litData.epiphany)) {
            return `2${day}${month}`;
        }
        // Fallback an toàn nếu không có epiphany
        if (!litData.epiphany && date.getDate() <= 1) {
            return `2${day}${month}`;
        }
    }

    // ===== ƯU TIÊN 4: Sanctoral (7DDMM) =====
    // Mã theo ngày-tháng cho các lễ thánh cố định
    // Chỉ ưu tiên khi KHÔNG rơi vào các mùa đặc biệt (đã xử lý ở trên)
    const code7DDMM = `7${day}${month}`;
    // FIXED_DATA_LOOKUP dùng key format "month-day" (ví dụ "8-15" cho 15/08)
    const fixedKey = `${parseInt(month)}-${parseInt(day)}`;
    if (includeSanctoral) {
        // Kiểm tra xem có lễ thánh trọng/kính cố định không (từ FIXED_DATA_LOOKUP)
        if (typeof FIXED_DATA_LOOKUP !== 'undefined' && FIXED_DATA_LOOKUP[fixedKey]) {
            const saint = FIXED_DATA_LOOKUP[fixedKey];
            const isSunday = dayOfWeek === 0;
            const isLordFixedFeast = isLordFeast({ special: saint.name });
            // Chỉ ưu tiên nếu là Lễ Trọng (TRONG) hoặc Lễ Kính (KINH)
            // Chúa Nhật Thường Niên: chỉ ưu tiên Lễ Trọng hoặc Lễ Kính của Chúa
            if (saint.rank === 'TRONG' || (saint.rank === 'KINH' && (!isSunday || isLordFixedFeast))) {
                // Kiểm tra xem có phải lễ di động đặc biệt không (sẽ xử lý ở dưới)
                const isSpecialFeast = (litData.epiphany && dTime === t(litData.epiphany)) ||
                    (litData.baptismLord && dTime === t(litData.baptismLord)) ||
                    (litData.ascension && dTime === t(litData.ascension)) ||
                    (litData.pentecost && dTime === t(litData.pentecost)) ||
                    (litData.trinity && dTime === t(litData.trinity)) ||
                    (litData.corpusChristi && dTime === t(litData.corpusChristi)) ||
                    (litData.sacredHeart && dTime === t(litData.sacredHeart)) ||
                    (litData.immaculateHeart && dTime === t(litData.immaculateHeart));

                // Kiểm tra xem có bị override bởi lễ di động không
                const movableOverride = typeof MOVABLE_OVERRIDES_FIXED !== 'undefined' && MOVABLE_OVERRIDES_FIXED[fixedKey];
                const isOverridden = movableOverride && litData[movableOverride] && dTime === t(litData[movableOverride]);

                // Kiểm tra xem có rơi vào Mùa Vọng không (17/12-24/12 đã xử lý ở trên)
                const isInAdvent = dTime >= t(litData.adventStart) && dTime < t(litData.christmas);

                // Kiểm tra xem có rơi vào Mùa Chay hoặc Mùa Phục Sinh không
                const isInLent = dTime >= t(litData.ashWednesday) && dTime < t(litData.easter);
                const isInEaster = dTime >= t(litData.easter) && dTime <= t(litData.pentecost);

                // Chỉ ưu tiên sanctoral nếu:
                // - Không phải lễ di động đặc biệt
                // - Không bị override bởi lễ di động
                // - Không rơi vào Mùa Vọng, Mùa Chay, Mùa Phục Sinh (các mùa này có mã riêng)
                if (!isSpecialFeast && !isOverridden && !isInAdvent && !isInLent && !isInEaster) {
                    return code7DDMM;
                }
            }
        }
    }

    // ===== ƯU TIÊN 5: Các lễ di động đặc biệt khác =====

    // 5010: Chúa Giêsu Chịu Phép Rửa (Chúa Nhật I Thường Niên)
    if (litData.baptismLord && dTime === t(litData.baptismLord)) {
        return "5010";
    }

    // 4080: Thăng Thiên
    if (litData.ascension && dTime === t(litData.ascension)) {
        return "4080";
    }

    // 4089: Vọng Hiện Xuống (trước Hiện Xuống 1 ngày)
    const pentecostVigil = addDays(litData.pentecost, -1);
    if (dTime === t(pentecostVigil)) {
        return "4089";
    }

    // 5001: Hiện Xuống (Pentecost Sunday)
    if (dTime === t(litData.pentecost)) {
        return "5001";
    }

    // 5002: Ba Ngôi (Chúa Nhật sau Hiện Xuống)
    if (litData.trinity && dTime === t(litData.trinity)) {
        return "5002";
    }

    // 5003: Mình Máu Thánh (Chúa Nhật sau Ba Ngôi)
    if (litData.corpusChristi && dTime === t(litData.corpusChristi)) {
        return "5003";
    }

    // 5004: Thánh Tâm (Thứ Sáu sau Mình Máu)
    if (litData.sacredHeart && dTime === t(litData.sacredHeart)) {
        return "5004";
    }

    // 8441: Trái Tim Vô Nhiễm Mẹ (Thứ Bảy sau Thánh Tâm)
    if (litData.immaculateHeart && dTime === t(litData.immaculateHeart)) {
        return "8441";
    }

    // ===== ƯU TIÊN 6: Mùa Chay (3) =====
    // Cấu trúc: 3 + 0 + T (1-6) + D (0-6)
    if (dTime >= t(litData.ashWednesday) && dTime < t(litData.easter)) {
        // Tìm Chúa Nhật I Mùa Chay (4 ngày sau Lễ Tro ban đầu)
        const firstSunLent = addDays(litData.ashWednesday, 4);
        const firstSunLentDate = new Date(firstSunLent);
        firstSunLentDate.setDate(firstSunLentDate.getDate() - firstSunLentDate.getDay());

        // 3004-3007: Lễ Tro và các ngày sau (nhưng phải TRƯỚC Chúa Nhật I Mùa Chay)
        if (dTime < t(firstSunLentDate)) {
            if (litData.ashWednesdayTransferred) {
                const ashCelebrationTime = t(litData.ashWednesdayCelebration);
                // Lễ Tro bị dời
                if (dTime === ashCelebrationTime) {
                    return "3004";
                }
                // Khi có dời Lễ Tro theo quy luật Việt Nam, dãy 3004-3007
                // bám theo ngày cử hành thực tế để nhất quán với export/test.
                if (dTime > ashCelebrationTime) {
                    const daysFromAsh = Math.floor((dTime - ashCelebrationTime) / (24 * 60 * 60 * 1000));
                    if (daysFromAsh >= 1 && daysFromAsh <= 3) {
                        return `300${4 + daysFromAsh}`;
                    }
                }
            } else {
                // Lễ Tro không bị dời
                if (dTime >= t(litData.ashWednesday)) {
                    const daysFromAsh = Math.floor((dTime - t(litData.ashWednesday)) / (24 * 60 * 60 * 1000));
                    if (daysFromAsh >= 0 && daysFromAsh <= 3) {
                        return `300${4 + daysFromAsh}`;
                    }
                }
            }
        }

        // Tuần Thánh: 3060-3066
        const holyWeekStart = addDays(litData.easter, -7);
        if (dTime >= t(holyWeekStart)) {
            // Tuần Thánh: Lễ Lá (CN) = 3060, Thứ 2-6 = 3061-3065, Thứ 7 = 3066
            return `306${dayOfWeek}`;
        }

        // Các tuần Mùa Chay khác: 3010-3050
        if (dTime >= t(firstSunLentDate)) {
            const weekNum = Math.floor((t(prevSunday(date)) - t(firstSunLentDate)) / ONE_WEEK) + 1;
            if (weekNum >= 1 && weekNum <= 5) {
                return `30${weekNum}${dayOfWeek}`;
            }
        }
    }

    // ===== ƯU TIÊN 7: Mùa Phục Sinh (4) =====
    // Cấu trúc: 4 + 0 + T (1-7) + D (0-6)
    if (dTime >= t(litData.easter) && dTime <= t(litData.pentecost)) {
        const weekNum = Math.floor((t(prevSunday(date)) - t(getSunday(litData.easter))) / ONE_WEEK) + 1;
        if (weekNum >= 1 && weekNum <= 7) {
            return `40${weekNum}${dayOfWeek}`;
        }
    }

    // ===== ƯU TIÊN 8: Mùa Vọng (1) =====
    // Cấu trúc: 1 + 0 + T (1-4) + D (0-6)
    // Lưu ý: Từ 17/12-24/12 đã xử lý ở trên (2DDMM)
    if (dTime >= t(litData.adventStart) && dTime < t(litData.christmas)) {
        // 17-24/12 đã xử lý ở trên (2DDMM)
        if (date.getMonth() === 11 && date.getDate() >= 17 && date.getDate() <= 24) {
            // 17-24/12: chỉ áp dụng 2DDMM cho ngày thường, không áp dụng cho Chúa Nhật
            if (dayOfWeek !== 0) {
                return `2${day}${month}`;
            }
        }
        const weekNum = Math.floor((t(prevSunday(date)) - t(getSunday(litData.adventStart))) / ONE_WEEK) + 1;
        if (weekNum >= 1 && weekNum <= 4) {
            return `10${weekNum}${dayOfWeek}`;
        }
    }

    // ===== ƯU TIÊN 9: Mùa Thường Niên (5) =====
    // Cấu trúc: 5 + TT (01-34) + D (0-6)
    // Chúa Giêsu Chịu Phép Rửa (5010) đã được xử lý ở trên, không tính vào đây

    if (dTime > t(litData.baptismLord) && dTime < t(litData.ashWednesday)) {
        // Sau Chúa Giêsu Chịu Phép Rửa đến trước Mùa Chay
        // Tính tuần từ Chúa Nhật của Chúa Giêsu Chịu Phép Rửa (hoặc chính nó nếu là CN)
        const baptismSun = prevSunday(litData.baptismLord);
        const thisSunday = prevSunday(date);
        const weekNum = Math.floor((t(thisSunday) - t(baptismSun)) / ONE_WEEK) + 1;
        if (weekNum >= 1 && weekNum <= 34) {
            return `5${weekNum.toString().padStart(2, '0')}${dayOfWeek}`;
        }
    } else if (dTime > t(litData.pentecost) && dTime < t(litData.adventStart)) {
        // Sau Hiện Xuống đến trước Mùa Vọng
        // CN 34 TN = Lễ Chúa Kitô Vua Vũ Trụ
        // Kiểm tra xem có phải là lễ Chúa Kitô Vua không (CN cuối TN)
        if (litData.christKing && dTime === t(litData.christKing)) {
            // Chúa Kitô Vua là CN cuối TN (tuần 34), dùng mã 5340 (5 + 34 + 0)
            return "5340";
        }

        // Tính ngược từ CN cuối TN (Chúa Kitô Vua)
        // CN cuối TN = christKing (CN trước CN I Mùa Vọng 7 ngày)
        const lastOTSunday = litData.christKing; // CN cuối TN = Chúa Kitô Vua
        const thisSunday = prevSunday(date);
        const weeksBeforeLast = Math.floor((t(lastOTSunday) - t(thisSunday)) / ONE_WEEK);
        const weekNum = 34 - weeksBeforeLast;

        if (weekNum >= 1 && weekNum <= 34) {
            return `5${weekNum.toString().padStart(2, '0')}${dayOfWeek}`;
        }
    }

    // Fallback: Trả về sanctoral code nếu không tìm thấy
    if (!includeSanctoral) {
        return getLiturgicalDayCode(date, litData, { includeSanctoral: true });
    }
    return code7DDMM;
}

function getLiturgicalCycle(date, litData) {
    // Năm Phụng Vụ mới bắt đầu vào Chúa Nhật I Mùa Vọng
    // Nếu Month == 12 hoặc (Month == 11 và Day >= Ngày CN 1 Mùa Vọng), 
    // thì Year_Liturgical = Year_Calendar + 1
    let year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Kiểm tra xem có phải sau Chúa Nhật I Mùa Vọng không
    if (month === 12 || (month === 11 && date.getTime() >= litData.adventStart.getTime())) {
        year += 1;
    }

    // Tính năm A/B/C: Năm % 3 == 1 => A, == 2 => B, == 0 => C
    const r = year % 3;
    return r === 1 ? "A" : (r === 2 ? "B" : "C");
}

// Tính số tuần Chúa Nhật trong năm dương lịch (từ 1 đến 53)
// Dùng cho lịch Chầu Thánh Thể
function getSundayNumberOfYear(date) {
    const year = date.getFullYear();
    const jan1 = new Date(year, 0, 1);

    // Tìm Chúa Nhật đầu tiên của năm
    let firstSunday = new Date(jan1);
    const jan1Day = jan1.getDay();
    if (jan1Day !== 0) {
        // Nếu 1/1 không phải Chúa Nhật, tìm Chúa Nhật đầu tiên
        firstSunday.setDate(jan1.getDate() + (7 - jan1Day));
    }

    // Nếu ngày hiện tại trước Chúa Nhật đầu tiên, return 0
    if (date < firstSunday) {
        return 0;
    }

    // Tính số tuần từ Chúa Nhật đầu tiên
    const daysSinceFirstSunday = Math.floor((date - firstSunday) / (24 * 60 * 60 * 1000));
    const sundayNumber = Math.floor(daysSinceFirstSunday / 7) + 1;

    return sundayNumber;
}

function getDetailedLiturgicalWeek(date, litData) {
    const code = getLiturgicalDayCode(date, litData);
    const season = parseInt(code.substring(0, 1));
    const month = date.getMonth();
    const day = date.getDate();
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);

    if (month === 11 && day >= 17 && day <= 24) {
        return `Mùa Vọng ngày ${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`;
    }
    if ((month === 11 && day >= 25) || (month === 0 && day === 1)) return "Tuần Bát Nhật Giáng Sinh";

    // Kiểm tra các ngày sau lễ Hiển Linh (từ ngày sau Hiển Linh đến trước Chúa Giêsu Chịu Phép Rửa)
    if (litData.epiphany && litData.baptismLord) {
        const epiphanyTime = t(litData.epiphany);
        const baptismTime = t(litData.baptismLord);

        // Ngày Hiển Linh
        if (dTime === epiphanyTime) {
            return "Lễ Hiển Linh";
        }

        // Ngày Chúa Giêsu Chịu Phép Rửa
        if (dTime === baptismTime) {
            return "Lễ Chúa Giêsu Chịu Phép Rửa";
        }

        // Các ngày sau lễ Hiển Linh (trước Chúa Giêsu Chịu Phép Rửa)
        if (dTime > epiphanyTime && dTime < baptismTime) {
            return "sau lễ Hiển Linh";
        }
    }

    if (season === 2) return "Mùa Giáng Sinh";

    // Kiểm tra các ngày đặc biệt có mã riêng
    if (code === "4089") return "Vọng Hiện Xuống";
    if (code === "4080") return "Lễ Chúa Thăng Thiên";
    if (code === "5001") return "Lễ Hiện Xuống";
    if (code === "5002") return "Lễ Chúa Ba Ngôi";
    if (code === "5003") return "Lễ Mình Máu Thánh Chúa";
    if (code === "5004") return "Lễ Thánh Tâm Chúa Giêsu";
    if (code === "8441") return "Trái Tim Vô Nhiễm Mẹ";

    const week = parseInt(code.substring(1, 3));
    const seasonNames = ["", "Mùa Vọng", "Mùa Giáng Sinh", "Mùa Chay", "Mùa Phục Sinh", "Thường Niên"];
    if (week === 0 && season === 3) return "Sau Lễ Tro";
    if (week === 6 && season === 3) return "Tuần Thánh";
    if (week === 1 && season === 4) return "Tuần Bát Nhật Phục Sinh";

    // Kiểm tra season hợp lệ trước khi truy cập seasonNames
    const seasonName = (season >= 0 && season < seasonNames.length) ? seasonNames[season] : "Thường Niên";
    // Kiểm tra week hợp lệ
    const weekRoman = (week > 0 && !isNaN(week)) ? toRoman(week) : "";

    if (!weekRoman) {
        // Nếu không có week hợp lệ, trả về tên mùa hoặc fallback
        return seasonName || "Mùa Thường Niên";
    }

    return `Tuần ${weekRoman} ${seasonName}`;
}

function getRankDisplayName(rank) {
    switch (rank) {
        case 'TRONG': return 'LỄ TRỌNG';
        case 'KINH': return 'LỄ KÍNH';
        case 'NHO': return 'LỄ NHỚ';
        case 'NHOKB': return 'LỄ NHỚ (TD)';
        case 'CHUA_NHAT': return 'CHÚA NHẬT';
        case 'CN': return 'CHÚA NHẬT';
        default: return '';
    }
}
function getRankBadgeClass(rank) {
    switch (rank) {
        case 'TRONG': return 'rank-TRONG';
        case 'KINH': return 'rank-KINH';
        case 'NHO': return 'rank-NHO';
        case 'NHOKB': return 'rank-NHOKB';
        case 'CN': return 'rank-CN';
        case 'CHUA_NHAT': return 'rank-CN';
        default: return 'bg-gray-100 text-gray-500';
    }
}

// ============================================================================
// LITURGICAL PRECEDENCE ENGINE
// Engine quyết định cử hành chính và commemorations khi có xung đột
// ============================================================================

/**********************************************************************
 * PHÂN CẤP ƯU TIÊN (Precedence Rank 1..13)
 * Rank nhỏ hơn => ưu tiên cao hơn.
 **********************************************************************/
const RANK = Object.freeze({
    TRIDUUM: 1,
    HIGH_LORD_SUNDAY_SEASON: 2,
    SOLEMNITY: 3,
    FEAST_LORD: 4,
    SUNDAY_ORD_OR_CHRISTMAS: 5,
    FEAST: 6,
    MEM_OBL: 7,
    MEM_OPT: 8,
    ADVENT_17_24_WEEKDAY: 9,
    ADVENT_1_16_WEEKDAY: 10,
    CHRISTMAS_WEEKDAY: 11,
    LENT_WEEKDAY: 12,
    OT_WEEKDAY: 13
});

const CATEGORY_WEIGHT = Object.freeze({
    LORD: 0,
    MARY: 1,
    SAINT: 2,
    OTHER: 3
});

const GRADE = Object.freeze({
    SOLEMNITY: "TRỌNG",
    FEAST: "KÍNH",
    MEMORIAL: "NHỚ",
    WEEKDAY: "NGÀY THƯỜNG"
});

// Grade weight (số cao hơn = ưu tiên cao hơn trong cùng rank)
function gradeWeight(grade) {
    if (grade === GRADE.SOLEMNITY) return 4;
    if (grade === GRADE.FEAST) return 3;
    if (grade === GRADE.MEMORIAL) return 2;
    if (grade === GRADE.WEEKDAY) return 1;
    return 0;
}

// Chuyển đổi rankCode sang GRADE
function rankCodeToGrade(rankCode) {
    if (rankCode === 'TRONG') return GRADE.SOLEMNITY;
    if (rankCode === 'KINH') return GRADE.FEAST;
    if (rankCode === 'NHO' || rankCode === 'NHOKB') return GRADE.MEMORIAL;
    return GRADE.WEEKDAY;
}

// Xác định Precedence Rank cho một ngày phụng vụ
// Số nhỏ hơn = ưu tiên cao hơn
function getPrecedenceRank(celebrationInfo, date, litData) {
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);
    const dayOfWeek = date.getDay();
    const season = parseInt(getLiturgicalDayCode(date, litData).substring(0, 1));
    const specialDayType = getSpecialDayType(date, litData);
    const month = date.getMonth();
    const day = date.getDate();

    // 1. TRIDUUM - Tam Nhật Vượt Qua (ưu tiên tuyệt đối)
    if (specialDayType === 'TRIDUUM') {
        return RANK.TRIDUUM;
    }

    // Ngày thường 17-24/12 (tuần cuối Mùa Vọng) - ưu tiên trước khi season bị hiểu là Giáng Sinh do 2DDMM
    if (month === 11 && day >= 17 && day <= 24 && dayOfWeek !== 0) {
        return RANK.ADVENT_17_24_WEEKDAY;
    }

    // Các ngày đặc biệt có ưu tiên cao (Theo bảng phụng vụ)
    // Áp dụng CHỈ cho ngày thường/Chúa Nhật của mùa (không áp dụng cho lễ thánh)
    const isAshWednesdayCelebration = litData?.ashWednesdayTransferred
        ? (dTime === t(litData.ashWednesdayCelebration))
        : (dTime === t(litData.ashWednesday));
    const isPrivilegedWeekday = specialDayType === 'HOLY_WEEK' ||
        specialDayType === 'EASTER_OCTAVE' ||
        isAshWednesdayCelebration;
    const isAshWednesdayCelebrationInfo = isAshWednesdayCelebration &&
        typeof celebrationInfo.special === 'string' && celebrationInfo.special.toLowerCase().includes('lễ tro');
    if (isPrivilegedWeekday && (
        celebrationInfo.rankCode === 'NGAY_THUONG' ||
        celebrationInfo.rankCode === 'CHUA_NHAT' ||
        isAshWednesdayCelebrationInfo
    )) {
        return RANK.HIGH_LORD_SUNDAY_SEASON;
    }

    // 2. HIGH_LORD_SUNDAY_SEASON - Chúa Nhật trong mùa đặc biệt (Vọng, Chay, Phục Sinh)
    if (dayOfWeek === 0 && (season === 1 || season === 3 || season === 4) && celebrationInfo.rankCode === 'CHUA_NHAT') {
        return RANK.HIGH_LORD_SUNDAY_SEASON;
    }

    // 3. SOLEMNITY - Lễ Trọng
    if (celebrationInfo.rankCode === 'TRONG') {
        return RANK.SOLEMNITY;
    }

    // 4. FEAST_LORD - Lễ Kính của Chúa
    if (celebrationInfo.rankCode === 'KINH' && isLordFeast(celebrationInfo)) {
        return RANK.FEAST_LORD;
    }

    // 5. SUNDAY_ORD_OR_CHRISTMAS - Chúa Nhật Thường Niên hoặc Chúa Nhật Mùa Giáng Sinh
    if (dayOfWeek === 0 && season === 5 && celebrationInfo.rankCode === 'CHUA_NHAT') {
        return RANK.SUNDAY_ORD_OR_CHRISTMAS;
    }
    if (dayOfWeek === 0 && season === 2 && celebrationInfo.rankCode === 'CHUA_NHAT') { // Chúa Nhật Mùa Giáng Sinh
        return RANK.SUNDAY_ORD_OR_CHRISTMAS;
    }

    // 6. FEAST - Lễ Kính (không phải của Chúa)
    if (celebrationInfo.rankCode === 'KINH') {
        return RANK.FEAST;
    }

    // 7. MEM_OBL - Lễ Nhớ Bắt Buộc
    if (celebrationInfo.rankCode === 'NHO') {
        return RANK.MEM_OBL;
    }

    // 8. MEM_OPT - Lễ Nhớ Tùy Chọn
    if (celebrationInfo.rankCode === 'NHOKB') {
        return RANK.MEM_OPT;
    }

    // 9. ADVENT_17_24_WEEKDAY - Ngày thường 17-24/12 (tuần cuối Mùa Vọng)
    if (season === 1 && dayOfWeek !== 0) {
        if (day >= 17 && day <= 24) {
            return RANK.ADVENT_17_24_WEEKDAY;
        }
    }

    // Ngày thường trong Bát Nhật Giáng Sinh: ưu tiên cao hơn lễ nhớ, nhưng thấp hơn lễ kính
    if (specialDayType === 'CHRISTMAS_OCTAVE' && dayOfWeek !== 0 && celebrationInfo.rankCode === 'NGAY_THUONG') {
        return RANK.ADVENT_17_24_WEEKDAY;
    }

    // 10. ADVENT_1_16_WEEKDAY - Ngày thường 1-16/12 Mùa Vọng
    if (season === 1 && dayOfWeek !== 0) {
        return RANK.ADVENT_1_16_WEEKDAY;
    }

    // 11. CHRISTMAS_WEEKDAY - Ngày thường Mùa Giáng Sinh (sau Bát Nhật)
    if (season === 2 && dayOfWeek !== 0 && celebrationInfo.rankCode === 'NGAY_THUONG') {
        return RANK.CHRISTMAS_WEEKDAY;
    }

    // 12. LENT_WEEKDAY - Ngày thường Mùa Chay
    if (season === 3 && dayOfWeek !== 0) {
        return RANK.LENT_WEEKDAY;
    }

    // 13. OT_WEEKDAY - Ngày thường Thường Niên
    if (season === 5 && dayOfWeek !== 0) {
        return RANK.OT_WEEKDAY;
    }

    // Fallback: ngày thường
    return RANK.OT_WEEKDAY;
}

// Kiểm tra xem có phải lễ của Chúa không
function isLordFeast(celebrationInfo) {
    const name = celebrationInfo.special || '';
    // Các lễ của Chúa thường có từ khóa như "Chúa", "Chúa Giêsu", "Kitô", "Thánh Thể"
    return name.includes('Chúa') || name.includes('Chúa Giêsu') ||
        name.includes('Kitô') || name.includes('Thánh Thể') ||
        name.includes('HIỆN XUỐNG') || name.includes('PHỤC SINH');
}

// Xác định Category Weight
function getCategoryWeight(celebrationInfo) {
    const name = celebrationInfo.special || (celebrationInfo.saints && celebrationInfo.saints[0]?.name) || '';

    // LORD - Lễ của Chúa
    if (isLordFeast(celebrationInfo)) {
        return CATEGORY_WEIGHT.LORD;
    }

    // MARY - Lễ về Đức Mẹ
    if (name.includes('Đức Mẹ') || name.includes('MẸ') || name.includes('MARIA')) {
        return CATEGORY_WEIGHT.MARY;
    }

    // SAINT - Lễ các thánh
    if (name.includes('Thánh') || celebrationInfo.saints && celebrationInfo.saints.length > 0) {
        return CATEGORY_WEIGHT.SAINT;
    }

    // OTHER - Khác
    return CATEGORY_WEIGHT.OTHER;
}

// Legacy function - giữ lại để tương thích (số nhỏ hơn = ưu tiên cao hơn)
// Pure mapping để tránh phụ thuộc ngày chạy.
function getRankPriority(rankCode) {
    switch (rankCode) {
        case 'TRONG': return RANK.SOLEMNITY;
        case 'KINH': return RANK.FEAST;
        case 'NHO': return RANK.MEM_OBL;
        case 'NHOKB':
        case 'O': return RANK.MEM_OPT;
        case 'CHUA_NHAT': return RANK.SUNDAY_ORD_OR_CHRISTMAS;
        case 'NGAY_THUONG': return RANK.OT_WEEKDAY;
        default: return RANK.OT_WEEKDAY;
    }
}

// Xác định loại ngày phụng vụ đặc biệt
function getSpecialDayType(date, litData) {
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);

    // Tam Nhật Vượt Qua (Triduum) - ưu tiên tuyệt đối
    const goodFridayTime = t(litData.goodFriday);
    const easterTime = t(litData.easter);
    if (dTime >= goodFridayTime && dTime <= easterTime) {
        return 'TRIDUUM';
    }

    // Tuần Thánh (trước Triduum)
    const palmSundayTime = t(litData.palmSunday);
    if (dTime >= palmSundayTime && dTime < goodFridayTime) {
        return 'HOLY_WEEK';
    }

    // Mùa Chay (từ Thứ Tư Lễ Tro đến trước Tuần Thánh)
    const ashWednesdayTime = t(litData.ashWednesday);
    if (dTime >= ashWednesdayTime && dTime < palmSundayTime) {
        return 'LENT';
    }

    // Bát Nhật Phục Sinh
    const octaveEnd = addDays(easterTime, 7);
    if (dTime > easterTime && dTime <= octaveEnd) {
        return 'EASTER_OCTAVE';
    }

    // Mùa Vọng (từ Chúa Nhật I Mùa Vọng đến 24/12)
    const adventStartTime = t(litData.adventStart);
    const christmasEve = t(new Date(date.getFullYear(), 11, 24));
    if (dTime >= adventStartTime && dTime <= christmasEve) {
        return 'ADVENT';
    }

    // Bát Nhật Giáng Sinh (25/12 -> 01/01, bắc cầu qua năm)
    let christmasStart = new Date(date.getFullYear(), 11, 25);
    let christmasOctaveEnd = new Date(date.getFullYear() + 1, 0, 1);
    // Nếu đang ở đầu tháng 1, bắc cầu từ 25/12 năm trước -> 01/01 năm hiện tại
    if (date.getMonth() === 0 && date.getDate() <= 1) {
        christmasStart = new Date(date.getFullYear() - 1, 11, 25);
        christmasOctaveEnd = new Date(date.getFullYear(), 0, 1);
    }
    const christmasTime = t(christmasStart);
    const christmasOctaveEndTime = t(christmasOctaveEnd);
    if (dTime >= christmasTime && dTime <= christmasOctaveEndTime) {
        return 'CHRISTMAS_OCTAVE';
    }

    return 'ORDINARY';
}

// Tạo base celebration từ temporal info
function baseCelebration(date, temporalInfo, litData) {
    const dayOfWeek = date.getDay();
    const season = parseInt(getLiturgicalDayCode(date, litData).substring(0, 1));
    const specialDayType = getSpecialDayType(date, litData);
    const detailedWeek = getDetailedLiturgicalWeek(date, litData);
    const cycle = getLiturgicalCycle(date, litData);
    const weekdayCycle = date.getFullYear() % 2 !== 0 ? "1" : "2";
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);
    const christmasStart = (date.getMonth() === 0)
        ? new Date(date.getFullYear() - 1, 11, 25)
        : new Date(date.getFullYear(), 11, 25);
    const christmasOctaveEnd = new Date(christmasStart.getFullYear() + 1, 0, 1);
    const isChristmasOctave = dTime >= t(christmasStart) && dTime <= t(christmasOctaveEnd);

    // Tam Nhật Vượt Qua
    if (specialDayType === 'TRIDUUM') {
        const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
        const dTime = t(date);
        const goodFridayTime = t(litData.goodFriday);
        const easterTime = t(litData.easter);
        const holyThursday = addDays(litData.goodFriday, -1);
        const holySaturday = addDays(litData.easter, -1);

        let name = "Tam Nhật Vượt Qua";
        let color = "white";
        if (dTime === t(holyThursday)) {
            name = "Thứ Năm Tuần Thánh (Tiệc Ly)";
            color = "white";
        } else if (dTime === goodFridayTime) {
            name = "Thứ Sáu Tuần Thánh (Tưởng niệm Cuộc Thương Khó)";
            color = "red";
        } else if (dTime === t(holySaturday)) {
            name = "Thứ Bảy Tuần Thánh (Canh thức Vượt Qua)";
            color = "white";
        } else if (dTime === easterTime) {
            name = "Chúa Nhật Phục Sinh";
            color = "white";
        }

        return {
            key: "BASE_TRIDUUM",
            name: name,
            category: "LORD",
            grade: (dayOfWeek === 0 ? GRADE.SOLEMNITY : GRADE.WEEKDAY),
            rank: RANK.TRIDUUM,
            color: color,
            rankCode: temporalInfo.rankCode,
            special: name,
            season: temporalInfo.season
        };
    }

    // Chúa Nhật
    if (dayOfWeek === 0) {
        // Bát nhật Giáng Sinh: luôn là Chúa Nhật Mùa Giáng Sinh (màu trắng)
        if (isChristmasOctave) {
            return {
                key: "BASE_SUN_XMAS_OCTAVE",
                name: "Chúa Nhật Mùa Giáng Sinh",
                category: "LORD",
                grade: GRADE.SOLEMNITY,
                rank: RANK.SUNDAY_ORD_OR_CHRISTMAS,
                color: "white",
                rankCode: 'CHUA_NHAT',
                special: "Chúa Nhật Mùa Giáng Sinh",
                season: "Mùa Giáng Sinh"
            };
        }

        // Giữ nguyên các cử hành Chúa/Lễ chính đã được xác định từ temporalInfo
        // (ví dụ: CHÚA THĂNG THIÊN được chuyển sang Chúa Nhật).
        if (temporalInfo.special && (temporalInfo.rankCode === 'TRONG' || temporalInfo.rankCode === 'KINH')) {
            const color = temporalInfo.color?.includes('red')
                ? 'red'
                : (temporalInfo.color?.includes('purple')
                    ? 'purple'
                    : (temporalInfo.color?.includes('white') ? 'white' : 'green'));
            return {
                key: "BASE_SUN_SPECIAL_TEMPORAL",
                name: temporalInfo.special,
                category: "LORD",
                grade: rankCodeToGrade(temporalInfo.rankCode),
                rank: getPrecedenceRank(temporalInfo, date, litData),
                color: color,
                rankCode: temporalInfo.rankCode,
                special: temporalInfo.special,
                season: temporalInfo.season
            };
        }

        if (season === 1) { // Mùa Vọng
            const adventStartTime = t(litData.adventStart);
            const week = 1 + Math.floor((t(date) - adventStartTime) / (7 * 24 * 60 * 60 * 1000));
            const weekRoman = toRoman(Math.min(Math.max(week, 1), 4));
            return {
                key: "BASE_SUN_ADVENT",
                name: `Chúa Nhật ${weekRoman} Mùa Vọng`,
                category: "LORD",
                grade: GRADE.SOLEMNITY,
                rank: RANK.HIGH_LORD_SUNDAY_SEASON,
                color: "purple",
                rankCode: 'CHUA_NHAT',
                special: `Chúa Nhật ${weekRoman} Mùa Vọng`,
                season: temporalInfo.season
            };
        }
        if (season === 3) { // Mùa Chay
            if (detailedWeek.includes("Tuần Thánh")) {
                return {
                    key: "BASE_SUN_PALM",
                    name: "Chúa Nhật Lễ Lá (Tuần Thánh)",
                    category: "LORD",
                    grade: GRADE.SOLEMNITY,
                    rank: RANK.HIGH_LORD_SUNDAY_SEASON,
                    color: "red",
                    rankCode: 'CHUA_NHAT',
                    special: "Chúa Nhật Lễ Lá",
                    season: temporalInfo.season
                };
            }
            const firstSundayLent = addDays(litData.ashWednesday, 4);
            const week = 1 + Math.floor((t(date) - t(firstSundayLent)) / (7 * 24 * 60 * 60 * 1000));
            const weekRoman = toRoman(Math.min(Math.max(week, 1), 5));
            return {
                key: "BASE_SUN_LENT",
                name: `Chúa Nhật ${weekRoman} Mùa Chay`,
                category: "LORD",
                grade: GRADE.SOLEMNITY,
                rank: RANK.HIGH_LORD_SUNDAY_SEASON,
                color: "purple",
                rankCode: 'CHUA_NHAT',
                special: `Chúa Nhật ${weekRoman} Mùa Chay`,
                season: temporalInfo.season
            };
        }
        if (season === 4) { // Mùa Phục Sinh
            const easterTime = t(litData.easter);
            const week = 1 + Math.floor((t(date) - easterTime) / (7 * 24 * 60 * 60 * 1000));
            const weekRoman = toRoman(Math.min(Math.max(week, 1), 7));
            return {
                key: "BASE_SUN_EASTER",
                name: `Chúa Nhật ${weekRoman} Mùa Phục Sinh`,
                category: "LORD",
                grade: GRADE.SOLEMNITY,
                rank: RANK.HIGH_LORD_SUNDAY_SEASON,
                color: "white",
                rankCode: 'CHUA_NHAT',
                special: `Chúa Nhật ${weekRoman} Mùa Phục Sinh`,
                season: temporalInfo.season
            };
        }
        if (season === 2) { // Mùa Giáng Sinh

            // Lễ Hiển Linh
            if (litData.epiphany && dTime === t(litData.epiphany)) {
                return {
                    key: "BASE_SUN_EPIPHANY",
                    name: "CHÚA NHẬT LỄ HIỂN LINH",
                    category: "LORD",
                    grade: GRADE.SOLEMNITY,
                    rank: RANK.HIGH_LORD_SUNDAY_SEASON,
                    color: "white",
                    rankCode: 'TRONG',
                    special: "CHÚA NHẬT LỄ HIỂN LINH",
                    season: temporalInfo.season
                };
            }

            // Lễ Chúa Giêsu Chịu Phép Rửa
            if (litData.baptismLord && dTime === t(litData.baptismLord)) {
                return {
                    key: "BASE_SUN_BAPTISM",
                    name: "CHÚA GIÊSU CHỊU PHÉP RỬA",
                    category: "LORD",
                    grade: GRADE.FEAST,
                    rank: RANK.FEAST_LORD,
                    color: "white",
                    rankCode: 'KINH',
                    special: "CHÚA GIÊSU CHỊU PHÉP RỬA",
                    season: temporalInfo.season
                };
            }

            return {
                key: "BASE_SUN_XMAS",
                name: "Chúa Nhật Mùa Giáng Sinh",
                category: "LORD",
                grade: GRADE.SOLEMNITY,
                rank: RANK.SUNDAY_ORD_OR_CHRISTMAS,
                color: "white",
                rankCode: 'CHUA_NHAT',
                special: "Chúa Nhật Mùa Giáng Sinh",
                season: temporalInfo.season
            };
        }
        // Chúa Nhật Thường Niên
        return {
            key: "BASE_SUN_OT",
            name: `Chúa Nhật Mùa Thường Niên (${detailedWeek})`,
            category: "LORD",
            grade: GRADE.SOLEMNITY,
            rank: RANK.SUNDAY_ORD_OR_CHRISTMAS,
            color: "green",
            rankCode: 'CHUA_NHAT',
            special: detailedWeek,
            season: temporalInfo.season
        };
    }

    // Ngày thường
    let color = "green";
    if (season === 1) color = "purple"; // Mùa Vọng
    if (season === 3) color = "purple"; // Mùa Chay
    if (season === 4) color = "white";  // Mùa Phục Sinh
    if (season === 2) color = "white";  // Mùa Giáng Sinh
    if (isChristmasOctave) color = "white"; // Bát nhật Giáng Sinh

    const baseRank = getPrecedenceRank(temporalInfo, date, litData);

    // Xử lý đặc biệt cho các ngày sau lễ Hiển Linh
    if (litData.epiphany && litData.baptismLord) {
        const epiphanyTime = t(litData.epiphany);
        const baptismTime = t(litData.baptismLord);

        if (dTime > epiphanyTime && dTime < baptismTime) {
            const dayOfWeekName = DAYS_FULL_VI[dayOfWeek];
            return {
                key: "BASE_WEEKDAY_AFTER_EPIPHANY",
                name: `${dayOfWeekName} sau lễ Hiển Linh`,
                category: "OTHER",
                grade: GRADE.WEEKDAY,
                rank: RANK.CHRISTMAS_WEEKDAY,
                color: "white",
                rankCode: 'NGAY_THUONG',
                special: `${dayOfWeekName} sau lễ Hiển Linh`,
                season: "Mùa Giáng Sinh"
            };
        }
    }

    return {
        key: "BASE_WEEKDAY",
        name: `Ngày thường ${temporalInfo.season}${detailedWeek ? " - " + detailedWeek : ""}`,
        category: temporalInfo.special ? "LORD" : "OTHER",
        grade: rankCodeToGrade(temporalInfo.rankCode),
        rank: baseRank,
        color: color,
        rankCode: temporalInfo.rankCode,
        special: temporalInfo.special || null,
        season: temporalInfo.season
    };
}

// Engine quyết định cử hành chính sử dụng candidates approach
// Input: temporalInfo, sanctoralInfo, date, litData
// Output: { primaryCelebration, commemorations, reason }
function determinePrimaryCelebration(temporalInfo, sanctoralInfo, date, litData) {
    // Tạo base celebration từ temporal
    const base = baseCelebration(date, temporalInfo, litData);

    // Tạo danh sách candidates
    const candidates = [base];

    // Thêm sanctoral nếu có
    if (sanctoralInfo) {
        const sanctoralCandidate = {
            key: "SANCTORAL",
            name: sanctoralInfo.special,
            category: getCategoryWeight(sanctoralInfo) === CATEGORY_WEIGHT.MARY ? "MARY" :
                (getCategoryWeight(sanctoralInfo) === CATEGORY_WEIGHT.SAINT ? "SAINT" : "OTHER"),
            grade: rankCodeToGrade(sanctoralInfo.rankCode),
            rank: getPrecedenceRank(sanctoralInfo, date, litData),
            color: sanctoralInfo.color.includes('red') ? 'red' :
                (sanctoralInfo.color.includes('white') ? 'white' : 'green'),
            rankCode: sanctoralInfo.rankCode,
            special: sanctoralInfo.special,
            saints: sanctoralInfo.saints || []
        };
        candidates.push(sanctoralCandidate);
    }

    // Sắp xếp candidates theo precedence
    candidates.sort((a, b) => {
        // 1. So sánh rank (số nhỏ hơn = ưu tiên cao hơn)
        if (a.rank !== b.rank) return a.rank - b.rank;

        // 2. So sánh category weight (số nhỏ hơn = ưu tiên cao hơn)
        const wa = CATEGORY_WEIGHT[a.category] ?? CATEGORY_WEIGHT.OTHER;
        const wb = CATEGORY_WEIGHT[b.category] ?? CATEGORY_WEIGHT.OTHER;
        if (wa !== wb) return wa - wb;

        // 3. So sánh grade weight (số cao hơn = ưu tiên cao hơn)
        const ga = gradeWeight(a.grade);
        const gb = gradeWeight(b.grade);
        if (ga !== gb) return gb - ga;

        // 4. So sánh tên (alphabetical)
        return String(a.name).localeCompare(String(b.name), "vi");
    });

    const winner = candidates[0];
    const isSanctoralWinner = winner.key === "SANCTORAL";
    const commemorations = candidates.slice(1).filter(c => {
        // Chỉ commemorated nếu là MEMORIAL hoặc trong một số trường hợp đặc biệt
        return c.grade === GRADE.MEMORIAL ||
            (c.rank === RANK.SOLEMNITY && winner.rank <= RANK.HIGH_LORD_SUNDAY_SEASON);
    });

    // Chuyển đổi winner về format temporalInfo/sanctoralInfo
    const primaryCelebration = {
        ...temporalInfo,
        special: winner.special || temporalInfo.special,
        rankCode: winner.rankCode || temporalInfo.rankCode,
        color: winner.color === 'red' ? 'bg-lit-red' :
            (winner.color === 'purple' ? 'bg-lit-purple' :
                (winner.color === 'white' ? 'bg-lit-white' : 'bg-lit-green')),
        textColor: winner.color === 'red' ? 'text-lit-red' :
            (winner.color === 'purple' ? 'text-lit-purple' :
                (winner.color === 'white' ? 'text-lit-gold' : 'text-lit-green')),
        saints: winner.saints || temporalInfo.saints,
        _isSanctoral: isSanctoralWinner // Flag để tooltip biết
    };

    return {
        primaryCelebration: primaryCelebration,
        commemorations: commemorations,
        reason: `Winner: ${winner.key} (rank ${winner.rank}, category ${winner.category}, grade ${winner.grade})`,
        _winnerKey: winner.key // Lưu winner key để tooltip sử dụng
    };
}

// Legacy function - giữ lại để tương thích
function resolveLiturgicalConflict(temporalInfo, sanctoralInfo, date, litData) {
    const result = determinePrimaryCelebration(temporalInfo, sanctoralInfo, date, litData);
    return {
        use: result.primaryCelebration === temporalInfo ? 'temporal' : 'sanctoral',
        reason: result.reason
    };
}

// ============================================================================
// LITURGICAL TRANSFER ENGINE
// Xử lý việc dời lễ khi lễ trọng rơi vào Chúa Nhật hoặc các ngày đặc biệt
// ============================================================================

// Xác định ngày dời lễ (transfer date) cho một lễ trọng
function getTransferDate(originalDate, litData) {
    const dayOfWeek = originalDate.getDay();
    const season = parseInt(getLiturgicalDayCode(originalDate, litData).substring(0, 1));
    const specialDayType = getSpecialDayType(originalDate, litData);

    // Chúa Nhật Thường Niên → dời sang Thứ Hai
    if (dayOfWeek === 0 && season === 5) {
        return addDays(originalDate, 1);
    }

    // Chúa Nhật Mùa Vọng, Mùa Chay, Mùa Phục Sinh → dời sang Thứ Hai
    if (dayOfWeek === 0 && (season === 1 || season === 3 || season === 4)) {
        return addDays(originalDate, 1);
    }

    // Tuần Thánh → dời sang Thứ Hai sau Tuần Bát Nhật Phục Sinh
    if (specialDayType === 'HOLY_WEEK') {
        const easterMonday = addDays(litData.easter, 1);
        const easterOctaveEnd = addDays(litData.easter, 7);
        // Nếu Thứ Hai sau Phục Sinh vẫn trong Bát Nhật, dời sang Thứ Hai sau Bát Nhật
        if (easterMonday.getTime() <= easterOctaveEnd.getTime()) {
            return addDays(easterOctaveEnd, 1);
        }
        return easterMonday;
    }

    // Bát Nhật Phục Sinh → dời sang Thứ Hai sau Bát Nhật
    if (specialDayType === 'EASTER_OCTAVE') {
        const easterOctaveEnd = addDays(litData.easter, 7);
        return addDays(easterOctaveEnd, 1);
    }

    // Bát Nhật Giáng Sinh: các lễ trong Bát Nhật không bị dời

    // Không cần dời
    return null;
}

// Xác định lễ nào bị dời đến ngày này
function getTransferredFeast(date, litData) {
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);

    // Duyệt qua tất cả các lễ trọng trong năm để tìm lễ bị dời đến ngày này
    // Chỉ kiểm tra các ngày gần đó (trong vòng 7 ngày) để tối ưu
    for (let offset = -7; offset <= 0; offset++) {
        const checkDate = addDays(date, offset);
        const checkKey = `${checkDate.getMonth() + 1}-${checkDate.getDate()}`;

        if (FIXED_DATA_LOOKUP[checkKey]) {
            const saint = FIXED_DATA_LOOKUP[checkKey];

            // Chỉ xử lý lễ trọng
            if (saint.rank === 'TRONG') {
                const transferDate = getTransferDate(checkDate, litData);

                // Nếu lễ này bị dời đến ngày hiện tại
                if (transferDate && t(transferDate) === dTime) {
                    return {
                        name: saint.name,
                        originalDate: checkDate,
                        rank: saint.rank,
                        color: saint.color
                    };
                }
            }
        }
    }

    // Kiểm tra các lễ đặc biệt có thể bị dời (đã được xử lý trong getLiturgicalData)
    // Thánh Giuse (19/3) - đã được xử lý trong getLiturgicalData
    // Truyền Tin (25/3) - đã được xử lý trong getLiturgicalData

    return null;
}

function getDayInfo(date, litData) {
    // Kiểm tra cache trước
    const year = date.getFullYear();
    const cacheKey = `dayInfo_${year}_${date.getMonth()}_${date.getDate()}`;
    const cached = CACHE.get('dayInfo', cacheKey);
    if (cached) {
        return cached;
    }

    const season = parseInt(getLiturgicalDayCode(date, litData).substring(0, 1));
    const dayOfWeek = date.getDay();
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);

    let result = {
        season: "Mùa Thường Niên",
        color: "bg-lit-green",
        textColor: "text-lit-green",
        special: null,
        isSolemn: false,
        saints: [],
        rankCode: 'NGAY_THUONG',
        rankName: '',
        commemorations: [],
        precedenceReason: null,
        _forceSanctoralReadings: false,
        _forceSanctoralKey: null
    };

    if (season === 1) { result.season = "Mùa Vọng"; result.color = "bg-lit-purple"; result.textColor = "text-lit-purple"; }
    else if (season === 2) { result.season = "Mùa Giáng Sinh"; result.color = "bg-lit-white"; result.textColor = "text-lit-gold"; }
    else if (season === 3) { result.season = "Mùa Chay"; result.color = "bg-lit-purple"; result.textColor = "text-lit-purple"; }
    else if (season === 4) { result.season = "Mùa Phục Sinh"; result.color = "bg-lit-white"; result.textColor = "text-lit-gold"; }

    // 17-24/12: vẫn thuộc Mùa Vọng (màu tím), dù dùng mã 2DDMM cho bài đọc ngày thường
    if (date.getMonth() === 11 && date.getDate() >= 17 && date.getDate() <= 24) {
        result.season = "Mùa Vọng";
        result.color = "bg-lit-purple";
        result.textColor = "text-lit-purple";
    }
    // Bát nhật Giáng Sinh (25/12 -> 01/01): luôn là Mùa Giáng Sinh (màu trắng)
    const christmasStart = (date.getMonth() === 0)
        ? new Date(date.getFullYear() - 1, 11, 25)
        : new Date(date.getFullYear(), 11, 25);
    const christmasOctaveEnd = new Date(christmasStart.getFullYear() + 1, 0, 1);
    const christmasStartTime = new Date(christmasStart.getFullYear(), 11, 25).getTime();
    const christmasOctaveEndTime = new Date(christmasOctaveEnd.getFullYear(), 0, 1).getTime();
    if (dTime >= christmasStartTime && dTime <= christmasOctaveEndTime) {
        result.season = "Mùa Giáng Sinh";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
    }

    // Default Sunday Rank
    if (dayOfWeek === 0) { result.rankCode = 'CHUA_NHAT'; result.rankName = 'Chúa Nhật'; }

    // Special Days (Solemnities mostly)

    // Xử lý Lễ Tro theo quy luật dời lễ tại Việt Nam
    if (litData.ashWednesdayTransferred) {
        // Lễ Tro bị dời do trùng Tết
        if (dTime === t(litData.ashWednesday)) {
            // Ngày Lễ Tro ban đầu: Mùa Chay bắt đầu nhưng không cử hành Lễ Tro
            result.special = "Bắt Đầu Mùa Chay (Lễ Tro dời)";
            result.color = "bg-lit-purple";
            result.textColor = "text-lit-purple";
            result.rankCode = 'NGAY_THUONG';
            result.ashWednesdayNote = litData.ashWednesdayTransferNote;
        }
        if (dTime === t(litData.ashWednesdayCelebration)) {
            // Ngày cử hành Lễ Tro thực tế (Mùng 4 Tết)
            result.special = "LỄ TRO (Cử hành)";
            result.color = "bg-lit-purple";
            result.textColor = "text-lit-purple";
            result.rankCode = 'TRONG';
            result.ashWednesdayNote = litData.ashWednesdayTransferNote;
            result.isTransferredAshWednesday = true;
        }
    } else {
        // Lễ Tro không bị dời
        if (dTime === t(litData.ashWednesday)) {
            result.special = "Lễ Tro";
            result.color = "bg-lit-purple";
            result.textColor = "text-lit-purple";
            result.rankCode = 'TRONG';
        }
    }
    if (dTime === t(litData.easter)) { result.special = "Đại Lễ Phục Sinh"; result.color = "bg-lit-white"; result.textColor = "text-lit-gold"; result.rankCode = 'TRONG'; }
    if (dTime === t(litData.ascension)) {
        result.special = "CHÚA THĂNG THIÊN";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = 'TRONG';
        result.season = "Mùa Phục Sinh";
    }

    // === TAM NHẬT VƯỢT QUA (Triduum) - Override màu theo ngày ===
    const holyThursday = addDays(litData.goodFriday, -1);
    const holySaturday = addDays(litData.easter, -1);

    if (dTime === t(holyThursday)) {
        result.special = "Thứ Năm Tuần Thánh (Tiệc Ly)";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = 'TRONG';
        result.season = "Tam Nhật Vượt Qua";
    }
    if (dTime === t(litData.goodFriday)) {
        result.special = "Thứ Sáu Tuần Thánh (Tưởng niệm Cuộc Thương Khó)";
        result.color = "bg-lit-red";  // ĐỎ - không phải tím
        result.textColor = "text-lit-red";
        result.rankCode = 'TRONG';
        result.season = "Tam Nhật Vượt Qua";
    }
    if (dTime === t(holySaturday)) {
        result.special = "Thứ Bảy Tuần Thánh (Canh thức Vượt Qua)";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = 'TRONG';
        result.season = "Tam Nhật Vượt Qua";
    }

    if (dTime === t(litData.pentecost)) { result.special = "CHÚA THÁNH THẦN HIỆN XUỐNG"; result.color = "bg-lit-red"; result.textColor = "text-lit-red"; result.rankCode = 'TRONG'; result.season = "Mùa Phục Sinh"; }

    // === CÁC LỄ SAU HIỆN XUỐNG ===
    if (dTime === t(litData.trinity)) {
        result.special = "CHÚA BA NGÔI";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = 'TRONG';
        result.season = "Mùa Thường Niên";
    }
    if (dTime === t(litData.corpusChristi)) {
        result.special = "MÌNH VÀ MÁU THÁNH CHÚA KITÔ";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = 'TRONG';
        result.season = "Mùa Thường Niên";
    }
    if (dTime === t(litData.sacredHeart)) {
        result.special = "THÁNH TÂM CHÚA GIÊSU";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = 'TRONG';
        result.season = "Mùa Thường Niên";
    }
    if (dTime === t(litData.immaculateHeart)) {
        result.special = "Trái Tim Vô Nhiễm Mẹ Maria";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = 'NHO';
        result.season = "Mùa Thường Niên";
    }

    if (dTime === t(litData.christKing)) {
        result.special = "ĐẠI LỄ CHÚA KITÔ VUA VŨ TRỤ";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = "TRONG";
        result.season = "Mùa Thường Niên";
    }
    if (dTime === t(litData.vietnameseMartyrs)) {
        result.special = "CÁC THÁNH TỬ ĐẠO VIỆT NAM";
        result.color = "bg-lit-red";
        result.textColor = "text-lit-red";
        result.rankCode = "TRONG";
        result._forceSanctoralReadings = true;
        result._forceSanctoralKey = "72411";
    }
    if (dTime === t(litData.rosarySunday)) { result.special = "ĐỨC MẸ MÂN CÔI (Kính Trọng Thể)"; result.color = "bg-lit-white"; result.rankCode = "TRONG"; }
    if (dTime === t(litData.missionSunday)) { result.special = "Khánh Nhật Truyền Giáo"; result.color = "bg-lit-green"; result.rankCode = "CHUA_NHAT"; }

    if (dTime === t(litData.annunciation)) {
        result.special = "LỄ TRUYỀN TIN";
        result.color = "bg-lit-white";
        result.rankCode = "TRONG";
        result._forceSanctoralReadings = true;
        result._forceSanctoralKey = "72503";
    }
    if (dTime === t(litData.stJoseph)) {
        result.special = "THÁNH GIUSE BẠN TRĂM NĂM ĐỨC MARIA";
        result.color = "bg-lit-white";
        result.rankCode = "TRONG";
        result._forceSanctoralReadings = true;
        result._forceSanctoralKey = "71903";
    }
    if (dTime === t(litData.immConception)) {
        result.special = "ĐỨC MẸ VÔ NHIỄM NGUYÊN TỘI";
        result.color = "bg-lit-white";
        result.rankCode = "TRONG";
        result._forceSanctoralReadings = true;
        result._forceSanctoralKey = "70812";
    }

    // Lễ Hiển Linh (Epiphany) - Chúa Nhật từ ngày 2-8 tháng 1
    if (dTime === t(litData.epiphany)) {
        result.special = "CHÚA NHẬT LỄ HIỂN LINH";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = "TRONG";
        result.isSolemn = true;
    }

    // Lễ Chúa Giêsu Chịu Phép Rửa - Chúa Nhật sau lễ Hiển Linh (Lễ Kính)
    if (dTime === t(litData.baptismLord)) {
        result.special = "CHÚA GIÊSU CHỊU PHÉP RỬA";
        result.color = "bg-lit-white";
        result.textColor = "text-lit-gold";
        result.rankCode = "KINH";
    }

    // Các ngày sau lễ Hiển Linh (trước Chúa Giêsu Chịu Phép Rửa)
    // Flag để biết đây là ngày sau Hiển Linh - temporal được ưu tiên hơn optional memorial
    let isAfterEpiphany = false;
    if (litData.epiphany && litData.baptismLord) {
        const epiphanyTime = t(litData.epiphany);
        const baptismTime = t(litData.baptismLord);

        if (dTime > epiphanyTime && dTime < baptismTime) {
            const dayOfWeekName = DAYS_FULL_VI[date.getDay()];
            result.special = `${dayOfWeekName} sau lễ Hiển Linh`;
            result.color = "bg-lit-white";
            result.textColor = "text-lit-gold";
            result.rankCode = "NGAY_THUONG";
            result._isAfterEpiphany = true; // Flag để không bị sanctoral đè
            isAfterEpiphany = true;
        }
    }

    // Kiểm tra lễ bị dời đến ngày này
    const transferredFeast = getTransferredFeast(date, litData);
    if (transferredFeast) {
        // Lễ bị dời có ưu tiên cao
        result.special = transferredFeast.name;
        result.rankCode = 'TRONG';
        if (transferredFeast.color === 'white') {
            result.color = 'bg-lit-white';
            result.textColor = 'text-lit-gold';
        } else if (transferredFeast.color === 'red') {
            result.color = 'bg-lit-red';
            result.textColor = 'text-lit-red';
        }
        result.transferred = true;
        result.originalDate = transferredFeast.originalDate;
    }

    // Xử lý sanctoral (các thánh) sử dụng Precedence Engine
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    let sanctoralInfo = null;

    // Bỏ qua FIXED khi ngày trùng với lễ di động (Vietnamese Martyrs, Mân Côi) để tránh trùng
    const movableKey = MOVABLE_OVERRIDES_FIXED[key];
    const skipFixedForMovable = movableKey && litData[movableKey] && dTime === t(litData[movableKey]);

    // Chỉ xử lý sanctoral nếu không có lễ bị dời và không trùng movable
    if (!transferredFeast && !skipFixedForMovable && FIXED_DATA_LOOKUP[key]) {
        const saint = FIXED_DATA_LOOKUP[key];

        // Kiểm tra xem lễ này có bị dời không
        const transferDate = getTransferDate(date, litData);
        const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
        const shouldTransfer = transferDate && saint.rank === 'TRONG' &&
            (date.getDay() === 0 || getSpecialDayType(date, litData) !== 'ORDINARY');
        const month = date.getMonth();
        const day = date.getDate();
        const isSanctoralSuppressed = () => {
            if (saint.rank === 'TRONG') return false;
            const specialDayType = getSpecialDayType(date, litData);
            const inHolyWeek = specialDayType === 'HOLY_WEEK' || specialDayType === 'TRIDUUM';
            const inEasterOctave = dTime >= t(litData.easter) && dTime <= t(addDays(litData.easter, 7));
            const inAdventLastWeek = (month === 11 && day >= 17 && day <= 24);
            const inLentWeekday = dTime >= t(litData.ashWednesday) && dTime < t(litData.palmSunday) && date.getDay() !== 0;
            const christmasStart = new Date(date.getFullYear(), 11, 25);
            const christmasOctaveEnd = new Date(date.getFullYear() + 1, 0, 1);
            const inChristmasOctave = dTime >= t(christmasStart) && dTime <= t(christmasOctaveEnd);

            // Feasts are suppressed only in Holy Week & Easter Octave
            if (saint.rank === 'KINH') {
                return inHolyWeek || inEasterOctave;
            }
            // Memorials are suppressed in strong seasons (Advent 17-24, Lent weekdays, Holy Week, Easter Octave, Christmas Octave)
            if (saint.rank === 'NHO' || saint.rank === 'NHOKB') {
                return inAdventLastWeek || inLentWeekday || inHolyWeek || inEasterOctave || inChristmasOctave;
            }
            return false;
        };

        if (!shouldTransfer) {
            const suppressed = isSanctoralSuppressed();
            // Lễ không bị dời, thêm vào saints nếu không bị suppress
            if (!suppressed) {
                result.saints.push(saint);
            }

            // === ĐẶC BIỆT: Ngày sau lễ Hiển Linh ===
            // Nếu là ngày sau Hiển Linh và lễ thánh chỉ là tùy chọn (NHOKB/O), 
            // giữ temporal làm chính, thánh làm phụ
            if (suppressed) {
                // Mùa mạnh: không hiển thị lễ thánh, giữ phụng vụ mùa
            } else if (result._isAfterEpiphany && (saint.rank === 'NHOKB' || saint.rank === 'O')) {
                // Không override special - giữ "Thứ X sau lễ Hiển Linh"
                // Saint đã được thêm vào result.saints, sẽ hiển thị như secondary
                // Continue without running precedence engine
            } else {
                // Tạo sanctoral info để so sánh với temporal
                sanctoralInfo = {
                    rankCode: saint.rank,
                    special: saint.name,
                    color: saint.color === 'white' ? 'bg-lit-white' : (saint.color === 'red' ? 'bg-lit-red' : result.color),
                    textColor: saint.color === 'white' ? 'text-lit-gold' : (saint.color === 'red' ? 'text-lit-red' : result.textColor),
                    saints: [saint]
                };

                // Sử dụng Precedence Engine để quyết định cử hành chính
                const precedence = determinePrimaryCelebration(result, sanctoralInfo, date, litData);

                // Áp dụng kết quả từ engine - sử dụng primaryCelebration đã được merge
                const primaryCelebration = precedence.primaryCelebration;

                // Cập nhật result với thông tin từ primaryCelebration
                result.special = primaryCelebration.special || result.special;
                result.rankCode = primaryCelebration.rankCode || result.rankCode;
                result.color = primaryCelebration.color || result.color;
                result.textColor = primaryCelebration.textColor || result.textColor;

                // Lưu commemorations nếu có
                if (precedence.commemorations && precedence.commemorations.length > 0) {
                    result.commemorations = precedence.commemorations;
                }

                // Lưu thông tin precedence để debug/log
                result.precedenceReason = precedence.reason;
                result._winnerKey = precedence._winnerKey; // Lưu winner key để sử dụng sau
            }
        } else {
            // Lễ bị dời, không hiển thị ở ngày này
            // Lễ sẽ được hiển thị ở ngày transferDate
        }
    }

    // Chúa Nhật: chỉ gán rank CHUA_NHAT khi đang là ngày thường hoặc lễ nhớ
    // (không override các lễ Kính/Lễ Trọng của Chúa)
    if (dayOfWeek === 0 && (result.rankCode === 'NGAY_THUONG' || result.rankCode === 'NHO' || result.rankCode === 'NHOKB')) {
        result.rankCode = 'CHUA_NHAT';
        result.rankName = 'Chúa Nhật';
    }

    // ===== XỬ LÝ TẾT VIỆT NAM =====
    const tetEvent = getTetEvent(date);
    if (tetEvent) {
        const tetResolution = resolveTetConflict(tetEvent, result, date, litData);

        // Đêm Giao Thừa (isEve): KHÔNG ghi đè lên phụng vụ ngày hôm đó
        // Chỉ lưu thông tin để hiển thị trong modal (như lễ vọng)
        if (tetEvent.isEve) {
            result.tetNote = tetResolution ? tetResolution.note : tetEvent.note;
            result.tetEvent = tetEvent;
            result.tetLunar = tetEvent.lunar;
        } else if (tetResolution && tetResolution.celebrate) {
            // So sánh rank để quyết định cử hành chính
            const currentRank = getRankPriority(result.rankCode);
            const tetRank = tetResolution.rank;

            // Tết được cử hành nếu có rank cao hơn hoặc bằng
            if (tetRank <= currentRank || result.rankCode === 'NGAY_THUONG' || result.rankCode === 'CHUA_NHAT') {
                // Lưu thông tin phụng vụ gốc vào commemorations nếu có
                if (result.special && result.special !== tetEvent.name) {
                    result.commemorations.push({
                        name: result.special,
                        rankCode: result.rankCode,
                        special: result.special
                    });
                }

                // Cập nhật thông tin Tết
                result.special = tetEvent.name;
                result.rankCode = tetEvent.rankCode;
                result.isTet = true;
                result.tetNote = tetResolution.note;
                result.tetLunar = tetEvent.lunar;

                // Cập nhật màu sắc
                if (tetEvent.color === 'red') {
                    result.color = 'bg-lit-red';
                    result.textColor = 'text-lit-red';
                } else if (tetEvent.color === 'white') {
                    result.color = 'bg-lit-white';
                    result.textColor = 'text-lit-gold';
                }
            } else {
                // Tết không được cử hành chính, thêm vào ghi chú
                result.tetNote = tetResolution.note;
                result.tetEvent = tetEvent;
            }
        } else if (tetResolution) {
            // Không override phụng vụ, nhưng lưu note để hiển thị tooltip/modal
            result.tetNote = tetResolution.note;
            result.tetEvent = tetEvent;
            result.tetLunar = tetEvent.lunar;
        }
    }

    // Lưu kết quả vào cache trước khi return
    CACHE.set('dayInfo', cacheKey, result);

    return result;
}

// ============================================================================
// HÀM XÁC ĐỊNH LỄ VỌNG CHO CÁC LỄ TRỌNG
// ============================================================================
function getVigilInfo(date, litData) {
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);
    const month = date.getMonth();
    const day = date.getDate();

    // CHỈ TRẢ VỀ THÔNG TIN LỄ VỌNG KHI ĐANG Ở NGÀY LỄ CHÍNH
    // (không phải ngày lễ vọng)

    // 1. Lễ Giáng Sinh (25/12) - lễ vọng là 24/12
    if (month === 11 && day === 25) {
        return {
            hasVigil: true,
            vigilName: "Lễ Vọng Giáng Sinh",
            vigilCode: "22412",
            mainFeastName: "Lễ Giáng Sinh",
            mainFeastDate: date,
            mainFeastCode: "22512"
        };
    }

    // 2. Lễ Hiện Xuống - lễ vọng là ngày hôm qua
    if (dTime === t(litData.pentecost)) {
        return {
            hasVigil: true,
            vigilName: "Vọng Hiện Xuống",
            vigilCode: "4089",
            mainFeastName: "CHÚA THÁNH THẦN HIỆN XUỐNG",
            mainFeastDate: date,
            mainFeastCode: "5001"
        };
    }

    // 3. Lễ Phục Sinh - lễ vọng là Thứ Bảy Tuần Thánh
    if (dTime === t(litData.easter)) {
        return {
            hasVigil: true,
            vigilName: "Canh Thức Vượt Qua (Lễ Vọng Phục Sinh)",
            vigilCode: "4076",
            mainFeastName: "Đại Lễ Phục Sinh",
            mainFeastDate: date,
            mainFeastCode: "4001"
        };
    }

    // 4. Lễ Các Thánh (1/11) - lễ vọng là 31/10
    if (month === 10 && day === 1) {
        return {
            hasVigil: true,
            vigilName: "Lễ Vọng Các Thánh",
            vigilCode: "73110",
            mainFeastName: "Lễ Các Thánh",
            mainFeastDate: date,
            mainFeastCode: "70111"
        };
    }

    return null;
}

// --- NEW: Multi-Readings Helper ---
function getFullReadings(code, sanctoralCode, specialCode, dayOfWeek, cycle, weekdayCycle, tetCode = null, vigilInfo = null) {
    const season = parseInt(code.substring(0, 1));
    let results = [];

    // 0. Special Feast Codes (các lễ trọng đặc biệt: 2030, 4080, 5001, 5002, 5003, 5004, 8441)
    // Các code này không phải seasonal code thông thường, cần tìm trong READINGS_DATA trước (code chính xác)
    // Sau đó fallback sang READINGS_SUNDAY (code cũ 5410, 5420, 5430, 5440 trong Sunday.js)
    const specialFeastCodes = ["2030", "4080", "5001", "5002", "5003", "5004", "8441"];
    // Mapping để tìm trong Sunday.js (code cũ)
    const sundayCodeMapping = {
        "2030": "6000",  // Lễ Hiển Linh (trong Sunday.js dùng mã 6000)
        "4080": "4070",  // Thăng Thiên (trong Sunday.js dùng bài đọc Chúa Nhật VII Phục Sinh)
        "5001": "5410",  // Hiện Xuống
        "5002": "5420",  // Ba Ngôi
        "5003": "5430",  // Mình Máu Thánh
        "5004": "5440"   // Thánh Tâm
    };

    if (specialFeastCodes.includes(code)) {
        let specialFeastData = null;
        const sundayCode = sundayCodeMapping[code] || code; // Code trong Sunday.js

        // ƯU TIÊN 1: Tìm trong OptionsaintReadings (cho code 8441 - Trái Tim Vô Nhiễm Mẹ)
        // Optionsaint.js có bản văn đầy đủ cho code 8441, nên ưu tiên tìm ở đây trước
        if (code === "8441" && typeof OptionsaintReadings !== 'undefined') {
            // Thử tìm với cả string "8441" và số 8441
            if (OptionsaintReadings[code] || OptionsaintReadings[8441]) {
                specialFeastData = OptionsaintReadings[code] || OptionsaintReadings[8441];
            }
        }

        // ƯU TIÊN 1.4: Các lễ trọng có mã tương ứng trong Sunday.js (2030, 5001, 5002, 5003, 5004)
        // ưu tiên lấy bản văn đầy đủ thay vì chỉ trích dẫn trong READINGS_DATA
        if (!specialFeastData && ["2030", "4080", "5001", "5002", "5003", "5004"].includes(code) && typeof READINGS_SUNDAY !== 'undefined') {
            const sundayData = READINGS_SUNDAY[sundayCode];
            if (sundayData) {
                if (sundayData[cycle]) {
                    specialFeastData = sundayData[cycle];
                } else if (typeof sundayData === 'object' && !sundayData.firstReading) {
                    const availableYears = Object.keys(sundayData).filter(k => ['A', 'B', 'C'].includes(k));
                    if (availableYears.length > 0) {
                        specialFeastData = sundayData[availableYears[0]];
                    }
                } else {
                    specialFeastData = sundayData;
                }
            }
        }

        // ƯU TIÊN 2: Tìm trong READINGS_DATA với code chính xác (2030, 5001, 5002, 5003, 5004, 8441)
        // Đây là nguồn dữ liệu chính xác nhất, được xác định dựa trên bài đọc cụ thể
        // Lưu ý: Với code 8441, đã tìm trong OptionsaintReadings ở trên, chỉ tìm READINGS_DATA nếu chưa có
        if (!specialFeastData && typeof READINGS_DATA !== 'undefined') {
            // Code 2030 (Lễ Hiển Linh) luôn dùng year "0" trong readingdata.js
            // Code 8441 (Trái Tim Vô Nhiễm Mẹ) luôn dùng year "0" trong readingdata.js
            // Code 5004 (Thánh Tâm) có year A/B/C cho Chúa Nhật, và có thể có year "0" cho ngày thường
            // Code 5001, 5002, 5003 có year A/B/C cho Chúa Nhật
            let specialReading = null;

            if (code === "2030" || code === "8441") {
                // Code 2030 và 8441: luôn tìm với year "0"
                specialReading = READINGS_DATA.find(r => r.code == code && r.year === "0");
            } else {
                // Code 5001-5004: tìm theo cycle cho Chúa Nhật, hoặc "0"/weekdayCycle cho ngày thường
                if (dayOfWeek === 0) {
                    // Chúa Nhật: ưu tiên cycle (A/B/C), fallback về "0" nếu không có
                    specialReading = READINGS_DATA.find(r => r.code == code && r.year === cycle) ||
                        READINGS_DATA.find(r => r.code == code && r.year === "0");
                } else {
                    // Ngày thường: ưu tiên "0" (bài đọc chung), fallback về cycle (A/B/C) nếu không có
                    // Lưu ý: Code 5004 (Thánh Tâm) thường là Thứ Sáu, có thể không có year "0"
                    // Nên fallback về cycle (A/B/C) để lấy bài đọc Chúa Nhật gần nhất
                    specialReading = READINGS_DATA.find(r => r.code == code && r.year === "0") ||
                        READINGS_DATA.find(r => r.code == code && r.year === cycle);
                }
            }

            if (specialReading) {
                // Convert format từ READINGS_DATA (reading1, psalm, gospel, reading2) 
                // sang format chuẩn (firstReading, psalms, secondReading, gospel) để tương thích
                specialFeastData = {
                    firstReading: specialReading.reading1 ? { excerpt: specialReading.reading1 } : null,
                    psalms: specialReading.psalm ? { excerpt: specialReading.psalm } : null,
                    secondReading: specialReading.reading2 ? { excerpt: specialReading.reading2 } : null,
                    gospel: specialReading.gospel ? { excerpt: specialReading.gospel } : null,
                    // Giữ nguyên các trường gốc để tương thích ngược
                    reading1: specialReading.reading1,
                    psalm: specialReading.psalm,
                    reading2: specialReading.reading2,
                    gospel: specialReading.gospel,
                    code: specialReading.code,
                    year: specialReading.year
                };
            }
        }

        // ƯU TIÊN 3: Tìm trong READINGS_SUNDAY với code cũ (fallback cho dữ liệu đầy đủ hơn)
        // Sunday.js có dữ liệu đầy đủ với firstReading, psalms, secondReading, gospel, alleluia
        // Lưu ý: Với code 2030, có thể không có trong READINGS_SUNDAY, nên thử tìm với code gốc trước
        if (!specialFeastData && typeof READINGS_SUNDAY !== 'undefined') {
            // Thử tìm với code gốc trước (cho code 2030)
            if (READINGS_SUNDAY[code]) {
                if (READINGS_SUNDAY[code][cycle]) {
                    specialFeastData = READINGS_SUNDAY[code][cycle];
                } else if (typeof READINGS_SUNDAY[code] === 'object' && !READINGS_SUNDAY[code].firstReading) {
                    const availableYears = Object.keys(READINGS_SUNDAY[code]).filter(k => ['A', 'B', 'C'].includes(k));
                    if (availableYears.length > 0) {
                        specialFeastData = READINGS_SUNDAY[code][availableYears[0]];
                    }
                } else {
                    specialFeastData = READINGS_SUNDAY[code];
                }
            }

            // Nếu không tìm thấy và có code cũ, thử với code cũ
            if (!specialFeastData && sundayCode !== code && READINGS_SUNDAY[sundayCode]) {
                if (READINGS_SUNDAY[sundayCode][cycle]) {
                    specialFeastData = READINGS_SUNDAY[sundayCode][cycle];
                } else if (typeof READINGS_SUNDAY[sundayCode] === 'object' && !READINGS_SUNDAY[sundayCode].firstReading) {
                    const availableYears = Object.keys(READINGS_SUNDAY[sundayCode]).filter(k => ['A', 'B', 'C'].includes(k));
                    if (availableYears.length > 0) {
                        specialFeastData = READINGS_SUNDAY[sundayCode][availableYears[0]];
                    }
                } else {
                    specialFeastData = READINGS_SUNDAY[sundayCode];
                }
            }
        }

        // ƯU TIÊN 4: Tìm trong READINGS_SPECIAL (cho ngày thường - fallback)
        if (!specialFeastData && typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[code]) {
            specialFeastData = READINGS_SPECIAL[code];
        }

        // ƯU TIÊN 5: Fallback cho code 8441 - tìm trong READINGS_SPECIAL (SaintsBible.js)
        // READINGS_SPECIAL có thể có code 8441 với bản văn đầy đủ
        if (!specialFeastData && code === "8441" && typeof READINGS_SPECIAL !== 'undefined') {
            if (READINGS_SPECIAL[code] || READINGS_SPECIAL[8441]) {
                specialFeastData = READINGS_SPECIAL[code] || READINGS_SPECIAL[8441];
            }
        }

        // ƯU TIÊN 6: Fallback cho code 8441 - tìm trong readings_year_1.js (code 5446)
        // Bản văn đầy đủ Tin Mừng Lc 2, 41-51 có trong readings_year_1.js với code 5446
        if (!specialFeastData && code === "8441") {
            // Thử tìm trong READINGS_ORDINARY_Y1 với code 5446 (cùng bài đọc)
            if (typeof READINGS_ORDINARY_Y1 !== 'undefined' && READINGS_ORDINARY_Y1["5446"]) {
                // Nếu chưa có gì, dùng toàn bộ từ 5446
                specialFeastData = READINGS_ORDINARY_Y1["5446"];
            }
        }

        if (specialFeastData) {
            results.push({ type: 'seasonal', data: specialFeastData });
            // Đã tìm thấy bài đọc cho code đặc biệt, tiếp tục tìm các nguồn khác (sanctoral, special, etc.)
        }
    }

    // 1. Seasonal/Temporal Reading
    // Lưu ý: Nếu đã tìm thấy trong specialFeastCodes ở trên, không tìm lại ở đây
    const alreadyFound = results.some(r => r.type === 'seasonal' && r.data);

    if (!alreadyFound) {
        if (dayOfWeek === 0) {
            // Chúa Nhật: tìm trong READINGS_SUNDAY
            // Thử tìm với code gốc trước, sau đó thử với sundayCodeMapping nếu là special feast
            let sundayData = null;
            if (typeof READINGS_SUNDAY !== 'undefined') {
                // Thử tìm với code gốc
                if (READINGS_SUNDAY[code] && READINGS_SUNDAY[code][cycle]) {
                    sundayData = READINGS_SUNDAY[code][cycle];
                } else if (READINGS_SUNDAY[code]) {
                    // Nếu không có theo cycle, thử lấy dữ liệu chung
                    if (typeof READINGS_SUNDAY[code] === 'object' && !READINGS_SUNDAY[code].firstReading) {
                        // Có thể là object với các năm A/B/C
                        const availableYears = Object.keys(READINGS_SUNDAY[code]).filter(k => ['A', 'B', 'C'].includes(k));
                        if (availableYears.length > 0) {
                            sundayData = READINGS_SUNDAY[code][availableYears[0]];
                        }
                    } else {
                        sundayData = READINGS_SUNDAY[code];
                    }
                }

                // Nếu không tìm thấy và là special feast, thử với code cũ
                if (!sundayData && specialFeastCodes.includes(code) && sundayCodeMapping[code]) {
                    const oldCode = sundayCodeMapping[code];
                    if (READINGS_SUNDAY[oldCode]) {
                        if (READINGS_SUNDAY[oldCode][cycle]) {
                            sundayData = READINGS_SUNDAY[oldCode][cycle];
                        } else if (typeof READINGS_SUNDAY[oldCode] === 'object' && !READINGS_SUNDAY[oldCode].firstReading) {
                            const availableYears = Object.keys(READINGS_SUNDAY[oldCode]).filter(k => ['A', 'B', 'C'].includes(k));
                            if (availableYears.length > 0) {
                                sundayData = READINGS_SUNDAY[oldCode][availableYears[0]];
                            }
                        } else {
                            sundayData = READINGS_SUNDAY[oldCode];
                        }
                    }
                }
            }

            // Fallback ưu tiên: nếu có bản văn đầy đủ trong READINGS_SPECIAL
            if (!sundayData && typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[code]) {
                sundayData = READINGS_SPECIAL[code];
            }

            // Fallback cho Chúa Nhật nếu không có trong READINGS_SUNDAY:
            // dùng READINGS_DATA (ví dụ các ngày 17-24/12 có mã 2DDMM)
            if (!sundayData && typeof READINGS_DATA !== 'undefined') {
                const readingData = READINGS_DATA.find(r => {
                    if (r.code != code) return false;
                    return r.year === cycle || r.year === "0";
                });

                if (readingData) {
                    sundayData = {
                        firstReading: readingData.reading1 ? { excerpt: readingData.reading1 } : null,
                        psalms: readingData.psalm ? { excerpt: readingData.psalm } : null,
                        secondReading: readingData.reading2 ? { excerpt: readingData.reading2 } : null,
                        gospel: readingData.gospel ? { excerpt: readingData.gospel } : null,
                        reading1: readingData.reading1,
                        psalm: readingData.psalm,
                        reading2: readingData.reading2,
                        gospel: readingData.gospel
                    };
                }
            }

            if (sundayData) {
                results.push({ type: 'seasonal', data: sundayData });
            }
        } else {
            let daily = null;
            if (season === 5) {
                // Mùa Thường Niên: tìm trong READINGS_ORDINARY_Y1 hoặc Y2
                if (weekdayCycle === "1" && typeof READINGS_ORDINARY_Y1 !== 'undefined') {
                    daily = READINGS_ORDINARY_Y1[code];
                } else if (typeof READINGS_ORDINARY_Y2 !== 'undefined') {
                    daily = READINGS_ORDINARY_Y2[code];
                }
            } else {
                // Các mùa khác: tìm trong READINGS_SEASONAL
                if (typeof READINGS_SEASONAL !== 'undefined') {
                    daily = READINGS_SEASONAL[code];
                    // Fallback đặc biệt cho Vọng Hiện Xuống (4089) → dùng 4076
                    if (!daily && code === "4089") {
                        daily = READINGS_SEASONAL["4076"];
                    }
                }

                // Fallback: nếu có bản văn đầy đủ trong READINGS_SPECIAL (ví dụ 2DDMM như 20101)
                if (!daily && typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[code]) {
                    daily = READINGS_SPECIAL[code];
                }

                // Fallback: Nếu không tìm thấy trong READINGS_SEASONAL, thử tìm trong READINGS_DATA
                // Đặc biệt cho các code đặc biệt như 6001-6006 (ngày sau lễ Hiển Linh)
                if (!daily && typeof READINGS_DATA !== 'undefined') {
                    // Kiểm tra xem code có phải là code đặc biệt không (6001-6006, 2DDMM, 2030, etc.)
                    if (code.toString().startsWith('2') || code.toString().startsWith('6') || code === "2030" || code === "4080" || code === "4089" ||
                        code === "5010" || code === "5340") {
                        const readingData = READINGS_DATA.find(r => {
                            if (r.code != code) return false;
                            // Với code đặc biệt, thử tìm với year "0" trước, sau đó thử với cycle
                            return r.year === "0" || (dayOfWeek === 0 && r.year === cycle);
                        });

                        if (readingData) {
                            // Convert format từ READINGS_DATA sang format chuẩn
                            daily = {
                                firstReading: readingData.reading1 ? { excerpt: readingData.reading1 } : null,
                                psalms: readingData.psalm ? { excerpt: readingData.psalm } : null,
                                secondReading: readingData.reading2 ? { excerpt: readingData.reading2 } : null,
                                gospel: readingData.gospel ? { excerpt: readingData.gospel } : null,
                                reading1: readingData.reading1,
                                psalm: readingData.psalm,
                                reading2: readingData.reading2,
                                gospel: readingData.gospel
                            };
                        }
                    }
                }
            }
            if (daily) results.push({ type: 'seasonal', data: daily });
        }
    }

    // 2. Sanctoral Reading (mã 7DDMM) - Lễ Trọng, Lễ Kính các Thánh
    // Quy tắc: Tìm trong READINGS_DATA với code = 7DDMM và year = cycle (A/B/C) hoặc "0"
    if (sanctoralCode) {
        let sanctoralData = null;

        // ƯU TIÊN 1: Tìm trong READINGS_DATA (nguồn dữ liệu chính xác nhất)
        // Sanctoral code: 7DDMM (5 chữ số, ví dụ: 71508 cho 15/08, 72411 cho 24/11)
        if (typeof READINGS_DATA !== 'undefined') {
            // Chúa Nhật: tìm với year = cycle (A/B/C)
            // Ngày thường: tìm với year = "0" (bài đọc chung cho tất cả các năm)
            const yearToFind = dayOfWeek === 0 ? cycle : "0";

            // Tìm bài đọc với code và year khớp
            const sanctoralReading = READINGS_DATA.find(r => {
                return r.code == sanctoralCode && r.year === yearToFind;
            });

            if (sanctoralReading) {
                // Convert format từ READINGS_DATA (reading1, psalm, gospel, reading2) 
                // sang format chuẩn (firstReading, psalms, secondReading, gospel)
                sanctoralData = {
                    firstReading: sanctoralReading.reading1 ? { excerpt: sanctoralReading.reading1 } : null,
                    psalms: sanctoralReading.psalm ? { excerpt: sanctoralReading.psalm } : null,
                    secondReading: sanctoralReading.reading2 ? { excerpt: sanctoralReading.reading2 } : null,
                    gospel: sanctoralReading.gospel ? { excerpt: sanctoralReading.gospel } : null,
                    // Giữ nguyên các trường gốc để tương thích ngược
                    reading1: sanctoralReading.reading1,
                    psalm: sanctoralReading.psalm,
                    reading2: sanctoralReading.reading2,
                    gospel: sanctoralReading.gospel,
                    code: sanctoralReading.code,
                    year: sanctoralReading.year
                };
            } else if (dayOfWeek === 0) {
                // Nếu là Chúa Nhật và không tìm thấy với cycle, thử tìm với "0"
                const fallbackReading = READINGS_DATA.find(r => {
                    return r.code == sanctoralCode && r.year === "0";
                });
                if (fallbackReading) {
                    sanctoralData = {
                        firstReading: fallbackReading.reading1 ? { excerpt: fallbackReading.reading1 } : null,
                        psalms: fallbackReading.psalm ? { excerpt: fallbackReading.psalm } : null,
                        secondReading: fallbackReading.reading2 ? { excerpt: fallbackReading.reading2 } : null,
                        gospel: fallbackReading.gospel ? { excerpt: fallbackReading.gospel } : null,
                        reading1: fallbackReading.reading1,
                        psalm: fallbackReading.psalm,
                        reading2: fallbackReading.reading2,
                        gospel: fallbackReading.gospel,
                        code: fallbackReading.code,
                        year: fallbackReading.year
                    };
                }
            }
        }

        // ƯU TIÊN 2: Ưu tiên bản văn đầy đủ trong READINGS_SPECIAL nếu có
        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[sanctoralCode]) {
            const specialFull = READINGS_SPECIAL[sanctoralCode];
            const hasFullText = (d) => {
                if (!d) return false;
                return Boolean(d.firstReading?.content || d.gospel?.content || (d.psalms?.verses && d.psalms.verses.length > 0));
            };
            if (!sanctoralData || hasFullText(specialFull)) {
                sanctoralData = specialFull;
            }
        }

        // ƯU TIÊN 3: Fallback sang READINGS_SEASONAL nếu có
        if (!sanctoralData && typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL[sanctoralCode]) {
            sanctoralData = READINGS_SEASONAL[sanctoralCode];
        }

        if (sanctoralData) {
            results.push({ type: 'sanctoral', data: sanctoralData });
        }
    }

    // 3. Option Saint Reading (mã 8DDMM) - tìm trong OptionsaintReadings (Optionsaint.js)
    // OptionsaintReadings chứa bài đọc tùy chọn cho các thánh, mã code dạng 8DDMM
    // Ưu tiên tìm với specialCode (8DDMM) trước, sau đó thử với sanctoralCode (7DDMM) nếu cần
    let optionsaintData = null;

    // ƯU TIÊN 1: Tìm với code chính (dayCode) nếu là mã đặc biệt (8441) hoặc mã 8DDMM
    // Code 8441 (Trái Tim Vô Nhiễm Mẹ) có bản văn đầy đủ trong OptionsaintReadings
    if (code && typeof OptionsaintReadings !== 'undefined') {
        // Tìm trực tiếp với code (8441 hoặc mã 8DDMM)
        if (OptionsaintReadings[code]) {
            optionsaintData = OptionsaintReadings[code];
        }
    }

    // ƯU TIÊN 2: Tìm với specialCode (8DDMM) - mã chính cho Optionsaint
    if (!optionsaintData && specialCode && typeof OptionsaintReadings !== 'undefined') {
        if (OptionsaintReadings[specialCode]) {
            optionsaintData = OptionsaintReadings[specialCode];
        }
    }

    // ƯU TIÊN 3: Nếu không tìm thấy với specialCode, thử với sanctoralCode (7DDMM)
    // Một số thánh có thể có bài đọc trong Optionsaint với mã 7DDMM
    if (!optionsaintData && sanctoralCode && typeof OptionsaintReadings !== 'undefined') {
        // Chuyển đổi 7DDMM thành 8DDMM để tìm trong Optionsaint
        const optionsaintCode = sanctoralCode.replace(/^7/, '8');
        if (OptionsaintReadings[optionsaintCode]) {
            optionsaintData = OptionsaintReadings[optionsaintCode];
        }
    }

    // Nếu tìm thấy trong OptionsaintReadings, thêm vào results
    if (optionsaintData) {
        results.push({ type: 'special', data: optionsaintData });
    }
    // Fallback: tìm trong READINGS_SPECIAL nếu có specialCode và chưa tìm thấy
    else if (specialCode && typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[specialCode]) {
        results.push({ type: 'special', data: READINGS_SPECIAL[specialCode] });
    }

    // 4. Tết Reading (mã 70001, 70002, 70003 - year: "0")
    if (tetCode) {
        // Tìm trong READINGS_SPECIAL trước (bài đọc đầy đủ)
        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[tetCode]) {
            results.push({ type: 'tet', data: READINGS_SPECIAL[tetCode] });
        }
        // Fallback: tìm trong READINGS_DATA với year: "0"
        else if (typeof READINGS_DATA !== 'undefined') {
            const tetReading = READINGS_DATA.find(r => r.code == tetCode && r.year === "0");
            if (tetReading) {
                results.push({ type: 'tet', data: tetReading });
            }
        }
    }

    // 5. Lễ Vọng Reading (nếu có)
    if (vigilInfo && vigilInfo.vigilCode) {
        // Tìm bài đọc lễ vọng trong các nguồn
        let vigilData = null;

        // Tìm trong READINGS_SEASONAL trước
        if (typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL[vigilInfo.vigilCode]) {
            vigilData = READINGS_SEASONAL[vigilInfo.vigilCode];
        }
        // Tìm trong READINGS_SPECIAL
        else if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[vigilInfo.vigilCode]) {
            vigilData = READINGS_SPECIAL[vigilInfo.vigilCode];
        }
        // Tìm trong READINGS_SUNDAY (cho lễ vọng Chúa Nhật)
        else if (typeof READINGS_SUNDAY !== 'undefined' && READINGS_SUNDAY[vigilInfo.vigilCode]) {
            vigilData = READINGS_SUNDAY[vigilInfo.vigilCode][cycle] || READINGS_SUNDAY[vigilInfo.vigilCode];
        }
        // Fallback: tìm trong READINGS_DATA
        else if (typeof READINGS_DATA !== 'undefined') {
            const vigilReading = READINGS_DATA.find(r => {
                if (r.code != vigilInfo.vigilCode) return false;
                return r.year === cycle || r.year === "0";
            });
            if (vigilReading) {
                vigilData = vigilReading;
            }
        }

        // Fallback đặc biệt cho Vọng Hiện Xuống (4089) - dùng bài đọc Thứ Bảy Tuần 7 Phục Sinh (4076)
        if (!vigilData && vigilInfo.vigilCode === "4089" && typeof READINGS_SEASONAL !== 'undefined') {
            vigilData = READINGS_SEASONAL["4076"];
        }

        if (vigilData) {
            results.push({
                type: 'vigil',
                data: vigilData,
                vigilInfo: vigilInfo
            });
        }
    }

    return results;
}

// Hàm tìm bài đọc từ tất cả các nguồn dữ liệu
function findReadingFromAllSources(code, year = null) {
    // 1. Tìm trong READINGS_SUNDAY (cho Chúa Nhật)
    if (typeof READINGS_SUNDAY !== 'undefined' && READINGS_SUNDAY[code]) {
        if (year && READINGS_SUNDAY[code][year]) {
            return { source: 'SUNDAY', data: READINGS_SUNDAY[code][year] };
        }
        return { source: 'SUNDAY', data: READINGS_SUNDAY[code] };
    }

    // 2. Tìm trong READINGS_SEASONAL (các mùa phụng vụ)
    if (typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL[code]) {
        return { source: 'SEASONAL', data: READINGS_SEASONAL[code] };
    }

    // 3. Tìm trong READINGS_ORDINARY_Y1 (Thường Niên năm lẻ)
    if (typeof READINGS_ORDINARY_Y1 !== 'undefined' && READINGS_ORDINARY_Y1[code]) {
        return { source: 'ORDINARY_Y1', data: READINGS_ORDINARY_Y1[code] };
    }

    // 4. Tìm trong READINGS_ORDINARY_Y2 (Thường Niên năm chẵn)
    if (typeof READINGS_ORDINARY_Y2 !== 'undefined' && READINGS_ORDINARY_Y2[code]) {
        return { source: 'ORDINARY_Y2', data: READINGS_ORDINARY_Y2[code] };
    }

    // 5. Tìm trong READINGS_SPECIAL (bài đọc các thánh - SaintsBible.js)
    if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[code]) {
        return { source: 'SPECIAL', data: READINGS_SPECIAL[code] };
    }

    // 6. Tìm trong OptionsaintReadings (bài đọc tùy chọn - Optionsaint.js)
    if (typeof OptionsaintReadings !== 'undefined' && OptionsaintReadings[code]) {
        return { source: 'OPTION_SAINT', data: OptionsaintReadings[code] };
    }

    // 7. Tìm trong READINGS_DATA (metadata)
    if (typeof READINGS_DATA !== 'undefined') {
        const found = READINGS_DATA.find(r => {
            if (r.code != code) return false;
            if (year) return r.year === year || r.year === "0";
            return true;
        });
        if (found) {
            return { source: 'READINGS_DATA', data: found };
        }
    }

    return null;
}

function renderReadingsContent(data, type) {
    const readingContent = document.getElementById('modalReadingsContent');
    const noMsg = document.getElementById('noReadingMsg');
    const readingSection = document.getElementById('modalReadingsSection');

    readingContent.innerHTML = "";
    readingSection.classList.remove('hidden');
    noMsg.classList.add('hidden');

    let fullHtml = "";

    // Màu và nhãn theo loại bài đọc
    const typeConfig = {
        seasonal: { header: '#15803d', bg: '#f0fdf4', label: 'Bài Đọc Theo Mùa Phụng Vụ', icon: '🌿', badge: 'bg-green-100 text-green-800 border-green-300' },
        vigil: { header: '#7c3aed', bg: '#faf5ff', label: 'Bài Đọc Lễ Vọng', icon: '🌙', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
        sanctoral: { header: '#b45309', bg: '#fffbeb', label: 'Bài Đọc Lễ Kính Thánh', icon: '✝️', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
        special: { header: '#7c3aed', bg: '#faf5ff', label: 'Bài Đọc Lễ Riêng', icon: '⭐', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
        tet: { header: '#dc2626', bg: '#fef2f2', label: 'Bài Đọc Thánh Lễ Tết', icon: '🎊', badge: 'bg-red-100 text-red-800 border-red-300' }
    };
    const config = typeConfig[type] || typeConfig.seasonal;
    const colors = { header: config.header, bg: config.bg };

    // Thêm banner cho biết nguồn bài đọc
    fullHtml += `
        <div class="mb-4 p-3 rounded-lg border ${config.badge} flex items-center gap-2">
            <span class="text-xl">${config.icon}</span>
            <span class="font-semibold text-sm uppercase tracking-wider">${config.label}</span>
        </div>
    `;

    const normalizeReadingSet = (d) => {
        if (!d) return null;
        // Nếu đã đúng format (firstReading/psalms/secondReading/gospel) thì giữ nguyên
        if (d.firstReading || d.psalms || d.secondReading || d.gospel) return d;
        // Fallback từ format summary (reading1/psalm/reading2/gospel)
        return {
            firstReading: d.reading1 ? { excerpt: d.reading1 } : null,
            psalms: d.psalm ? { excerpt: d.psalm } : null,
            secondReading: d.reading2 ? { excerpt: d.reading2 } : null,
            gospel: d.gospel ? { excerpt: d.gospel } : null,
            reading1: d.reading1,
            psalm: d.psalm,
            reading2: d.reading2,
            gospel: d.gospel
        };
    };

    const createBlock = (d, blockType) => {
        if (!d) return "";
        let html = `<div class="reading-block">`;

        // Header với icon
        let icon = '📖';
        let headerText = d.title || '';
        if (blockType === 'reading1') { icon = '📜'; headerText = headerText || 'Bài Đọc I'; }
        else if (blockType === 'reading2') { icon = '📜'; headerText = headerText || 'Bài Đọc II'; }
        else if (blockType === 'gospel') { icon = '✝️'; headerText = headerText || 'Tin Mừng'; }

        html += `<div class="flex items-center gap-2 mb-2">`;
        html += `<span class="text-lg">${icon}</span>`;
        html += `<span class="reading-header" style="color: ${colors.header}; margin-bottom: 0;">${headerText}</span>`;
        html += `</div>`;

        if (d.excerpt) html += `<span class="reading-citation">${d.excerpt}</span>`;
        if (d.info) html += `<span class="reading-info">${d.info}</span>`;
        if (d.content) {
            const formattedContent = d.content
                .replace(/\r\n/g, '<br/>')
                .replace(/\n/g, '<br/>');
            html += `<p class="reading-content">${formattedContent}</p>`;
        }
        if (d.end) html += `<span class="reading-end">${d.end}</span>`;
        html += `</div>`;
        return html;
    };

    const createPsalm = (d) => {
        if (!d) return "";
        const isDarkMode = document.body.classList.contains('dark-mode');
        let bgStyle, headerColor, citationColor, responseBgStyle, responseBorderColor;

        if (isDarkMode) {
            bgStyle = "background: linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%);";
            headerColor = "#fcd34d";
            citationColor = "#fcd34d";
            responseBgStyle = "background: rgba(15, 23, 42, 0.85);";
            responseBorderColor = "#fcd34d";
        } else {
            bgStyle = "background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);";
            headerColor = "#854d0e";
            citationColor = "#92400e";
            responseBgStyle = "background: white;";
            responseBorderColor = "#facc15";
        }

        let html = `<div class="reading-block" style="${bgStyle} padding: 16px; border-radius: 8px; margin: 16px 0;">`;
        html += `<div class="flex items-center gap-2 mb-3">`;
        html += `<span class="text-lg">🎵</span>`;
        html += `<span class="reading-header" style="color: ${headerColor}; margin-bottom: 0;">Đáp Ca</span>`;
        html += `</div>`;
        if (d.excerpt) html += `<span class="reading-citation" style="color: ${citationColor};">${d.excerpt}</span>`;
        if (d.response) html += `<div class="psalm-response" style="${responseBgStyle} padding: 12px; border-radius: 6px; margin: 12px 0; border-left: 4px solid ${responseBorderColor};">${d.response}</div>`;
        if (d.verses) {
            html += `<div class="space-y-2 mt-3">`;
            d.verses.forEach(v => html += `<span class="psalm-verse">${v}</span>`);
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    };

    const createAlleluia = (d) => {
        if (!d) return "";
        const isDarkMode = document.body.classList.contains('dark-mode');
        let bgStyle, borderColor, verseColor, contentColor;

        if (isDarkMode) {
            bgStyle = "background: linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%);";
            borderColor = "#fcd34d";
            verseColor = "#fde68a";
            contentColor = "#fcd34d";
        } else {
            bgStyle = "background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);";
            borderColor = "#facc15";
            verseColor = "";
            contentColor = "";
        }

        return `
        <div class="alleluia-box" style="${bgStyle} border-left: 4px solid ${borderColor}; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">🎶</span>
                <span class="alleluia-verse" style="margin-bottom: 0; ${verseColor ? `color: ${verseColor};` : ''}">${d.verse || 'Alleluia, Alleluia!'}</span>
            </div>
            <p class="alleluia-content" style="${contentColor ? `color: ${contentColor};` : ''}">${d.content}</p>
        </div>`;
    };

    // Render các phần
    if (data && data.options && Array.isArray(data.options)) {
        data.options.forEach((opt, idx) => {
            const setData = normalizeReadingSet(opt.data);
            if (!setData) return;
            fullHtml += `
                <div class="reading-option">
                    <div class="reading-option-title">${opt.label || `Lựa chọn ${idx + 1}`}</div>
                </div>
            `;
            fullHtml += createBlock(setData.firstReading, 'reading1');
            fullHtml += createPsalm(setData.psalms);
            if (setData.secondReading) {
                fullHtml += createBlock(setData.secondReading, 'reading2');
            }
            fullHtml += createAlleluia(setData.alleluia);
            fullHtml += createBlock(setData.gospel, 'gospel');
            if (idx < data.options.length - 1) {
                fullHtml += `<div class="section-divider">Lựa chọn tiếp theo</div>`;
            }
        });
    } else {
        const normalized = normalizeReadingSet(data);
        if (normalized) {
            fullHtml += createBlock(normalized.firstReading, 'reading1');
            fullHtml += createPsalm(normalized.psalms);
            if (normalized.secondReading) {
                fullHtml += createBlock(normalized.secondReading, 'reading2');
            }
            fullHtml += createAlleluia(normalized.alleluia);
            fullHtml += createBlock(normalized.gospel, 'gospel');
        }
    }

    readingContent.innerHTML = fullHtml;

    // Update active state cho selector
    document.querySelectorAll('.reading-selector').forEach(el => {
        el.classList.remove('active');
        el.classList.remove('border-green-300', 'border-amber-300', 'border-purple-300', 'border-red-300');
        el.classList.add('border-transparent');
    });

    let activeId = 'btn-seasonal';
    let borderClass = 'border-green-300';
    if (type === 'sanctoral') { activeId = 'btn-sanctoral'; borderClass = 'border-amber-300'; }
    else if (type === 'special') { activeId = 'btn-special'; borderClass = 'border-purple-300'; }
    else if (type === 'tet') { activeId = 'btn-tet'; borderClass = 'border-red-300'; }

    const activeEl = document.getElementById(activeId);
    if (activeEl) {
        activeEl.classList.add('active', borderClass);
    }
}

function updateHeaderTodayInfo(dateOverride) {
    const today = dateOverride ? new Date(dateOverride) : getHeaderBaseDate();
    if (dateOverride) {
        headerFocusDate = new Date(today);
    }
    const litData = getLiturgicalData(today.getFullYear());
    // Dùng hàm core để lấy toàn bộ thông tin phụng vụ
    const dayInfo = getDayLiturgicalInfo(today, litData);
    const info = dayInfo.info;

    const dayOfWeek = DAYS_FULL_VI[today.getDay()];
    const cycle = dayInfo.cycle;
    const weekdayCycle = dayInfo.weekdayCycle;
    const detailedWeek = dayInfo.detailedWeek;

    // === 1. CỬ HÀNH CHÍNH (Title + Rank + Color) ===
    let celebrationTitle = "";
    let rankBadgeText = "";
    let rankBadgeClass = "";

    if (info.special) {
        celebrationTitle = info.special;
        rankBadgeText = getRankDisplayName(info.rankCode);
        rankBadgeClass = getRankBadgeClass(info.rankCode);
    } else if (info.isTet) {
        const tetEvent = getTetEvent(today);
        celebrationTitle = tetEvent?.fullName || tetEvent?.name || "Tết Nguyên Đán";
        rankBadgeText = "LỄ TRỌNG";
        rankBadgeClass = getRankBadgeClass('TRONG');
    } else if (info.saints.length > 0 && ['S', 'F'].includes(info.saints[0].type)) {
        celebrationTitle = info.saints[0].name;
        rankBadgeText = getRankDisplayName(info.saints[0].rank);
        rankBadgeClass = getRankBadgeClass(info.saints[0].rank);
    } else {
        // Ngày thường - hiển thị ngày trong tuần + tuần phụng vụ
        celebrationTitle = `${dayOfWeek} ${detailedWeek}`;
        if (today.getDay() === 0) {
            rankBadgeText = "CHÚA NHẬT";
            rankBadgeClass = getRankBadgeClass('CN');
        }
    }

    // Hiển thị cử hành chính - NỔI BẬT
    const headerCelebration = document.getElementById('headerCelebration');
    if (headerCelebration) {
        headerCelebration.innerText = celebrationTitle;
        // Thêm màu text theo màu phụng vụ
        let textColorClass = 'text-gray-900';
        if (info.color.includes('purple')) textColorClass = 'text-purple-800';
        else if (info.color.includes('green')) textColorClass = 'text-green-800';
        else if (info.color.includes('red')) textColorClass = 'text-red-800';
        else if (info.color.includes('white')) textColorClass = 'text-amber-700';
        headerCelebration.className = `text-3xl md:text-5xl font-black font-serif leading-tight mb-4 tracking-tight ${textColorClass}`;
    }

    // Badge - Bậc lễ
    const headerBadge = document.getElementById('headerRankBadge');
    if (headerBadge) {
        if (rankBadgeText) {
            headerBadge.innerText = rankBadgeText;
            headerBadge.className = `text-[0.7rem] font-bold uppercase px-3 py-1 rounded-full ${rankBadgeClass}`;
        } else {
            headerBadge.className = "hidden";
        }
    }

    // Color dot - Màu phụng vụ
    const headerColorDot = document.getElementById('headerColorDot');
    if (headerColorDot) {
        headerColorDot.className = `w-4 h-4 rounded-full shadow-md ring-2 ring-white ${info.color}`;
    }

    // === 2. TUẦN + Chu kỳ (BỎ MÙA PHỤNG VỤ) ===
    const headerSeasonWeek = document.getElementById('headerSeasonWeek');
    if (headerSeasonWeek) {
        // Chỉ hiển thị tuần, không hiển thị mùa
        headerSeasonWeek.innerText = detailedWeek;
    }

    // === 2b. NGÀY DƯƠNG + ÂM (Thanh today) ===
    const headerDateCard = document.getElementById('headerDateCard');
    const headerDateText = document.getElementById('headerDateText');
    const headerLunarText = document.getElementById('headerLunarText');
    if (headerDateText) {
        headerDateText.innerText = `${dayOfWeek}, ${today.getDate()} tháng ${today.getMonth() + 1}, ${today.getFullYear()}`;
    }
    if (headerLunarText && typeof LUNAR_CALENDAR !== 'undefined') {
        const lunar = LUNAR_CALENDAR.getLunarDate(today);
        if (lunar) {
            const monthStr = lunar.leap ? `${lunar.month}N` : lunar.month;
            headerLunarText.innerText = `${lunar.day}/${monthStr} Âm lịch`;
        }
    }
    if (headerDateCard) {
        let accent = "#0f3d5e";
        if (info.color.includes('purple')) accent = "#7e22ce";
        else if (info.color.includes('green')) accent = "#15803d";
        else if (info.color.includes('red')) accent = "#dc2626";
        else if (info.color.includes('white')) accent = "#d97706";
        else if (info.color.includes('rose')) accent = "#db2777";
        headerDateCard.style.setProperty('--today-accent', accent);
        const headerInfo = document.getElementById('headerTodayInfo');
        if (headerInfo) headerInfo.style.setProperty('--today-accent', accent);
    }

    const headerCycle = document.getElementById('headerCycle');
    if (headerCycle) {
        let cycleText = `Năm ${cycle}`;
        // Thêm năm lẻ/chẵn cho ngày thường Mùa Thường Niên
        if (info.season === "Mùa Thường Niên" && today.getDay() !== 0) {
            cycleText += ` - ${weekdayCycle === "1" ? "Năm lẻ" : "Năm chẵn"}`;
        }
        headerCycle.innerText = cycleText;
    }

    // === 3. THAM CHIẾU BÀI ĐỌC ===
    // Dùng thông tin từ dayInfo (đã có sẵn từ hàm core)
    const code = dayInfo.dayCode;
    const sanctoralCode = dayInfo.sanctoralCode;
    const specialCode = dayInfo.specialCode;

    let seasonalSummary = READINGS_DATA.find(r => {
        if (r.code != code) return false;
        if (today.getDay() === 0) return r.year === cycle;
        return r.year === weekdayCycle || r.year === "0";
    });
    let sanctoralSummary = READINGS_DATA.find(r => r.code == sanctoralCode);

    let readingsText = "";
    // Ưu tiên bài đọc theo luật phụng vụ (sanctoral khi cần)
    let primarySummary = seasonalSummary;
    if ((info._forceSanctoralReadings || info._winnerKey === 'SANCTORAL') && sanctoralSummary) {
        primarySummary = sanctoralSummary;
    }

    if (primarySummary) {
        let parts = [primarySummary.reading1, primarySummary.psalm, primarySummary.gospel].filter(Boolean);
        readingsText = parts.join(" • ");
    }

    const headerReadings = document.getElementById('headerReadings');
    if (headerReadings) {
        headerReadings.innerText = readingsText || "Chạm để xem bài đọc";
    }

    // === 4. CỬ HÀNH PHỤ (nếu có) - Ở dưới cùng ===
    const headerSecondary = document.getElementById('headerSecondary');
    const headerSecondaryContent = document.getElementById('headerSecondaryContent');

    if (headerSecondary) {
        let secondaryCelebrations = [];
        const secondarySet = new Set();
        const primaryName = (info.special || "").trim();
        const pushSecondary = (name) => {
            if (!name) return;
            const normalized = name.trim().toLowerCase();
            if (!normalized) return;
            if (primaryName && normalized === primaryName.toLowerCase()) return;
            if (secondarySet.has(normalized)) return;
            secondarySet.add(normalized);
            secondaryCelebrations.push(name.trim());
        };

        // Thu thập thánh/lễ nhớ không phải cử hành chính
        if (info.saints.length > 0) {
            info.saints.forEach((saint, idx) => {
                // Bỏ qua nếu đã là cử hành chính
                if (idx === 0 && ['S', 'F'].includes(saint.type) && !info.special) return;
                if (!['S', 'F'].includes(saint.type)) {
                    pushSecondary(saint.name);
                }
            });
        }

        // Thu thập commemorations
        if (info.commemorations && info.commemorations.length > 0) {
            info.commemorations.forEach(c => {
                const name = c.special || c.name || c.key;
                if (name) {
                    pushSecondary(name);
                }
            });
        }

        if (secondaryCelebrations.length > 0 && headerSecondaryContent) {
            headerSecondaryContent.innerText = secondaryCelebrations.join(" • ");
            headerSecondary.classList.remove('hidden');
        } else {
            headerSecondary.classList.add('hidden');
        }
    }

    // === 5. GHI CHÚ KỶ LUẬT PHỤNG VỤ ===
    const disciplines = getLiturgicalDiscipline(today, litData);
    const headerDiscipline = document.getElementById('headerDiscipline');
    const headerDisciplineContent = document.getElementById('headerDisciplineContent');

    if (headerDiscipline && headerDisciplineContent) {
        if (disciplines.length > 0) {
            let disciplineHtml = disciplines.map(d =>
                `<span class="discipline-tag ${d.class}">${d.icon} ${d.label}</span>`
            ).join('');
            headerDisciplineContent.innerHTML = disciplineHtml;
            headerDiscipline.classList.remove('hidden');
        } else {
            headerDiscipline.classList.add('hidden');
        }
    }

    // === 6. LỊCH CHẦU THÁNH THỂ (Chúa Nhật) ===
    if (today.getDay() === 0) {
        const sundayNumber = getSundayNumberOfYear(today);
        const weekKey = sundayNumber.toString().padStart(2, '0');

        if (typeof eucharisticAdoration !== 'undefined' && eucharisticAdoration[weekKey] && eucharisticAdoration[weekKey].content) {
            // Thêm thông tin Chầu vào headerReadings hoặc tạo phần riêng
            const adorationText = eucharisticAdoration[weekKey].content;
            // Hiển thị trong secondary section nếu có
            if (headerSecondary && headerSecondaryContent) {
                let currentContent = headerSecondaryContent.innerText;
                if (currentContent) {
                    headerSecondaryContent.innerHTML = `<div class="text-amber-700 font-medium mb-1">⛪ ${adorationText}</div><div class="text-gray-600">${currentContent}</div>`;
                } else {
                    headerSecondaryContent.innerHTML = `<span class="text-amber-700 font-medium">⛪ ${adorationText}</span>`;
                }
                headerSecondary.classList.remove('hidden');
                // Thay đổi label cho phù hợp
                const labelEl = headerSecondary.querySelector('p');
                if (labelEl) labelEl.textContent = 'Lịch Chầu Thánh Thể';
            }
        }
    }

    // Click handler
    document.getElementById('headerTodayInfo').onclick = () => openModal(today, info);

    // Cập nhật ngay view thu gọn (nếu đang hiển thị) để đồng bộ khi đổi ngày
    if (typeof HeaderCollapseManager !== 'undefined' && HeaderCollapseManager.updateCompactView) {
        HeaderCollapseManager.updateCompactView();
    }
}

// --- LITURGICAL TOOLTIP ---
// Tạo tooltip element nếu chưa có
function ensureTooltipElement() {
    let tooltip = document.getElementById('liturgicalTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'liturgicalTooltip';
        tooltip.className = 'liturgical-tooltip';
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

// Helper: xác định có phải ngày lễ vọng không (dùng chung, tránh trùng logic)
function isVigilDay(date, dayCode, litData) {
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);
    const m = date.getMonth();
    const d = date.getDate();
    const holySaturday = addDays(litData.easter, -1);
    return dayCode === "4089" ||
        (m === 11 && d === 24) ||
        (dTime === t(holySaturday)) ||
        (m === 9 && d === 31);
}

// Helper: nhận diện tên lễ vọng trong chuỗi (nếu có)
function hasVigilName(name) {
    if (!name) return false;
    const normalized = String(name).toLowerCase();
    if (normalized.includes('mùa vọng')) return false;
    return normalized.includes('lễ vọng') ||
        normalized.startsWith('vọng ') ||
        normalized.includes(' vọng ') ||
        normalized.includes('vọng-') ||
        normalized.includes('canh thức') ||
        normalized.includes('canh thuc');
}

// Helper: lấy thông tin lễ vọng khi đang ở NGÀY TRƯỚC lễ chính
function getVigilEveInfo(date, litData) {
    const nextDay = addDays(date, 1);
    const nextDayVigil = getVigilInfo(nextDay, litData);
    if (!nextDayVigil) return null;
    return {
        ...nextDayVigil,
        isEve: true,
        mainFeastDate: nextDay
    };
}

// ============================================================================
// CORE FUNCTION: Lấy toàn bộ thông tin phụng vụ cho một ngày
// Hàm này là lõi (core) được dùng bởi renderCalendar, modal, tooltip, export
// ============================================================================
function getDayLiturgicalInfo(date, litData) {
    // 1. Lấy thông tin phụng vụ cơ bản (từ precedence engine)
    const info = getDayInfo(date, litData);

    // 2. Lấy mã ngày phụng vụ
    const dayCode = getLiturgicalDayCode(date, litData);

    // 3. Lấy tuần phụng vụ chi tiết
    const detailedWeek = getDetailedLiturgicalWeek(date, litData);

    // 4. Kiểm tra lễ vọng (ngày chính và ngày trước đó)
    const vigilInfo = getVigilInfo(date, litData);
    const vigilEveInfo = getVigilEveInfo(date, litData);

    // 5. Xác định dayLabel dựa trên bậc lễ (precedence)
    const dayLabelText = getDayLabelFromPrecedence(date, info, dayCode, litData, detailedWeek, vigilEveInfo);

    // 6. Lấy thông tin lịch âm
    const lunar = typeof LUNAR_CALENDAR !== 'undefined' ? LUNAR_CALENDAR.getLunarDate(date) : null;

    // 7. Lấy các mã phụng vụ khác
    let sanctoralCode = getSanctoralDayCode(date);
    if (info._forceSanctoralReadings && info._forceSanctoralKey) {
        sanctoralCode = info._forceSanctoralKey;
    }
    const specialCode = getSpecialFeastCode(date, litData);
    const tetCode = getTetReadingCode(date);

    // 8. Lấy chu kỳ phụng vụ
    const cycle = getLiturgicalCycle(date, litData);
    const weekdayCycle = date.getFullYear() % 2 !== 0 ? "1" : "2";

    // 9. Xác định có phải ngày lễ vọng không (dùng helper chung)
    const vigDay = isVigilDay(date, dayCode, litData) || hasVigilName(info.special) || Boolean(vigilEveInfo);

    // 10. Format dayLabel với HTML (cho renderCalendar)
    let dayLabel = "";
    if (info.transferred && info.special) {
        dayLabel = dayLabelText;
    } else if (info.special) {
        dayLabel = dayLabelText;
    } else if (info.saints.length > 0) {
        dayLabel = dayLabelText;
    } else {
        dayLabel = `<span class="ferial-label">${dayLabelText}</span>`;
    }

    // Trả về object chứa tất cả thông tin
    return {
        // Thông tin cơ bản
        info: info,
        dayCode: dayCode,
        detailedWeek: detailedWeek,
        dayLabelText: dayLabelText,
        dayLabel: dayLabel, // HTML formatted

        // Lịch âm
        lunar: lunar,

        // Mã phụng vụ
        sanctoralCode: sanctoralCode,
        specialCode: specialCode,
        tetCode: tetCode,

        // Chu kỳ
        cycle: cycle,
        weekdayCycle: weekdayCycle,

        // Lễ vọng
        vigilInfo: vigilInfo,
        vigilEveInfo: vigilEveInfo,
        isVigilDay: vigDay,

        // Liturgical data
        litData: litData
    };
}

// Helper function: Xác định dayLabel dựa trên bậc lễ từ precedence engine (dùng chung cho renderCalendar, tooltip, export)
function getDayLabelFromPrecedence(date, info, dayCode, litData, detailedWeek, vigilEveInfo = null) {
    const t = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
    const dTime = t(date);
    const holySaturday = addDays(litData.easter, -1);
    const vigDay = isVigilDay(date, dayCode, litData) || Boolean(vigilEveInfo) || hasVigilName(info.special);
    const normalizeFeastName = (name) => {
        if (!name) return name;
        if (name.includes("CHÚA GIÁNG SINH")) return "CHÚA GIÁNG SINH";
        if (name.includes("Lễ Giáng Sinh")) return "CHÚA GIÁNG SINH";
        return name;
    };

    // Ưu tiên: Lễ bị dời > Lễ cử hành chính > Sanctoral > Ngày thường
    if (info.transferred && info.special) {
        // Lễ bị dời đến ngày này
        return normalizeFeastName(info.special);
    } else if (info.special && !vigDay) {
        // Cử hành chính (từ precedence) - BỎ QUA nếu là lễ vọng
        return normalizeFeastName(info.special);
    } else if (info.saints.length > 0) {
        // Sanctoral (nếu không bị dời)
        const saintName = info.saints[0].name.replace("Thánh ", "T.").replace("Đức Mẹ ", "ĐM.");
        return normalizeFeastName(saintName);
    } else {
        // Ngày thường - Nếu là lễ vọng, hiển thị mùa phụng vụ thay vì tên lễ vọng
        if (vigDay) {
            // Hiển thị mùa phụng vụ thay vì tên lễ vọng
            // Xử lý đặc biệt cho các mã lễ vọng
            if (dayCode === "4089") {
                // Vọng Hiện Xuống - Thứ Bảy tuần 7 Phục Sinh
                return "Tuần VII Mùa Phục Sinh";
            } else if (dayCode === "22412") {
                // Lễ Vọng Giáng Sinh (24/12) - vẫn là Mùa Vọng
                return `Mùa Vọng ngày ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (dayCode === "4076" && dTime === t(holySaturday)) {
                // Canh Thức Vượt Qua (Thứ Bảy Tuần Thánh)
                return "Tuần Thánh";
            } else if (dayCode === "73110") {
                // Lễ Vọng Các Thánh
                return info.season || "Mùa Thường Niên";
            } else {
                // Fallback: dùng logic parse thông thường
                const season = parseInt(dayCode.substring(0, 1));
                const week = parseInt(dayCode.substring(1, 3));
                const seasonNames = ["", "Mùa Vọng", "Mùa Giáng Sinh", "Mùa Chay", "Mùa Phục Sinh", "Thường Niên"];
                if (week > 0 && season > 0 && season < 6) {
                    return `Tuần ${toRoman(week)} ${seasonNames[season]}`;
                } else {
                    return info.season || "Mùa Thường Niên";
                }
            }
        } else {
            // Ngày thường bình thường
            return detailedWeek || info.season || "Mùa Thường Niên";
        }
    }
}

// Generate tooltip content từ thông tin phụng vụ
function generateTooltipContent(date, info, litData) {
    // Dùng hàm core để lấy toàn bộ thông tin phụng vụ (bỏ qua tham số info, litData nếu có)
    const activeLitData = litData || getLiturgicalData(date.getFullYear());
    const dayInfo = getDayLiturgicalInfo(date, activeLitData);
    const infoFromCore = dayInfo.info;

    // Lấy các thông tin từ dayInfo
    const code = dayInfo.dayCode;
    const sanctoralCode = dayInfo.sanctoralCode;
    const specialCode = dayInfo.specialCode;
    const cycle = dayInfo.cycle;
    const weekdayCycle = dayInfo.weekdayCycle;
    const detailedWeek = dayInfo.detailedWeek;
    const seasonalCodeForReadings = String(code).startsWith('7')
        ? getLiturgicalDayCode(date, activeLitData, { includeSanctoral: false })
        : code;

    // Lấy thông tin bài đọc
    let seasonalSummary = READINGS_DATA.find(r => {
        if (r.code != seasonalCodeForReadings) return false;
        if (date.getDay() === 0) return r.year === cycle;
        return r.year === weekdayCycle || r.year === "0";
    });
    let sanctoralSummary = READINGS_DATA.find(r => r.code == sanctoralCode);
    let specialSummary = READINGS_DATA.find(r => r.code == specialCode);

    // Ưu tiên bài đọc sanctoral khi cần (lễ trọng/riêng)
    let primarySummary = seasonalSummary;
    if ((infoFromCore._forceSanctoralReadings || infoFromCore._winnerKey === 'SANCTORAL') && sanctoralSummary) {
        primarySummary = sanctoralSummary;
    }

    const gospel = primarySummary?.gospel || sanctoralSummary?.gospel || specialSummary?.gospel || '';

    // Xác định có lựa chọn khác không
    const hasSanctoral = sanctoralSummary && sanctoralSummary !== seasonalSummary;
    const hasSpecial = specialSummary && specialSummary !== seasonalSummary;
    const hasAlternatives = hasSanctoral || hasSpecial;

    // Xác định cử hành chính và bậc lễ thấp hơn từ dayInfo (đã được xử lý bởi precedence engine)
    const primaryName = dayInfo.dayLabelText;
    let secondaryName = '';

    // Bậc lễ thấp hơn: từ commemorations hoặc saints không được cử hành
    if (infoFromCore.commemorations && infoFromCore.commemorations.length > 0) {
        // Lấy commemoration đầu tiên
        const commemoration = infoFromCore.commemorations[0];
        secondaryName = commemoration.special || commemoration.name || '';
    } else if (infoFromCore.saints.length > 0 && !infoFromCore.special) {
        // Nếu có saints nhưng không phải cử hành chính
        secondaryName = infoFromCore.saints[0].name;
    }

    // Xác định chu kỳ - chỉ hiển thị với Mùa Thường Niên và cử hành chính là temporal
    let cycleText = '';
    // Cử hành chính là temporal nếu:
    // - Không phải lễ bị dời (transferred)
    // - Và (_winnerKey không phải "SANCTORAL" hoặc không có _winnerKey)
    // - Và (info.special không phải là tên thánh hoặc info.special === detailedWeek)
    const isSanctoralPrimary = infoFromCore._winnerKey === "SANCTORAL" ||
        (infoFromCore.saints.length > 0 && infoFromCore.special === infoFromCore.saints[0]?.name);
    const isTemporalPrimary = !infoFromCore.transferred && !isSanctoralPrimary;

    if (infoFromCore.season === "Mùa Thường Niên" && isTemporalPrimary) {
        if (date.getDay() === 0) {
            // Chúa Nhật: Năm A/B/C
            cycleText = `Năm ${cycle}`;
        } else {
            // Ngày thường: Năm chẵn/lẻ
            cycleText = weekdayCycle === "1" ? "Năm lẻ" : "Năm chẵn";
        }
    }

    // Tạo HTML
    let html = '';

    // Hàng đầu tiên: Cử hành chính - chữ lớn, đậm, nổi bật
    html += `<div class="tooltip-primary" style="font-size: 1rem; font-weight: 700; color: #1f2937; margin-bottom: 8px; line-height: 1.4;">`;

    if (cycleText) {
        // Có chu kỳ: hiển thị với chu kỳ
        html += `${primaryName} - ${cycleText}`;
    } else {
        // Không có chu kỳ: chỉ hiển thị tên
        html += primaryName;
    }

    html += `</div>`;

    // Hàng thứ hai: Bậc lễ thấp hơn (commemoration) - chữ nhỏ hơn
    if (secondaryName) {
        html += `<div class="tooltip-secondary" style="font-size: 0.85rem; font-weight: 400; color: #6b7280; margin-bottom: 12px; line-height: 1.3;">`;
        html += secondaryName;
        html += `</div>`;
    } else {
        html += `<div style="margin-bottom: 12px;"></div>`;
    }

    // Tin Mừng
    if (gospel) {
        html += `<div class="tooltip-section">`;
        html += `<div class="tooltip-label">Tin Mừng</div>`;
        html += `<div class="tooltip-value tooltip-gospel">${gospel}</div>`;
        html += `</div>`;
    }

    // Lễ không cử hành (thay vì "Lựa chọn khác")
    const notCelebratedNames = [];

    // Kiểm tra sanctoral không được cử hành
    if (hasSanctoral && sanctoralSummary) {
        // Parse sanctoralCode (format: "7ddmm")
        // Ví dụ: "72501" = ngày 25 tháng 01
        if (sanctoralCode && sanctoralCode.length >= 5 && sanctoralCode[0] === '7') {
            const day = parseInt(sanctoralCode.substring(1, 3));
            const month = parseInt(sanctoralCode.substring(3, 5));
            const saintKey = `${month}-${day}`;

            if (FIXED_DATA_LOOKUP[saintKey]) {
                const saint = FIXED_DATA_LOOKUP[saintKey];
                // Chỉ thêm nếu không phải cử hành chính
                // Kiểm tra xem có phải là cử hành chính không
                const isSanctoralPrimary = infoFromCore._winnerKey === "SANCTORAL" ||
                    (infoFromCore.special === saint.name) ||
                    // Lễ di động ép sanctoral (Tử Đạo VN, Truyền Tin, St Joseph...)
                    // → sanctoral code ĐÃ bị đổi, tên có thể khác nhưng vẫn là cử hành chính
                    infoFromCore._forceSanctoralReadings ||
                    // So sánh mềm: tên cử hành chính chứa trong tên thánh hoặc ngược lại
                    (infoFromCore.special && saint.name &&
                        (saint.name.includes(infoFromCore.special) || infoFromCore.special.includes(saint.name)));

                if (!isSanctoralPrimary) {
                    notCelebratedNames.push(saint.name);
                }
            }
        }
    }

    // Kiểm tra special không được cử hành
    if (hasSpecial && specialSummary) {
        // Có thể thêm logic để xác định tên lễ đặc biệt nếu cần
    }

    // Hiển thị nếu có lễ không cử hành
    if (notCelebratedNames.length > 0) {
        html += `<div class="tooltip-section">`;
        html += `<div class="tooltip-label">Lễ Không Cử Hành</div>`;
        html += `<div class="tooltip-value tooltip-alternative">${notCelebratedNames.join(' / ')}</div>`;
        html += `</div>`;
    }

    // Hiển thị thông tin Tết nếu có
    if (infoFromCore.isTet && infoFromCore.tetNote) {
        html += `<div class="tooltip-section" style="background-color: #fef2f2; padding: 8px; border-radius: 4px; margin-top: 8px;">`;
        html += `<div class="tooltip-label" style="color: #dc2626;">🎊 Tết Nguyên Đán</div>`;
        html += `<div class="tooltip-value" style="font-size: 0.8rem; color: #991b1b;">${infoFromCore.tetNote}</div>`;
        html += `</div>`;
    } else if (infoFromCore.tetEvent && infoFromCore.tetNote) {
        // Tết không được cử hành chính nhưng có ghi chú
        html += `<div class="tooltip-section" style="background-color: #fef2f2; padding: 8px; border-radius: 4px; margin-top: 8px;">`;
        html += `<div class="tooltip-label" style="color: #dc2626;">🎊 ${infoFromCore.tetEvent.name}</div>`;
        html += `<div class="tooltip-value" style="font-size: 0.8rem; color: #991b1b;">${infoFromCore.tetNote}</div>`;
        html += `</div>`;
    }

    // Hiển thị thông tin dời Lễ Tro nếu có
    if (infoFromCore.ashWednesdayNote) {
        html += `<div class="tooltip-section" style="background-color: #f3e8ff; padding: 8px; border-radius: 4px; margin-top: 8px;">`;
        html += `<div class="tooltip-label" style="color: #7c3aed;">✝️ Lễ Tro ${infoFromCore.isTransferredAshWednesday ? '(Dời)' : ''}</div>`;
        html += `<div class="tooltip-value" style="font-size: 0.75rem; color: #5b21b6;">${infoFromCore.ashWednesdayNote}</div>`;
        html += `</div>`;
    }

    // Hiển thị lịch Chầu Thánh Thể cho Chúa Nhật
    if (date.getDay() === 0) {
        const sundayNumber = getSundayNumberOfYear(date);
        const weekKey = sundayNumber.toString().padStart(2, '0');
        if (typeof eucharisticAdoration !== 'undefined' && eucharisticAdoration[weekKey] && eucharisticAdoration[weekKey].content) {
            html += `<div class="tooltip-section" style="background-color: #fef3c7; padding: 8px; border-radius: 4px; margin-top: 8px;">`;
            html += `<div class="tooltip-label" style="color: #92400e;">⛪ Chầu Thánh Thể</div>`;
            html += `<div class="tooltip-value" style="font-size: 0.8rem; color: #78350f;">${eucharisticAdoration[weekKey].content.replace('Chầu Thánh Thể tại: ', '')}</div>`;
            html += `</div>`;
        }
    }

    return html;
}

// Hiển thị tooltip
function showTooltip(event, date, info, litData) {
    const tooltip = ensureTooltipElement();
    const content = generateTooltipContent(date, info, litData);
    tooltip.innerHTML = content;

    // Hiển thị tooltip tạm thời để lấy kích thước
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    tooltip.classList.add('visible');
    const tooltipRect = tooltip.getBoundingClientRect();

    // Lấy vị trí con trỏ chuột hoặc touch
    // clientX/clientY là tọa độ tương đối với viewport (màn hình hiển thị)
    let mouseX, mouseY;
    if (event.clientX !== undefined && event.clientX !== 0) {
        // Mouse event - sử dụng clientX/clientY (viewport coordinates)
        mouseX = event.clientX;
        mouseY = event.clientY;
    } else if (event.touches && event.touches.length > 0) {
        // Touch event
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
    } else {
        // Fallback: sử dụng vị trí element (getBoundingClientRect trả về viewport coordinates)
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX = rect.left + rect.width / 2;
        mouseY = rect.top + rect.height / 2;
    }

    // Kích thước viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Offset để không che mất con trỏ
    const offsetX = 15;
    const offsetY = 15;

    // Tính vị trí ban đầu (bên phải và dưới con trỏ)
    let left = mouseX + offsetX;
    let top = mouseY + offsetY;

    // Điều chỉnh nếu tooltip ra ngoài màn hình bên phải
    if (left + tooltipRect.width > viewportWidth - 10) {
        // Hiển thị bên trái con trỏ
        left = mouseX - tooltipRect.width - offsetX;
    }

    // Điều chỉnh nếu tooltip ra ngoài màn hình bên trái
    if (left < 10) {
        left = 10;
    }

    // Điều chỉnh nếu tooltip ra ngoài màn hình bên dưới
    if (top + tooltipRect.height > viewportHeight - 10) {
        // Hiển thị phía trên con trỏ
        top = mouseY - tooltipRect.height - offsetY;
    }

    // Điều chỉnh nếu tooltip ra ngoài màn hình phía trên
    if (top < 10) {
        top = 10;
    }

    // Áp dụng vị trí - KHÔNG cộng scroll offset vì tooltip dùng position: fixed
    // position: fixed định vị theo viewport, clientX/clientY cũng là viewport coordinates
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = 'visible';
}

// Ẩn tooltip
function hideTooltip() {
    const tooltip = document.getElementById('liturgicalTooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

// Long-press handler
let longPressTimer = null;
let tooltipShownByLongPress = false;

function handleLongPress(event, date, info, litData) {
    longPressTimer = setTimeout(() => {
        showTooltip(event, date, info, litData);
        tooltipShownByLongPress = true;
        // Giữ tooltip hiển thị sau khi long-press
        setTimeout(() => {
            tooltipShownByLongPress = false;
        }, 2000); // Giữ tooltip 2 giây sau long-press
    }, 500); // 500ms để kích hoạt long-press
}

function cancelLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function renderCalendar() {
    const startTime = performance.now();

    document.getElementById('currentYearDisplay').innerText = currentYear;
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = "";
    const litData = getLiturgicalData(currentYear);

    // Hiển thị thông báo nếu Lễ Tro bị dời (năm có Tết trùng Lễ Tro)
    if (litData.ashWednesdayTransferred) {
        console.log(`[${currentYear}] Lễ Tro bị dời:`, litData.ashWednesdayTransferNote);
    }

    for (let month = 0; month < 12; month++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = "calendar-month bg-white/90 p-4 rounded-2xl shadow border border-gray-100 flex flex-col";
        const monthTitle = document.createElement('div');
        monthTitle.className = "month-title flex justify-center items-center mb-4 pb-2 border-b border-gray-100 font-bold text-gray-800 uppercase tracking-widest text-lg";
        monthTitle.innerText = MONTHS_VI[month];
        monthDiv.appendChild(monthTitle);
        const daysHeader = document.createElement('div');
        daysHeader.className = "days-header grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-gray-400 text-center uppercase tracking-wide";
        DAYS_VI.forEach(d => {
            const span = document.createElement('span'); span.innerText = d;
            if (d === 'CN') span.className = "text-red-500 font-bold";
            daysHeader.appendChild(span);
        });
        monthDiv.appendChild(daysHeader);
        const daysGrid = document.createElement('div');
        daysGrid.className = "calendar-days-grid grid grid-cols-7 gap-2 flex-grow";
        const firstDayOfMonth = new Date(currentYear, month, 1).getDay();
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        for (let i = 0; i < firstDayOfMonth; i++) daysGrid.appendChild(document.createElement('div'));

        const getSeasonColorClass = (seasonName) => {
            if (seasonName === "Mùa Vọng" || seasonName === "Mùa Chay") return "bg-lit-purple";
            if (seasonName === "Mùa Giáng Sinh" || seasonName === "Mùa Phục Sinh") return "bg-lit-white";
            return "bg-lit-green"; // Mùa Thường Niên
        };

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentYear, month, d);

            // Dùng hàm core để lấy toàn bộ thông tin phụng vụ
            const dayInfo = getDayLiturgicalInfo(date, litData);
            const info = dayInfo.info;

            const dayEl = document.createElement('div');
            const isOptionalMemorial = info.rankCode === 'NHOKB' && info.saints && info.saints.length > 0;
            const colorSource = isOptionalMemorial ? getSeasonColorClass(info.season) : info.color;
            let bgClass = "bg-white hover:bg-gray-50 text-gray-700";
            let borderClass = "border-gray-200";
            if (colorSource.includes('purple')) { bgClass = "bg-purple-50 text-purple-900"; borderClass = "border-purple-200"; }
            else if (colorSource.includes('green') && date.getDay() === 0) { bgClass = "bg-green-50 text-green-900"; borderClass = "border-green-200"; }
            else if (colorSource.includes('red')) { bgClass = "bg-red-50 text-red-900"; borderClass = "border-red-200"; }
            else if (colorSource.includes('white')) { bgClass = "bg-yellow-50 text-yellow-900"; borderClass = "border-yellow-200"; }
            // Tạo bản sao để tránh mutation - so sánh timestamp thay vì mutate date
            const dateCopy = new Date(date);
            dateCopy.setHours(0, 0, 0, 0);
            const todayCopy = new Date();
            todayCopy.setHours(0, 0, 0, 0);
            const isToday = (dateCopy.getTime() === todayCopy.getTime());
            if (isToday) bgClass += " today-highlight";
            dayEl.className = `calendar-day ${bgClass} ${borderClass}`;

            // Sử dụng dayLabel từ hàm core (đã được format sẵn)
            let html = `<span class="day-number">${d}</span>`;
            if (isOptionalMemorial) {
                html += `<span class="day-label ferial-label"><em>${dayInfo.dayLabelText}</em></span>`;
            } else if (dayInfo.dayLabel) {
                html += `<span class="day-label">${dayInfo.dayLabel}</span>`;
            }

            // Hiển thị lễ nhớ/commemorations (tránh lặp tên)
            let secondaryItems = [];
            const secondarySet = new Set();
            const maxSecondaryLen = 34;
            const shortenSecondaryName = (name) => {
                if (!name) return "";
                let s = name.replace(/^Thánh\s+/i, 'T. ')
                    .replace(/^Đức Mẹ\s+/i, 'ĐM. ')
                    .replace(/\s+/g, ' ')
                    .trim();
                const parenMatch = s.match(/\([^)]+\)\s*$/);
                const paren = parenMatch ? parenMatch[0].trim() : "";
                let base = s.replace(/\([^)]+\)\s*$/, '').trim();
                if (base.length > maxSecondaryLen) {
                    if (base.includes(',')) {
                        base = base.split(',')[0].trim();
                    } else if (base.includes('–')) {
                        base = base.split('–')[0].trim();
                    } else if (base.includes('-')) {
                        base = base.split('-')[0].trim();
                    }
                }
                let result = paren ? `${base} ${paren}`.trim() : base;
                if (result.length > maxSecondaryLen) {
                    const words = result.split(' ');
                    let clipped = "";
                    for (const w of words) {
                        const next = clipped ? `${clipped} ${w}` : w;
                        if (next.length > maxSecondaryLen) break;
                        clipped = next;
                    }
                    result = clipped ? `${clipped}...` : result.slice(0, maxSecondaryLen);
                }
                return result.trim();
            };
            const addSecondary = (name, opacity, marginTop) => {
                if (!name) return;
                const shortName = shortenSecondaryName(name);
                if (secondarySet.has(shortName)) return;
                secondarySet.add(shortName);
                secondaryItems.push({ text: shortName, opacity, marginTop });
            };

            // Lễ nhớ nếu không phải cử hành chính
            if (info.saints && info.saints.length > 0) {
                const firstSaint = info.saints[0];
                const isSaintPrimary = info.special === firstSaint.name ||
                    (info._winnerKey === 'SANCTORAL' && firstSaint.rank !== 'NHOKB');

                if (!isSaintPrimary && (firstSaint.rank === 'NHO' || firstSaint.rank === 'NHOKB')) {
                    addSecondary(firstSaint.name, 0.8, 2);
                }
            }

            // Commemorations
            if (info.commemorations && info.commemorations.length > 0) {
                info.commemorations.forEach(comm => {
                    const commName = typeof comm === 'string' ? comm : (comm.name || '');
                    addSecondary(commName, 0.7, 1);
                });
            }

            if (secondaryItems.length > 0) {
                const extraCount = secondaryItems.length - 1;
                const first = secondaryItems[0];
                const lineText = extraCount > 0 ? `${first.text} +${extraCount}` : first.text;
                html += `<span class="day-label secondary-saint" style="opacity: ${first.opacity}; display: block; margin-top: ${first.marginTop}px;">${lineText}</span>`;
            }

            // Hiển thị lịch âm (Âm lịch Việt Nam)
            if (dayInfo.lunar) {
                const lunar = dayInfo.lunar;
                const isFirstDay = lunar.day === 1;
                let lunarClass = "lunar-date";
                let lunarText = "";

                if (isFirstDay) {
                    // Ngày mùng 1: hiển thị cả tháng
                    lunarClass += " lunar-first-day lunar-full-month";
                    const monthName = lunar.leap ? `${lunar.month}N` : lunar.month;
                    lunarText = `1/${monthName}`;
                } else {
                    // Các ngày khác: chỉ hiển thị ngày
                    lunarText = lunar.day;
                }
                html += `<span class="${lunarClass}">${lunarText}</span>`;
            }

            // Hiển thị dấu chấm cho lễ trọng (cử hành chính hoặc bị dời)
            if (info.rankCode === "TRONG" || (info.transferred && info.rankCode === "TRONG")) {
                html += `<div class="saint-dot bg-red-500"></div>`;
            } else if (info.saints.length > 0 && info.saints[0].rank === "TRONG" && !info.transferred) {
                html += `<div class="saint-dot bg-red-500"></div>`;
            }

            dayEl.innerHTML = html;
            dayEl.onclick = () => openModal(date, info);

            // Gắn class để điều chỉnh line-clamp theo độ dài/độ nhiều nội dung
            if (secondaryItems.length > 0) {
                dayEl.classList.add('has-secondary');
            }
            const primaryText = (dayInfo.dayLabelText || "")
                .replace(/<[^>]*>/g, "")
                .replace(/\s+/g, " ")
                .trim();
            if (primaryText.length >= 34) {
                dayEl.classList.add('long-primary');
            }
            if (date.getDay() === 0) {
                dayEl.classList.add('is-sunday');
            }

            // Thêm tooltip events (hover và long-press)
            dayEl.addEventListener('mouseenter', (e) => {
                showTooltip(e, date, info, litData);
            });
            dayEl.addEventListener('mouseleave', () => {
                if (!tooltipShownByLongPress) {
                    hideTooltip();
                }
            });
            dayEl.addEventListener('touchstart', (e) => {
                handleLongPress(e, date, info, litData);
            });
            dayEl.addEventListener('touchend', (e) => {
                const wasLongPress = tooltipShownByLongPress;
                cancelLongPress();

                if (wasLongPress) {
                    // Nếu đã hiển thị bằng long-press, ngăn click event và giữ tooltip
                    e.preventDefault();
                    setTimeout(() => {
                        if (tooltipShownByLongPress) {
                            hideTooltip();
                            tooltipShownByLongPress = false;
                        }
                    }, 2000);
                } else {
                    // Nếu không phải long-press, ẩn tooltip ngay
                    hideTooltip();
                }
            });
            dayEl.addEventListener('touchmove', () => {
                cancelLongPress();
                if (!tooltipShownByLongPress) {
                    hideTooltip();
                }
            });

            daysGrid.appendChild(dayEl);
        }
        // Bổ sung ô trống để tháng luôn đủ 6 hàng (42 ô)
        const totalCells = firstDayOfMonth + daysInMonth;
        for (let i = totalCells; i < 42; i++) {
            daysGrid.appendChild(document.createElement('div'));
        }
        monthDiv.appendChild(daysGrid);
        grid.appendChild(monthDiv);
    }

    // Log performance
    const endTime = performance.now();
    console.log(`⚡ Render calendar ${currentYear}: ${(endTime - startTime).toFixed(2)}ms`);
}

function openModal(date, info) {
    const modal = document.getElementById('dayModal');
    const modalYear = date.getFullYear();
    const litData = getLiturgicalData(modalYear);

    // Dùng hàm core để lấy toàn bộ thông tin phụng vụ
    // Nếu info đã được truyền vào, vẫn dùng hàm core để đảm bảo tính nhất quán
    const dayInfo = getDayLiturgicalInfo(date, litData);

    // Lấy các thông tin từ dayInfo
    const code = dayInfo.dayCode;
    const sanctoralCode = dayInfo.sanctoralCode;
    const specialCode = dayInfo.specialCode;
    const cycle = dayInfo.cycle;
    const weekdayCycle = dayInfo.weekdayCycle;
    const detailedWeek = dayInfo.detailedWeek;
    const seasonalCodeForReadings = String(code).startsWith('7')
        ? getLiturgicalDayCode(date, litData, { includeSanctoral: false })
        : code;

    // Sử dụng info từ dayInfo (đảm bảo tính nhất quán)
    const infoFromCore = dayInfo.info;
    const dayName = DAYS_FULL_VI[date.getDay()];

    // ============================================================================
    // HEADER - Ngày tháng và cử hành chính
    // ============================================================================

    // Ngày dương lịch
    const modalDate = document.getElementById('modalDate');
    const modalDayOfWeek = document.getElementById('modalDayOfWeek');
    if (modalDate) modalDate.innerText = `${date.getDate()} tháng ${date.getMonth() + 1}, ${modalYear}`;
    if (modalDayOfWeek) modalDayOfWeek.innerText = dayName;

    // Ngày âm lịch
    if (dayInfo.lunar) {
        const lunar = dayInfo.lunar;
        const lunarMonthName = LUNAR_CALENDAR.getLunarMonthName(lunar.month, lunar.leap);
        const modalLunarDate = document.getElementById('modalLunarDate');
        if (modalLunarDate) modalLunarDate.innerText = `${lunar.day}/${lunar.month}${lunar.leap ? ' nhuận' : ''} (${lunarMonthName})`;
    }

    // Màu header theo mùa
    const header = document.getElementById('modalHeader');
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        // Dark mode: nền tối mềm
        if (infoFromCore.color.includes('green')) header.style.background = 'linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(16, 185, 129, 0.12) 100%)';
        else if (infoFromCore.color.includes('purple')) header.style.background = 'linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(139, 92, 246, 0.12) 100%)';
        else if (infoFromCore.color.includes('red')) header.style.background = 'linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(239, 68, 68, 0.12) 100%)';
        else header.style.background = 'linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(217, 119, 6, 0.12) 100%)';
    } else {
        // Light mode: nền sáng
        if (infoFromCore.color.includes('green')) header.style.background = 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)';
        else if (infoFromCore.color.includes('purple')) header.style.background = 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)';
        else if (infoFromCore.color.includes('red')) header.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)';
        else header.style.background = 'linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)';
    }

    // === 1. CỬ HÀNH CHÍNH (Title + Rank + Color) ===
    let celebrationTitle = "";
    let rankCode = infoFromCore.rankCode;

    if (infoFromCore.special) {
        celebrationTitle = infoFromCore.special;
    } else if (infoFromCore.isTet) {
        const tetEvent = getTetEvent(date);
        celebrationTitle = tetEvent?.fullName || tetEvent?.name || "Tết Nguyên Đán";
        rankCode = 'TRONG';
    } else if (infoFromCore.saints.length > 0 && ['S', 'F'].includes(infoFromCore.saints[0].type)) {
        celebrationTitle = infoFromCore.saints[0].name;
        rankCode = infoFromCore.saints[0].rank;
    } else {
        celebrationTitle = `${dayName} ${detailedWeek}`;
        if (date.getDay() === 0) rankCode = 'CN';
    }

    // Kiểm tra lễ vọng từ dayInfo
    const hasVigil = dayInfo.vigilInfo && dayInfo.vigilInfo.hasVigil;

    const modalCelebrationTitle = document.getElementById('modalCelebrationTitle');
    const modalCelebrationSubtitle = document.getElementById('modalCelebrationSubtitle');
    // Chỉ set innerText nếu không có lễ vọng (sẽ được cập nhật với innerHTML sau)
    if (!hasVigil) {
        if (modalCelebrationTitle) modalCelebrationTitle.innerText = celebrationTitle;
        if (modalCelebrationSubtitle) {
            modalCelebrationSubtitle.innerHTML = "";
            modalCelebrationSubtitle.innerText = "";
            modalCelebrationSubtitle.classList.add('hidden');
        }
    }

    // Color indicator
    const colorIndicator = document.getElementById('modalColorIndicator');
    colorIndicator.className = `w-4 h-4 rounded-full border-2 border-white shadow ${infoFromCore.color}`;

    // Rank badge
    const badgeEl = document.getElementById('modalRankBadge');
    if (rankCode && rankCode !== 'NGAY_THUONG') {
        badgeEl.innerText = getRankDisplayName(rankCode);
        badgeEl.className = `text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded ${getRankBadgeClass(rankCode)}`;
    } else {
        badgeEl.className = "hidden";
    }

    // === 2. MÙA VÀ TUẦN + Chu kỳ bài đọc ===
    const seasonBadge = document.getElementById('modalSeasonBadge');
    let seasonIcon = "📅";
    let seasonClass = "bg-gray-100 text-gray-700";
    if (infoFromCore.season === "Mùa Vọng") { seasonIcon = "🕯️"; seasonClass = "season-advent"; }
    else if (infoFromCore.season === "Mùa Giáng Sinh") { seasonIcon = "⭐"; seasonClass = "season-christmas"; }
    else if (infoFromCore.season === "Mùa Chay") { seasonIcon = "✝️"; seasonClass = "season-lent"; }
    else if (infoFromCore.season === "Mùa Phục Sinh") { seasonIcon = "🕊️"; seasonClass = "season-easter"; }
    else if (infoFromCore.season === "Mùa Thường Niên") { seasonIcon = "🌿"; seasonClass = "season-ordinary"; }

    seasonBadge.innerHTML = `${seasonIcon} ${detailedWeek}`;
    seasonBadge.className = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${seasonClass}`;

    const modalCode = document.getElementById('modalCode');
    const modalYearCycle = document.getElementById('modalYearCycle');
    if (modalCode) {
        modalCode.innerText = code;
        modalCode.classList.add('hidden');
    }
    if (modalYearCycle) modalYearCycle.innerText = `Năm ${cycle}`;

    // Weekday cycle (chỉ cho Mùa Thường Niên ngày thường)
    const weekdayCycleEl = document.getElementById('modalWeekdayCycle');
    if (infoFromCore.season === "Mùa Thường Niên" && date.getDay() !== 0) {
        weekdayCycleEl.innerText = weekdayCycle === "1" ? "Năm lẻ" : "Năm chẵn";
        weekdayCycleEl.classList.remove('hidden');
    } else {
        weekdayCycleEl.classList.add('hidden');
    }

    // === 5. GHI CHÚ KỶ LUẬT PHỤNG VỤ ===
    const disciplines = getLiturgicalDiscipline(date, litData);
    const disciplineSection = document.getElementById('modalDisciplineSection');
    const disciplineContent = document.getElementById('modalDisciplineContent');
    const obligationBadge = document.getElementById('modalObligationBadge');
    const hasObligation = disciplines.some(d => d.type === 'obligation');
    if (obligationBadge) {
        if (hasObligation) {
            obligationBadge.classList.remove('hidden');
        } else {
            obligationBadge.classList.add('hidden');
        }
    }
    const disciplinesForSection = disciplines.filter(d => d.type !== 'obligation');
    if (disciplinesForSection.length > 0) {
        disciplineSection.classList.remove('hidden');
        disciplineContent.innerHTML = disciplinesForSection.map(d =>
            `<span class="discipline-tag ${d.class}">${d.icon} ${d.label}</span>`
        ).join('');
    } else {
        disciplineSection.classList.add('hidden');
    }

    // === TẾT SECTION ===
    const tetSection = document.getElementById('modalTetSection');
    const tetContent = document.getElementById('modalTetContent');
    if (infoFromCore.isTet || infoFromCore.tetEvent) {
        tetSection.classList.remove('hidden');
        const tetInfo = infoFromCore.isTet ? getTetEvent(date) : infoFromCore.tetEvent;
        if (tetInfo) {
            let tetHtml = `<p class="font-bold text-lg mb-1">${tetInfo.fullName || tetInfo.name}</p>`;
            if (infoFromCore.tetNote) {
                tetHtml += `<p class="text-sm opacity-80">${infoFromCore.tetNote}</p>`;
            }
            tetContent.innerHTML = tetHtml;
        }
    } else {
        tetSection.classList.add('hidden');
    }

    // === ASH WEDNESDAY TRANSFER SECTION ===
    const ashSection = document.getElementById('modalAshWednesdaySection');
    const ashContent = document.getElementById('modalAshWednesdayContent');
    if (ashSection && ashContent) {
        if (infoFromCore.ashWednesdayNote) {
            ashSection.classList.remove('hidden');
            let ashHtml = infoFromCore.isTransferredAshWednesday
                ? `<p class="font-bold text-lg mb-1">Cử hành Lễ Tro (Dời)</p>`
                : `<p class="font-bold text-lg mb-1">Bắt đầu Mùa Chay</p>`;
            ashHtml += `<p class="text-sm opacity-90">${infoFromCore.ashWednesdayNote}</p>`;
            ashContent.innerHTML = ashHtml;
        } else {
            ashSection.classList.add('hidden');
        }
    }

    // === 3. CÁC CỬ HÀNH PHỤ ===
    const secondarySection = document.getElementById('modalSecondaryCelebrations');
    const secondaryContent = document.getElementById('modalSecondaryContent');
    const secondaryCelebrations = [];
    const secondarySeen = new Set();
    const primaryNameForSecondary = (infoFromCore.special || "").trim();
    const addSecondary = (item) => {
        if (!item || !item.name) return;
        const normalized = item.name.trim().toLowerCase();
        if (!normalized) return;
        if (primaryNameForSecondary && normalized === primaryNameForSecondary.toLowerCase()) return;
        if (secondarySeen.has(normalized)) return;
        secondarySeen.add(normalized);
        secondaryCelebrations.push(item);
    };

    // Thu thập cử hành phụ từ saints và commemorations
    if (infoFromCore.saints.length > 0) {
        infoFromCore.saints.forEach((s, idx) => {
            if (idx > 0 || (!['S', 'F'].includes(s.type) && !infoFromCore.special)) {
                addSecondary({
                    name: s.name,
                    rank: s.rank,
                    type: s.type === 'O' ? 'optional' : 'commemoration'
                });
            }
        });
    }
    if (infoFromCore.commemorations && infoFromCore.commemorations.length > 0) {
        infoFromCore.commemorations.forEach(c => {
            const name = (c.special || c.name || c.key || 'Không rõ');
            addSecondary({
                name,
                type: 'commemoration'
            });
        });
    }

    if (secondaryCelebrations.length > 0 && secondarySection && secondaryContent) {
        secondarySection.classList.remove('hidden');
        secondaryContent.innerHTML = secondaryCelebrations.map(c => `
            <div class="secondary-celebration ${c.type}">
                <span class="flex-1 text-sm font-medium text-gray-800">${c.name}</span>
                ${c.rank ? `<span class="text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded ${getRankBadgeClass(c.rank)}">${getRankDisplayName(c.rank)}</span>` : ''}
            </div>
        `).join('');
        // Tránh trùng lặp với khối "Lịch các thánh hôm nay"
        const saintSection = document.getElementById('modalSaintSection');
        if (saintSection) saintSection.classList.add('hidden');
    } else if (secondarySection) {
        secondarySection.classList.add('hidden');
    }
    if (!hasVigil && modalCelebrationSubtitle) {
        modalCelebrationSubtitle.innerHTML = "";
        modalCelebrationSubtitle.innerText = "";
        modalCelebrationSubtitle.classList.add('hidden');
    }

    // === 4. BÀI ĐỌC ===
    // Kiểm tra lễ vọng từ dayInfo
    const vigilInfo = dayInfo.vigilInfo;
    const vigilEveInfo = dayInfo.vigilEveInfo;
    const vigilInfoForReadings = vigilInfo || vigilEveInfo;

    // Tìm summary từ READINGS_DATA
    let seasonalSummary = READINGS_DATA.find(r => {
        if (r.code != seasonalCodeForReadings) return false;
        if (date.getDay() === 0) return r.year === cycle;
        return r.year === weekdayCycle || r.year === "0";
    });
    let sanctoralSummary = READINGS_DATA.find(r => r.code == sanctoralCode);
    let specialSummary = READINGS_DATA.find(r => r.code == specialCode);
    // Dùng tetCode từ dayInfo (đã có sẵn từ hàm core)
    const tetCode = dayInfo.tetCode;
    let tetSummary = tetCode ? READINGS_DATA.find(r => r.code == tetCode && r.year === "0") : null;

    // Tìm summary cho lễ vọng (nếu có)
    let vigilSummary = null;
    if (vigilInfoForReadings && vigilInfoForReadings.vigilCode) {
        vigilSummary = READINGS_DATA.find(r => {
            if (r.code != vigilInfoForReadings.vigilCode) return false;
            return r.year === cycle || r.year === "0";
        });
    }

    // Lấy dữ liệu bài đọc đầy đủ (bao gồm lễ vọng)
    const allReadings = getFullReadings(seasonalCodeForReadings, sanctoralCode, specialCode, date.getDay(), cycle, weekdayCycle, tetCode, vigilInfoForReadings);
    let seasonalFullData = allReadings.find(i => i.type === 'seasonal')?.data;
    const sanctoralFullData = allReadings.find(i => i.type === 'sanctoral')?.data;
    const specialFullData = allReadings.find(i => i.type === 'special')?.data;
    const tetFullData = allReadings.find(i => i.type === 'tet')?.data;
    const vigilFullData = allReadings.find(i => i.type === 'vigil')?.data;
    const vigilFullInfo = allReadings.find(i => i.type === 'vigil')?.vigilInfo;

    const hasFullText = (d) => {
        if (!d) return false;
        if (d.options && Array.isArray(d.options)) {
            return d.options.some(opt => {
                const optData = opt?.data;
                return Boolean(optData?.firstReading?.content || optData?.gospel?.content || (optData?.psalms?.verses && optData.psalms.verses.length > 0));
            });
        }
        return Boolean(d.firstReading?.content || d.gospel?.content || (d.psalms?.verses && d.psalms.verses.length > 0));
    };

    // === ĐẶC BIỆT: Lễ Hiển Linh (2030) - ưu tiên bản văn đầy đủ từ Sunday.js (6000)
    if (seasonalCodeForReadings === "2030" && (!seasonalFullData || !hasFullText(seasonalFullData))) {
        if (typeof READINGS_SUNDAY !== 'undefined' && READINGS_SUNDAY["6000"]) {
            seasonalFullData = READINGS_SUNDAY["6000"][cycle] || READINGS_SUNDAY["6000"];
        }
    }

    // === Fallback: Nếu chỉ có trích dẫn, ưu tiên bản văn đầy đủ trong SaintsBible.js (READINGS_SPECIAL)
    if ((!seasonalFullData || !hasFullText(seasonalFullData)) && !(seasonalFullData && seasonalFullData.options)) {
        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[seasonalCodeForReadings]) {
            seasonalFullData = READINGS_SPECIAL[seasonalCodeForReadings];
        }
    }

    // === ĐẶC BIỆT: Lễ Giáng Sinh (25/12) - hiển thị đủ 3 lựa chọn (Đêm/Rạng Đông/Ban Ngày)
    const isChristmasDay = date.getMonth() === 11 && date.getDate() === 25;
    const isChristmasEve = date.getMonth() === 11 && date.getDate() === 24;
    if (isChristmasDay && typeof READINGS_DATA !== 'undefined') {
        const christmasOptions = [];
        const variants = [
            { year: "D", label: "Lễ Đêm" },
            { year: "B", label: "Lễ Rạng Đông" },
            { year: "R", label: "Lễ Ban Ngày" }
        ];
        variants.forEach(v => {
            const summary = READINGS_DATA.find(r => r.code == 22512 && r.year === v.year);
            if (!summary) return;
            let data = {
                firstReading: summary.reading1 ? { excerpt: summary.reading1 } : null,
                psalms: summary.psalm ? { excerpt: summary.psalm } : null,
                secondReading: summary.reading2 ? { excerpt: summary.reading2 } : null,
                gospel: summary.gospel ? { excerpt: summary.gospel } : null,
                reading1: summary.reading1,
                psalm: summary.psalm,
                reading2: summary.reading2,
                gospel: summary.gospel
            };
            // Nếu có bản văn đầy đủ trong SaintsBible.js, ưu tiên dùng theo từng lễ (Đêm/Rạng Đông/Ngày)
            if (typeof READINGS_SPECIAL !== 'undefined') {
                const fullKey = `22512${v.year}`; // 22512D / 22512B / 22512R
                if (READINGS_SPECIAL[fullKey]) {
                    data = READINGS_SPECIAL[fullKey];
                } else if (v.year === "B" && READINGS_SPECIAL["22512"]) {
                    // Fallback cho lễ Rạng Đông (đang lưu sẵn dưới key 22512)
                    data = READINGS_SPECIAL["22512"];
                }
            }
            christmasOptions.push({ label: v.label, data });
        });
        if (christmasOptions.length > 0) {
            seasonalFullData = { options: christmasOptions };
            if (!seasonalSummary) {
                seasonalSummary = READINGS_DATA.find(r => r.code == 22512 && r.year === "R") ||
                    READINGS_DATA.find(r => r.code == 22512 && r.year === "B") ||
                    READINGS_DATA.find(r => r.code == 22512 && r.year === "D");
            }
        }
    }

    // === ĐẶC BIỆT: Ngày 24/12 - Ban sáng (Mùa Vọng ngày 24/12) + Ban chiều (Lễ Vọng Giáng Sinh)
    if (isChristmasEve) {
        const eveOptions = [];
        // 1) Ban sáng: Mùa Vọng ngày 24/12 (22412)
        let morningData = null;
        if (typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL["22412"]) {
            morningData = READINGS_SEASONAL["22412"];
        } else if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL["22412"]) {
            morningData = READINGS_SPECIAL["22412"];
        } else if (typeof READINGS_DATA !== 'undefined') {
            const morningSummary = READINGS_DATA.find(r => r.code == 22412 && r.year === "0");
            if (morningSummary) {
                morningData = {
                    firstReading: morningSummary.reading1 ? { excerpt: morningSummary.reading1 } : null,
                    psalms: morningSummary.psalm ? { excerpt: morningSummary.psalm } : null,
                    secondReading: morningSummary.reading2 ? { excerpt: morningSummary.reading2 } : null,
                    gospel: morningSummary.gospel ? { excerpt: morningSummary.gospel } : null,
                    reading1: morningSummary.reading1,
                    psalm: morningSummary.psalm,
                    reading2: morningSummary.reading2,
                    gospel: morningSummary.gospel
                };
            }
        }
        if (morningData) {
            eveOptions.push({ label: "Mùa Vọng ngày 24/12 (ban sáng)", data: morningData });
        }

        // 2) Ban chiều: Lễ Vọng Giáng Sinh (224122)
        let vigilData = null;
        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL["224122"]) {
            vigilData = READINGS_SPECIAL["224122"];
        } else if (typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL["224122"]) {
            vigilData = READINGS_SEASONAL["224122"];
        } else if (typeof READINGS_DATA !== 'undefined') {
            const vigilSummary = READINGS_DATA.find(r => r.code == 224122);
            if (vigilSummary) {
                vigilData = {
                    firstReading: vigilSummary.reading1 ? { excerpt: vigilSummary.reading1 } : null,
                    psalms: vigilSummary.psalm ? { excerpt: vigilSummary.psalm } : null,
                    secondReading: vigilSummary.reading2 ? { excerpt: vigilSummary.reading2 } : null,
                    gospel: vigilSummary.gospel ? { excerpt: vigilSummary.gospel } : null,
                    reading1: vigilSummary.reading1,
                    psalm: vigilSummary.psalm,
                    reading2: vigilSummary.reading2,
                    gospel: vigilSummary.gospel
                };
            }
        }
        if (vigilData) {
            eveOptions.push({ label: "Lễ Vọng Giáng Sinh (ban chiều)", data: vigilData });
        }

        if (eveOptions.length > 0) {
            seasonalFullData = { options: eveOptions };
            if (!seasonalSummary && typeof READINGS_DATA !== 'undefined') {
                seasonalSummary = READINGS_DATA.find(r => r.code == 22412 && r.year === "0");
            }
        }
    }

    // === CẬP NHẬT HIỂN THỊ LỄ VỌNG (nếu có) ===
    if (vigilInfoForReadings && vigilInfoForReadings.hasVigil && !isChristmasDay) {
        const modalCelebrationTitle = document.getElementById('modalCelebrationTitle');
        const modalCelebrationSubtitle = document.getElementById('modalCelebrationSubtitle');

        // Lấy tên bài đọc cho lễ chính
        const mainFeastCode = vigilInfoForReadings.mainFeastCode || code;
        let mainFeastReadings = null;

        // Tìm trong READINGS_SUNDAY trước (cho Chúa Nhật)
        if (date.getDay() === 0 && typeof READINGS_SUNDAY !== 'undefined' && READINGS_SUNDAY[mainFeastCode]) {
            const mainFeastData = READINGS_SUNDAY[mainFeastCode][cycle] || READINGS_SUNDAY[mainFeastCode];
            if (mainFeastData) {
                mainFeastReadings = {
                    reading1: mainFeastData.firstReading?.excerpt || '—',
                    psalm: mainFeastData.psalms?.excerpt || '—',
                    reading2: mainFeastData.secondReading?.excerpt || '—',
                    gospel: mainFeastData.gospel?.excerpt || '—'
                };
            }
        }

        // Fallback: tìm trong READINGS_DATA
        if (!mainFeastReadings) {
            const mainFeastSummary = READINGS_DATA.find(r => {
                if (r.code != mainFeastCode) return false;
                if (date.getDay() === 0) return r.year === cycle;
                return r.year === weekdayCycle || r.year === "0";
            });
            if (mainFeastSummary) {
                mainFeastReadings = {
                    reading1: mainFeastSummary.reading1 || '—',
                    psalm: mainFeastSummary.psalm || '—',
                    reading2: mainFeastSummary.reading2 || '—',
                    gospel: mainFeastSummary.gospel || '—'
                };
            }
        }

        // Fallback: lấy từ seasonalFullData nếu có
        if (!mainFeastReadings && seasonalFullData) {
            mainFeastReadings = {
                reading1: seasonalFullData.firstReading?.excerpt || seasonalFullData.reading1 || '—',
                psalm: seasonalFullData.psalms?.excerpt || seasonalFullData.psalm || '—',
                reading2: seasonalFullData.secondReading?.excerpt || seasonalFullData.reading2 || '—',
                gospel: seasonalFullData.gospel?.excerpt || seasonalFullData.gospel || '—'
            };
        }

        // Lấy tên bài đọc cho lễ vọng
        let vigilReadings = null;
        if (vigilSummary) {
            vigilReadings = {
                reading1: vigilSummary.reading1 || '—',
                psalm: vigilSummary.psalm || '—',
                reading2: vigilSummary.reading2 || '—',
                gospel: vigilSummary.gospel || '—'
            };
        } else if (vigilFullData) {
            vigilReadings = {
                reading1: vigilFullData.firstReading?.excerpt || vigilFullData.reading1 || '—',
                psalm: vigilFullData.psalms?.excerpt || vigilFullData.psalm || '—',
                reading2: vigilFullData.secondReading?.excerpt || vigilFullData.reading2 || '—',
                gospel: vigilFullData.gospel?.excerpt || vigilFullData.gospel || '—'
            };
        }

        // Hiển thị lễ chính (không hiển thị bài đọc ở đây, sẽ hiển thị trong tabs)
        if (modalCelebrationTitle) {
            const mainFeastName = vigilInfoForReadings.mainFeastName || celebrationTitle;
            modalCelebrationTitle.innerHTML = `
                <div class="font-bold text-lg mb-1">${mainFeastName}</div>
            `;
        }

        // Hiển thị lễ vọng (chỉ tên, không hiển thị bài đọc ở đây)
        if (modalCelebrationSubtitle) {
            modalCelebrationSubtitle.classList.remove('hidden');
            modalCelebrationSubtitle.innerHTML = `
                <div class="font-semibold text-base mb-1 text-purple-700">${vigilInfoForReadings.vigilName}</div>
                <div class="text-xs text-gray-500 italic">Bài đọc có thể chọn trong phần "BÀI ĐỌC THÁNH LỄ" bên dưới</div>
            `;
        }
    }

    // ============================================================================
    // ĐẶC BIỆT: Lễ Các Thánh Tử Đạo Việt Nam (di động, _forceSanctoralKey = 72411)
    // Lễ này là lễ trọng di động, khi rơi vào CN thì:
    //   - Tab ưu tiên: "Các Thánh Tử Đạo VN" (sanctoral 72411)
    //   - Tab phụ: "Chúa Nhật TN" (seasonal - bài đọc CN gốc)
    //   - Không hiện thánh cố định ngày hôm đó (bị đè bởi lễ trọng)
    // ============================================================================
    const isVietnameseMartyrs = infoFromCore._forceSanctoralReadings && infoFromCore._forceSanctoralKey === "72411";

    // Nếu là Lễ Tử Đạo VN, cần lấy lại bài đọc seasonal gốc (CN TN) vì sanctoralCode đã bị đổi
    let originalSeasonalSummary = seasonalSummary;
    let originalSeasonalFullData = seasonalFullData;
    if (isVietnameseMartyrs) {
        // Lấy mã seasonal gốc (không bị đổi bởi sanctoral)
        const originalSeasonalCode = getLiturgicalDayCode(date, litData, { includeSanctoral: false });
        if (originalSeasonalCode !== seasonalCodeForReadings) {
            originalSeasonalSummary = READINGS_DATA.find(r => {
                if (r.code != originalSeasonalCode) return false;
                if (date.getDay() === 0) return r.year === cycle;
                return r.year === weekdayCycle || r.year === "0";
            });
            // Lấy full data từ Sunday.js cho CN
            if (date.getDay() === 0 && typeof READINGS_SUNDAY !== 'undefined') {
                const sundayCode = originalSeasonalCode;
                if (READINGS_SUNDAY[sundayCode]) {
                    originalSeasonalFullData = READINGS_SUNDAY[sundayCode][cycle] || READINGS_SUNDAY[sundayCode];
                }
            }
        }
        // Gán lại seasonal data gốc cho tab "Mùa phụng vụ"
        seasonalSummary = originalSeasonalSummary;
        seasonalFullData = originalSeasonalFullData;
    }

    // ============================================================================
    // XÁC ĐỊNH NGUỒN BÀI ĐỌC MẶC ĐỊNH DỰA TRÊN BẬC LỄ (Precedence)
    // ============================================================================

    // Xác định nguồn bài đọc nên được load mặc định
    let defaultReadingSource = 'seasonal'; // Mặc định là Mùa phụng vụ
    let defaultLabel = 'Mùa Phụng Vụ';

    // 1. Tết có ưu tiên cao nhất (nếu đang cử hành Tết)
    if (infoFromCore.isTet && tetFullData) {
        defaultReadingSource = 'tet';
        defaultLabel = 'Thánh Lễ Tết';
    }
    // 2. Ép bài đọc riêng cho các lễ trọng có bài đọc đặc thù (St Joseph, Truyền Tin, Vô Nhiễm...)
    else if (infoFromCore._forceSanctoralReadings && (sanctoralFullData || sanctoralSummary)) {
        defaultReadingSource = 'sanctoral';
        defaultLabel = infoFromCore.special || (infoFromCore.saints[0]?.name || 'Lễ Trọng');
    }
    // 3. Lễ Vọng (nếu có bài đọc riêng) - ưu tiên cao trên ngày VỌNG
    else if (vigilInfoForReadings && vigilInfoForReadings.hasVigil && (vigilSummary || vigilFullData) && vigilEveInfo) {
        defaultReadingSource = 'vigil';
        defaultLabel = vigilInfoForReadings.vigilName || 'Lễ Vọng';
    }
    // 4. Kiểm tra _winnerKey từ Precedence Engine
    else if (infoFromCore._winnerKey === 'SANCTORAL' && sanctoralFullData) {
        defaultReadingSource = 'sanctoral';
        defaultLabel = infoFromCore.saints.length > 0 ? infoFromCore.saints[0].name : 'Lễ Kính Thánh';
    }
    // 5. Lễ Trọng/Kính/Nhớ của thánh (S/F/M type) - bao gồm cả lễ nhớ
    else if (infoFromCore.saints.length > 0 && ['S', 'F', 'M'].includes(infoFromCore.saints[0].type) && sanctoralFullData) {
        defaultReadingSource = 'sanctoral';
        defaultLabel = infoFromCore.saints[0].name;
    }
    // 5b. Lễ Nhớ (NHO/NHOKB) - nếu có sanctoralFullData, ưu tiên hiển thị
    else if (infoFromCore.saints.length > 0 && (infoFromCore.saints[0].rank === 'NHO' || infoFromCore.saints[0].rank === 'NHOKB') && sanctoralFullData) {
        defaultReadingSource = 'sanctoral';
        defaultLabel = infoFromCore.saints[0].name;
    }
    // 6. Special feast codes (8441, 5001, 5002, 5003, 5004) - ưu tiên khi là lễ chính
    else if (seasonalFullData && ['8441', '5001', '5002', '5003', '5004'].includes(code)) {
        // Code đặc biệt đã được tìm thấy trong seasonalFullData (từ READINGS_SPECIAL hoặc READINGS_DATA)
        defaultReadingSource = 'seasonal';
        // Sử dụng infoFromCore.special nếu có và khớp với tên lễ đặc biệt, nếu không thì dùng tên từ code
        const specialNames = {
            '8441': ['Trái Tim Vô Nhiễm Mẹ', 'Trái Tim Vô Nhiễm'],
            '5001': ['CHÚA THÁNH THẦN HIỆN XUỐNG', 'Hiện Xuống'],
            '5002': ['CHÚA BA NGÔI', 'Ba Ngôi'],
            '5003': ['MÌNH VÀ MÁU THÁNH CHÚA KITÔ', 'Mình Máu Thánh'],
            '5004': ['THÁNH TÂM CHÚA GIÊSU', 'Thánh Tâm']
        };
        const specialFullNames = {
            '8441': 'Trái Tim Vô Nhiễm Mẹ Maria',
            '5001': 'CHÚA THÁNH THẦN HIỆN XUỐNG',
            '5002': 'CHÚA BA NGÔI',
            '5003': 'MÌNH VÀ MÁU THÁNH CHÚA KITÔ',
            '5004': 'THÁNH TÂM CHÚA GIÊSU'
        };
        const expectedNames = specialNames[code] || [];
        // Kiểm tra xem infoFromCore.special có chứa một trong các tên khớp không
        const matches = infoFromCore.special && expectedNames.some(name =>
            infoFromCore.special.includes(name) || name.includes(infoFromCore.special)
        );
        if (matches) {
            defaultLabel = infoFromCore.special;
        } else {
            // Fallback: lấy tên từ code
            defaultLabel = specialFullNames[code] || 'Lễ Đặc Biệt';
        }
    }
    // 7. Special feast (nếu có và ưu tiên)
    else if (specialFullData && infoFromCore.special) {
        defaultReadingSource = 'special';
        defaultLabel = 'Lễ Riêng';
    }

    // === ÉP CHỈ HIỂN THỊ OPTIONS (Giáng Sinh 25/12) hoặc 24/12 (sáng + vọng)
    const limitToSeasonalOptions = isChristmasDay || isChristmasEve;
    if (limitToSeasonalOptions) {
        defaultReadingSource = 'seasonal';
        defaultLabel = isChristmasDay ? 'Lễ Giáng Sinh' : 'Ngày 24/12';
    }

    // Tạo tabs chọn nguồn bài đọc
    const readingTabs = document.getElementById('modalReadingTabs');
    let tabsHtml = "";

    // Tab Seasonal (hoặc Special Feast nếu code là 8441, 5001-5004)
    const isSeasonalActive = defaultReadingSource === 'seasonal';
    // Kiểm tra xem có phải là lễ đặc biệt không (code 8441, 5001-5004)
    const isSpecialFeastCode = ['8441', '5001', '5002', '5003', '5004'].includes(seasonalCodeForReadings);
    const seasonalTabLabel = limitToSeasonalOptions
        ? (isChristmasDay ? 'Lễ Giáng Sinh' : 'Ngày 24/12')
        : ((isSpecialFeastCode && defaultLabel !== 'Mùa Phụng Vụ') ? defaultLabel : 'Mùa phụng vụ');
    tabsHtml += `<button id="btn-seasonal" class="reading-tab tab-seasonal ${isSeasonalActive ? 'active' : ''}">
        <i class="fas fa-leaf text-green-600"></i> ${seasonalTabLabel}
        ${isSeasonalActive ? '<span class="ml-1 text-[0.6rem] bg-green-100 text-green-700 px-1.5 rounded">Đang dùng</span>' : ''}
    </button>`;

    // Tab Vigil (nếu có lễ vọng với bài đọc riêng)
    if (!limitToSeasonalOptions && vigilInfoForReadings && vigilInfoForReadings.hasVigil && (vigilSummary || vigilFullData)) {
        const isVigilActive = defaultReadingSource === 'vigil';
        const vigilName = vigilInfoForReadings.vigilName || 'Lễ Vọng';
        tabsHtml += `<button id="btn-vigil" class="reading-tab tab-vigil ${isVigilActive ? 'active' : ''}">
            <i class="fas fa-moon text-purple-600"></i> ${vigilName.length > 25 ? 'Lễ Vọng' : vigilName}
            ${isVigilActive ? '<span class="ml-1 text-[0.6rem] bg-purple-100 text-purple-700 px-1.5 rounded">Đang dùng</span>' : ''}
        </button>`;
    }

    // Tab Sanctoral (nếu có) - bao gồm cả lễ nhớ
    if (!limitToSeasonalOptions && (sanctoralSummary || sanctoralFullData)) {
        const isSanctoralActive = defaultReadingSource === 'sanctoral';
        // Ưu tiên tên lễ từ _forceSanctoralReadings (cho lễ di động như Tử Đạo VN)
        const saintName = (infoFromCore._forceSanctoralReadings && infoFromCore.special)
            ? infoFromCore.special
            : (infoFromCore.saints.length > 0 ? infoFromCore.saints[0].name : 'Lễ kính');
        // Rút ngắn tên nếu quá dài
        const displayName = saintName.length > 25 ?
            (saintName.includes('và') ? saintName.split('và')[0].trim() + '...' : saintName.substring(0, 22) + '...') :
            saintName;
        tabsHtml += `<button id="btn-sanctoral" class="reading-tab tab-sanctoral ${isSanctoralActive ? 'active' : ''}">
            <i class="fas fa-cross text-red-600"></i> ${displayName}
            ${isSanctoralActive ? '<span class="ml-1 text-[0.6rem] bg-red-100 text-red-700 px-1.5 rounded">Đang dùng</span>' : ''}
        </button>`;
    }

    // Tab Special (nếu có)
    if (!limitToSeasonalOptions && (specialSummary || specialFullData)) {
        const isSpecialActive = defaultReadingSource === 'special';
        tabsHtml += `<button id="btn-special" class="reading-tab tab-special ${isSpecialActive ? 'active' : ''}">
            <i class="fas fa-star text-purple-600"></i> Lễ riêng
            ${isSpecialActive ? '<span class="ml-1 text-[0.6rem] bg-purple-100 text-purple-700 px-1.5 rounded">Đang dùng</span>' : ''}
        </button>`;
    }

    // Tab Tết (nếu có)
    if (!limitToSeasonalOptions && (tetSummary || tetFullData) && infoFromCore.isTet) {
        const isTetActive = defaultReadingSource === 'tet';
        tabsHtml += `<button id="btn-tet" class="reading-tab tab-tet ${isTetActive ? 'active' : ''}">
            <i class="fas fa-gift text-orange-600"></i> Thánh lễ Tết
            ${isTetActive ? '<span class="ml-1 text-[0.6rem] bg-orange-100 text-orange-700 px-1.5 rounded">Đang dùng</span>' : ''}
        </button>`;
    }

    readingTabs.innerHTML = tabsHtml;

    // Hiển thị tham chiếu bài đọc
    const refsSection = document.getElementById('modalReadingRefs');
    const updateReadingRefs = (summary) => {
        if (summary && refsSection) {
            refsSection.classList.remove('hidden');
            const refReading1 = document.getElementById('refReading1');
            const refPsalm = document.getElementById('refPsalm');
            const refReading2 = document.getElementById('refReading2');
            const refGospel = document.getElementById('refGospel');
            if (refReading1) refReading1.innerText = summary.reading1 || '—';
            if (refPsalm) refPsalm.innerText = summary.psalm || '—';
            if (refReading2) refReading2.innerText = summary.reading2 || '—';
            if (refGospel) refGospel.innerText = summary.gospel || '—';
        } else if (refsSection) {
            refsSection.classList.add('hidden');
        }
    };

    // Setup click handlers cho tabs
    const setupTabClick = (id, data, type, summary, labelText) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onclick = () => {
                // Xóa trạng thái active và label "Đang dùng" của tất cả tabs
                document.querySelectorAll('.reading-tab').forEach(el => {
                    el.classList.remove('active');
                    // Xóa badge "Đang dùng"
                    const badge = el.querySelector('span.ml-1');
                    if (badge) badge.remove();
                });

                // Thêm trạng thái active cho tab được click
                btn.classList.add('active');

                // Thêm badge "Đang dùng" cho tab được click
                const colorMap = {
                    'seasonal': 'bg-green-100 text-green-700',
                    'vigil': 'bg-purple-100 text-purple-700',
                    'sanctoral': 'bg-red-100 text-red-700',
                    'special': 'bg-purple-100 text-purple-700',
                    'tet': 'bg-orange-100 text-orange-700'
                };
                const badgeSpan = document.createElement('span');
                badgeSpan.className = `ml-1 text-[0.6rem] ${colorMap[type]} px-1.5 rounded`;
                badgeSpan.textContent = 'Đang dùng';
                btn.appendChild(badgeSpan);

                updateReadingRefs(summary);

                if (data) {
                    renderReadingsContent(data, type);
                } else {
                    document.getElementById('modalReadingsSection')?.classList.add('hidden');
                    document.getElementById('noReadingMsg')?.classList.remove('hidden');
                }
            };
        }
    };

    setupTabClick('btn-seasonal', seasonalFullData, 'seasonal', seasonalSummary, 'Mùa Phụng Vụ');
    if (!limitToSeasonalOptions && vigilInfoForReadings && vigilInfoForReadings.hasVigil && (vigilSummary || vigilFullData)) {
        setupTabClick('btn-vigil', vigilFullData, 'vigil', vigilSummary, vigilInfoForReadings.vigilName || 'Lễ Vọng');
    }
    if (!limitToSeasonalOptions) {
        setupTabClick('btn-sanctoral', sanctoralFullData, 'sanctoral', sanctoralSummary, 'Lễ Kính Thánh');
        setupTabClick('btn-special', specialFullData, 'special', specialSummary, 'Lễ Riêng');
        setupTabClick('btn-tet', tetFullData, 'tet', tetSummary, 'Thánh Lễ Tết');
    }

    // === DEFAULT RENDER - Dựa trên defaultReadingSource đã xác định từ Precedence ===
    console.log(`📖 Nguồn bài đọc mặc định: ${defaultReadingSource} (${defaultLabel})`);

    switch (defaultReadingSource) {
        case 'tet':
            if (tetFullData) {
                renderReadingsContent(tetFullData, 'tet');
                updateReadingRefs(tetSummary);
            }
            break;
        case 'vigil':
            if (vigilFullData) {
                renderReadingsContent(vigilFullData, 'vigil');
                updateReadingRefs(vigilSummary);
            } else if (vigilSummary) {
                // Nếu chỉ có summary, vẫn hiển thị references
                updateReadingRefs(vigilSummary);
            } else {
                // Fallback về seasonal nếu không có dữ liệu lễ vọng
                if (seasonalFullData) {
                    renderReadingsContent(seasonalFullData, 'seasonal');
                    updateReadingRefs(seasonalSummary);
                    // Cập nhật tab active
                    document.querySelectorAll('.reading-tab').forEach(el => el.classList.remove('active'));
                    document.getElementById('btn-seasonal')?.classList.add('active');
                }
            }
            break;
        case 'sanctoral':
            if (sanctoralFullData) {
                renderReadingsContent(sanctoralFullData, 'sanctoral');
                updateReadingRefs(sanctoralSummary);
            } else if (sanctoralSummary) {
                // Nếu chỉ có summary, vẫn hiển thị references
                updateReadingRefs(sanctoralSummary);
                // Fallback về seasonal nếu có
                if (seasonalFullData) {
                    renderReadingsContent(seasonalFullData, 'seasonal');
                    // Cập nhật tab active
                    document.querySelectorAll('.reading-tab').forEach(el => el.classList.remove('active'));
                    document.getElementById('btn-seasonal')?.classList.add('active');
                }
            } else {
                // Nếu không có sanctoral, fallback về seasonal
                if (seasonalFullData) {
                    renderReadingsContent(seasonalFullData, 'seasonal');
                    updateReadingRefs(seasonalSummary);
                    // Cập nhật tab active
                    document.querySelectorAll('.reading-tab').forEach(el => el.classList.remove('active'));
                    document.getElementById('btn-seasonal')?.classList.add('active');
                } else {
                    document.getElementById('modalReadingsSection')?.classList.add('hidden');
                    document.getElementById('noReadingMsg')?.classList.remove('hidden');
                }
            }
            break;
        case 'special':
            if (specialFullData) {
                renderReadingsContent(specialFullData, 'special');
                updateReadingRefs(specialSummary);
            }
            break;
        case 'seasonal':
        default:
            if (seasonalFullData) {
                renderReadingsContent(seasonalFullData, 'seasonal');
                updateReadingRefs(seasonalSummary);
            } else {
                document.getElementById('modalReadingsSection')?.classList.add('hidden');
                document.getElementById('noReadingMsg')?.classList.remove('hidden');
                refsSection?.classList.add('hidden');
            }
            break;
    }

    // Fallback: Nếu nguồn mặc định không có dữ liệu, thử nguồn khác
    const contentEl = document.getElementById('modalReadingsContent');
    if (contentEl && contentEl.innerHTML.trim() === '') {
        // Ưu tiên 1: Thử sanctoral (cho lễ nhớ)
        if (sanctoralFullData) {
            renderReadingsContent(sanctoralFullData, 'sanctoral');
            updateReadingRefs(sanctoralSummary);
            // Cập nhật tab active
            document.querySelectorAll('.reading-tab').forEach(el => el.classList.remove('active'));
            const sanctoralBtn = document.getElementById('btn-sanctoral');
            if (sanctoralBtn) {
                sanctoralBtn.classList.add('active');
                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'ml-1 text-[0.6rem] bg-red-100 text-red-700 px-1.5 rounded';
                badgeSpan.textContent = 'Đang dùng';
                sanctoralBtn.appendChild(badgeSpan);
            }
        }
        // Ưu tiên 2: Thử seasonal
        else if (seasonalFullData) {
            renderReadingsContent(seasonalFullData, 'seasonal');
            updateReadingRefs(seasonalSummary);
            document.querySelectorAll('.reading-tab').forEach(el => el.classList.remove('active'));
            document.getElementById('btn-seasonal')?.classList.add('active');
        }
    }

    // === SAINTS SECTION (chi tiết) ===
    const saintContent = document.getElementById('modalSaintContent');
    saintContent.innerHTML = "";
    if (infoFromCore.saints.length > 0 && !infoFromCore.isTet && secondaryCelebrations.length === 0) {
        document.getElementById('modalSaintSection').classList.remove('hidden');
        infoFromCore.saints.forEach(s => {
            const div = document.createElement('div');
            div.className = "flex items-center justify-between bg-gray-50 p-3 rounded-lg";
            const rankClass = getRankBadgeClass(s.rank);
            div.innerHTML = `
                <span class="font-semibold text-gray-800">${s.name}</span>
                <span class="text-[0.6rem] font-bold uppercase px-2 py-1 rounded ${rankClass}">${getRankDisplayName(s.rank)}</span>`;
            saintContent.appendChild(div);
        });
    } else {
        document.getElementById('modalSaintSection').classList.add('hidden');
    }

    // === EUCHARISTIC ADORATION SECTION ===
    // Lịch Chầu Thánh Thể theo tuần lễ Chúa Nhật trong năm
    const adorationSection = document.getElementById('modalAdorationSection');
    const adorationContent = document.getElementById('modalAdorationContent');
    if (adorationSection && adorationContent) {
        // Chỉ hiển thị cho Chúa Nhật
        if (date.getDay() === 0) {
            // Tính số tuần Chúa Nhật trong năm (từ đầu năm dương lịch)
            const sundayNumber = getSundayNumberOfYear(date);
            const weekKey = sundayNumber.toString().padStart(2, '0');

            if (typeof eucharisticAdoration !== 'undefined' && eucharisticAdoration[weekKey] && eucharisticAdoration[weekKey].content) {
                adorationSection.classList.remove('hidden');

                // Hiển thị thông tin chi tiết hơn
                const adorationData = eucharisticAdoration[weekKey];
                let adorationHtml = `<div class="text-amber-900 font-medium">${adorationData.content}</div>`;
                adorationHtml += `<div class="text-xs text-amber-700 mt-1 opacity-75">Tuần ${sundayNumber} trong năm phụng vụ</div>`;
                adorationContent.innerHTML = adorationHtml;
            } else {
                adorationSection.classList.add('hidden');
            }
        } else {
            adorationSection.classList.add('hidden');
        }
    }

    // === MEDITATION LINK SECTION ===
    const meditationSection = document.getElementById('modalMeditationSection');
    const meditationLink = document.getElementById('modalMeditationLink');
    if (meditationSection && meditationLink) {
        const meditationData = getMeditationLinkForDate(date, dayInfo, cycle, weekdayCycle);
        if (meditationData) {
            let url = meditationData;
            let label = 'Mở suy niệm hôm nay';
            if (typeof meditationData === 'object' && meditationData !== null) {
                url = meditationData.url || meditationData.href || '';
                label = meditationData.label || label;
            }
            if (url) {
                meditationLink.href = url;
                meditationLink.textContent = label;
                meditationSection.classList.remove('hidden');
            } else {
                meditationSection.classList.add('hidden');
            }
        } else {
            meditationSection.classList.add('hidden');
        }
    }

    // === SHOW MODAL ===
    modal.classList.remove('opacity-0');
    modal.classList.remove('pointer-events-none');
    document.body.classList.add('modal-active');
}

function closeModal() {
    const modal = document.getElementById('dayModal');
    modal.classList.add('opacity-0');
    modal.classList.add('pointer-events-none');
    document.body.classList.remove('modal-active');
}

function changeYear(offset) {
    currentYear += offset;
    // Xóa cache dayInfo khi đổi năm (liturgicalData và lunarDates vẫn giữ)
    CACHE.dayInfo.clear();
    renderCalendar();
}
function goToToday() {
    currentYear = new Date().getFullYear();
    renderCalendar();
    headerFocusDate = null;
    updateHeaderTodayInfo();
}

// Hàm xóa toàn bộ cache (dùng khi cần reset)
function clearAllCache() {
    CACHE.clearAll();
    renderCalendar();
}

// Hiển thị thống kê cache
function showCacheStats() {
    const stats = CACHE.getStats();
    console.log('📊 Cache Statistics:');
    console.log('  Memory Cache:');
    console.log(`    - Liturgical Data: ${stats.memory.liturgicalData} items`);
    console.log(`    - Day Info: ${stats.memory.dayInfo} items`);
    console.log(`    - Lunar Dates: ${stats.memory.lunarDates} items`);
    console.log(`    - Readings: ${stats.memory.readings} items`);
    console.log('  LocalStorage:');
    console.log(`    - Items: ${stats.storage.count}`);
    console.log(`    - Size: ${stats.storage.sizeKB} KB`);
    return stats;
}

// ============================================================================
// HEADER TODAY VIEW - COLLAPSE ON SCROLL
// ============================================================================

const HeaderCollapseManager = {
    isCollapsed: false,
    collapseThreshold: 220, // ngưỡng thu gọn
    expandThreshold: 120, // ngưỡng mở rộng (thấp hơn để tránh nhấp nháy)
    lastScrollTop: 0,
    ticking: false,

    init() {
        // Bind scroll event
        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

        // Bind expand button click
        const expandBtn = document.getElementById('expandTodayBtn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Không trigger openModal
                this.expand();
                // Scroll lên đầu trang
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Initial state check
        this.checkScrollPosition();
    },

    onScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.checkScrollPosition();
                this.ticking = false;
            });
            this.ticking = true;
        }
    },

    checkScrollPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > this.collapseThreshold && !this.isCollapsed) {
            this.collapse();
        } else if (scrollTop < this.expandThreshold && this.isCollapsed) {
            this.expand();
        }

        this.lastScrollTop = scrollTop;
    },

    collapse() {
        if (this.isCollapsed) return;
        this.isCollapsed = true;

        const headerInfo = document.getElementById('headerTodayInfo');
        const expanded = document.getElementById('headerExpanded');
        const collapsed = document.getElementById('headerCollapsed');

        if (!headerInfo || !expanded || !collapsed) return;

        // Cập nhật dữ liệu compact
        this.updateCompactView();

        // Animate
        headerInfo.classList.add('collapsed');
        headerInfo.dataset.expanded = 'false';
        expanded.classList.add('hiding');
        collapsed.classList.remove('hidden');

        // Delay để CSS transition hoạt động
        requestAnimationFrame(() => {
            collapsed.classList.add('showing');
        });
    },

    expand() {
        if (!this.isCollapsed) return;
        this.isCollapsed = false;

        const headerInfo = document.getElementById('headerTodayInfo');
        const expanded = document.getElementById('headerExpanded');
        const collapsed = document.getElementById('headerCollapsed');

        if (!headerInfo || !expanded || !collapsed) return;

        // Animate
        headerInfo.classList.remove('collapsed');
        headerInfo.dataset.expanded = 'true';
        collapsed.classList.remove('showing');
        expanded.classList.remove('hiding');

        // Hide collapsed after animation
        setTimeout(() => {
            if (!this.isCollapsed) {
                collapsed.classList.add('hidden');
            }
        }, 350);
    },

    updateCompactView() {
        const today = getHeaderBaseDate();
        const litData = getLiturgicalData(today.getFullYear());

        // Dùng hàm core để lấy toàn bộ thông tin phụng vụ
        const dayInfo = getDayLiturgicalInfo(today, litData);
        const info = dayInfo.info;
        const cycle = dayInfo.cycle;
        const weekdayCycle = dayInfo.weekdayCycle;

        // Get celebration title - dùng dayLabelText từ hàm core
        let celebrationTitle = dayInfo.dayLabelText;

        // Get reading summary - dùng dayCode từ dayInfo
        const code = dayInfo.dayCode;
        let seasonalSummary = READINGS_DATA.find(r => {
            if (r.code != code) return false;
            if (today.getDay() === 0) return r.year === cycle;
            return r.year === weekdayCycle || r.year === "0";
        });

        let readingsText = "";
        if (seasonalSummary) {
            // Rút gọn: chỉ hiển thị Tin Mừng
            readingsText = seasonalSummary.gospel || "";
            if (seasonalSummary.reading1) {
                readingsText = `${seasonalSummary.reading1} • ${seasonalSummary.gospel || ""}`;
            }
        }

        // Cycle text
        let cycleText = `Năm ${cycle}`;
        if (info.season === "Mùa Thường Niên" && today.getDay() !== 0) {
            cycleText += ` - ${weekdayCycle === "1" ? "Năm lẻ" : "Năm chẵn"}`;
        }

        // Update compact elements
        const colorDotCompact = document.getElementById('headerColorDotCompact');
        const celebrationCompact = document.getElementById('headerCelebrationCompact');
        const cycleCompact = document.getElementById('headerCycleCompact');
        const readingsCompact = document.getElementById('headerReadingsCompact');

        if (colorDotCompact) colorDotCompact.className = `w-3 h-3 rounded-full shadow-sm ring-1 ring-white flex-shrink-0 ${info.color}`;
        if (celebrationCompact) celebrationCompact.innerText = celebrationTitle;
        if (cycleCompact) cycleCompact.innerText = cycleText;

        // Cho Chúa Nhật: hiển thị lịch Chầu thay vì bài đọc
        if (today.getDay() === 0) {
            const sundayNumber = getSundayNumberOfYear(today);
            const weekKey = sundayNumber.toString().padStart(2, '0');
            if (typeof eucharisticAdoration !== 'undefined' && eucharisticAdoration[weekKey] && eucharisticAdoration[weekKey].content) {
                const adorationText = eucharisticAdoration[weekKey].content.replace('Chầu Thánh Thể tại: ', '⛪ ');
                if (readingsCompact) readingsCompact.innerText = adorationText;
            } else {
                if (readingsCompact) readingsCompact.innerText = readingsText || "Chạm để xem bài đọc";
            }
        } else {
            if (readingsCompact) readingsCompact.innerText = readingsText || "Chạm để xem bài đọc";
        }
    }
};

window.onload = function () {
    updateHeaderTodayInfo();
    renderCalendar();
    HeaderCollapseManager.init();
    initCalendarFontControls();
    initThemeToggle();
    initHeaderNavButtons();
    document.onkeydown = function (evt) {
        if (evt.key === 'Escape' || evt.key === 'Esc') {
            closeModal();
            closeExportModal();
        }
    };
};

// === Calendar cell font size controls (A-/A+) ===
function initCalendarFontControls() {
    const scaleKey = 'calendarCellFontScale';
    const minScale = 0.9;
    const maxScale = 1.3;
    const step = 0.05;
    const root = document.documentElement;
    const btnDec = document.getElementById('cellFontDec');
    const btnInc = document.getElementById('cellFontInc');

    const applyScale = (value) => {
        const clamped = Math.min(maxScale, Math.max(minScale, value));
        root.style.setProperty('--cell-font-scale', clamped.toFixed(2));
        localStorage.setItem(scaleKey, clamped.toFixed(2));
    };

    const saved = parseFloat(localStorage.getItem(scaleKey));
    if (!Number.isNaN(saved)) {
        applyScale(saved);
    }

    if (btnDec) {
        btnDec.onclick = () => {
            const current = parseFloat(getComputedStyle(root).getPropertyValue('--cell-font-scale')) || 1;
            applyScale(current - step);
        };
    }

    if (btnInc) {
        btnInc.onclick = () => {
            const current = parseFloat(getComputedStyle(root).getPropertyValue('--cell-font-scale')) || 1;
            applyScale(current + step);
        };
    }
}

function initHeaderNavButtons() {
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    const prevBtnCompact = document.getElementById('prevDayBtnCompact');
    const nextBtnCompact = document.getElementById('nextDayBtnCompact');
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            shiftHeaderDate(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            shiftHeaderDate(1);
        });
    }
    if (prevBtnCompact) {
        prevBtnCompact.addEventListener('click', (e) => {
            e.stopPropagation();
            shiftHeaderDate(-1);
        });
    }
    if (nextBtnCompact) {
        nextBtnCompact.addEventListener('click', (e) => {
            e.stopPropagation();
            shiftHeaderDate(1);
        });
    }
}

// === Theme Toggle (Light/Dark) ===
function initThemeToggle() {
    const storageKey = 'calendarThemeMode';
    const btn = document.getElementById('toggleTheme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem(storageKey);
    const initial = saved || (prefersDark ? 'dark' : 'light');

    const applyTheme = (mode) => {
        const isDark = mode === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        if (btn) {
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            btn.setAttribute('aria-label', isDark ? 'Tắt giao diện tối' : 'Bật giao diện tối');
            btn.innerHTML = isDark
                ? '<i class="fas fa-sun"></i><span>Giao diện sáng</span>'
                : '<i class="fas fa-moon"></i><span>Giao diện tối</span>';
        }
        localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
    };

    applyTheme(initial);

    if (btn) {
        btn.onclick = () => {
            const isDark = document.body.classList.contains('dark-mode');
            applyTheme(isDark ? 'light' : 'dark');
        };
    }
}

// ============================================================================
// EXPORT FUNCTIONS - Xuất lịch ra JSON/PDF
// ============================================================================

let exportRange = 'year'; // 'month', 'year', 'custom'

function showExportOptions() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Set current month in custom inputs
        const currentMonth = new Date().getMonth() + 1;
        document.getElementById('exportFromMonth').value = currentMonth;
    }
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function setExportRange(range) {
    exportRange = range;

    // Update button styles
    document.querySelectorAll('.export-range-btn').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'bg-blue-50', 'text-blue-700');
        btn.classList.add('border-gray-200');
    });

    const activeBtn = document.getElementById(`exportRange${range.charAt(0).toUpperCase() + range.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'border-blue-500', 'bg-blue-50', 'text-blue-700');
        activeBtn.classList.remove('border-gray-200');
    }

    // Show/hide custom inputs
    const customInputs = document.getElementById('customRangeInputs');
    if (customInputs) {
        if (range === 'custom') {
            customInputs.classList.remove('hidden');
        } else {
            customInputs.classList.add('hidden');
        }
    }
}

function getExportDateRange() {
    const today = new Date();
    let fromMonth, toMonth;

    switch (exportRange) {
        case 'month':
            fromMonth = today.getMonth() + 1;
            toMonth = fromMonth;
            break;
        case 'custom':
            fromMonth = parseInt(document.getElementById('exportFromMonth').value);
            toMonth = parseInt(document.getElementById('exportToMonth').value);
            break;
        case 'year':
        default:
            fromMonth = 1;
            toMonth = 12;
            break;
    }

    return { fromMonth, toMonth };
}

function generateCalendarData() {
    const { fromMonth, toMonth } = getExportDateRange();
    const litData = getLiturgicalData(currentYear);
    const includeReadings = document.getElementById('exportIncludeReadings')?.checked || false;
    const includeSaints = document.getElementById('exportIncludeSaints')?.checked || true;
    const includeLunar = document.getElementById('exportIncludeLunar')?.checked || true;

    // Metadata
    const exportData = {
        metadata: {
            title: `Lịch Phụng Vụ Công Giáo Năm ${currentYear}`,
            year: currentYear,
            exportedAt: new Date().toISOString(),
            range: {
                from: `${currentYear}-${String(fromMonth).padStart(2, '0')}-01`,
                to: `${currentYear}-${String(toMonth).padStart(2, '0')}-${new Date(currentYear, toMonth, 0).getDate()}`
            },
            liturgicalCycle: {
                sundayCycle: `Năm ${getDayLiturgicalInfo(new Date(currentYear, 0, 1), litData).cycle}`,
                weekdayCycle: currentYear % 2 === 0 ? "Năm Chẵn" : "Năm Lẻ"
            }
        },
        months: []
    };

    // Generate data for each month
    for (let month = fromMonth; month <= toMonth; month++) {
        const monthData = {
            month: month,
            name: MONTHS_VI[month - 1],
            days: []
        };

        const daysInMonth = new Date(currentYear, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, month - 1, day);

            // Dùng hàm core để lấy toàn bộ thông tin phụng vụ
            const dayInfo = getDayLiturgicalInfo(date, litData);
            const info = dayInfo.info;

            const dayData = {
                date: `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                year: currentYear,
                month: month,
                day: day,
                dayOfWeek: DAYS_FULL_VI[date.getDay()],
                celebration: dayInfo.dayLabelText, // Dùng dayLabelText từ hàm core
                rank: info.rankCode || 'NGAY_THUONG',
                color: info.color?.replace('bg-lit-', '') || 'green',
                season: info.season,
                code: dayInfo.dayCode
            };

            // Lunar date từ dayInfo
            if (includeLunar && dayInfo.lunar) {
                dayData.lunar = {
                    day: dayInfo.lunar.day,
                    month: dayInfo.lunar.month,
                    year: dayInfo.lunar.year,
                    isLeapMonth: dayInfo.lunar.isLeapMonth || false
                };
            }

            // Saints - Luôn bao gồm tất cả saints (kể cả lễ nhớ), không phụ thuộc vào includeSaints
            // includeSaints chỉ ảnh hưởng đến việc hiển thị trong PDF, nhưng dữ liệu vẫn cần có
            if (info.saints && info.saints.length > 0) {
                dayData.saints = info.saints.map(s => ({
                    name: s.name,
                    rank: s.rank,
                    color: s.color?.replace('bg-lit-', ''),
                    type: s.type || (s.rank === 'TRONG' ? 'S' : s.rank === 'KINH' ? 'F' : s.rank === 'NHO' ? 'M' : 'O')
                }));
            }

            // Commemorations - Luôn bao gồm để hiển thị đầy đủ
            if (info.commemorations && info.commemorations.length > 0) {
                dayData.commemorations = info.commemorations.map(c => {
                    if (typeof c === 'string') return c;
                    return c.name || c.special || '';
                }).filter(c => c); // Loại bỏ giá trị rỗng
            }

            // Reading references
            if (includeReadings) {
                // Lấy chu kỳ năm phụng vụ từ dayInfo
                const cycle = dayInfo.cycle;
                const weekdayCycle = dayInfo.weekdayCycle;
                const dayOfWeek = date.getDay();

                // Tìm bài đọc từ tất cả nguồn
                let readingData = null;
                let readingSource = 'temporal';
                let usedCode = dayInfo.dayCode;

                // === ƯU TIÊN 1: Kiểm tra bài đọc Tết (nếu đang cử hành Tết) ===
                if (info.isTet && dayInfo.tetCode) {
                    if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[dayInfo.tetCode]) {
                        readingData = READINGS_SPECIAL[dayInfo.tetCode];
                        readingSource = 'tet';
                        usedCode = dayInfo.tetCode;
                        dayData.readingNote = 'Bài đọc Thánh Lễ Tết';
                    }
                }

                // === ƯU TIÊN 2: Ép bài đọc sanctoral cho các lễ trọng có bài đọc riêng (St Joseph, Truyền Tin, Vô Nhiễm) ===
                if (!readingData && info._forceSanctoralReadings && dayInfo.sanctoralCode) {
                    if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[dayInfo.sanctoralCode]) {
                        readingData = READINGS_SPECIAL[dayInfo.sanctoralCode];
                        readingSource = 'sanctoral';
                        usedCode = dayInfo.sanctoralCode;
                        dayData.readingNote = 'Bài đọc lễ riêng (sanctoral)';
                    } else if (typeof READINGS_DATA !== 'undefined') {
                        const forcedSummary = READINGS_DATA.find(r => r.code == dayInfo.sanctoralCode && (r.year === "0" || r.year === cycle));
                        if (forcedSummary) {
                            readingData = {
                                firstReading: forcedSummary.reading1 ? { excerpt: forcedSummary.reading1 } : null,
                                psalms: forcedSummary.psalm ? { excerpt: forcedSummary.psalm } : null,
                                secondReading: forcedSummary.reading2 ? { excerpt: forcedSummary.reading2 } : null,
                                gospel: forcedSummary.gospel ? { excerpt: forcedSummary.gospel } : null,
                                reading1: forcedSummary.reading1,
                                psalm: forcedSummary.psalm,
                                reading2: forcedSummary.reading2,
                                gospel: forcedSummary.gospel
                            };
                            readingSource = 'sanctoral';
                            usedCode = dayInfo.sanctoralCode;
                            dayData.readingNote = 'Bài đọc lễ riêng (sanctoral)';
                        }
                    }
                }

                // === ƯU TIÊN 3: Lễ Trọng/Kính các Thánh (sanctoral) ===
                // Nếu là Lễ Trọng hoặc Lễ Kính và thánh là cử hành chính, tìm bài đọc riêng của thánh (7DDMM)
                if (!readingData && (info.rankCode === 'TRONG' || info.rankCode === 'KINH')) {
                    // Kiểm tra xem thánh có phải cử hành chính không
                    const isSanctoralPrimary = info._winnerKey === 'SANCTORAL' ||
                        (info.saints.length > 0 && info.special === info.saints[0].name) ||
                        (info.saints.length > 0 && ['S', 'F'].includes(info.saints[0].type) && !info.special);

                    if (isSanctoralPrimary && dayInfo.sanctoralCode) {
                        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[dayInfo.sanctoralCode]) {
                            readingData = READINGS_SPECIAL[dayInfo.sanctoralCode];
                            readingSource = 'sanctoral';
                            usedCode = dayInfo.sanctoralCode;
                        }
                    }
                }

                // === ƯU TIÊN 4: Sử dụng getFullReadings() để tìm bài đọc từ tất cả nguồn ===
                // Hàm này đã xử lý đầy đủ các trường hợp đặc biệt (2030, 5001-5004, 8441, etc.)
                if (!readingData) {
                    try {
                        const fullReadings = getFullReadings(
                            dayInfo.dayCode,
                            dayInfo.sanctoralCode,
                            dayInfo.specialCode,
                            dayOfWeek,
                            cycle,
                            weekdayCycle,
                            dayInfo.tetCode,
                            null // vigilInfo
                        );

                        // Tìm bài đọc theo thứ tự ưu tiên
                        const seasonalReading = fullReadings && fullReadings.length > 0 ? fullReadings.find(r => r.type === 'seasonal') : null;
                        const sanctoralReading = fullReadings && fullReadings.length > 0 ? fullReadings.find(r => r.type === 'sanctoral') : null;
                        const specialReading = fullReadings && fullReadings.length > 0 ? fullReadings.find(r => r.type === 'special') : null;
                        if (seasonalReading && seasonalReading.data) {
                            readingData = seasonalReading.data;
                            readingSource = 'temporal';
                            usedCode = dayInfo.dayCode;
                        }
                        // Fallback: tìm bài đọc sanctoral
                        else if (sanctoralReading && sanctoralReading.data) {
                            readingData = sanctoralReading.data;
                            readingSource = 'sanctoral';
                            usedCode = dayInfo.sanctoralCode || dayInfo.dayCode;
                        }
                        // Fallback: tìm bài đọc special (Optionsaint / lễ riêng)
                        else if (specialReading && specialReading.data) {
                            readingData = specialReading.data;
                            readingSource = 'special';
                            usedCode = dayInfo.specialCode || dayInfo.sanctoralCode || dayInfo.dayCode;
                        }
                    } catch (error) {
                        console.warn(`Lỗi khi lấy bài đọc cho ngày ${day}:`, error);
                    }
                }

                // === ƯU TIÊN 5: Xử lý đặc biệt cho các mã không có trong dữ liệu ===
                if (!readingData) {
                    // Vọng Hiện Xuống (4089) → dùng bài đọc thứ bảy tuần 7 Phục Sinh (4076)
                    if (dayInfo.dayCode === "4089") {
                        // Tìm trong READINGS_SEASONAL trước
                        if (typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL["4089"]) {
                            readingData = READINGS_SEASONAL["4089"];
                        }
                        // Fallback: dùng bài đọc thứ bảy tuần 7 Phục Sinh (4076)
                        else if (typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL["4076"]) {
                            readingData = READINGS_SEASONAL["4076"];
                            dayData.readingNote = 'Bài đọc Vọng Hiện Xuống';
                        }
                    }
                    // Trái Tim Vô Nhiễm Mẹ (8441) → tìm trong sanctoral
                    if (dayInfo.dayCode === "8441" && dayInfo.sanctoralCode) {
                        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[dayInfo.sanctoralCode]) {
                            readingData = READINGS_SPECIAL[dayInfo.sanctoralCode];
                        }
                    }
                }

                // === ƯU TIÊN 6: Lễ Nhớ các Thánh (optional memorial) ===
                // Nếu vẫn không có và là lễ nhớ, thử tìm bài đọc tùy chọn
                if (!readingData && (info.rankCode === 'NHO' || info.rankCode === 'NHOKB') && dayInfo.sanctoralCode) {
                    if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[dayInfo.sanctoralCode]) {
                        readingData = READINGS_SPECIAL[dayInfo.sanctoralCode];
                        readingSource = 'sanctoral';
                        usedCode = dayInfo.sanctoralCode;
                    } else if (typeof OptionsaintReadings !== 'undefined') {
                        // Tìm với specialCode (8DDMM) trước
                        if (dayInfo.specialCode && OptionsaintReadings[dayInfo.specialCode]) {
                            readingData = OptionsaintReadings[dayInfo.specialCode];
                        }
                        // Fallback: tìm với sanctoralCode (chuyển 7DDMM thành 8DDMM)
                        else if (dayInfo.sanctoralCode) {
                            const optionsaintCode = dayInfo.sanctoralCode.replace(/^7/, '8');
                            if (OptionsaintReadings[optionsaintCode]) {
                                readingData = OptionsaintReadings[optionsaintCode];
                            } else if (OptionsaintReadings[dayInfo.sanctoralCode]) {
                                readingData = OptionsaintReadings[dayInfo.sanctoralCode];
                            }
                        }
                        readingSource = 'option';
                        usedCode = dayInfo.sanctoralCode;
                    }
                }

                if (readingData) {
                    // Xử lý nhiều format dữ liệu khác nhau
                    // Format 1: firstReading, psalms, secondReading, gospel (có excerpt)
                    // Format 2: reading1, psalm, reading2, gospel (từ READINGS_DATA)
                    // Format 3: BD1_ref, DC_ref, BD2_ref, TM_ref (format cũ)
                    const reading1 = readingData.firstReading?.excerpt ||
                        readingData.reading1 ||
                        readingData.BD1_ref ||
                        null;
                    const psalm = readingData.psalms?.excerpt ||
                        readingData.psalm ||
                        readingData.DC_ref ||
                        null;
                    const reading2 = readingData.secondReading?.excerpt ||
                        readingData.reading2 ||
                        readingData.BD2_ref ||
                        null;
                    const gospel = readingData.gospel?.excerpt ||
                        readingData.gospel ||
                        readingData.TM_ref ||
                        null;

                    // Chỉ tạo readings object nếu có ít nhất một bài đọc
                    if (reading1 || psalm || reading2 || gospel) {
                        dayData.readings = {
                            code: usedCode,
                            source: readingSource,
                            references: {
                                reading1: reading1,
                                psalm: psalm,
                                reading2: reading2,
                                gospel: gospel
                            }
                        };
                    }
                }
            }

            // Discipline notes
            const disciplineList = getLiturgicalDiscipline(date, litData);
            if (Array.isArray(disciplineList) && disciplineList.length > 0) {
                const hasFast = disciplineList.some(d => d.type === 'fast');
                const hasAbstinence = disciplineList.some(d => d.type === 'abstinence');
                const hasObligation = disciplineList.some(d => d.type === 'obligation');
                dayData.discipline = {
                    fast: hasFast,
                    abstinence: hasAbstinence,
                    obligation: hasObligation,
                    tags: disciplineList
                };
            }

            monthData.days.push(dayData);
        }

        exportData.months.push(monthData);
    }

    return exportData;
}

function exportCalendar(format) {
    const data = generateCalendarData();
    const { fromMonth, toMonth } = getExportDateRange();

    let filename;
    if (fromMonth === toMonth) {
        filename = `lich-phung-vu-${currentYear}-thang-${String(fromMonth).padStart(2, '0')}`;
    } else if (fromMonth === 1 && toMonth === 12) {
        filename = `lich-phung-vu-${currentYear}`;
    } else {
        filename = `lich-phung-vu-${currentYear}-thang-${fromMonth}-den-${toMonth}`;
    }

    if (format === 'json') {
        exportToJSON(data, filename);
    } else if (format === 'pdf') {
        exportToPDF(data, filename);
    }

    closeExportModal();
}

function exportToJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    showExportNotification('JSON đã được tải xuống!', 'success');
}

function exportToPDF(data, filename) {
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');

    // Color mapping for liturgical colors
    const colorMap = {
        'green': '#16a34a',
        'purple': '#9333ea',
        'white': '#eab308',
        'red': '#dc2626',
        'rose': '#ec4899'
    };

    // Color background mapping
    const colorBgMap = {
        'green': '#f0fdf4',
        'purple': '#faf5ff',
        'white': '#fefce8',
        'red': '#fef2f2',
        'rose': '#fdf2f8'
    };

    // Rank labels
    const rankLabels = {
        'TRONG': 'Lễ Trọng',
        'KINH': 'Lễ Kính',
        'NHO': 'Lễ Nhớ',
        'NHOKB': 'Lễ Nhớ (KB)',
        'CHUA_NHAT': 'Chúa Nhật',
        'NGAY_THUONG': ''
    };

    // Month names in Vietnamese
    const monthNamesVN = [
        'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư',
        'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám',
        'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
    ];

    let htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${data.metadata.title}</title>
    <style>
        @page { 
            size: A4; 
            margin: 12mm 10mm;
        }
        @media print {
            .no-print { display: none !important; }
            .month-section { page-break-inside: avoid; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', 'Arial', sans-serif; 
            font-size: 9pt; 
            line-height: 1.35;
            color: #1f2937;
            background: #f8fafc;
        }
        
        /* Container to limit width */
        .page-container {
            max-width: 210mm; /* A4 width */
            margin: 0 auto;
            background: #fff;
            min-height: 100vh;
        }
        @media screen {
            .page-container {
                max-width: 800px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
        }
        
        /* Header */
        .header { 
            text-align: center; 
            padding: 20px 0 15px;
            margin-bottom: 15px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
        }
        .header h1 { 
            font-size: 22pt; 
            font-weight: 700;
            margin: 0 0 5px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .header .subtitle { 
            font-size: 10pt; 
            opacity: 0.9;
        }
        .header .cycle {
            display: inline-block;
            margin-top: 10px;
            padding: 5px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-size: 11pt;
            font-weight: 600;
        }
        
        /* Print button */
        .print-controls {
            text-align: center;
            padding: 15px;
            background: #f8fafc;
            margin-bottom: 15px;
            border-radius: 10px;
        }
        .print-btn {
            padding: 12px 40px;
            font-size: 14px;
            cursor: pointer;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
            transition: transform 0.2s;
        }
        .print-btn:hover { transform: translateY(-2px); }
        
        /* Month Section */
        .month-section { 
            margin-bottom: 20px;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
        }
        .month-header { 
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
            color: white;
            padding: 12px 20px;
            font-size: 14pt;
            font-weight: 700;
        }
        
        /* Table */
        table { 
            width: 100%; 
            border-collapse: collapse;
        }
        th { 
            background: #f1f5f9; 
            padding: 8px 6px;
            font-weight: 600;
            text-align: left;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
        }
        td { 
            padding: 6px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }
        tr:hover { background: #f8fafc; }
        
        /* Columns */
        .col-date { width: 70px; text-align: center; }
        .col-celebration { }
        .col-readings { width: 180px; }
        .col-lunar { width: 55px; text-align: center; }
        
        /* Date cell */
        .date-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .day-name { font-size: 7pt; color: #64748b; text-transform: uppercase; }
        .day-num { 
            font-size: 14pt; 
            font-weight: 700; 
            line-height: 1.2;
        }
        .color-bar {
            width: 100%;
            height: 4px;
            border-radius: 2px;
            margin-top: 3px;
        }
        
        /* Celebration */
        .celebration-main { 
            font-weight: 600; 
            font-size: 9pt;
            color: #1f2937;
        }
        .rank-badge { 
            display: inline-block;
            font-size: 6.5pt; 
            color: #fff;
            padding: 1px 6px;
            border-radius: 3px;
            margin-left: 5px;
            font-weight: 600;
            vertical-align: middle;
        }
        .rank-trong { background: #dc2626; }
        .rank-kinh { background: #f59e0b; }
        .rank-nho { background: #22c55e; }
        .rank-nhokb { background: #6b7280; }
        
        .saints-line { 
            font-size: 7.5pt; 
            color: #64748b; 
            font-style: italic; 
            margin-top: 2px;
        }
        .discipline-line { 
            font-size: 7pt; 
            color: #7c3aed; 
            font-weight: 600;
            margin-top: 2px;
        }
        
        /* Readings */
        .readings-cell {
            font-size: 7.5pt;
            color: #475569;
            line-height: 1.4;
        }
        .reading-item {
            display: flex;
            margin-bottom: 1px;
        }
        .reading-label {
            color: #94a3b8;
            width: 25px;
            flex-shrink: 0;
        }
        .reading-ref {
            font-weight: 500;
            color: #1e40af;
        }
        
        /* Lunar */
        .lunar-date {
            font-size: 9pt;
            color: #dc2626;
            font-weight: 500;
        }
        .lunar-new { 
            background: #fef2f2;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
        }
        
        /* Special rows */
        .row-sunday { background: #fef2f2; }
        .row-solemnity { background: #fef3c7; }
        .row-feast { background: #f0fdf4; }
        
        /* Footer */
        .footer {
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            padding: 15px;
            border-top: 1px solid #e5e7eb;
            margin-top: 10px;
        }
        
        /* Legend */
        .legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 10px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 8pt;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .legend-color {
            width: 14px;
            height: 14px;
            border-radius: 3px;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
<div class="page-container">
    <div class="header">
        <h1>✝ ${data.metadata.title}</h1>
        <div class="subtitle">Giáo Hội Công Giáo Việt Nam</div>
        <div class="cycle">${data.metadata.liturgicalCycle.sundayCycle} • ${data.metadata.liturgicalCycle.weekdayCycle}</div>
    </div>
    
    <div class="content-wrapper" style="padding: 0 15px;">
    
    <div class="print-controls no-print">
        <button class="print-btn" onclick="window.print()">
            🖨️ In hoặc Lưu PDF
        </button>
        <p style="margin-top: 10px; font-size: 12px; color: #64748b;">
            Nhấn Ctrl+P (hoặc Cmd+P trên Mac) → Chọn "Save as PDF"
        </p>
    </div>
    
    <div class="legend no-print">
        <div class="legend-item"><div class="legend-color" style="background: #16a34a;"></div> Thường Niên</div>
        <div class="legend-item"><div class="legend-color" style="background: #9333ea;"></div> Mùa Vọng/Chay</div>
        <div class="legend-item"><div class="legend-color" style="background: #eab308;"></div> Lễ Trọng</div>
        <div class="legend-item"><div class="legend-color" style="background: #dc2626;"></div> Tử Đạo</div>
    </div>
`;

    // Generate month tables
    data.months.forEach(month => {
        const monthName = monthNamesVN[month.month - 1] || month.name;

        htmlContent += `
    <div class="month-section">
        <div class="month-header">${monthName} năm ${data.metadata.year}</div>
        <table>
            <thead>
                <tr>
                    <th class="col-date">Ngày</th>
                    <th class="col-celebration">Cử Hành Phụng Vụ</th>
                    <th class="col-readings">Bài Đọc</th>
                    <th class="col-lunar">Âm</th>
                </tr>
            </thead>
            <tbody>
`;

        month.days.forEach(day => {
            const date = new Date(day.date);
            const dayNum = date.getDate();
            const isSunday = date.getDay() === 0;
            const isSolemnity = day.rank === 'TRONG';
            const isFeast = day.rank === 'KINH';

            let rowClass = '';
            if (isSolemnity) rowClass = 'row-solemnity';
            else if (isFeast) rowClass = 'row-feast';
            else if (isSunday) rowClass = 'row-sunday';

            const colorHex = colorMap[day.color] || '#16a34a';
            const rankLabel = rankLabels[day.rank] || '';
            let rankClass = 'rank-badge ';
            if (day.rank === 'TRONG') rankClass += 'rank-trong';
            else if (day.rank === 'KINH') rankClass += 'rank-kinh';
            else if (day.rank === 'NHO') rankClass += 'rank-nho';
            else if (day.rank === 'NHOKB') rankClass += 'rank-nhokb';

            // Lunar date
            let lunarStr = '';
            if (day.lunar) {
                const lunarText = `${day.lunar.day}/${day.lunar.month}`;
                lunarStr = day.lunar.day === 1
                    ? `<span class="lunar-new">${lunarText}</span>`
                    : lunarText;
            }

            // Saints - Hiển thị tất cả lễ nhớ, kể cả khi không phải cử hành chính
            let saintsStr = '';
            if (day.saints && day.saints.length > 0) {
                // Lọc và hiển thị tất cả saints (bao gồm lễ nhớ)
                const allSaints = day.saints.map(s => {
                    const rankLabel = s.rank === 'NHO' ? ' (Lễ Nhớ)' :
                        s.rank === 'NHOKB' ? ' (Lễ Nhớ KB)' :
                            s.rank === 'KINH' ? ' (Lễ Kính)' :
                                s.rank === 'TRONG' ? ' (Lễ Trọng)' : '';
                    return s.name + rankLabel;
                }).join('; ');
                saintsStr = `<div class="saints-line">↳ ${allSaints}</div>`;
            }

            // Commemorations - Hiển thị các lễ bị commemorated
            let commemorationsStr = '';
            if (day.commemorations && day.commemorations.length > 0) {
                commemorationsStr = `<div class="saints-line" style="opacity: 0.8; font-size: 0.9em;">↳ ${day.commemorations.join('; ')}</div>`;
            }

            // Discipline
            let disciplineStr = '';
            if (day.discipline) {
                const parts = [];
                if (day.discipline.fast) parts.push('Ăn chay');
                if (day.discipline.abstinence) parts.push('Kiêng thịt');
                if (day.discipline.obligation) parts.push('Lễ buộc');
                if (parts.length > 0) {
                    disciplineStr = `<div class="discipline-line">⚠ ${parts.join(' • ')}</div>`;
                }
            }

            // Readings
            let readingsStr = '';
            if (day.readings && day.readings.references) {
                const refs = day.readings.references;
                if (refs.reading1) readingsStr += `<div class="reading-item"><span class="reading-label">I:</span><span class="reading-ref">${refs.reading1}</span></div>`;
                if (refs.psalm) readingsStr += `<div class="reading-item"><span class="reading-label">Đc:</span><span class="reading-ref">${refs.psalm}</span></div>`;
                if (refs.reading2) readingsStr += `<div class="reading-item"><span class="reading-label">II:</span><span class="reading-ref">${refs.reading2}</span></div>`;
                if (refs.gospel) readingsStr += `<div class="reading-item"><span class="reading-label">TM:</span><span class="reading-ref">${refs.gospel}</span></div>`;
            }

            // Short day name
            const shortDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            const dayName = shortDays[date.getDay()];

            htmlContent += `
                <tr class="${rowClass}">
                    <td class="col-date">
                        <div class="date-wrapper">
                            <span class="day-name">${dayName}</span>
                            <span class="day-num">${String(dayNum).padStart(2, '0')}</span>
                            <div class="color-bar" style="background: ${colorHex};"></div>
                        </div>
                    </td>
                    <td class="col-celebration">
                        <span class="celebration-main">${day.celebration}</span>
                        ${rankLabel ? `<span class="${rankClass}">${rankLabel}</span>` : ''}
                        ${saintsStr}
                        ${commemorationsStr}
                        ${disciplineStr}
                    </td>
                    <td class="col-readings">
                        <div class="readings-cell">${readingsStr || '<span style="color:#cbd5e1;">—</span>'}</div>
                    </td>
                    <td class="col-lunar">
                        <span class="lunar-date">${lunarStr}</span>
                    </td>
                </tr>
`;
        });

        htmlContent += `
            </tbody>
        </table>
    </div>
`;
    });

    htmlContent += `
    <div class="footer">
        ✝ Lịch Phụng Vụ Công Giáo • Xuất ngày ${new Date().toLocaleDateString('vi-VN')} • lichphungvu.com
    </div>
    
    </div><!-- end content-wrapper -->
</div><!-- end page-container -->
</body>
</html>
`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Show notification
    showExportNotification('Đã mở trang in PDF. Chọn "Lưu dạng PDF" để lưu file.', 'success');
}

function showExportNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 transform transition-all duration-300 translate-y-2 opacity-0`;

    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        notification.classList.add('bg-blue-500', 'text-white');
        notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Remove after 3s
    setTimeout(() => {
        notification.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
