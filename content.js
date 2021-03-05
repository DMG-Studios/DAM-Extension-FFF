
// Content JS contains the external data for calendar, news and events //
// Everything has to be called with functions do to how Extensions work // 

let nextCalendar = document.getElementById("nextCal");
let nextCalendarTime = document.getElementById("nextTime");
let nextCalendarComment = document.getElementById("nextComment");
let nextCalendarLink = document.getElementById("nextLink");
let arbsHash;
let fetchLink;
let newsTimeOut = 7600;

// Get arbs hash from browser storage and store it in a variable // 

function GetHash() {
    function setCurrentChoice(result) {
        arbsHash = result.arbs || "default";
        call();
    }
    function onError(error) {
        console.log(`Error: ${error}`);
    }
    let getting = browser.storage.sync.get("arbs");
    getting.then(setCurrentChoice, onError);
}

// Call Get hash //
GetHash();

// Set Fetch link composed of api address and your ARBS link // 
function call() {
    // Check if arbshash is a link or a name and proceed accordingly // 
    if (/\s/.test(arbsHash)) {
        let fName = arbsHash.substr(0, arbsHash.indexOf(' '));
        let lName = arbsHash.substr(arbsHash.indexOf(' ') + 1);
        let nameStr = fName + "+" + lName;
        fetchLink = 'https://api.cornern.tlk.fi/dam-api/teacher?name=' + nameStr;
    } else {
        fetchLink = 'https://api.cornern.tlk.fi/dam-api/calendar?link=' + arbsHash;
    }
    GetNextEvent();
    GetNews();
}

// Options for showing time without seconds // 
let dOpt = {
    hour: '2-digit',
    minute: '2-digit',
}

// Function to fetch and parse response from calendar api // 
var t = 0;
let calendarEvents;

function GetNextEvent() {

    document.getElementById('leftEvent').addEventListener('click', eventLeft);
    document.getElementById('rightEvent').addEventListener('click', eventRight);

    // Scroll calendar events backwards and forwards 
    function eventLeft() {
        t = t == 0 ? 0 : t - 1;
        fillCalendar(t);
    }
    function eventRight() {
        t = t == calendarEvents.length - 1 ? 0 : t + 1
        fillCalendar(t);
    }

    // Sub function for fetching calendar content // 
    function getCalendar() {
        fetch(fetchLink)
            .then((r) => r.json())
            .catch((e) => {
                nextCalendarComment.textContent = "Something wen't horribly wrong. Atleast 5 highly trained tölks have been assigned to fix this, please check your settings"
                nextCalendarLink.href = "https://www.dinmamma.fi"
                nextCalendarLink.textContent = "DMG Studios Apologizes"
            })
            .then((r) => {
                callCalendar(r);
            });
    }
    function callCalendar(r) {
        calendarEvents = r;
        fillCalendar(t);
    }

    // call getcalendar (duh)
    getCalendar();

    function fillCalendar(t) {
        // Check that CalendarEvents have been fetched before populating, else proceed with error message // 

        const sortedCalendar = calendarEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        if (calendarEvents) {
            // Split up the incoming calendar event into smaller parts for handling // 
            let nextEventName = sortedCalendar[t].name;
            let nextEventComment = sortedCalendar[t].comment;
            let nextEventStart = sortedCalendar[t].startTime;
            let nextEventEnd = sortedCalendar[t].endTime;
            let nextEventRoom = sortedCalendar[t].room;
            // Variables to split comment into link and commentEntry // 

            let link;
            let comment;
           
            // Regexp incomming comment for a http/s link to append to Link to lecture // 
            let nextLink = nextEventComment.split(/(https?:\/\/[^\s]+)/g);

            // Forloop to passing link and comment // 
            nextLink.forEach(element => {
                if (element.includes('http')) {
                    link = element;
                } else if (element.length > 1) {
                    comment = element;
                }
            });

            // if result doesn't return a link set it to ARBS 

            if (link == undefined) {
                link = "https://famnen.arcada.fi/arbs/"
            }

            // If no room is booked assign to online // 

            if (nextEventRoom == "") {
                nextEventRoom = "Online";
            }

            // Assign event name and room to Calendar frame header //
            nextCalendar.textContent = nextEventName + " @ " + nextEventRoom;

            // Assign time, comment and link to calendar frame // 
            if (nextEventStart.length == 8) {
                nextCalendarTime.textContent = new Date(0, 0, 0, nextEventStart.substr(0, 2), nextEventStart.substr(3, 2), 0).toLocaleTimeString('fi-Fi', dOpt) + " - " + new Date(0, 0, 0, nextEventEnd.substr(0, 2), nextEventEnd.substr(3, 2), 0).toLocaleTimeString('fi-Fi', dOpt)
            } else {
                nextCalendarTime.textContent = new Date(nextEventStart).toLocaleDateString('fi-FI',) + " " + new Date(nextEventStart).toLocaleTimeString('fi-FI', dOpt) + " - " + new Date(nextEventEnd).toLocaleTimeString('fi-FI', dOpt);
            }

            // If user hasn't changed from default show comment with settings notifi//

            if (arbsHash == "default") {
                nextCalendarComment.textContent = "Please add your ARBS link in settings from the cog in the top right corner to see your own schedule."
            } else {
                comment = comment.replace(/[^\wåäö\s]/gi, '');
                nextCalendarComment.textContent = comment;
            }
            nextCalendarLink.href = link;
        }
    }
}

