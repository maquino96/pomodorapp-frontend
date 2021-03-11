
const y = document.querySelector('div.timer')
let x = parseInt(y.innerText)

let h =0, m = 0, s = 0

let finish_bool = parseInt(y.dataset.finish) 


function updateClock(){

  if ( parseInt(s) < 60 ){
    s = parseInt(s)+1
    if (parseInt(s) <10){
      s = "0"+s
    }
  }
  if ( s === 60){
    s = 0
    m = parseInt(m)+1
    if (parseInt(m) <10){
      m = "0"+m
    }
  }
  if ( m === 60){
    m = 0
    h = parseInt(h)+1
    if(parseInt(h) <10){
      h = "0"+h
    }
  }
  console.log(h,m,s)
  document.querySelector('div.timer').innerText = `${h}:${m}:${s}`

}

var initClock = () => setInterval("updateClock()", 1000)


