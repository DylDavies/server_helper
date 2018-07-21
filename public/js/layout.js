let md = new MobileDetect(window.navigator.userAgent);
let mdP = md.phone();
let mdT = md.tablet();

console.log(window.navigator.userAgent);

if(mdP === null && mdT === null){
    $("#desktop").show();
}

if(mdP && mdT === null){
    $("#phone").show();
    $("body").css("zoom", "170%");
}

if (mdT && mdP === null) {
    $("#tablet").show();
}

function openNav(){
    $("#side-menu").css("width", "50%");
    $("#side-menu").css("border", "solid 5px black");
    $(".container").css("margin-right", "50%");
}

function closeNav(){
    $("#side-menu").css("width", "0");
    setTimeout(function(){
      $("#side-menu").css("border", "none");
    }, 300)
    $(".container").css("margin-right", "0");
}
