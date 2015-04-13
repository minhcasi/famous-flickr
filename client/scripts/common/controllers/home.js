'use strict';
var controllername = 'home';
var ProgressBar = require('progressbar.js');

module.exports = function (app) {
    /*jshint validthis: true */

    var deps = ['$window', '$scope', '$famous', app.name + '.photos', app.name + '.famousHelper'];

    function controller($window, $scope, $famous, photos, famousHelper) {
        var vm = this;
        vm.viewSize = {
            width: $window.innerWidth,
            height: $window.innerHeight
        };
        vm.headerHeight = 200;
        vm.userName = 'John Doe';

        vm.photos = photos.generate(2 * vm.viewSize.width / 3, 2 * vm.viewSize.width / 3, 30, 3);
        vm.photoMain = 'images/background_image.jpg'; //photos.generate(vm.viewSize.width * 2, vm.headerHeight * 2)[0][0];
        vm.photoMainBlurred = 'images/background_image_blurred.jpg';
        vm.photoProfile = photos.generate(100, 100)[0][0];

        vm.getPhotoStyle = photos.getStyle;

        var EventHandler = $famous['famous/core/EventHandler'];
        vm.eventHandler = new EventHandler();
        vm.scrollEventHandler = new EventHandler();

        vm.scrollOption = {
            direction: 0,
            paginated: true
        };

        var getScrollView = function () {
            vm.scrollview = famousHelper.getRenderNode(vm.scrollview, '#scrollView');
            return vm.scrollview;
        };

        var getMainPhoto = function () {
            vm.mainPhoto = famousHelper.getRenderNode(vm.mainPhoto, '#mainPhoto');
            return vm.mainPhoto;
        };


        var getmyPhoto = function () {
            vm.myPhoto = famousHelper.getRenderNode(vm.myPhoto, '.myphoto');
            return vm.myPhoto;
        };


        vm.getOverpull = function () {
            return -Math.min(0, getScrollView().getAbsolutePosition());
        };

        vm.getToolbarTranslate = function () {
            var pos = getScrollView().getAbsolutePosition();
            return pos > (vm.headerHeight - 60) ? pos - (vm.headerHeight - 60) : 0;
        };

        var Timer = $famous['famous/utilities/Timer'];
        Timer.every(function () {
            var pos = vm.getOverpull();
            // rever the comments to blur with css
            //             if(getMainPhoto()) {
            //                 vm.mainPhoto.setProperties({
            //                     webkitFilter: 'blur(' + getBlur(pos) + 'px)'
            //                 });
            //             }
            fillCircle(Math.min(1, pos / 250));
        }, 2);

        function getBlur(pos) {
            var distance = 50;
            var blur = pos > distance ? Math.min(Math.round((pos - distance) / 15), 10) : 0;
            return blur;
        }

        vm.getOpacityBlur = function () {
            var pos = vm.getOverpull();

            var blur = getBlur(pos);
            var opacity = Math.min(blur / 10, 1);

            return opacity;
        };

        var fillCircle = function (value) {
            if (vm.circle) {
                vm.circle.set(value);
                return;
            }
            vm.circle = new ProgressBar.Circle($window.document.getElementById('circleSvgContainer'), {
                color: '#3498DB',
                fill: '#FFFFFF'
            });
        };

        vm.getFocus = function (idx) {
            console.log(idx);
        }
        //var getSurface = function() {
        //    vm.mainPhoto = famousHelper.getRenderNode(vm.mainPhoto, '#mainPhoto');
        //    return vm.mainPhoto;
        //};

        var Surface = $famous['famous/src/core/Surface'];

        vm.myList = [
            {content: "slide2: one", color: "red"},
            {content: "slide2: two", color: "blue"},
            {content: "slide2: three", color: "green"}
        ];

        ////////////////////////////////////////////////////////////////
        // handle scoll event
        var GenericSync = $famous['famous/inputs/GenericSync'];
        vm.sync = new GenericSync(["mouse", "touch"], {direction: GenericSync.DIRECTION_Y});
        vm.sync.on('update', function (data) {
            if (vm.myList.length == 3) {
                // vm.myList.unshift({content: "me first!", color: "#43ff29"});
                // vm.myList.push({content: "slide2: me last!", color: "#2255f3"});
                vm.myList.unshift({content: "slide1: -one", color: "#2255f3"});
                vm.myList.push({content: "slide1: four", color: "#2255f3"});
            }

            if (!$scope.$$phase) $scope.$apply();
            vm.currentCal = famousHelper.getRenderNode(vm.currentCal, '#myView');
        });


        vm.sync.on('end', function (data) {
            // update the current month of calendar
            // get current index
            var scrollView = $famous.find('#main-scroll-view')[0].renderNode;

            /*console.log(scrollView.getAbsolutePosition());
            console.log(scrollView.getCurrentIndex());
            console.log(scrollView.getOffset());
            console.log(scrollView.getPosition());*/
        });

        vm.scrollEventHandler.pipe(vm.sync);
    }

    controller.$inject = deps;
    app.controller(app.name + '.' + controllername, controller);
};