/**
 * Created by bludwarf on 21/05/2016.
 */
// SVG Utils : http://toddmotto.com/hacking-svg-traversing-with-ease-addclass-removeclass-toggleclass-functions/

SVGElement.prototype.hasClass = function (className) {
    return new RegExp('(\\s|^)' + className + '(\\s|$)').test(this.getAttribute('class'));
};
SVGElement.prototype.addClass = function (className) {
    if (!this.hasClass(className)) {
        this.setAttribute('class', this.getAttribute('class') + ' ' + className);
    }
};
SVGElement.prototype.removeClass = function (className) {
    var removedClass = this.getAttribute('class').replace(new RegExp('(\\s|^)' + className + '(\\s|$)', 'g'), '$2');
    if (this.hasClass(className)) {
        this.setAttribute('class', removedClass);
    }
};
SVGElement.prototype.toggleClass = function (className) {
    if (this.hasClass(className)) {
        this.removeClass(className);
    } else {
        this.addClass(className);
    }
};