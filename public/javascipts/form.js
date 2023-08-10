


function togglePass() {
    var x = document.getElementById("password1");   // Input
    var s = document.getElementById("Layer_1");               // Show pass
    var h = document.getElementById("Layer_2");               // Hide pass
    if (x != undefined && x.type === "password") {
        x.type = 'text';
        s.style.display = 'none';
        h.style.display = 'inline';
    } else {
        x.type = 'password';
        s.style.display = 'inline';
        h.style.display = 'none';
    }   
}

function togglePass2() {
    var x = document.getElementById("password2");   // Input
    var s = document.getElementById("Layer_3");               // Show pass
    var h = document.getElementById("Layer_4");               // Hide pass
    if (x != undefined && x.type === "password") {
        x.type = 'text';
        s.style.display = 'none';
        h.style.display = 'inline';
    } else {
        x.type = 'password';
        s.style.display = 'inline';
        h.style.display = 'none';
    }   
}
