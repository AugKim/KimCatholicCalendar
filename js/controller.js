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
    VERSION: '1.0.1',
    
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
            // Giới hạn cache size để tránh memory leak
            if (cache.size > 500) {
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
        } catch (e) {}
        
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

const LUNAR_CALENDAR = (function() {
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
        getLunarDate: function(date) {
            const cacheKey = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
            const cached = CACHE.get('lunarDates', cacheKey);
            if (cached) return cached;
            
            const result = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
            CACHE.set('lunarDates', cacheKey, result);
            return result;
        },
        
        // Format ngày âm lịch
        formatLunarDay: function(date) {
            const lunar = this.getLunarDate(date);
            return lunar.day;
        },
        
        // Format đầy đủ ngày âm lịch (ngày/tháng)
        formatLunarFull: function(date) {
            const lunar = this.getLunarDate(date);
            const monthStr = lunar.leap ? `${lunar.month}N` : lunar.month;
            return `${lunar.day}/${monthStr}`;
        },
        
        // Kiểm tra có phải ngày mùng 1 âm lịch không
        isFirstDayOfLunarMonth: function(date) {
            const lunar = this.getLunarDate(date);
            return lunar.day === 1;
        },
        
        // Lấy tên tháng âm lịch
        getLunarMonthName: function(month, leap) {
            const names = ["Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "M.Một", "Chạp"];
            return (leap ? "Nhuận " : "") + names[month - 1];
        },
        
        // Kiểm tra có phải ngày Tết Việt Nam không (Mùng 1, 2, 3 tháng Giêng)
        isTetDay: function(date) {
            const lunar = this.getLunarDate(date);
            // Tháng Giêng (tháng 1) và không phải tháng nhuận
            if (lunar.month === 1 && !lunar.leap && lunar.day >= 1 && lunar.day <= 3) {
                return lunar.day;
            }
            return 0;
        },
        
        // Kiểm tra có phải ngày 30 Tết (Giao thừa) không
        isNewYearEve: function(date) {
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
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
    
    // Quy tắc xung đột Tết theo HĐGMVN:
    // 1. Nếu Tết trùng Chúa Nhật Thường Niên: có thể cử hành lễ Tết (ưu tiên Tết)
    // 2. Nếu trùng Mùa Chay/Tuần Thánh: giữ phụng vụ mùa; thêm ghi chú về Tết
    
    const isOrdinarySunday = (season === "Mùa Thường Niên" && dayOfWeek === 0);
    const isLentOrHoly = (season === "Mùa Chay" || season === "Mùa Phục Sinh");
    const specialDayType = getSpecialDayType(date, litData);
    const isTriduum = specialDayType === 'TRIDUUM';
    const isHolyWeek = specialDayType === 'HOLY_WEEK';
    
    let result = {
        celebrate: true,
        note: tetEvent.note,
        rank: tetEvent.rank
    };
    
    if (isTriduum || isHolyWeek) {
        // Tam Nhật Vượt Qua hoặc Tuần Thánh: không cử hành Tết
        result.celebrate = false;
        result.note = "Tết rơi vào Tuần Thánh/Tam Nhật: giữ phụng vụ mùa; có thể thêm ý nguyện Tết.";
        result.rank = 13; // Demote to lowest
    } else if (isLentOrHoly && !isOrdinarySunday) {
        // Mùa Chay: có thể cử hành nhưng ưu tiên thấp hơn
        result.note = "Tết rơi vào Mùa Chay: theo phép HĐGMVN, có thể cử hành Thánh lễ Tết.";
        result.rank = 6; // Demote to FEAST level
    } else if (isOrdinarySunday) {
        // Chúa Nhật Thường Niên: Tết được ưu tiên
        result.note = "Theo phép HĐGMVN: khi Tết trùng Chúa Nhật Thường Niên, có thể cử hành Thánh lễ Tết.";
        result.rank = 3; // Keep SOLEMNITY level
    }
    
    return result;
}

// Sử dụng object thuần thay vì mảng để làm lookup map
const FIXED_DATA_LOOKUP = {};
SAINTS_DATA.forEach(item => {
    const parts = item.date.includes('/') ? item.date.split('/') : item.date.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const key = `${month}-${day}`; 
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

// --- CORE FUNCTIONS ---
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function toRoman(num) {
    const roman = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
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
    // Lễ Thăng Thiên: Easter + 39 ngày (Thứ Năm sau 40 ngày kể từ Phục Sinh, đếm Phục Sinh là ngày 1)
    // Tại Việt Nam giữ ngày Thứ Năm truyền thống, không dời sang Chúa Nhật
    const ascension = addDays(easter, 39); 
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

function getLiturgicalDayCode(date, litData) {
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
    const dTime = t(date);
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const getSunday = (d) => { const c = new Date(d); c.setHours(0,0,0,0); c.setDate(c.getDate() - c.getDay()); return c; }
    const currentSun = getSunday(date);
    const dayCode = date.getDay();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // ===== ƯU TIÊN 1: Mã theo ngày-tháng (7DDMM, 2DDMM) =====
    // Kiểm tra 7DDMM (sanctoral) - chỉ trả về nếu có trong readingdata
    // (Việc kiểm tra có trong readingdata sẽ được xử lý ở nơi gọi)
    const code7DDMM = `7${day}${month}`;
    
    // Kiểm tra 2DDMM (cuối Vọng - Giáng Sinh - đầu tháng 1)
    // 17/12 đến 01/01
    if ((date.getMonth() === 11 && date.getDate() >= 17) || 
        (date.getMonth() === 0 && date.getDate() <= 1) ||
        (date.getMonth() === 11 && date.getDate() === 25)) {
        const code2DDMM = `2${day}${month}`;
        // Trả về ngay nếu trong khoảng này (sẽ kiểm tra trong readingdata sau)
        // return code2DDMM; // Comment để xử lý các trường hợp đặc biệt trước
    }
    
    // ===== ƯU TIÊN 2: Các lễ di động có mã riêng =====
    
    // 6000-6006: Lễ Hiển Linh và các ngày sau
    const epiphany = litData.epiphany || new Date(date.getFullYear(), 0, 6);
    if (dTime === t(epiphany)) {
        return "6000"; // Lễ Hiển Linh
    }
    
    // 5010: Lễ Chúa Giêsu Chịu Phép Rửa (Chúa Nhật I Thường Niên)
    const baptismLord = litData.baptismLord;
    if (baptismLord && dTime === t(baptismLord)) {
        return "5010"; // Chúa Nhật I Thường Niên - Chúa Giêsu Chịu Phép Rửa
    }
    
    // Các ngày sau lễ Hiển Linh (trước Chúa Giêsu Chịu Phép Rửa)
    if (baptismLord && dTime > t(epiphany) && dTime < t(baptismLord)) {
        const daysAfterEpiphany = Math.floor((dTime - t(epiphany)) / (24 * 60 * 60 * 1000));
        if (daysAfterEpiphany >= 1 && daysAfterEpiphany <= 6) {
            return `600${daysAfterEpiphany}`;
        }
    }
    
    // 4080: Thăng Thiên (Easter + 39 ngày, thường là Thứ Năm)
    const ascension = litData.ascension || addDays(litData.easter, 39);
    if (dTime === t(ascension)) {
        return "4080";
    }
    
    // 4089: Vọng Hiện Xuống (trước Hiện Xuống 1 ngày)
    const pentecostVigil = addDays(litData.pentecost, -1);
    if (dTime === t(pentecostVigil)) {
        return "4089";
    }
    
    // 5410: Hiện Xuống (Pentecost Sunday) - mã theo READINGS_SUNDAY
    if (dTime === t(litData.pentecost)) {
        return "5410";
    }
    
    // Các lễ trọng sau Hiện Xuống - mã theo READINGS_SUNDAY
    // 5420: Ba Ngôi (Trinity Sunday) - Chúa Nhật sau Hiện Xuống
    if (dTime === t(litData.trinity)) {
        return "5420";
    }
    // 5430: Mình Máu Thánh (Corpus Christi) - Chúa Nhật sau Ba Ngôi
    if (dTime === t(litData.corpusChristi)) {
        return "5430";
    }
    // 5440: Thánh Tâm (Sacred Heart) - Thứ Sáu sau Mình Máu
    if (dTime === t(litData.sacredHeart)) {
        return "5440";
    }
    // 5441: Trái Tim Vô Nhiễm Mẹ - Thứ Bảy sau Thánh Tâm
    if (dTime === t(litData.immaculateHeart)) {
        return "5441";
    }
    
    // 3004-3007: Đầu Mùa Chay (Thứ Tư Lễ Tro đến Thứ Bảy)
    // Nếu Lễ Tro bị dời (trùng Tết), bài đọc Lễ Tro (3004) được dùng vào ngày cử hành thực tế
    if (litData.ashWednesdayTransferred) {
        // Ngày cử hành Lễ Tro thực tế (dời sang Mùng 4 Tết)
        if (dTime === t(litData.ashWednesdayCelebration)) {
            return "3004"; // Bài đọc Lễ Tro
        }
        // Các ngày sau Lễ Tro ban đầu (Thứ Năm, Thứ Sáu, Thứ Bảy sau Tro)
        if (dTime > t(litData.ashWednesday) && dTime <= t(addDays(litData.ashWednesday, 3))) {
            const daysFromAsh = Math.floor((dTime - t(litData.ashWednesday)) / (24 * 60 * 60 * 1000));
            return `300${4 + daysFromAsh}`;
        }
        // Ngày Lễ Tro ban đầu (bị dời) - không có mã riêng, dùng mã thường niên
    } else {
        // Lễ Tro không bị dời - logic bình thường
        if (dTime >= t(litData.ashWednesday) && dTime <= t(addDays(litData.ashWednesday, 3))) {
            const daysFromAsh = Math.floor((dTime - t(litData.ashWednesday)) / (24 * 60 * 60 * 1000));
            return `300${4 + daysFromAsh}`;
        }
    }
    
    // ===== ƯU TIÊN 3: Tính mùa + tuần + thứ (SWWD) =====
    let seasonCode = 0, weekCode = 0;

    if (dTime >= t(litData.adventStart) && dTime < t(litData.christmas)) { // Advent
        // 17-24/12 đã xử lý ở trên (2DDMM)
        if (date.getMonth() === 11 && date.getDate() >= 17 && date.getDate() <= 24) {
            return `2${day}${month}`;
        }
        seasonCode = 1;
        weekCode = Math.floor((t(currentSun) - t(getSunday(litData.adventStart))) / ONE_WEEK) + 1;
    } else if (dTime >= t(litData.christmas) || dTime < t(litData.baptismLord)) { // Christmas
        // Mùa Giáng Sinh dùng 2DDMM (không bao gồm ngày Chúa Giêsu Chịu Phép Rửa)
        return `2${day}${month}`;
    } else if (dTime >= t(litData.ashWednesday) && dTime < t(litData.easter)) { // Lent
        // 3004-3007 đã xử lý ở trên
        seasonCode = 3;
        const firstSunLent = addDays(litData.ashWednesday, 4); // Chúa Nhật I Mùa Chay
        if (dTime < t(firstSunLent)) {
            weekCode = 0; // Tuần 0 (sau Lễ Tro)
        } else {
            weekCode = Math.floor((t(currentSun) - t(getSunday(firstSunLent))) / ONE_WEEK) + 1;
        }
    } else if (dTime >= t(litData.easter) && dTime <= t(litData.pentecost)) { // Easter
        seasonCode = 4;
        weekCode = Math.floor((t(currentSun) - t(getSunday(litData.easter))) / ONE_WEEK) + 1;
    } else { // Ordinary
        seasonCode = 5;
        if (dTime > t(litData.pentecost)) {
            // Sau Hiện Xuống: tính ngược từ Chúa Kitô Vua
            const ckSunday = getSunday(litData.christKing);
            weekCode = 34 - Math.round((t(ckSunday) - t(currentSun)) / ONE_WEEK);
        } else {
            // Sau Lễ Hiển Linh: tính từ Chúa Nhật Lễ Chúa Giêsu Chịu Phép Rửa
            const baptismSun = getSunday(litData.baptismLord);
            weekCode = Math.floor((t(currentSun) - t(baptismSun)) / ONE_WEEK) + 1;
        }
    }
    
    const weekStr = weekCode < 10 ? `0${weekCode}` : `${weekCode}`;
    return `${seasonCode}${weekStr}${dayCode}`;
}

function getLiturgicalCycle(date, litData) {
    let year = date.getFullYear();
    if (date.getTime() >= litData.adventStart.getTime()) year += 1;
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
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
    const dTime = t(date);

    if (month === 11 && day >= 17 && day <= 24) return "Tuần Chuẩn Bị Giáng Sinh";
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
    if (code === "5410") return "Lễ Hiện Xuống";
    if (code === "5420") return "Lễ Chúa Ba Ngôi";
    if (code === "5430") return "Lễ Mình Máu Thánh Chúa";
    if (code === "5440") return "Lễ Thánh Tâm Chúa Giêsu";
    if (code === "5441") return "Trái Tim Vô Nhiễm Mẹ";

    const week = parseInt(code.substring(1, 3));
    const seasonNames = ["", "Mùa Vọng", "Mùa Giáng Sinh", "Mùa Chay", "Mùa Phục Sinh", "Thường Niên"];
    if(week === 0 && season === 3) return "Sau Lễ Tro";
    if(week === 6 && season === 3) return "Tuần Thánh";
    if(week === 1 && season === 4) return "Tuần Bát Nhật Phục Sinh";
    return `Tuần ${toRoman(week)} ${seasonNames[season]}`;
}

function getRankDisplayName(rank) {
    switch(rank) {
        case 'TRONG': return 'LỄ TRỌNG';
        case 'KINH': return 'LỄ KÍNH';
        case 'NHO': return 'LỄ NHỚ';
        case 'NHOKB': return 'LỄ NHỚ (TD)';
        default: return '';
    }
}
function getRankBadgeClass(rank) {
     switch(rank) {
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
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
    const dTime = t(date);
    const dayOfWeek = date.getDay();
    const season = parseInt(getLiturgicalDayCode(date, litData).substring(0, 1));
    const specialDayType = getSpecialDayType(date, litData);
    
    // 1. TRIDUUM - Tam Nhật Vượt Qua (ưu tiên tuyệt đối)
    if (specialDayType === 'TRIDUUM') {
        return RANK.TRIDUUM;
    }
    
    // 2. HIGH_LORD_SUNDAY_SEASON - Chúa Nhật trong mùa đặc biệt (Vọng, Chay, Phục Sinh)
    if (dayOfWeek === 0 && (season === 1 || season === 3 || season === 4)) {
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
    
    // 5. SUNDAY_ORD_OR_CHRISTMAS - Chúa Nhật Thường Niên hoặc ngày trong Mùa Giáng Sinh
    if (dayOfWeek === 0 && season === 5) {
        return RANK.SUNDAY_ORD_OR_CHRISTMAS;
    }
    if (season === 2) { // Mùa Giáng Sinh (bất kỳ ngày nào)
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
        const day = date.getDate();
        if (day >= 17 && day <= 24) {
            return RANK.ADVENT_17_24_WEEKDAY;
        }
    }
    
    // 10. ADVENT_1_16_WEEKDAY - Ngày thường 1-16/12 Mùa Vọng
    if (season === 1 && dayOfWeek !== 0) {
        return RANK.ADVENT_1_16_WEEKDAY;
    }
    
    // 11. CHRISTMAS_WEEKDAY - Ngày thường Mùa Giáng Sinh (đã xử lý ở trên cho tất cả ngày)
    // Không cần check lại vì đã return ở trên
    
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
function getRankPriority(rankCode, date = null, litData = null) {
    // Chuyển đổi từ rank code sang precedence rank (số nhỏ hơn = ưu tiên cao hơn)
    const tempInfo = { rankCode: rankCode };
    const targetDate = date || new Date();
    const targetLitData = litData || getLiturgicalData(targetDate.getFullYear());
    return getPrecedenceRank(tempInfo, targetDate, targetLitData);
}

// Xác định loại ngày phụng vụ đặc biệt
function getSpecialDayType(date, litData) {
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
    
    // Bát Nhật Giáng Sinh
    const christmasTime = t(litData.christmas);
    const christmasOctaveEnd = t(new Date(date.getFullYear(), 0, 1));
    if (dTime >= christmasTime && dTime <= christmasOctaveEnd) {
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
    
    // Tam Nhật Vượt Qua
    if (specialDayType === 'TRIDUUM') {
        const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
        if (season === 1) { // Mùa Vọng
            const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
            const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
            const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
            const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
            const dTime = t(date);
            
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
    
    const baseRank = getPrecedenceRank(temporalInfo, date, litData);
    
    // Xử lý đặc biệt cho các ngày sau lễ Hiển Linh
    if (litData.epiphany && litData.baptismLord) {
        const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
        const dTime = t(date);
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
    
    // Bát Nhật Giáng Sinh → dời sang Thứ Hai sau Bát Nhật
    if (specialDayType === 'CHRISTMAS_OCTAVE') {
        const christmasOctaveEnd = new Date(originalDate.getFullYear(), 0, 1);
        return addDays(christmasOctaveEnd, 1);
    }
    
    // Không cần dời
    return null;
}

// Xác định lễ nào bị dời đến ngày này
function getTransferredFeast(date, litData) {
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
        precedenceReason: null
    };

    if(season === 1) { result.season = "Mùa Vọng"; result.color = "bg-lit-purple"; result.textColor = "text-lit-purple"; }
    else if(season === 2) { result.season = "Mùa Giáng Sinh"; result.color = "bg-lit-white"; result.textColor = "text-lit-gold"; }
    else if(season === 3) { result.season = "Mùa Chay"; result.color = "bg-lit-purple"; result.textColor = "text-lit-purple"; }
    else if(season === 4) { result.season = "Mùa Phục Sinh"; result.color = "bg-lit-white"; result.textColor = "text-lit-gold"; }
    
    // Default Sunday Rank
    if(dayOfWeek === 0) { result.rankCode = 'CHUA_NHAT'; result.rankName = 'Chúa Nhật'; }

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
            result._forceTemporal = true;
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
    
    if (dTime === t(litData.vietnameseMartyrs)) { result.special = "CÁC THÁNH TỬ ĐẠO VIỆT NAM"; result.color = "bg-lit-red"; result.rankCode = "TRONG"; }
    if (dTime === t(litData.rosarySunday)) { result.special = "ĐỨC MẸ MÂN CÔI (Kính Trọng Thể)"; result.color = "bg-lit-white"; result.rankCode = "TRONG"; }
    if (dTime === t(litData.missionSunday)) { result.special = "Khánh Nhật Truyền Giáo"; result.color = "bg-lit-green"; result.rankCode = "CHUA_NHAT"; } 
    
    if (dTime === t(litData.annunciation)) { result.special = "LỄ TRUYỀN TIN"; result.color = "bg-lit-white"; result.rankCode = "TRONG"; }
    if (dTime === t(litData.stJoseph)) { result.special = "THÁNH GIUSE BẠN TRĂM NĂM ĐỨC MARIA"; result.color = "bg-lit-white"; result.rankCode = "TRONG"; }
    if (dTime === t(litData.immConception)) { result.special = "ĐỨC MẸ VÔ NHIỄM NGUYÊN TỘI"; result.color = "bg-lit-white"; result.rankCode = "TRONG"; }
    
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
    
    // Chỉ xử lý sanctoral nếu không có lễ bị dời
    if (!transferredFeast && FIXED_DATA_LOOKUP[key]) {
        const saint = FIXED_DATA_LOOKUP[key];
        
        // Kiểm tra xem lễ này có bị dời không
        const transferDate = getTransferDate(date, litData);
        const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
        const shouldTransfer = transferDate && saint.rank === 'TRONG' && 
                              (date.getDay() === 0 || getSpecialDayType(date, litData) !== 'ORDINARY');
        
        if (!shouldTransfer) {
            // Lễ không bị dời, thêm vào saints
            result.saints.push(saint);
            
            // === ĐẶC BIỆT: Ngày sau lễ Hiển Linh ===
            // Nếu là ngày sau Hiển Linh và lễ thánh chỉ là tùy chọn (NHOKB/O), 
            // giữ temporal làm chính, thánh làm phụ
            if (result._forceTemporal) {
                // Giữ cử hành chính là temporal (ví dụ: ngày bắt đầu Mùa Chay khi Lễ Tro dời)
                // Saint đã được thêm vào result.saints, sẽ hiển thị như secondary
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

    // Chúa Nhật luôn có rank CHUA_NHAT (trừ khi đã là TRONG)
    if(dayOfWeek === 0 && result.rankCode !== 'TRONG') { 
        result.rankCode = 'CHUA_NHAT'; 
        result.rankName = 'Chúa Nhật'; 
    }
    
    // ===== XỬ LÝ TẾT VIỆT NAM =====
    const tetEvent = getTetEvent(date);
    if (tetEvent) {
        const tetResolution = resolveTetConflict(tetEvent, result, date, litData);
        
        if (tetResolution && tetResolution.celebrate) {
            // So sánh rank để quyết định cử hành chính
            const currentRank = getRankPriority(result.rankCode, date, litData);
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
            // Tết không được cử hành (Tuần Thánh/Tam Nhật)
            result.tetNote = tetResolution.note;
            result.tetEvent = tetEvent;
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
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
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
            mainFeastCode: "5410"
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

    // 1. Seasonal/Temporal Reading
    if (dayOfWeek === 0) {
        // Chúa Nhật: tìm trong READINGS_SUNDAY
        if (typeof READINGS_SUNDAY !== 'undefined' && READINGS_SUNDAY[code] && READINGS_SUNDAY[code][cycle]) {
            results.push({ type: 'seasonal', data: READINGS_SUNDAY[code][cycle] });
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
        }
        if (daily) results.push({ type: 'seasonal', data: daily });
    }

    // 2. Sanctoral Reading (mã 7DDMM) - tìm trong READINGS_SPECIAL (SaintsBible.js)
    if (sanctoralCode) {
        // Tìm trong READINGS_SPECIAL (bài đọc đầy đủ cho các thánh)
        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[sanctoralCode]) {
            results.push({ type: 'sanctoral', data: READINGS_SPECIAL[sanctoralCode] });
        }
        // Fallback: tìm trong READINGS_SEASONAL nếu có
        else if (typeof READINGS_SEASONAL !== 'undefined' && READINGS_SEASONAL[sanctoralCode]) {
            results.push({ type: 'sanctoral', data: READINGS_SEASONAL[sanctoralCode] });
        }
    }
    
    // 3. Option Saint Reading (mã 8DDMM) - tìm trong OptionsaintReadings (Optionsaint.js)
    if (specialCode) {
        // Tìm trong OptionsaintReadings
        if (typeof OptionsaintReadings !== 'undefined' && OptionsaintReadings[specialCode]) {
            results.push({ type: 'special', data: OptionsaintReadings[specialCode] });
        }
        // Fallback: tìm trong READINGS_SPECIAL
        else if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[specialCode]) {
            results.push({ type: 'special', data: READINGS_SPECIAL[specialCode] });
        }
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

    const createBlock = (d, blockType) => {
        if(!d) return "";
        let html = `<div class="reading-block">`;
        
        // Header với icon
        let icon = '📖';
        let headerText = d.title || '';
        if(blockType === 'reading1') { icon = '📜'; headerText = headerText || 'Bài Đọc I'; }
        else if(blockType === 'reading2') { icon = '📜'; headerText = headerText || 'Bài Đọc II'; }
        else if(blockType === 'gospel') { icon = '✝️'; headerText = headerText || 'Tin Mừng'; }
        
        html += `<div class="flex items-center gap-2 mb-2">`;
        html += `<span class="text-lg">${icon}</span>`;
        html += `<span class="reading-header" style="color: ${colors.header}; margin-bottom: 0;">${headerText}</span>`;
        html += `</div>`;
        
        if(d.excerpt) html += `<span class="reading-citation">${d.excerpt}</span>`;
        if(d.info) html += `<span class="reading-info">${d.info}</span>`;
        if(d.content) {
            const formattedContent = d.content
                .replace(/\r\n/g, '<br/>')
                .replace(/\n/g, '<br/>');
            html += `<p class="reading-content">${formattedContent}</p>`;
        }
        if(d.end) html += `<span class="reading-end">${d.end}</span>`;
        html += `</div>`;
        return html;
    };
    
    const createPsalm = (d) => {
        if(!d) return "";
        let html = `<div class="reading-block" style="background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); padding: 16px; border-radius: 8px; margin: 16px 0;">`;
        html += `<div class="flex items-center gap-2 mb-3">`;
        html += `<span class="text-lg">🎵</span>`;
        html += `<span class="reading-header" style="color: #854d0e; margin-bottom: 0;">Đáp Ca</span>`;
        html += `</div>`;
        if(d.excerpt) html += `<span class="reading-citation" style="color: #92400e;">${d.excerpt}</span>`;
        if(d.response) html += `<div class="psalm-response" style="background: white; padding: 12px; border-radius: 6px; margin: 12px 0; border-left: 4px solid #facc15;">${d.response}</div>`;
        if(d.verses) { 
            html += `<div class="space-y-2 mt-3">`;
            d.verses.forEach(v => html += `<span class="psalm-verse">${v}</span>`);
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    };
    
    const createAlleluia = (d) => {
        if(!d) return "";
        return `
        <div class="alleluia-box" style="background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border-left: 4px solid #facc15; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">🎶</span>
                <span class="alleluia-verse" style="margin-bottom: 0;">${d.verse || 'Alleluia, Alleluia!'}</span>
            </div>
            <p class="alleluia-content">${d.content}</p>
        </div>`;
    };

    // Render các phần
    fullHtml += createBlock(data.firstReading, 'reading1');
    fullHtml += createPsalm(data.psalms);
    if (data.secondReading) {
        fullHtml += createBlock(data.secondReading, 'reading2');
    }
    fullHtml += createAlleluia(data.alleluia);
    fullHtml += createBlock(data.gospel, 'gospel');

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

function updateHeaderTodayInfo() {
    const today = new Date();
    const litData = getLiturgicalData(today.getFullYear());
    const info = getDayInfo(today, litData);
    
    const dayOfWeek = DAYS_FULL_VI[today.getDay()];
    const cycle = getLiturgicalCycle(today, litData);
    const weekdayCycle = today.getFullYear() % 2 !== 0 ? "1" : "2";
    const detailedWeek = getDetailedLiturgicalWeek(today, litData);
    
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
    
    const headerCycle = document.getElementById('headerCycle');
    if (headerCycle) {
        let cycleText = `Năm ${cycle}`;
        // Thêm năm lẻ/chẵn cho ngày thường Mùa Thường Niên
        if (info.season === "Mùa Thường Niên" && today.getDay() !== 0) {
            cycleText += ` • ${weekdayCycle === "1" ? "Năm lẻ" : "Năm chẵn"}`;
        }
        headerCycle.innerText = cycleText;
    }
    
    // === 3. THAM CHIẾU BÀI ĐỌC ===
    const code = getLiturgicalDayCode(today, litData);
    const sanctoralCode = getSanctoralDayCode(today);
    const specialCode = getSpecialFeastCode(today, litData);
    
    let seasonalSummary = READINGS_DATA.find(r => {
        if (r.code != code) return false;
        if (today.getDay() === 0) return r.year === cycle;
        return r.year === weekdayCycle || r.year === "0";
    });
    
    let readingsText = "";
    if (seasonalSummary) {
        let parts = [seasonalSummary.reading1, seasonalSummary.psalm, seasonalSummary.gospel].filter(Boolean);
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
        
        // Thu thập thánh/lễ nhớ không phải cử hành chính
        if (info.saints.length > 0) {
            info.saints.forEach((saint, idx) => {
                // Bỏ qua nếu đã là cử hành chính
                if (idx === 0 && ['S', 'F'].includes(saint.type) && !info.special) return;
                if (!['S', 'F'].includes(saint.type)) {
                    secondaryCelebrations.push(saint.name);
                }
            });
        }
        
        // Thu thập commemorations
        if (info.commemorations && info.commemorations.length > 0) {
            info.commemorations.forEach(c => {
                const name = c.special || c.name || c.key;
                if (name) secondaryCelebrations.push(name);
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

// Generate tooltip content từ thông tin phụng vụ
function generateTooltipContent(date, info, litData) {
    const code = getLiturgicalDayCode(date, litData);
    const sanctoralCode = getSanctoralDayCode(date);
    const specialCode = getSpecialFeastCode(date, litData);
    const cycle = getLiturgicalCycle(date, litData);
    const weekdayCycle = currentYear % 2 !== 0 ? "1" : "2";
    const detailedWeek = getDetailedLiturgicalWeek(date, litData);
    
    // Lấy thông tin bài đọc
    let seasonalSummary = READINGS_DATA.find(r => {
        if (r.code != code) return false;
        if (date.getDay() === 0) return r.year === cycle;
        return r.year === weekdayCycle || r.year === "0";
    });
    let sanctoralSummary = READINGS_DATA.find(r => r.code == sanctoralCode);
    let specialSummary = READINGS_DATA.find(r => r.code == specialCode);
    
    const gospel = seasonalSummary?.gospel || sanctoralSummary?.gospel || specialSummary?.gospel || '';
    
    // Xác định có lựa chọn khác không
    const hasSanctoral = sanctoralSummary && sanctoralSummary !== seasonalSummary;
    const hasSpecial = specialSummary && specialSummary !== seasonalSummary;
    const hasAlternatives = hasSanctoral || hasSpecial;
    
    // Xác định cử hành chính và bậc lễ thấp hơn từ info (đã được xử lý bởi precedence engine)
    let primaryName = '';
    let secondaryName = '';
    
    // Kiểm tra xem có phải là ngày lễ vọng không (không hiển thị trong tooltip)
    const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
    const dTime = t(date);
    const month = date.getMonth();
    const day = date.getDate();
    const pentecostVigil = addDays(litData.pentecost, -1);
    const holySaturday = addDays(litData.easter, -1);
    const isVigilDay = 
        code === "4089" || // Vọng Hiện Xuống
        (month === 11 && day === 24) || // Lễ Vọng Giáng Sinh (24/12)
        (dTime === t(holySaturday)) || // Canh Thức Vượt Qua (Thứ Bảy Tuần Thánh)
        (month === 9 && day === 31); // Lễ Vọng Các Thánh (31/10)
    
    // Cử hành chính: từ info.special hoặc detailedWeek
    // Nếu là lễ vọng, hiển thị mùa phụng vụ thay vì tên lễ vọng
    if (isVigilDay) {
        // Hiển thị mùa phụng vụ thay vì tên lễ vọng
        const season = parseInt(code.substring(0, 1));
        const week = parseInt(code.substring(1, 3));
        const seasonNames = ["", "Mùa Vọng", "Mùa Giáng Sinh", "Mùa Chay", "Mùa Phục Sinh", "Thường Niên"];
        if (week > 0 && season > 0 && season < 6) {
            primaryName = `Tuần ${toRoman(week)} ${seasonNames[season]}`;
        } else {
            primaryName = info.season || "Mùa Thường Niên";
        }
    } else {
        primaryName = info.special || detailedWeek;
    }
    
    // Bậc lễ thấp hơn: từ commemorations hoặc saints không được cử hành
    if (info.commemorations && info.commemorations.length > 0) {
        // Lấy commemoration đầu tiên
        const commemoration = info.commemorations[0];
        secondaryName = commemoration.special || commemoration.name || '';
    } else if (info.saints.length > 0 && !info.special) {
        // Nếu có saints nhưng không phải cử hành chính
        secondaryName = info.saints[0].name;
    }
    
    // Xác định chu kỳ - chỉ hiển thị với Mùa Thường Niên và cử hành chính là temporal
    let cycleText = '';
    // Cử hành chính là temporal nếu:
    // - Không phải lễ bị dời (transferred)
    // - Và (_winnerKey không phải "SANCTORAL" hoặc không có _winnerKey)
    // - Và (info.special không phải là tên thánh hoặc info.special === detailedWeek)
    const isSanctoralPrimary = info._winnerKey === "SANCTORAL" || 
                               (info.saints.length > 0 && info.special === info.saints[0]?.name);
    const isTemporalPrimary = !info.transferred && !isSanctoralPrimary;
    
    if (info.season === "Mùa Thường Niên" && isTemporalPrimary) {
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
                const isSanctoralPrimary = info._winnerKey === "SANCTORAL" || 
                                         (info.special === saint.name);
                
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
    if (info.isTet && info.tetNote) {
        html += `<div class="tooltip-section" style="background-color: #fef2f2; padding: 8px; border-radius: 4px; margin-top: 8px;">`;
        html += `<div class="tooltip-label" style="color: #dc2626;">🎊 Tết Nguyên Đán</div>`;
        html += `<div class="tooltip-value" style="font-size: 0.8rem; color: #991b1b;">${info.tetNote}</div>`;
        html += `</div>`;
    } else if (info.tetEvent && info.tetNote) {
        // Tết không được cử hành chính nhưng có ghi chú
        html += `<div class="tooltip-section" style="background-color: #fef2f2; padding: 8px; border-radius: 4px; margin-top: 8px;">`;
        html += `<div class="tooltip-label" style="color: #dc2626;">🎊 ${info.tetEvent.name}</div>`;
        html += `<div class="tooltip-value" style="font-size: 0.8rem; color: #991b1b;">${info.tetNote}</div>`;
        html += `</div>`;
    }
    
    // Hiển thị thông tin dời Lễ Tro nếu có
    if (info.ashWednesdayNote) {
        html += `<div class="tooltip-section" style="background-color: #f3e8ff; padding: 8px; border-radius: 4px; margin-top: 8px;">`;
        html += `<div class="tooltip-label" style="color: #7c3aed;">✝️ Lễ Tro ${info.isTransferredAshWednesday ? '(Dời)' : ''}</div>`;
        html += `<div class="tooltip-value" style="font-size: 0.75rem; color: #5b21b6;">${info.ashWednesdayNote}</div>`;
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
        monthDiv.className = "bg-white p-4 rounded-2xl shadow border border-gray-100 flex flex-col";
        const monthTitle = document.createElement('div');
        monthTitle.className = "flex justify-center items-center mb-4 pb-2 border-b border-gray-100 font-bold text-gray-800 uppercase tracking-widest text-lg";
        monthTitle.innerText = MONTHS_VI[month];
        monthDiv.appendChild(monthTitle);
        const daysHeader = document.createElement('div');
        daysHeader.className = "grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-gray-400 text-center uppercase tracking-wide";
        DAYS_VI.forEach(d => {
            const span = document.createElement('span'); span.innerText = d;
            if(d==='CN') span.className = "text-red-500 font-bold";
            daysHeader.appendChild(span);
        });
        monthDiv.appendChild(daysHeader);
        const daysGrid = document.createElement('div');
        daysGrid.className = "grid grid-cols-7 gap-2 flex-grow";
        const firstDayOfMonth = new Date(currentYear, month, 1).getDay();
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        for(let i=0; i<firstDayOfMonth; i++) daysGrid.appendChild(document.createElement('div'));

        for(let d=1; d<=daysInMonth; d++) {
            const date = new Date(currentYear, month, d);
            const info = getDayInfo(date, litData);
            const dayEl = document.createElement('div');
            let bgClass = "bg-white hover:bg-gray-50 text-gray-700";
            let borderClass = "border-gray-200";
            if(info.color.includes('purple')) { bgClass = "bg-purple-50 text-purple-900"; borderClass = "border-purple-200"; }
            else if(info.color.includes('green') && date.getDay()===0) { bgClass = "bg-green-50 text-green-900"; borderClass = "border-green-200"; }
            else if(info.color.includes('red')) { bgClass = "bg-red-50 text-red-900"; borderClass = "border-red-200"; }
            else if(info.color.includes('white')) { bgClass = "bg-yellow-50 text-yellow-900"; borderClass = "border-yellow-200"; }
            // Tạo bản sao để tránh mutation - so sánh timestamp thay vì mutate date
            const dateCopy = new Date(date);
            dateCopy.setHours(0, 0, 0, 0);
            const todayCopy = new Date();
            todayCopy.setHours(0, 0, 0, 0);
            const isToday = (dateCopy.getTime() === todayCopy.getTime());
            if(isToday) bgClass += " today-highlight";
            dayEl.className = `calendar-day ${bgClass} ${borderClass}`;
            
            // Áp dụng quy tắc bậc lễ và precedence để xác định hiển thị
            // LƯU Ý: Không hiển thị lễ vọng trong calendar grid, chỉ hiển thị trong modal
            let dayLabel = "";
            const dayCode = getLiturgicalDayCode(date, litData);
            
            // Kiểm tra xem có phải là ngày lễ vọng không
            const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
            const dTime = t(date);
            const dateMonth = date.getMonth();
            const dateDay = date.getDate();
            
            // Xác định các ngày lễ vọng
            const pentecostVigil = addDays(litData.pentecost, -1);
            const holySaturday = addDays(litData.easter, -1);
            const isVigilDay = 
                dayCode === "4089" || // Vọng Hiện Xuống
                (dateMonth === 11 && dateDay === 24) || // Lễ Vọng Giáng Sinh (24/12)
                (dTime === t(holySaturday)) || // Canh Thức Vượt Qua (Thứ Bảy Tuần Thánh)
                (dateMonth === 9 && dateDay === 31); // Lễ Vọng Các Thánh (31/10)
            
            // Ưu tiên: Lễ bị dời > Lễ cử hành chính > Commemorations
            if (info.transferred && info.special) {
                // Lễ bị dời đến ngày này
                dayLabel = info.special;
            } else if (info.special && !isVigilDay) {
                // Cử hành chính (từ precedence) - BỎ QUA nếu là lễ vọng
                dayLabel = info.special;
            } else if (info.saints.length > 0) {
                // Sanctoral (nếu không bị dời)
                dayLabel = info.saints[0].name.replace("Thánh ", "T.").replace("Đức Mẹ ", "ĐM.");
            } else {
                // Ngày thường - Nếu là lễ vọng, hiển thị mùa phụng vụ thay vì tên lễ vọng
                if (isVigilDay) {
                    // Hiển thị mùa phụng vụ thay vì tên lễ vọng
                    const season = parseInt(dayCode.substring(0, 1));
                    const week = parseInt(dayCode.substring(1, 3));
                    const seasonNames = ["", "Mùa Vọng", "Mùa Giáng Sinh", "Mùa Chay", "Mùa Phục Sinh", "Thường Niên"];
                    if (week > 0 && season > 0 && season < 6) {
                        dayLabel = `<span class="ferial-label">Tuần ${toRoman(week)} ${seasonNames[season]}</span>`;
                    } else {
                        dayLabel = `<span class="ferial-label">${info.season || "Mùa Thường Niên"}</span>`;
                    }
                } else {
                    // Ngày thường bình thường
                    dayLabel = `<span class="ferial-label">${getDetailedLiturgicalWeek(date, litData)}</span>`;
                }
            }
            
            let html = `<span class="day-number">${d}</span>`;
            if (dayLabel) html += `<span class="day-label">${dayLabel}</span>`;
            
            // Hiển thị lịch âm (Âm lịch Việt Nam)
            const lunar = LUNAR_CALENDAR.getLunarDate(date);
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
            
            // Hiển thị dấu chấm cho lễ trọng (cử hành chính hoặc bị dời)
            if (info.rankCode === "TRONG" || (info.transferred && info.rankCode === "TRONG")) {
                html += `<div class="saint-dot bg-red-500"></div>`;
            } else if (info.saints.length > 0 && info.saints[0].rank === "TRONG" && !info.transferred) {
                html += `<div class="saint-dot bg-red-500"></div>`;
            }
            
            dayEl.innerHTML = html;
            dayEl.onclick = () => openModal(date, info);
            
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
        monthDiv.appendChild(daysGrid);
        grid.appendChild(monthDiv);
    }
    
    // Log performance
    const endTime = performance.now();
    console.log(`⚡ Render calendar ${currentYear}: ${(endTime - startTime).toFixed(2)}ms`);
}

function openModal(date, info) {
    const modal = document.getElementById('dayModal');
    const litData = getLiturgicalData(currentYear);
    const code = getLiturgicalDayCode(date, litData);
    const sanctoralCode = getSanctoralDayCode(date);
    const specialCode = getSpecialFeastCode(date, litData);
    const cycle = getLiturgicalCycle(date, litData);
    const weekdayCycle = currentYear % 2 !== 0 ? "1" : "2"; 
    const detailedWeek = getDetailedLiturgicalWeek(date, litData);
    const dayName = DAYS_FULL_VI[date.getDay()];
    
    // ============================================================================
    // HEADER - Ngày tháng và cử hành chính
    // ============================================================================
    
    // Ngày dương lịch
    const modalDate = document.getElementById('modalDate');
    const modalDayOfWeek = document.getElementById('modalDayOfWeek');
    if (modalDate) modalDate.innerText = `${date.getDate()} tháng ${date.getMonth() + 1}, ${currentYear}`;
    if (modalDayOfWeek) modalDayOfWeek.innerText = dayName;
    
    // Ngày âm lịch
    const lunar = LUNAR_CALENDAR.getLunarDate(date);
    const lunarMonthName = LUNAR_CALENDAR.getLunarMonthName(lunar.month, lunar.leap);
    const modalLunarDate = document.getElementById('modalLunarDate');
    if (modalLunarDate) modalLunarDate.innerText = `${lunar.day}/${lunar.month}${lunar.leap ? ' nhuận' : ''} (${lunarMonthName})`;
    
    // Màu header theo mùa
    const header = document.getElementById('modalHeader');
    if(info.color.includes('green')) header.style.background = 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)';
    else if(info.color.includes('purple')) header.style.background = 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)';
    else if(info.color.includes('red')) header.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)';
    else header.style.background = 'linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)';

    // === 1. CỬ HÀNH CHÍNH (Title + Rank + Color) ===
    let celebrationTitle = "";
    let celebrationSubtitle = "";
    let rankCode = info.rankCode;
    
    if (info.special) {
        celebrationTitle = info.special;
    } else if (info.isTet) {
        const tetEvent = getTetEvent(date);
        celebrationTitle = tetEvent?.fullName || tetEvent?.name || "Tết Nguyên Đán";
        rankCode = 'TRONG';
    } else if (info.saints.length > 0 && ['S', 'F'].includes(info.saints[0].type)) {
        celebrationTitle = info.saints[0].name;
        rankCode = info.saints[0].rank;
    } else {
        celebrationTitle = `${dayName} ${detailedWeek}`;
        if (date.getDay() === 0) rankCode = 'CN';
    }
    
    // Thêm subtitle nếu có cử hành phụ (sẽ được cập nhật sau nếu có lễ vọng)
    if (info.saints.length > 0 && !['S', 'F'].includes(info.saints[0].type) && !info.special) {
        celebrationSubtitle = `Có thể kính nhớ: ${info.saints[0].name}`;
    }
    
    const modalCelebrationTitle = document.getElementById('modalCelebrationTitle');
    const modalCelebrationSubtitle = document.getElementById('modalCelebrationSubtitle');
    if (modalCelebrationTitle) modalCelebrationTitle.innerText = celebrationTitle;
    if (modalCelebrationSubtitle) modalCelebrationSubtitle.innerText = celebrationSubtitle;
    
    // Color indicator
    const colorIndicator = document.getElementById('modalColorIndicator');
    colorIndicator.className = `w-4 h-4 rounded-full border-2 border-white shadow ${info.color}`;
    
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
    if (info.season === "Mùa Vọng") { seasonIcon = "🕯️"; seasonClass = "season-advent"; }
    else if (info.season === "Mùa Giáng Sinh") { seasonIcon = "⭐"; seasonClass = "season-christmas"; }
    else if (info.season === "Mùa Chay") { seasonIcon = "✝️"; seasonClass = "season-lent"; }
    else if (info.season === "Mùa Phục Sinh") { seasonIcon = "🕊️"; seasonClass = "season-easter"; }
    else if (info.season === "Mùa Thường Niên") { seasonIcon = "🌿"; seasonClass = "season-ordinary"; }
    
    seasonBadge.innerHTML = `${seasonIcon} ${detailedWeek}`;
    seasonBadge.className = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${seasonClass}`;
    
    const modalCode = document.getElementById('modalCode');
    const modalYearCycle = document.getElementById('modalYearCycle');
    if (modalCode) modalCode.innerText = code;
    if (modalYearCycle) modalYearCycle.innerText = `Năm ${cycle}`;
    
    // Weekday cycle (chỉ cho Mùa Thường Niên ngày thường)
    const weekdayCycleEl = document.getElementById('modalWeekdayCycle');
    if (info.season === "Mùa Thường Niên" && date.getDay() !== 0) {
        weekdayCycleEl.innerText = weekdayCycle === "1" ? "Năm lẻ" : "Năm chẵn";
        weekdayCycleEl.classList.remove('hidden');
    } else {
        weekdayCycleEl.classList.add('hidden');
    }

    // === 5. GHI CHÚ KỶ LUẬT PHỤNG VỤ ===
    const disciplines = getLiturgicalDiscipline(date, litData);
    const disciplineSection = document.getElementById('modalDisciplineSection');
    const disciplineContent = document.getElementById('modalDisciplineContent');
    if (disciplines.length > 0) {
        disciplineSection.classList.remove('hidden');
        disciplineContent.innerHTML = disciplines.map(d => 
            `<span class="discipline-tag ${d.class}">${d.icon} ${d.label}</span>`
        ).join('');
    } else {
        disciplineSection.classList.add('hidden');
    }

    // === TẾT SECTION ===
    const tetSection = document.getElementById('modalTetSection');
    const tetContent = document.getElementById('modalTetContent');
    if (info.isTet || info.tetEvent) {
        tetSection.classList.remove('hidden');
        const tetInfo = info.isTet ? getTetEvent(date) : info.tetEvent;
        if (tetInfo) {
            let tetHtml = `<p class="font-bold text-lg mb-1">${tetInfo.fullName || tetInfo.name}</p>`;
            if (info.tetNote) {
                tetHtml += `<p class="text-sm opacity-80">${info.tetNote}</p>`;
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
        if (info.ashWednesdayNote) {
            ashSection.classList.remove('hidden');
            let ashHtml = info.isTransferredAshWednesday 
                ? `<p class="font-bold text-lg mb-1">Cử hành Lễ Tro (Dời)</p>`
                : `<p class="font-bold text-lg mb-1">Bắt đầu Mùa Chay</p>`;
            ashHtml += `<p class="text-sm opacity-90">${info.ashWednesdayNote}</p>`;
            ashContent.innerHTML = ashHtml;
        } else {
            ashSection.classList.add('hidden');
        }
    }

    // === 3. CÁC CỬ HÀNH PHỤ ===
    const secondarySection = document.getElementById('modalSecondaryCelebrations');
    const secondaryContent = document.getElementById('modalSecondaryContent');
    const secondaryCelebrations = [];
    
    // Thu thập cử hành phụ từ saints và commemorations
    if (info.saints.length > 0) {
        info.saints.forEach((s, idx) => {
            if (idx > 0 || (!['S', 'F'].includes(s.type) && !info.special)) {
                secondaryCelebrations.push({
                    name: s.name,
                    rank: s.rank,
                    type: s.type === 'O' ? 'optional' : 'commemoration'
                });
            }
        });
    }
    if (info.commemorations && info.commemorations.length > 0) {
        info.commemorations.forEach(c => {
            secondaryCelebrations.push({
                name: c.special || c.name || c.key || 'Không rõ',
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
    } else if (secondarySection) {
        secondarySection.classList.add('hidden');
    }

    // === 4. BÀI ĐỌC ===
    // Kiểm tra lễ vọng
    const vigilInfo = getVigilInfo(date, litData);
    
    // Tìm summary từ READINGS_DATA
    let seasonalSummary = READINGS_DATA.find(r => {
        if (r.code != code) return false;
        if (date.getDay() === 0) return r.year === cycle;
        return r.year === weekdayCycle || r.year === "0";
    });
    let sanctoralSummary = READINGS_DATA.find(r => r.code == sanctoralCode);
    let specialSummary = READINGS_DATA.find(r => r.code == specialCode);
    const tetCode = getTetReadingCode(date);
    let tetSummary = tetCode ? READINGS_DATA.find(r => r.code == tetCode && r.year === "0") : null;
    
    // Tìm summary cho lễ vọng (nếu có)
    let vigilSummary = null;
    if (vigilInfo && vigilInfo.vigilCode) {
        vigilSummary = READINGS_DATA.find(r => {
            if (r.code != vigilInfo.vigilCode) return false;
            return r.year === cycle || r.year === "0";
        });
    }

    // Lấy dữ liệu bài đọc đầy đủ (bao gồm lễ vọng)
    const allReadings = getFullReadings(code, sanctoralCode, specialCode, date.getDay(), cycle, weekdayCycle, tetCode, vigilInfo);
    const seasonalFullData = allReadings.find(i => i.type === 'seasonal')?.data;
    const sanctoralFullData = allReadings.find(i => i.type === 'sanctoral')?.data;
    const specialFullData = allReadings.find(i => i.type === 'special')?.data;
    const tetFullData = allReadings.find(i => i.type === 'tet')?.data;
    const vigilFullData = allReadings.find(i => i.type === 'vigil')?.data;
    const vigilFullInfo = allReadings.find(i => i.type === 'vigil')?.vigilInfo;
    
    // === CẬP NHẬT HIỂN THỊ LỄ VỌNG (nếu có) ===
    if (vigilInfo && vigilInfo.hasVigil) {
        const modalCelebrationTitle = document.getElementById('modalCelebrationTitle');
        const modalCelebrationSubtitle = document.getElementById('modalCelebrationSubtitle');
        
        // Lấy tên bài đọc cho lễ chính
        const mainFeastCode = vigilInfo.mainFeastCode || code;
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
        
        // Hiển thị lễ chính với bài đọc
        if (modalCelebrationTitle) {
            const mainFeastName = vigilInfo.mainFeastName || celebrationTitle;
            const mainReadings = mainFeastReadings ? 
                `I: ${mainFeastReadings.reading1} • Đc: ${mainFeastReadings.psalm} • ${mainFeastReadings.reading2 ? `II: ${mainFeastReadings.reading2} • ` : ''}TM: ${mainFeastReadings.gospel}` : 
                '';
            
            modalCelebrationTitle.innerHTML = `
                <div class="font-bold text-lg mb-1">${mainFeastName}</div>
                <div class="text-sm text-gray-600 font-normal">${mainReadings}</div>
            `;
        }
        
        // Hiển thị lễ vọng với bài đọc
        if (modalCelebrationSubtitle) {
            if (vigilReadings) {
                const vigilReadingsStr = `I: ${vigilReadings.reading1} • Đc: ${vigilReadings.psalm} • ${vigilReadings.reading2 ? `II: ${vigilReadings.reading2} • ` : ''}TM: ${vigilReadings.gospel}`;
                modalCelebrationSubtitle.innerHTML = `
                    <div class="font-semibold text-base mb-1 text-purple-700">${vigilInfo.vigilName}</div>
                    <div class="text-sm text-gray-600 font-normal">${vigilReadingsStr}</div>
                `;
            } else {
                modalCelebrationSubtitle.innerHTML = `
                    <div class="font-semibold text-base mb-1 text-purple-700">${vigilInfo.vigilName}</div>
                `;
            }
        }
    }

    // ============================================================================
    // XÁC ĐỊNH NGUỒN BÀI ĐỌC MẶC ĐỊNH DỰA TRÊN BẬC LỄ (Precedence)
    // ============================================================================
    
    // Xác định nguồn bài đọc nên được load mặc định
    let defaultReadingSource = 'seasonal'; // Mặc định là Mùa phụng vụ
    let defaultLabel = 'Mùa Phụng Vụ';
    
    // 1. Tết có ưu tiên cao nhất (nếu đang cử hành Tết)
    if (info.isTet && tetFullData) {
        defaultReadingSource = 'tet';
        defaultLabel = 'Thánh Lễ Tết';
    }
    // 2. Kiểm tra _winnerKey từ Precedence Engine
    else if (info._winnerKey === 'SANCTORAL' && sanctoralFullData) {
        defaultReadingSource = 'sanctoral';
        defaultLabel = 'Lễ Kính Thánh';
    }
    // 3. Lễ Trọng/Kính của thánh (S/F type)
    else if (info.saints.length > 0 && ['S', 'F'].includes(info.saints[0].type) && sanctoralFullData) {
        defaultReadingSource = 'sanctoral';
        defaultLabel = 'Lễ Kính Thánh';
    }
    // 4. Special feast (nếu có và ưu tiên)
    else if (specialFullData && info.special) {
        defaultReadingSource = 'special';
        defaultLabel = 'Lễ Riêng';
    }
    
    // Tạo tabs chọn nguồn bài đọc
    const readingTabs = document.getElementById('modalReadingTabs');
    let tabsHtml = "";
    
    // Tab Seasonal
    const isSeasonalActive = defaultReadingSource === 'seasonal';
    tabsHtml += `<button id="btn-seasonal" class="reading-tab tab-seasonal ${isSeasonalActive ? 'active' : ''}">
        <i class="fas fa-leaf text-green-600"></i> Mùa phụng vụ
        ${isSeasonalActive ? '<span class="ml-1 text-[0.6rem] bg-green-100 text-green-700 px-1.5 rounded">Đang dùng</span>' : ''}
    </button>`;
    
    // Tab Sanctoral (nếu có)
    if (sanctoralSummary || sanctoralFullData) {
        const isSanctoralActive = defaultReadingSource === 'sanctoral';
        const saintName = info.saints.length > 0 ? info.saints[0].name : 'Lễ kính';
        tabsHtml += `<button id="btn-sanctoral" class="reading-tab tab-sanctoral ${isSanctoralActive ? 'active' : ''}">
            <i class="fas fa-cross text-red-600"></i> ${saintName.length > 20 ? 'Lễ kính' : saintName}
            ${isSanctoralActive ? '<span class="ml-1 text-[0.6rem] bg-red-100 text-red-700 px-1.5 rounded">Đang dùng</span>' : ''}
        </button>`;
    }
    
    // Tab Special (nếu có)
    if (specialSummary || specialFullData) {
        const isSpecialActive = defaultReadingSource === 'special';
        tabsHtml += `<button id="btn-special" class="reading-tab tab-special ${isSpecialActive ? 'active' : ''}">
            <i class="fas fa-star text-purple-600"></i> Lễ riêng
            ${isSpecialActive ? '<span class="ml-1 text-[0.6rem] bg-purple-100 text-purple-700 px-1.5 rounded">Đang dùng</span>' : ''}
        </button>`;
    }
    
    // Tab Tết (nếu có)
    if ((tetSummary || tetFullData) && info.isTet) {
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
    setupTabClick('btn-sanctoral', sanctoralFullData, 'sanctoral', sanctoralSummary, 'Lễ Kính Thánh');
    setupTabClick('btn-special', specialFullData, 'special', specialSummary, 'Lễ Riêng');
    setupTabClick('btn-tet', tetFullData, 'tet', tetSummary, 'Thánh Lễ Tết');

    // === DEFAULT RENDER - Dựa trên defaultReadingSource đã xác định từ Precedence ===
    console.log(`📖 Nguồn bài đọc mặc định: ${defaultReadingSource} (${defaultLabel})`);
    
    switch (defaultReadingSource) {
        case 'tet':
            if (tetFullData) {
                renderReadingsContent(tetFullData, 'tet');
                updateReadingRefs(tetSummary);
            }
            break;
        case 'sanctoral':
            if (sanctoralFullData) {
                renderReadingsContent(sanctoralFullData, 'sanctoral');
                updateReadingRefs(sanctoralSummary);
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
        if (seasonalFullData) {
            renderReadingsContent(seasonalFullData, 'seasonal');
            updateReadingRefs(seasonalSummary);
            document.querySelectorAll('.reading-tab').forEach(el => el.classList.remove('active'));
            document.getElementById('btn-seasonal')?.classList.add('active');
        }
    }
    
    // === SAINTS SECTION (chi tiết) ===
    const saintContent = document.getElementById('modalSaintContent');
    saintContent.innerHTML = "";
    if (info.saints.length > 0 && !info.isTet) {
        document.getElementById('modalSaintSection').classList.remove('hidden');
        info.saints.forEach(s => {
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
    scrollThreshold: 150, // pixels từ đầu trang để bắt đầu thu gọn
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
        
        if (scrollTop > this.scrollThreshold && !this.isCollapsed) {
            this.collapse();
        } else if (scrollTop <= this.scrollThreshold && this.isCollapsed) {
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
        const today = new Date();
        const litData = getLiturgicalData(today.getFullYear());
        const info = getDayInfo(today, litData);
        const cycle = getLiturgicalCycle(today, litData);
        const weekdayCycle = today.getFullYear() % 2 !== 0 ? "1" : "2";
        
        // Get celebration title
        let celebrationTitle = "";
        if (info.special) {
            celebrationTitle = info.special;
        } else if (info.isTet) {
            const tetEvent = getTetEvent(today);
            celebrationTitle = tetEvent?.name || "Tết Nguyên Đán";
        } else if (info.saints.length > 0 && ['S', 'F'].includes(info.saints[0].type)) {
            celebrationTitle = info.saints[0].name;
        } else {
            const dayOfWeek = DAYS_FULL_VI[today.getDay()];
            const detailedWeek = getDetailedLiturgicalWeek(today, litData);
            celebrationTitle = `${dayOfWeek} ${detailedWeek}`;
        }
        
        // Get reading summary
        const code = getLiturgicalDayCode(today, litData);
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
            cycleText += ` • ${weekdayCycle === "1" ? "Lẻ" : "Chẵn"}`;
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

window.onload = function() {
    updateHeaderTodayInfo(); 
    renderCalendar();
    HeaderCollapseManager.init();
    document.onkeydown = function(evt) { 
        if (evt.keyCode == 27) {
            closeModal();
            closeExportModal();
        }
    };
};

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
                sundayCycle: `Năm ${getLiturgicalCycle(new Date(currentYear, 0, 1), litData)}`,
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
            const info = getDayInfo(date, litData);
            const dayCode = getLiturgicalDayCode(date, litData);
            
            // Kiểm tra xem có phải là ngày lễ vọng không (không hiển thị trong export)
            const t = d => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
            const dTime = t(date);
            const monthCheck = date.getMonth();
            const dayCheck = date.getDate();
            const pentecostVigil = addDays(litData.pentecost, -1);
            const holySaturday = addDays(litData.easter, -1);
            const isVigilDay = 
                dayCode === "4089" || // Vọng Hiện Xuống
                (monthCheck === 11 && dayCheck === 24) || // Lễ Vọng Giáng Sinh (24/12)
                (dTime === t(holySaturday)) || // Canh Thức Vượt Qua (Thứ Bảy Tuần Thánh)
                (monthCheck === 9 && dayCheck === 31); // Lễ Vọng Các Thánh (31/10)
            
            // Xác định celebration - ẩn lễ vọng, hiển thị mùa phụng vụ
            let celebrationText = '';
            if (isVigilDay) {
                // Hiển thị mùa phụng vụ thay vì tên lễ vọng
                const season = parseInt(dayCode.substring(0, 1));
                const week = parseInt(dayCode.substring(1, 3));
                const seasonNames = ["", "Mùa Vọng", "Mùa Giáng Sinh", "Mùa Chay", "Mùa Phục Sinh", "Thường Niên"];
                if (week > 0 && season > 0 && season < 6) {
                    celebrationText = `Tuần ${toRoman(week)} ${seasonNames[season]}`;
                } else {
                    celebrationText = info.season || "Mùa Thường Niên";
                }
            } else {
                celebrationText = info.special || info.celebration || getDetailedLiturgicalWeek(date, litData);
            }
            
            const dayData = {
                date: `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                dayOfWeek: DAYS_FULL_VI[date.getDay()],
                celebration: celebrationText,
                rank: info.rankCode || 'NGAY_THUONG',
                color: info.color?.replace('bg-lit-', '') || 'green',
                season: info.season,
                code: dayCode
            };
            
            // Lunar date
            if (includeLunar && typeof LUNAR_CALENDAR !== 'undefined') {
                const lunar = LUNAR_CALENDAR.getLunarDate(date);
                if (lunar) {
                    dayData.lunar = {
                        day: lunar.day,
                        month: lunar.month,
                        year: lunar.year,
                        isLeapMonth: lunar.isLeapMonth || false
                    };
                }
            }
            
            // Saints
            if (includeSaints && info.saints && info.saints.length > 0) {
                dayData.saints = info.saints.map(s => ({
                    name: s.name,
                    rank: s.rank,
                    color: s.color?.replace('bg-lit-', '')
                }));
            }
            
            // Commemorations
            if (info.commemorations && info.commemorations.length > 0) {
                dayData.commemorations = info.commemorations.map(c => c.name || c);
            }
            
            // Reading references
            if (includeReadings) {
                // Lấy chu kỳ năm phụng vụ
                const cycle = getLiturgicalCycle(date, litData);
                const weekdayCycle = currentYear % 2 === 1 ? "1" : "2";
                const dayOfWeek = date.getDay();
                
                // Tìm bài đọc từ tất cả nguồn
                let readingData = null;
                let readingSource = 'temporal';
                let usedCode = dayCode;
                
                // === ƯU TIÊN 1: Kiểm tra bài đọc Tết (nếu đang cử hành Tết) ===
                if (info.isTet) {
                    const tetCode = getTetReadingCode(date);
                    if (tetCode && typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[tetCode]) {
                        readingData = READINGS_SPECIAL[tetCode];
                        readingSource = 'tet';
                        usedCode = tetCode;
                        dayData.readingNote = 'Bài đọc Thánh Lễ Tết';
                    }
                }
                
                // === ƯU TIÊN 2: Lễ Trọng/Kính các Thánh (sanctoral) ===
                // Nếu là Lễ Trọng hoặc Lễ Kính, tìm bài đọc riêng của thánh (7DDMM)
                if (!readingData && (info.rankCode === 'TRONG' || info.rankCode === 'KINH')) {
                    const dd = String(date.getDate()).padStart(2, '0');
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const sanctoralCode = `7${dd}${mm}`;
                    
                    if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[sanctoralCode]) {
                        readingData = READINGS_SPECIAL[sanctoralCode];
                        readingSource = 'sanctoral';
                        usedCode = sanctoralCode;
                    }
                }
                
                // === ƯU TIÊN 3: Lễ Nhớ các Thánh (optional memorial) ===
                // Nếu là lễ nhớ và có bài đọc riêng, ưu tiên hiển thị
                if (!readingData && (info.rankCode === 'NHO' || info.rankCode === 'NHOKB')) {
                    const dd = String(date.getDate()).padStart(2, '0');
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const memorialCode = `7${dd}${mm}`;
                    const memorialOptionCode = `8${dd}${mm}`;
                    
                    if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[memorialCode]) {
                        readingData = READINGS_SPECIAL[memorialCode];
                        readingSource = 'sanctoral';
                        usedCode = memorialCode;
                        dayData.readingNote = 'Bài đọc Lễ Nhớ';
                    } else if (typeof OptionsaintReadings !== 'undefined' && OptionsaintReadings[memorialOptionCode]) {
                        readingData = OptionsaintReadings[memorialOptionCode];
                        readingSource = 'option';
                        usedCode = memorialOptionCode;
                        dayData.readingNote = 'Bài đọc Lễ Nhớ (tùy chọn)';
                    }
                }

                // === ƯU TIÊN 4: Bài đọc theo mùa/ngày (temporal) ===
                if (!readingData) {
                    // Chúa Nhật: tìm trong READINGS_SUNDAY với cycle
                    if (dayOfWeek === 0) {
                        const result = findReadingFromAllSources(dayCode, cycle);
                        if (result && result.data) {
                            readingData = result.data;
                        }
                    } else {
                        // Ngày thường: kiểm tra mùa
                        const season = parseInt(dayCode.substring(0, 1));
                        if (season === 5) {
                            // Mùa Thường Niên: tìm theo năm lẻ/chẵn
                            if (weekdayCycle === "1" && typeof READINGS_ORDINARY_Y1 !== 'undefined') {
                                readingData = READINGS_ORDINARY_Y1[dayCode];
                            } else if (typeof READINGS_ORDINARY_Y2 !== 'undefined') {
                                readingData = READINGS_ORDINARY_Y2[dayCode];
                            }
                        } else {
                            // Các mùa khác (Vọng, Giáng Sinh, Chay, Phục Sinh)
                            if (typeof READINGS_SEASONAL !== 'undefined') {
                                readingData = READINGS_SEASONAL[dayCode];
                            }
                        }
                    }
                }
                
                // === ƯU TIÊN 4: Fallback - tìm từ tất cả nguồn ===
                if (!readingData) {
                    const result = findReadingFromAllSources(dayCode, cycle);
                    if (result && result.data) {
                        readingData = result.data;
                    }
                }
                
                // === ƯU TIÊN 4b: Xử lý đặc biệt cho các mã không có trong dữ liệu ===
                if (!readingData) {
                    // Vọng Hiện Xuống (4089) → dùng bài đọc thứ bảy tuần 7 Phục Sinh (4076)
                    if (dayCode === "4089") {
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
                    // Trái Tim Vô Nhiễm Mẹ (5441) → tìm trong sanctoral
                    if (dayCode === "5441") {
                        const dd = String(date.getDate()).padStart(2, '0');
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const saintCode = `7${dd}${mm}`;
                        if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[saintCode]) {
                            readingData = READINGS_SPECIAL[saintCode];
                        }
                    }
                }
                
                // === ƯU TIÊN 5: Lễ Nhớ (fallback) ===
                // Nếu chưa có dữ liệu và là lễ nhớ, thử lại từ nguồn tùy chọn (đảm bảo không bỏ sót)
                if (!readingData && (info.rankCode === 'NHO' || info.rankCode === 'NHOKB')) {
                    const dd = String(date.getDate()).padStart(2, '0');
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const memorialCode = `7${dd}${mm}`;
                    const memorialOptionCode = `8${dd}${mm}`;
                    
                    if (typeof READINGS_SPECIAL !== 'undefined' && READINGS_SPECIAL[memorialCode]) {
                        readingData = READINGS_SPECIAL[memorialCode];
                        readingSource = 'sanctoral';
                        usedCode = memorialCode;
                        dayData.readingNote = 'Bài đọc Lễ Nhớ';
                    } else if (typeof OptionsaintReadings !== 'undefined' && OptionsaintReadings[memorialOptionCode]) {
                        readingData = OptionsaintReadings[memorialOptionCode];
                        readingSource = 'option';
                        usedCode = memorialOptionCode;
                        dayData.readingNote = 'Bài đọc Lễ Nhớ (tùy chọn)';
                    }
                }
                
                if (readingData) {
                    dayData.readings = {
                        code: usedCode,
                        source: readingSource,
                        references: {
                            reading1: readingData.firstReading?.excerpt || readingData.BD1_ref || null,
                            psalm: readingData.psalms?.excerpt || readingData.DC_ref || null,
                            reading2: readingData.secondReading?.excerpt || readingData.BD2_ref || null,
                            gospel: readingData.gospel?.excerpt || readingData.TM_ref || null
                        }
                    };
                }
            }
            
            // Discipline notes
            const discipline = getLiturgicalDiscipline(date, litData);
            if (discipline && (discipline.fast || discipline.abstinence || discipline.obligation)) {
                dayData.discipline = {
                    fast: discipline.fast || false,
                    abstinence: discipline.abstinence || false,
                    obligation: discipline.obligation || false,
                    note: discipline.note || null
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
            
            // Saints
            let saintsStr = '';
            if (day.saints && day.saints.length > 0) {
                saintsStr = `<div class="saints-line">↳ ${day.saints.map(s => s.name).join('; ')}</div>`;
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
