function makeSlideShow(el){
    $slideshow = Object.create(Slideshow);
    $slideshow.init(document.querySelector('.diashow'));
}

Slideshow = {
    init: function (el) {
        this.settings = {};
        this.counter = 0;
        this.el = el;   
        this.addEventListeners(el);
        this.loadSettings(el);          
    },
    loadSettings: function(el) {
        var that = this;
        var request = new XMLHttpRequest();
        request.open("GET","/settings");
        request.addEventListener('load', function(event) {
            if (request.status == 200){
                that.settings = JSON.parse(request.responseText);
                that.loadData(that.el); 
                if (that.settings.client.auto)
                    that.autoCycle(that.el, that.settings.client.auto.speed, that.settings.client.pauseOnHover);
                if (that.settings.client.swipe)
                    that.addSwipe(that.el);
            }
            else
                console.warn(request.statusText, request.responseText);
        });
        request.send();
    },
    loadData: function(el) {
        var that = this;
        var request = new XMLHttpRequest();
        request.open("GET","/data");
        request.addEventListener('load', function(event) {
            if (request.status == 200) {

                // remove slides
                var rem = document.getElementsByTagName("figure");
                for (var i = rem.length-1; i >= 0; i--)
                  rem[i].remove();

                // add slides with loaded data
                json = JSON.parse(request.responseText);
                docFrag = document.createDocumentFragment();
                Object.keys(json).forEach(function(k){
                    var fig = document.createElement("figure");
                    var img = document.createElement("img");
                    var cap = document.createElement("figcaption");
                    img.src = that.settings.image_dir + k;
                    cap.innerHTML = json[k]['text'];
                    fig.dataset.fav = json[k]['fav'];
                    fig.dataset.date = that.getDate(json[k]['time']);
                    fig.appendChild(img);
                    fig.appendChild(cap);
                    docFrag.appendChild(fig);
                });
                el.appendChild(docFrag);

                // update globals with new slides data
                that.$items = el.querySelectorAll(that.settings.client.selector);
                that.numItems = that.$items.length;
                that.$items[that.counter].classList.add('show');
                that.setInfo(that.$items[that.counter].dataset.fav, that.$items[that.counter].dataset.date);

            } 
            else
                console.warn(request.statusText, request.responseText);

            // set data refresh timer
            setTimeout(function(){ that.loadData(el);}, 10000);
        });
        request.send();

    },
    getDate: function(timestamp) {
        var date = new Date(timestamp * 1000);
        var year = date.getFullYear();
        var month = "0" + (date.getMonth() + 1);
        var day = "0" + date.getDate();
        var hours = "0" + date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        var formattedTime = day.substr(-2) + '.' + month.substr(-2) + '.' + year + ', ' + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2); 
        return formattedTime;

    },
    setInfo: function(fav, date) {
        if(fav === "false") {
            document.getElementById('btnFav').classList.add('btnFav');
            document.getElementById('btnFav').classList.remove('btnFavFav');
        }
        else {
            document.getElementById('btnFav').classList.remove('btnFav');
            document.getElementById('btnFav').classList.add('btnFavFav');
        }
        document.getElementById("dateSpan").innerHTML = date;
    },
    showCurrent: function (i) {
        // increment or decrement this.counter depending on whether i === 1 or i === -1
        if (i > 0)
            this.counter = (this.counter + 1 === this.numItems) ? 0 : this.counter + 1;
        else
            this.counter = (this.counter - 1 < 0) ? this.numItems - 1 : this.counter - 1;

        // remove .show from whichever element currently has it 
        // http://stackoverflow.com/a/16053538/2006057
        [].forEach.call(this.$items, function (el) {
            el.classList.remove('show');
        });

        // add .show to the one item that's supposed to have it
        this.$items[this.counter].classList.add('show');
        this.setInfo(this.$items[this.counter].dataset.fav, this.$items[this.counter].dataset.date);
    },
    addEventListeners: function (el) {
        var that = this;
        el.querySelector('.next').addEventListener('click', function () {
            that.showCurrent(1); // increment & show
        }, false);
    
        el.querySelector('.prev').addEventListener('click', function () {
            that.showCurrent(-1); // decrement & show
        }, false);
        
        el.onkeydown = function (e) {
            e = e || window.event;
            if (e.keyCode === 37) {
                that.showCurrent(-1); // decrement & show
            } else if (e.keyCode === 39) {
                that.showCurrent(1); // increment & show
            }
        };
    },
    autoCycle: function (el, speed, pauseOnHover) {
        var that = this,
            interval = window.setInterval(function () {
                that.showCurrent(1); // increment & show
            }, speed);
        
        if (pauseOnHover) {
            el.addEventListener('mouseover', function () {
                clearInterval(interval);
                interval = null;
            }, false);
            el.addEventListener('mouseout', function () {
                if(!interval) {
                    interval = window.setInterval(function () {
                        that.showCurrent(1); // increment & show
                    }, speed);
                }
            }, false);
        } // end pauseonhover
        
    },
    addSwipe: function(el){
        var that = this,
        ht = new Hammer.Manager(el);
        ht.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
        ht.add( new Hammer.Tap() );
        ht.get('doubletap').recognizeWith('tap');
        ht.on('swiperight', function(e) {
            that.showCurrent(-1); // decrement & show
        });
        ht.on('swipeleft', function(e) {
            that.showCurrent(1); // increment & show
        });
        /*
        ht.on('panup', function(e) {
            that.hideMenu(); //show/hide menu
        });
        ht.on('pandown', function(e) {
            that.showMenu(); //show/hide menu
        });
        */
        ht.on('doubletap', function(e) {
            that.toggleMenu(); //show/hide menu
        });
    },
    toggleMenu: function() {
        var elem = document.querySelector('.menu');
        if(elem.style.visibility === "visible")
            elem.style.visibility = "hidden";
        else
            elem.style.visibility = "visible";
    },
   /* 
    hideMenu: function() {
        var elem = document.querySelector('.menu');
        elem.style.visibility = "hidden";
    }
    showMenu: function() {
        var elem = document.querySelector('.menu');
        elem.style.visibility = "visible";
    }
    */
    
}; 