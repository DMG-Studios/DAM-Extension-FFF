
/// Get Calendar next up // 


let nextCalendar = document.getElementById("nextCal");
let nextCalendarTime = document.getElementById("nextTime");
let nextCalendarComment = document.getElementById("nextComment");
let nextCalendarLink = document.getElementById("nextLink");

let arbsHash;

function GetHash() {
  
    function setCurrentChoice(result) {
      arbsHash = result.arbs || "default";
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get("arbs");
    getting.then(setCurrentChoice, onError);
}
GetNextEvent(GetHash());


let dOpt = {
    hour:   '2-digit',
    minute: '2-digit',
}

function GetNextEvent(hash){
    let calendarEvents;
    function getCalendar() {
        fetch("calendar.json")
            .then((r) => r.json())
            .then((r) => {
                callCalendar(r);
            });
    }
    function callCalendar(r) {
        calendarEvents = r;
    }

    getCalendar();
    
 
    nextCalendar.textContent = " Test "
    setTimeout(() => {
        let nextEventName = calendarEvents[0].name;
        let nextEventComment = calendarEvents[0].comment;
        let nextEventStart = calendarEvents[0].startTime;
        let nextEventEnd = calendarEvents[0].endTime;
        let nextEventRoom = calendarEvents[0].room;
        let nextLink = nextEventComment.split(/(https?:\/\/[^\s]+)/g);
        let link; 
        let comment;


        nextLink.forEach(element => {
            if(element.includes('http')){
                link = element;
            }else if(element.length > 1){
                comment = element;
            }
        });
        if(nextEventRoom == ""){
            nextEventRoom = "Online";
        }
        nextCalendar.titel = nextEventComment;
        nextCalendar.textContent = nextEventName + " @ " + nextEventRoom;
        nextCalendarTime.textContent = new Date(nextEventStart).toLocaleDateString('fi-FI',) + " "+ new Date(nextEventStart).toLocaleTimeString('en-GB',dOpt) + " - " + new Date(nextEventEnd).toLocaleTimeString('en-GB', dOpt);

        nextCalendarComment.textContent = comment;
        nextCalendarLink.href = link;

    }, 200);
}