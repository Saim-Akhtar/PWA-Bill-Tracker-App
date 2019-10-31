const heading = '   Bill Tracker'

const container_heading = document.querySelector('.container-heading__span')
container_heading.innerHTML = ''

let i = 0
const speed = 50

function typingEffect() {
    if (i < heading.length) {
        container_heading.innerHTML += heading[i]
        i += 1
        setTimeout(typingEffect, speed)
    } else {
        container_heading.style.border = 'none'
    }
}


setTimeout(typingEffect, speed + 100)