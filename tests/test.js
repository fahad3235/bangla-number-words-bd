/* Unit tests for bangla-number-words-bd engine. Run: node tests/test.js */
'use strict';
const assert = require('assert');
const BN = require('../js/words.js');

let passed = 0;
function eq(actual, expected, label) {
  assert.strictEqual(actual, expected, label + ' — expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  passed++;
}
function throwsWith(fn, code, label) {
  try { fn(); } catch (e) { assert.strictEqual(e.message, code, label + ' — wrong error: ' + e.message); passed++; return; }
  assert.fail(label + ' — expected throw ' + code);
}

// ---- digit conversion ----
eq(BN.convertDigits('Price 123', 'en2bn'), 'Price ১২৩', 'en2bn basic');
eq(BN.convertDigits('১২৩', 'bn2en'), '123', 'bn2en basic');
eq(BN.convertDigits('abc', 'en2bn'), 'abc', 'no digits unchanged');
eq(BN.convertDigits('ফোন: ০১৭১২-৩৪৫৬৭৮', 'bn2en'), 'ফোন: 01712-345678', 'bn2en keeps other chars');
eq(BN.convertDigits('01712', 'bn2en'), '01712', 'en digits untouched by bn2en');
eq(BN.convertDigits('', 'en2bn'), '', 'empty string');
eq(BN.convertDigits('Mix১2৩', 'en2bn'), 'Mix১২৩', 'mixed direction-safe');
throwsWith(() => BN.convertDigits(123, 'en2bn'), 'NOT_A_STRING', 'non-string input');
throwsWith(() => BN.convertDigits('1', 'sideways'), 'BAD_DIRECTION', 'bad direction');

// ---- numberToWords: spot-check every decade ----
eq(BN.numberToWords(0), 'শূন্য', '0');
eq(BN.numberToWords(1), 'এক', '1');
eq(BN.numberToWords(9), 'নয়', '9');
eq(BN.numberToWords(10), 'দশ', '10');
eq(BN.numberToWords(11), 'এগারো', '11');
eq(BN.numberToWords(19), 'ঊনিশ', '19');
eq(BN.numberToWords(20), 'বিশ', '20');
eq(BN.numberToWords(21), 'একুশ', '21');
eq(BN.numberToWords(25), 'পঁচিশ', '25');
eq(BN.numberToWords(30), 'ত্রিশ', '30');
eq(BN.numberToWords(37), 'সাঁইত্রিশ', '37');
eq(BN.numberToWords(40), 'চল্লিশ', '40');
eq(BN.numberToWords(46), 'ছেচল্লিশ', '46');
eq(BN.numberToWords(50), 'পঞ্চাশ', '50');
eq(BN.numberToWords(57), 'সাতান্ন', '57');
eq(BN.numberToWords(60), 'ষাট', '60');
eq(BN.numberToWords(69), 'ঊনসত্তর', '69');
eq(BN.numberToWords(70), 'সত্তর', '70');
eq(BN.numberToWords(75), 'পঁচাত্তর', '75');
eq(BN.numberToWords(80), 'আশি', '80');
eq(BN.numberToWords(88), 'আটাশি', '88');
eq(BN.numberToWords(90), 'নব্বই', '90');
eq(BN.numberToWords(99), 'নিরানব্বই', '99');

// hundreds / thousands / lakhs / crores
eq(BN.numberToWords(100), 'একশত', '100');
eq(BN.numberToWords(101), 'একশত এক', '101');
eq(BN.numberToWords(115), 'একশত পনেরো', '115');
eq(BN.numberToWords(250), 'দুইশত পঞ্চাশ', '250');
eq(BN.numberToWords(1000), 'এক হাজার', '1000');
eq(BN.numberToWords(1200), 'এক হাজার দুইশত', '1200');
eq(BN.numberToWords(25000), 'পঁচিশ হাজার', '25000');
eq(BN.numberToWords(100000), 'এক লক্ষ', '100000');
eq(BN.numberToWords(2500000), 'পঁচিশ লক্ষ', '2500000');
eq(BN.numberToWords(10000000), 'এক কোটি', '10000000');
eq(BN.numberToWords(25000000), 'দুই কোটি পঞ্চাশ লক্ষ', '25000000');
eq(BN.numberToWords(123456789),
  'বারো কোটি চৌত্রিশ লক্ষ ছাপ্পান্ন হাজার সাতশত ঊননব্বই', '123456789 full');
eq(BN.numberToWords(100000000), 'দশ কোটি', '100000000');
eq(BN.numberToWords(999999999),
  'নিরানব্বই কোটি নিরানব্বই লক্ষ নিরানব্বই হাজার নয়শত নিরানব্বই', 'max');
eq(BN.numberToWords(100001), 'এক লক্ষ এক', 'skips empty chunks');

// validation
throwsWith(() => BN.numberToWords(-1), 'NEGATIVE', 'negative rejected');
throwsWith(() => BN.numberToWords(1000000000), 'TOO_LARGE', 'over max rejected');
throwsWith(() => BN.numberToWords(1.5), 'NOT_AN_INTEGER', 'decimal rejected');
throwsWith(() => BN.numberToWords(NaN), 'NOT_AN_INTEGER', 'NaN rejected');

// ---- amountToWords (cheque style) ----
eq(BN.amountToWords(2500.50), 'দুই হাজার পাঁচশত টাকা পঞ্চাশ পয়সা মাত্র', '2500.50');
eq(BN.amountToWords(100), 'একশত টাকা মাত্র', '100 flat');
eq(BN.amountToWords(1), 'এক টাকা মাত্র', '1');
eq(BN.amountToWords(0.75), 'পঁচাত্তর পয়সা মাত্র', '0.75 paisa only');
eq(BN.amountToWords(0), 'শূন্য টাকা মাত্র', '0');
eq(BN.amountToWords(150000), 'এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র', '150000');
eq(BN.amountToWords(10.999), 'এগারো টাকা মাত্র', '10.999 rounds to 11');
eq(BN.amountToWords(5.05), 'পাঁচ টাকা পাঁচ পয়সা মাত্র', '5.05');
throwsWith(() => BN.amountToWords(-5), 'NEGATIVE', 'negative amount');
throwsWith(() => BN.amountToWords('100'), 'NOT_A_NUMBER', 'string amount');

// ---- formatBDGrouping ----
eq(BN.formatBDGrouping(0), '0', 'g0');
eq(BN.formatBDGrouping(100), '100', 'g100');
eq(BN.formatBDGrouping(1000), '1,000', 'g1000');
eq(BN.formatBDGrouping(10000), '10,000', 'g10000');
eq(BN.formatBDGrouping(100000), '1,00,000', 'g100000');
eq(BN.formatBDGrouping(2500000), '25,00,000', 'g2500000');
eq(BN.formatBDGrouping(12345678), '1,23,45,678', 'g12345678');
eq(BN.formatBDGrouping(999999999), '99,99,99,999', 'gmax');
throwsWith(() => BN.formatBDGrouping(-1), 'NEGATIVE', 'negative grouping');

// ---- scaleBreakdown ----
let bd = BN.scaleBreakdown(25000000);
eq(bd.lakhs, '250', '25M lakhs');
eq(bd.crores, '2.5', '25M crores');
eq(bd.millions, '25', '25M millions');
eq(bd.billions, '0.03', '25M billions');
bd = BN.scaleBreakdown(1500);
eq(bd.lakhs, '0.02', '1500 lakhs');
eq(bd.crores, '0', '1500 crores');

console.log('ALL ' + passed + ' ASSERTIONS PASSED');
