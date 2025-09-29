let calendarDatas = [];
 
async function getCalendarData() {
    calendarDatas = [];
    try {
        let res = await fetch(`${ServerUrl}/steps/user/${loggedUser.id}`);
        let data = await res.json();
        data.forEach(step => {
            calendarDatas.push({
                title: `Lépés: ${step.count}`,
                start: step.date
            })
        });
    } catch (error) {
        console.log(error);
    }
}
 
function initCalendar() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'hu',
        headerToolbar: {
            left: 'prev,today,next',
            center: 'title',
            right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        events: calendarDatas
    });
 
    calendar.render();
}