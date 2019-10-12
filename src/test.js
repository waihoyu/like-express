

function a(path,aa) {  
    console.log(path, aa)
    console.log(arguments)
}

function b(x,y) {
    a.apply(this, arguments)
}

b(1,2);