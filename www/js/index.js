

var app = function() {


    var self = {};
    self.is_configured = false;

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        v.map(function(e) {e._idx = k++;});
    };

    // Initializes an attribute of an array of objects.
    var set_array_attribute = function (v, attr, x) {
        v.map(function (e) {e[attr] = x;});
    };

    self.initialize = function () {
        document.addEventListener('deviceready', self.ondeviceready, false);
    };

    self.ondeviceready = function () {
        // This callback is called once Cordova has finished
        // its own initialization.
        console.log("The device is ready");
        $("#vue-div").show(); // This is jQuery.
        self.is_configured = true;
    };

    self.reset = function () {
        self.vue.progress = false;
        self.vue.board = Array.from(new Array((self.vue.size**2)-1),(val,index)=>index+1).concat([0]);
    };

    self.move = function(i, j, dir, max) {
        var curr = self.vue.size*i+j;
        if (curr >= self.vue.size**2 || curr < 0) return;
        var up = curr - self.vue.size;
        var down = curr + self.vue.size;
        var right = curr + 1;
        var left = curr - 1;
        if (self.vue.board[left]=='0' && (dir=='left' || !dir) &&
            (Math.floor((left)/self.vue.size) == Math.floor(curr/self.vue.size))) {
            //$(".content:contains('"+self.vue.board[curr]+"')").animate({left: -30/(self.vue.size*2)+"em"}, 1000, function() {
              tmp = self.vue.board[left];
              Vue.set(self.vue.board,left, self.vue.board[curr]);
              Vue.set(self.vue.board,curr, tmp);
            //});
            //$(".content:contains('"+self.vue.board[curr]+"')").css('left','0');
            //$(".content:contains('"+self.vue.board[left]+"')").css('left', '0');
        } else if (self.vue.board[right]=='0' && (dir=='right' || !dir) &&
            (Math.floor((right)/self.vue.size) == Math.floor(curr/self.vue.size))) {
            tmp = self.vue.board[right];
            Vue.set(self.vue.board,right, self.vue.board[curr]);
            Vue.set(self.vue.board,curr, tmp);
        } else if (self.vue.board[up]=='0' && (dir=='up' || !dir)) {
            tmp = self.vue.board[up];
            Vue.set(self.vue.board,up, self.vue.board[curr]);
            Vue.set(self.vue.board,curr, tmp);
        } else if (self.vue.board[down]=='0' && (dir=='down' || !dir)) {
            tmp = self.vue.board[down];
            Vue.set(self.vue.board,down, self.vue.board[curr]);
            Vue.set(self.vue.board,curr, tmp);
        }
        var zero = self.vue.board.indexOf(0);
        if (max == null) {
          if(zero%self.vue.size > j) dir = 'right';
          else if(zero%self.vue.size < j) dir = 'left';
          else if(Math.floor(zero/self.vue.size) < i) dir = 'up';
          else if(Math.floor(zero/self.vue.size) > i) dir = 'down';
          if(dir == 'left') max = j-(zero%self.vue.size);
          if(dir == 'right') max = (zero%self.vue.size)-j;
          if(dir == 'up') max = i-Math.floor(zero/self.vue.size);
          if(dir == 'down') max = Math.floor(zero/self.vue.size)-i;

        }
        //console.log(max);
        //console.log("move(",i,", ",(zero%self.vue.size)-1,", ",dir,", ",max,")");
        console.log("move(",Math.floor(zero/self.vue.size),", ",j,", ",dir,", ",max,")");
        console.log(j == (zero%self.vue.size));
        if (i == (Math.floor(zero/self.vue.size)) && dir == 'left' || dir == 'right') {
          max--;
          if (max == -1) return;
          else if (dir == 'right') self.move(i, (zero%self.vue.size)-1, dir, max);
          else if (dir == 'left')  self.move(i, (zero%self.vue.size)+1, dir, max);
        } else if (j == (zero%self.vue.size) && dir == 'up' || dir == 'down') {
          max--;
          if (max == -1) return;
          else if (dir == 'up') self.move(Math.floor(zero/self.vue.size)+1, j, dir, max);
          else if (dir == 'down') self.move(Math.floor(zero/self.vue.size)-1, j, dir, max);
        }

        //console.log(self.vue.board);
        //console.log("Shuffle:" + i + ", " + j);

    };

    self.solvable = function () {
        var p = 0;
        var board = self.vue.board;
        for(var i = 0; i < board.length; i++)
            for(var j = i+1; j < board.length; j++)
                if(board[i] > board[j] && board[j])
                    p++;
        if (self.vue.size%2) return p%2==0;
        else return Math.floor(board.indexOf(0)/self.vue.size)%2 ? p%2 == 0 : p%2 != 0;
    };

    self.shuffle = function() {
        for (var i = self.vue.board.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = self.vue.board[i];
            Vue.set(self.vue.board, i, self.vue.board[j]);
            Vue.set(self.vue.board, j, tmp);
        }
        //console.log(self.vue.solvable());
        if (!self.vue.solvable()) self.vue.shuffle();
        self.vue.progress = true;
    };

    /*Vue.component('notification', {
        template: '#notification',
        props: ['msg']
    });*/

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            board: [],
            size: 4,
            progress: false,

        },
        mounted: function() {
            var vm = this;
            window.addEventListener('keyup', function (event) {
                switch(event.keyCode) {
                    case 37:
                        vm.move((vm.board.indexOf(0)/vm.size), 1, 'left');
                        break;
                    case 38:
                        vm.move((vm.board.indexOf(0)/vm.size), vm.size, 'up');
                        break;
                    case 39:
                        vm.move((vm.board.indexOf(0)/vm.size), -1, 'right');
                        break;
                    case 40:
                        vm.move((vm.board.indexOf(0)/vm.size), -vm.size, 'down');
                        break;
                    case 187:
                        vm.plus();
                        break;
                    case 189:
                        vm.minus();
                        break;

                }
            })
        },
        watch: {
            board: function() {
                if (JSON.stringify(this.board) === JSON.stringify(Array.from(new Array((this.size ** 2) - 1), (val, index) => index + 1).concat([0])) && this.progress === true) {
                    this.notifyError('You win!', 'alert-success');
                    this.progress = false;
                }
            }
        },
        methods: {
            reset: self.reset,
            solvable: self.solvable,
            shuffle: self.shuffle,
            move: self.move,
            plus () {
                if (this.size == 7) {
                    var vm = this;
                    vm.notifyError('The grid size can\'t go any larger!','alert-danger');
                    return; }
                this.size+=1;
                this.reset();
            },
            minus () {
                if (this.size == 3) {
                    var vm = this;
                    vm.notifyError('The grid size can\'t go any smaller!', 'alert-danger');
                    return; }
                this.size-=1;
                this.reset();
            },
            notifyError (txt, type) {
                $('.alert').remove();
                $("<div>").addClass('alert '+type)
                                .html(txt)
                                .prependTo('.chessboard')
                                .hide()
                                .slideDown('slow');
                setTimeout(function() {
                    $('.alert').slideUp('slow');
                }, 3000);
            }
        }
    });

    self.reset();
    return self;
};

var APP = null;

// This will make everything accessible from the js console
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
    APP.initialize();
});
