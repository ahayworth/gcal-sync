const configuration = {
  'searchDays': 14,
  'calendarTo': '',
  'calendarFrom': '',
  'patterns': [
    'fixme',
    'fixme'
  ]
};

function syncEvents() {
  var toCalendar = CalendarApp.getCalendarsByName(configuration.calendarTo);
  var fromCalendar = CalendarApp.getCalendarsByName(configuration.calendarFrom);

  if (toCalendar.length > 1) {
    Logger.log(`Found ${toCalendar.length} calendars for ${configuration.calendarTo}, cannot continue.`)
    return
  }

  if (fromCalendar.length > 1) {
    Logger.log(`Found ${fromCalendar.length} calendars for ${configuration.calendarFrom}, cannot continue.`)
    return
  }

  var now = new Date();
  var later = new Date(now.getTime() + (1000 * 60 * 60 * 24 * configuration.searchDays));

  var fromEvents = fromCalendar[0].getEvents(now, later);
  var toEvents = toCalendar[0].getEvents(now, later);
  Logger.log(`Found ${fromEvents.length} events on calendar ${fromCalendar[0].getName()}`);
  Logger.log(`Found ${toEvents.length} events on calendar ${toCalendar[0].getName()}`);

  var regexen = configuration.patterns.map(p => new RegExp(`${p}`, 'i'))
  var matchedFromEvents = fromEvents.filter(e => regexen.some(r => r.test(e.getTitle())))
  for (let fromEvent of matchedFromEvents) {
    Logger.log(`Syncing event: ${fromEvent.getTitle()}`)
    var idString = `Synced event from ${configuration.calendarFrom}: ${fromEvent.getId()}`;
    if (toEvents.some(e => e.getDescription() == idString)) {
      Logger.log(`Event already synced.`)
    } else {
      var title = `Synced: ${fromEvent.getTitle()}`;
      var syncedEvent;
      if (fromEvent.isAllDayEvent()) {
        var start = fromEvent.getAllDayStartDate();
        var end = fromEvent.getAllDayEndDate();
        syncedEvent = toCalendar[0].createAllDayEvent(title, start, end, {description: idString})
      } else {
        var start = fromEvent.getStartTime();
        var end = fromEvent.getEndTime();
        syncedEvent = toCalendar[0].createEvent(title, start, end, {description: idString})
      }

      syncedEvent.setVisibility(CalendarApp.Visibility.PRIVATE)
      Logger.log(`Created new event - title: ${syncedEvent.getTitle()}, id: ${syncedEvent.getId()}`)
    }
  }
}
