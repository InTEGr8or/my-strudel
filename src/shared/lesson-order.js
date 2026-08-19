/**
 * Lesson list order comes from front matter `order`, not folder names.
 * Missing order sorts last (not as 0), so a real `order: 0` can be first.
 */
function lessonOrder(page) {
  var n = page && page.data && page.data.order;
  return typeof n === 'number' && isFinite(n) ? n : 999;
}

function sortLessons(pages) {
  return (pages || [])
    .filter(function (p) { return p && p.data && p.data.type === 'lesson'; })
    .slice()
    .sort(function (a, b) {
      var d = lessonOrder(a) - lessonOrder(b);
      if (d !== 0) return d;
      var ta = (a.data && a.data.title) || '';
      var tb = (b.data && b.data.title) || '';
      return String(ta).localeCompare(String(tb));
    });
}

module.exports = { lessonOrder: lessonOrder, sortLessons: sortLessons };
