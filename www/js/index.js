

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

    self.move = function(i, j, dir) {
        var curr = self.vue.size*i+j;
        if (curr >= self.vue.size**2 || curr < 0) return;
        var up = curr - self.vue.size;
        var down = curr + self.vue.size;
        var right = curr + 1;
        var left = curr - 1;
        if (self.vue.board[left]=='0' && (dir=='left' || !dir) && (Math.floor(left/self.vue.size) == Math.floor(curr/self.vue.size))) {
            tmp = self.vue.board[left];

            Vue.set(self.vue.board,left, self.vue.board[curr]);
            Vue.set(self.vue.board,curr, tmp);
        } else if (self.vue.board[right]=='0' && (dir=='right' || !dir) && (Math.floor(right/self.vue.size) == Math.floor(curr/self.vue.size))) {
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
            size: 3,
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
        computed: {
            win() {
                //var vm = this;
                if (JSON.stringify(this.board) === JSON.stringify(Array.from(new Array((this.size ** 2) - 1), (val, index) => index + 1).concat([0])) && this.progress == true) {
                    this.notifyError('You win!', 'alert-success');
                    this.progress = false;
                    return true;
                } else
                    return false;
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
                curr = document.getElementsByClassName('alert')[0];
                if (curr) curr.parentNode.removeChild(curr);
                msg = document.createElement("div");
                msg.classList.add('alert', type);
                msg.innerHTML = txt;
                document.getElementById('vue-div').insertBefore(msg, document.getElementsByClassName('container')[0]);
                $(".alert").slideDown("swing");
                setTimeout(function() {
                    $(".alert").slideDown("swing");
                    $(".alert").hide();
                    // 3000 for 3 seconds
                }, 3000)
            }
        }
    });

    self.reset();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
    APP.initialize();
});