// Get news from api //

function GetNews() {
    // Initialize global variables for news 
    let news;
    let events;
    var newsTimer;
    var x = 0

    // Get html elements 
    let latest = document.getElementById('latest');
    let newsBody = document.getElementById('newsBody');
    let newsLink = document.getElementById('newsLink');

    // This part is messy but works.
    // Due to having to call 2 API:s they chain together to not cause a situation where one part hasn't loaded before showing
    
    // Call News API, if news succeed call events and set all to variables
    
    function getNewsArticle() {
        fetch('https://api.cornern.tlk.fi/dam-api/news')
            .then((r) => r.json())
            .then((r) => {
                SetNews(r);
            }).then(() => {
                GetEvents();
            }).catch((error) => {
                console.error('Error:', error)
            });
    }

    function GetEvents() {
        fetch('https://api.cornern.tlk.fi/dam-api/events')
            .then((r) => r.json())
            .then((r) => {
                SetEvents(r)
            }).then(() => {
                callNews();
            }).catch((error) => {
                console.error('Error:', error)
            });;
    }

    function SetEvents(r) {
        events = r;
    }

    function SetNews(r) {
        news = r;
    }

    function callNews() {
        for(let i in news){
            events.push(news[i]);
        }
        updateNews(events[0]);
        loopNews();
    }

    getNewsArticle();

    // Function that loops news based on X value, 
    function loopNews() {
        if (Object.keys(events).length > 1) {
            newsTimer = setInterval(() => {
                updateNews(events[x]);
                x = x < Object.keys(events).length - 1 ? x + 1 : 0;
            }, newsTimeOut);
        } else {
            latest.textContent = "Couldn't fetch news, we are sorry and working on a fix";
        }
    }

    // General function to update news, same update function is used for interval and manual scrolling
    function updateNews(newsItem) {
        latest.textContent = newsItem.heading;
        newsBody.textContent = newsItem.body.substr(0, 150).substr(0, newsItem.body.substr(0, 150).lastIndexOf(" ")) + "\u2026";
        newsLink.href = newsItem.link;
    }

    // Functions that scroll news left and right, if user it at first goes to last and vice versa.
    function newLeft() {
        x = x == 0 ? Object.keys(events).length-1 : x - 1;
        updateNews(events[x]);
        clearInterval(newsTimer);
    }
    function newsRight() {
        x = x == Object.keys(events).length-1 ? 0 : x + 1
        updateNews(events[x]);
        clearInterval(newsTimer);
    }

    // Add event listeners to buttons for news feed scrolling
    document.getElementById('left').addEventListener('click', newLeft);
    document.getElementById('right').addEventListener('click', newsRight);
}
