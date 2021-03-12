
let h =0
let m = 0
let s = 0

let currUserInterval = 0
let currUserBreak = 0

let bT = 0


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
  // console.log(h,m,s)
  document.querySelector('div.timer').innerText = `${h}:${m}:${s}`

  // console.log(m)

  if ( parseInt(m) > 0 && parseInt(m)%currUserInterval===0 && parseInt(s) === 0){
    // alert doesn't work, will get stuck with alert 
    alert(`Please take your ${currUserBreak} minute break.`)
    
    breakVar = breakClock()
    toggleBreakTimer()

  }

}

var initClock = () => setInterval("updateClock()", 1000)
var breakClock = () => setInterval("breakFunc()",1000)

function breakFunc(){
  // debugger
  breakTimer.innerText = `${bT}`
  bT-=1
  console.log(bT)

  if(bT === 0){
    // debugger
    alert('Break Over')
    bT = currUserBreak *60
    toggleBreakTimer()
    clearInterval(breakVar)
   
  }

}
