'use strict';
var directiveName = 'calendar';

module.exports = function (app) {
    /*jshint validthis: true */

    var dependencies = [];
    function directive() {
        var ticking = false;
        var transform = {
            translate : {x: 0, y: 0}
        };

        function _removeTime(date) {
            return date.day(0).hour(0).minute(0).second(0).millisecond(0);
        }

        function _buildMonth(scope, start, month) {
            scope.weeks = [];
            var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
            while (!done) {
                scope.weeks.push({days: _buildWeek(date.clone(), month)});
                date.add(1, "w");
                done = count++ > 2 && monthIndex !== date.month();
                monthIndex = date.month();
            }
        }

        function _buildWeek(date, month) {
            var days = [];
            for (var i = 0; i < 7; i++) {
                days.push({
                    name: date.format("dd").substring(0, 1),
                    number: date.date(),
                    isCurrentMonth: date.month() === month.month(),
                    isToday: date.isSame(new Date(), "day"),
                    date: date
                });
                date = date.clone();
                date.add(1, "d");
            }
            return days;
        }

        function _updateElementTransform(el) {
            var value = [
                'translate3d(' + transform.translate.x + 'px, 0px, 0)',
                'scale(1,1)',
                'rotate3d(1,1,1,0deg)'
            ];

            value = value.join(" ");

            el.style.webkitTransform = value;
            el.style.mozTransform = value;
            el.style.transform = value;
        }
        function _reqAnimationFrame() {
            return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
                    window.setTimeout(callback, 1000/60);
                };
        };

        function _requestElementUpdate(el) {
            _reqAnimationFrame(_updateElementTransform(el));
        }

        return {
            restrict: "E",
            templateUrl: "calendar.html",
            scope: {
                selected: "="
            },
            link: function (scope, element) {
                console.log('link...');

                scope.selected = _removeTime(scope.selected || moment());
                scope.month = scope.selected.clone();
                scope.transform=transform.translate;

                var start = scope.selected.clone();
                start.date(1);
                _removeTime(start.day(0));

                _buildMonth(scope, start, scope.month);

                scope.select = function (day) {
                    scope.selected = day.date;
                };

                scope.next = function () {
                    var next = scope.month.clone();
                    _removeTime(next.month(next.month() + 1).date(1));
                    scope.month.month(scope.month.month() + 1);

                    // native swipe by ios
                    var fade = new steroids.Animation({
                        transition: "slideFromRight",
                        duration: 1
                    });
                    fade.perform();

                    _buildMonth(scope, next, scope.month);
                };

                scope.previous = function () {
                    var previous = scope.month.clone();
                    _removeTime(previous.month(previous.month() - 1).date(1));
                    scope.month.month(scope.month.month() - 1);

                    // native swipe by ios
                    var fade = new steroids.Animation({
                        transition: "slideFromLeft",
                        duration: 1
                    });
                    fade.perform();


                    _buildMonth(scope, previous, scope.month);
                };


                scope.onPanLeft = function(ev) {
                    transform.translate = {
                        x: ev.deltaX,
                        y:ev.deltaY
                    };
                    scope.transform=transform.translate;

                    _requestElementUpdate(element[0]);

                    if (ev.deltaX < -150) {
                        scope.next();
                    }
                };

                scope.onPanRight = function(ev) {
                    transform.translate = {
                        x: ev.deltaX,
                        y:ev.deltaY
                    };
                    scope.transform=transform.translate;
                    _requestElementUpdate(element[0]);


                    if (ev.deltaX > 150) {
                        scope.previous();
                    }
                };
            }
        };
    }

    directive.$inject = dependencies;
    app.directive(directiveName, directive);
};