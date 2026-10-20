/*
 * bangla-number-words-bd — core engine
 * Pure functions, zero dependencies. Works in Node and the browser.
 * All Bengali words are standard spellings; grouping follows the
 * Bangladesh/Indian convention (lakh / crore).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BanglaNumbers = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_INT = 999999999; // 99 crore 99 lakh 99 thousand 999

  // Bengali names for 0–99 (standard spellings).
  var ONES = [
    'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
    'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো',
    'আঠারো', 'ঊনিশ', 'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ',
    'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'ঊনত্রিশ', 'ত্রিশ', 'একত্রিশ', 'বত্রিশ',
    'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ',
    'ঊনচল্লিশ', 'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ',
    'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
    'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন',
    'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট', 'একষট্টি',
    'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি',
    'আটষট্টি', 'ঊনসত্তর', 'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর',
    'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
    'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি',
    'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই', 'একানব্বই', 'বিরানব্বই',
    'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই',
    'আটানব্বই', 'নিরানব্বই'
  ];

  var EN_DIGITS = '0123456789';
  var BN_DIGITS = '০১২৩৪৫৬৭৮৯';

  function assertInteger(n) {
    if (typeof n !== 'number' || !isFinite(n) || Math.floor(n) !== n) {
      throw new Error('NOT_AN_INTEGER');
    }
    if (n < 0) throw new Error('NEGATIVE');
    if (n > MAX_INT) throw new Error('TOO_LARGE');
  }

  // Convert digits inside any text. dir: 'en2bn' | 'bn2en'
  function convertDigits(text, dir) {
    if (typeof text !== 'string') throw new Error('NOT_A_STRING');
    if (dir !== 'en2bn' && dir !== 'bn2en') throw new Error('BAD_DIRECTION');
    var from = dir === 'en2bn' ? EN_DIGITS : BN_DIGITS;
    var to = dir === 'en2bn' ? BN_DIGITS : EN_DIGITS;
    return text.replace(/[0-9০-৯]/g, function (ch) {
      var i = from.indexOf(ch);
      return i === -1 ? ch : to.charAt(i);
    });
  }

  function twoDigitWords(n) {
    return ONES[n]; // 0..99
  }

  // Integer 0..999999999 → Bengali words, e.g. 123456789 →
  // "বারো কোটি চৌত্রিশ লক্ষ ছাপ্পান্ন হাজার সাতশত ঊননব্বই"
  function numberToWords(n) {
    assertInteger(n);
    if (n === 0) return ONES[0];
    var parts = [];
    var crore = Math.floor(n / 10000000);
    var lakh = Math.floor(n / 100000) % 100;
    var thousand = Math.floor(n / 1000) % 100;
    var hundred = Math.floor(n / 100) % 10;
    var rest = n % 100;
    if (crore > 0) parts.push(twoDigitWords(crore) + ' কোটি');
    if (lakh > 0) parts.push(twoDigitWords(lakh) + ' লক্ষ');
    if (thousand > 0) parts.push(twoDigitWords(thousand) + ' হাজার');
    if (hundred > 0) parts.push(twoDigitWords(hundred) + 'শত');
    if (rest > 0) parts.push(twoDigitWords(rest));
    return parts.join(' ');
  }

  // Money amount → cheque-style words, e.g. 2500.50 →
  // "দুই হাজার পাঁচশত টাকা পঞ্চাশ পয়সা মাত্র"
  function amountToWords(amount) {
    if (typeof amount !== 'number' || !isFinite(amount)) throw new Error('NOT_A_NUMBER');
    if (amount < 0) throw new Error('NEGATIVE');
    // Round to 2 decimals (paisa).
    var total = Math.round(amount * 100);
    var taka = Math.floor(total / 100);
    var paisa = total % 100;
    if (taka > MAX_INT) throw new Error('TOO_LARGE');
    var parts = [];
    if (taka > 0) parts.push(numberToWords(taka) + ' টাকা');
    if (paisa > 0) parts.push(numberToWords(paisa) + ' পয়সা');
    if (parts.length === 0) parts.push(ONES[0] + ' টাকা');
    return parts.join(' ') + ' মাত্র';
  }

  // 12345678 → "1,23,45,678" (Bangladesh/Indian grouping)
  function formatBDGrouping(n) {
    assertInteger(n);
    var s = String(n);
    if (s.length <= 3) return s;
    var tail = s.slice(-3);
    var head = s.slice(0, -3).replace(/(\d)(?=(\d{2})+$)/g, '$1,');
    return head + ',' + tail;
  }

  // Big-number explainer: returns { lakhs, crores, millions, billions } as trimmed strings
  function scaleBreakdown(n) {
    assertInteger(n);
    function trim(x) {
      var s = String(Math.round(x * 100) / 100);
      return s;
    }
    return {
      lakhs: trim(n / 100000),
      crores: trim(n / 10000000),
      millions: trim(n / 1000000),
      billions: trim(n / 1000000000)
    };
  }

  return {
    MAX_INT: MAX_INT,
    convertDigits: convertDigits,
    numberToWords: numberToWords,
    amountToWords: amountToWords,
    formatBDGrouping: formatBDGrouping,
    scaleBreakdown: scaleBreakdown
  };
});
