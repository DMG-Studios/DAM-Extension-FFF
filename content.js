
/// Content JS for Calendar next up and News API Connections // 

let nextCalendar = document.getElementById("nextCal");
let nextCalendarTime = document.getElementById("nextTime");
let nextCalendarComment = document.getElementById("nextComment");
let nextCalendarLink = document.getElementById("nextLink");

let arbsHash;
let fetchLink;

// Get arbs hash set in options // 

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

// Call Get hash //

GetHash();

// Timeout so app has time to fetch before creating calendar view, this should be implemented into background.js for future reference. // 

setTimeout(() => {

    // Set Fetch link composed of api address and your ARBS link // 
    fetchLink = 'https://api.cornern.tlk.fi/dam-api/calendar?link=' + arbsHash;
    GetNextEvent();
    GetNews();


}, 100);

// Options for showing time without seconds // 

let dOpt = {
    hour: '2-digit',
    minute: '2-digit',
}

// Function to fetch and parse response from calendar api // 

function GetNextEvent() {
    let calendarEvents;
    // Sub function for fetching // 
    function getCalendar() {
        fetch(fetchLink)
            .then((r) => r.json())
            .then((r) => {
                callCalendar(r);
            });
    }
    function callCalendar(r) {
        calendarEvents = r;
        fillCalendar();
    }

    getCalendar();

    function fillCalendar() {
        console.log(calendarEvents);

        // Check that CalendarEvents have been fetched before populating, else proceed with error message // 
        if (calendarEvents) {

            let nextEventName = calendarEvents[0].name;
            let nextEventComment = calendarEvents[0].comment;
            let nextEventStart = calendarEvents[0].startTime;
            let nextEventEnd = calendarEvents[0].endTime;
            let nextEventRoom = calendarEvents[0].room;

            // Regexp incomming comment for a http/s link to append to Link to lecture // 

            let nextLink = nextEventComment.split(/(https?:\/\/[^\s]+)/g);

            // Variables to split comment into link and commentEntry // 

            let link;
            let comment;

            // Forloop to assing link and comment // 
            nextLink.forEach(element => {
                if (element.includes('http')) {
                    link = element;
                } else if (element.length > 1) {
                    comment = element;
                }
            });

            // If no room is booked assign to online // 

            if (nextEventRoom == "") {
                nextEventRoom = "Online";
            }

            // Assign event name and room to Calendar frame header //
            nextCalendar.textContent = nextEventName + " @ " + nextEventRoom;

            // Assign time, comment and link to calendar frame // 
            nextCalendarTime.textContent = new Date(nextEventStart).toLocaleDateString('fi-FI',) + " " + new Date(nextEventStart).toLocaleTimeString('en-GB', dOpt) + " - " + new Date(nextEventEnd).toLocaleTimeString('en-GB', dOpt);
            nextCalendarComment.textContent = comment;
            nextCalendarLink.href = link;

            // if there wasn't a response assign error message // 
        } else {
            nextCalendarComment.textContent = "Something wen't horribly wrong. Atleast 5 highly trained tölks have been assigned to fix this"
            nextCalendarLink.href = "www.dinmamma.fi"
            nextCalendarLink.textContent = "DMG Studios Appologizes"
        }
    }
}
// Get news from api //

function GetNews() {
    let news;
    let latest = document.getElementById('latest');
    let newsBody = document.getElementById('newsBody');
    let newsLink = document.getElementById('newsLink');
    function getNewsArticle() {
        fetch('https://api.cornern.tlk.fi/dam-api/news')
            .then((r) => r.json())
            .then((r) => {
                callNews(r);
            });
    }
    function callNews(r) {
        news = r;
        fillNews();
    }

    getNewsArticle();


    function fillNews() {
        if (news) {
            let newsShort = news[0].body.substr(0, 150) ;
            newsShort = newsShort. substring(0, newsShort. lastIndexOf(" ")) + "\u2026";
            latest.textContent = news[0].heading;
            newsLink.href = news[0].link
            newsBody.textContent = newsShort;
        } else {
            latest.textContent = "Couldn't fetch news, we are sorry and working on a fix";
        }
    }
}