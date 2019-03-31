# gcal-sync

## Overview

A simple apps script to sync events from one google calendar to another.

The intended use case is to synchronize events from a personal calendar to a work calendar,
so that free/busy on the work calendar accurately reflects personal events during the work day.

## Notes

This project uses [clasp](https://github.com/google/clasp), which is a CLI interface for
Google Apps Script projects. More information [is available](https://developers.google.com/apps-script/guides/clasp) on
how to use it for development.

## Getting started

Only OS X is supported at the moment. PRs welcome for other operating systems.

1. Set up initial dependencies: `script/bootstrap`
  - Homebrew is required, and the script will complain if it cannot be found.

2. Log in: `npx clasp login`
  - You should authenticate with the account we will be syncing *to*.

3. Create an apps script project: `npx clasp create --type standalone --title gcal-sync`
  - This will drop additional files into your checkout, which are *not* checked in.
  - You may get an error about not having enabled the Apps Script API. If so, follow the instructions in the error message.


## Configuration

Because I'm not extremely familiar with Apps Script, configuration is done in the script itself. Open `main.ts` and
change the `configuration` hash to something that works for you.

- `searchDays`: How many days we should look forward when syncing events. The default is `14`, and longer intervals equate
  to longer runtimes.
- `calendarTo`: The calendar which will receive the synced events.
- `calendarFrom`: The calendar which will be scanned for events to sync.
- `patterns`: An array of pattterns to match, case insensitive. Technically, full javascript regex support should work here
  but it has not been tested.

When the script is executed, we will ask for the next `searchDays` worth of events from `calendarFrom` and `calendarTo`. We will
examine each event retrieved from `calendarFrom` and if the event *title* matches one of `patterns`, we will sync it to `calendarTo`.

Events will not be duplicated during runs (unless you delete and re-create the event on `calendarFrom`), so running on a schedule
should be safe.

Synced events are set to private visibility.

## Deployment

1. Share your `calendarFrom` with your `calendarTo` account. You must allow the `calendarTo` account *full* visibility.
  - [Instructions](https://support.google.com/calendar/answer/37082?hl=en)
2. Ensure that events from Gmail are set to *full* visibility, if you use this feature:
  - [Instructions](https://support.google.com/calendar/answer/6084018?hl=en&co=GENIE.Platform=Desktop)
3. Add your `calendarFrom` calendar to your `calendarTo` account:
  - [Instructions](https://support.google.com/calendar/answer/6294878?hl=en&ref_topic=3417921)
4. Deploy the app to Google Apps: `npx clasp push`
  - Ensure you have changed the defaults in `main.ts` before this step.
  - I do not commit my changes anywhere, because I consider the synced events private and personal. Whether or not you
    do so, is up to you.
5. Manually run the script at least once to ensure you have authorized the app to modify your calendar:
  - `npx clasp open`
  - Click Run -> Run Function -> syncEvents
  - Review Permissions -> Choose Account -> Allow
  - Click View -> Logs and ensure things worked as expected
6. Add a trigger for the project
  - Click on Edit -> Current Project's Triggers
  - Click on Add Trigger (in the bottom right-hand corner of the screen)
  - Do not change the function/deployment settings
  - I use a time-driven trigger, once daily.
  - You can use whatever you want
